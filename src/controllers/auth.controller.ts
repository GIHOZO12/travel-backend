import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import generateToken from '../utils/token';

// Fields safe to send back to the client — never spread `...admin`, that
// would leak the bcrypt password hash.
const publicFields = { id: true, name: true, email: true, role: true, createdAt: true } as const;

// POST /api/auth/login
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {

    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(admin.id);

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
  const admins = await prisma.adminUser.findMany({
    select: publicFields,
    orderBy: { createdAt: 'asc' },
  });

  res.json({ success: true, data: admins });
});

// POST /api/auth/admins
// ADMIN-only — see requireAdmin in auth.routes.ts. Creates a STAFF account by
// default; an explicit role: "ADMIN" is required to create a fellow admin.
const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, `An admin with email "${email}" already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.create({
    data: { name, email, password: hashedPassword, role: role ?? 'STAFF' },
    select: publicFields,
  });

  res.status(201).json({ success: true, data: admin });
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

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Admin not found');
  }

  if (existing.role === 'ADMIN' && role === 'STAFF') {
    const adminCount = await prisma.adminUser.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot demote the only remaining administrator');
    }
  }

  const admin = await prisma.adminUser.update({
    where: { id },
    data: { role },
    select: publicFields,
  });

  res.json({ success: true, data: admin });
});

// DELETE /api/auth/admins/:id
// ADMIN-only. Same "don't lock everyone out" safety rules as updateAdmin.
const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (id === req.user!.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Admin not found');
  }

  if (existing.role === 'ADMIN') {
    const adminCount = await prisma.adminUser.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot delete the only remaining administrator');
    }
  }

  await prisma.adminUser.delete({ where: { id } });
  res.json({ success: true, message: 'Admin account deleted' });
});

export { login, getMe, getAdmins, createAdmin, updateAdmin, deleteAdmin };
