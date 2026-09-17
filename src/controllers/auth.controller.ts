import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import generateToken from '../utils/token';

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

// POST /api/auth/admins
// Protected — only an already-logged-in admin can create another one.
// There is no public registration endpoint by design.
const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, `An admin with email "${email}" already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.create({
    data: { name, email, password: hashedPassword },
  });

  res.status(201).json({
    success: true,
    data: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

export { login, getMe, createAdmin };
