import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppDataSource } from '../config/data-source';
import { AdminUser } from '../entities/AdminUser';
import { AdminRole } from '../entities/enums';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import generateToken from '../utils/token';
import { generateInviteToken, hashToken } from '../utils/inviteToken';
import { notifyRoleChanged, notifyStaffInvite } from '../services/notifications';

const adminRepo = AppDataSource.getRepository(AdminUser);

// The fields safe to send back to the client — never send the entity itself,
// that would leak the bcrypt password hash and the invite token's hash.
// setPasswordTokenHash becomes a plain boolean: the Staff page needs to know
// "has this person finished setup?" but the hash must never reach the client.
function toPublicAdmin(admin: AdminUser) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
    hasPendingInvite: admin.setPasswordTokenHash !== null,
  };
}

// POST /api/auth/login
//
// Every branch logs enough to diagnose a failure from server logs alone
// (Render's dashboard, etc.) — but NEVER the password itself, in any form.
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`[login] attempt for "${email}"`);

  const admin = await adminRepo.findOneBy({ email });
  if (!admin) {
    console.log(`[login] failed for "${email}": no account with that email`);
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    console.log(`[login] failed for "${email}" (id ${admin.id}): wrong password`);
    throw new ApiError(401, 'Invalid email or password');
  }

  // Thrown as an ApiError further down (inside generateToken) if JWT_SECRET
  // isn't set on this host — surfaced as a 500, but that's an easy thing to
  // miss on a host you don't control the env vars for as directly as .env.
  if (!process.env.JWT_SECRET) {
    console.error(`[login] JWT_SECRET is not set on this server — cannot issue a token for "${email}"`);
  }

  const token = generateToken(admin.id);
  console.log(`[login] succeeded for "${email}" (id ${admin.id}, role ${admin.role})`);

  res.json({
    success: true,
    data: {
      token,
      // Never spread `...admin` here — that would include the password
      // hash in the response. List the fields explicitly instead.
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    },
  });
});

// GET /api/auth/me
// `protect` middleware guarantees req.user is set before this runs.
const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user });
});

// GET /api/auth/admins
// ADMIN-only. Lists every staff/admin account, for the "Staff" management page.
const getAdmins = asyncHandler(async (req: Request, res: Response) => {
  const admins = await adminRepo.find({
    // Don't even load the password hash — only what toPublicAdmin needs.
    select: { id: true, name: true, email: true, role: true, createdAt: true, setPasswordTokenHash: true },
    order: { createdAt: 'ASC' },
  });

  res.json({ success: true, data: admins.map(toPublicAdmin) });
});

// POST /api/auth/admins
// ADMIN-only — see requireAdmin in auth.routes.ts. Creates a STAFF account by
// default; an explicit role: "ADMIN" is required to create a fellow admin.
// No password is collected: `password` is filled with a random value nobody
// will ever know (the schema requires *some* hash), and the new person sets
// their real one by following the emailed invite link.
const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role } = req.body;

  const existing = await adminRepo.findOneBy({ email });
  if (existing) {
    throw new ApiError(409, `An admin with email "${email}" already exists`);
  }

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  const invite = generateInviteToken();

  const admin = await adminRepo.save(
    adminRepo.create({
      name,
      email,
      role: role ?? AdminRole.STAFF,
      password: placeholderPassword,
      setPasswordTokenHash: invite.hash,
      setPasswordExpires: invite.expires,
    }),
  );

  // Fire-and-forget: account creation must succeed even if mail delivery
  // fails or SMTP isn't configured (see services/notifications.ts).
  void notifyStaffInvite(admin, invite.raw);

  res.status(201).json({ success: true, data: toPublicAdmin(admin) });
});

// POST /api/auth/admins/:id/resend-invite
// ADMIN-only. Only works for accounts that haven't finished setup yet
// (hasPendingInvite) — an already-active account's password isn't touched.
const resendInvite = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await adminRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Admin not found');
  }
  if (existing.setPasswordTokenHash === null) {
    throw new ApiError(400, 'This account is already active — its invite was already used');
  }

  const invite = generateInviteToken();
  existing.setPasswordTokenHash = invite.hash;
  existing.setPasswordExpires = invite.expires;
  const admin = await adminRepo.save(existing);

  void notifyStaffInvite(admin, invite.raw);

  res.json({ success: true, data: toPublicAdmin(admin) });
});

// POST /api/auth/set-password
// PUBLIC — no login required. The token itself (emailed to the account
// holder, never shown anywhere else) is the authentication. Single-use:
// clears the token on success, so the same link can't be replayed. Returns a
// JWT so the person lands signed in, same shape as POST /auth/login.
const setPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const admin = await adminRepo.findOneBy({ setPasswordTokenHash: hashToken(token) });
  if (!admin || !admin.setPasswordExpires || admin.setPasswordExpires < new Date()) {
    throw new ApiError(400, 'This invite link is invalid or has expired. Ask an administrator to resend it.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // update() runs a single UPDATE ... WHERE id = ? without loading the row first.
  await adminRepo.update(admin.id, { password: hashedPassword, setPasswordTokenHash: null, setPasswordExpires: null });

  const jwt = generateToken(admin.id);

  res.json({
    success: true,
    data: {
      token: jwt,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    },
  });
});

// PUT /api/auth/admins/:id
// ADMIN-only. Changes a staff member's role (promote to ADMIN / demote to
// STAFF). Two safety rules, both to prevent locking every admin out:
//   1. You cannot change your own role.
//   2. You cannot demote the last remaining ADMIN.
const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { role } = req.body;

  if (id === req.user!.id) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  const existing = await adminRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Admin not found');
  }

  if (existing.role === AdminRole.ADMIN && role === AdminRole.STAFF) {
    const adminCount = await adminRepo.count({ where: { role: AdminRole.ADMIN } });
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot demote the only remaining administrator');
    }
  }

  existing.role = role;
  const admin = await adminRepo.save(existing);

  // Fire-and-forget: the role change must succeed even if mail delivery
  // fails or SMTP isn't configured (see services/notifications.ts). Skipped
  // for a still-pending account — they haven't logged in yet, so "your role
  // changed" would be a confusing email to get before "you have an account".
  if (admin.setPasswordTokenHash === null) {
    void notifyRoleChanged(admin);
  }

  res.json({ success: true, data: toPublicAdmin(admin) });
});

// DELETE /api/auth/admins/:id
// ADMIN-only. Same "don't lock everyone out" safety rules as updateAdmin.
const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (id === req.user!.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const existing = await adminRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Admin not found');
  }

  if (existing.role === AdminRole.ADMIN) {
    const adminCount = await adminRepo.count({ where: { role: AdminRole.ADMIN } });
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot delete the only remaining administrator');
    }
  }

  await adminRepo.delete(id);
  res.json({ success: true, message: 'Admin account deleted' });
});

export { login, getMe, getAdmins, createAdmin, resendInvite, setPassword, updateAdmin, deleteAdmin };
