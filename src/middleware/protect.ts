import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { AdminUser } from '../entities/AdminUser';
import ApiError from '../utils/ApiError';

const adminRepo = AppDataSource.getRepository(AdminUser);

interface TokenPayload {
  id: number;
}

// Verifies the `Authorization: Bearer <token>` header and attaches the
// requesting admin to req.user. Any route that needs a logged-in admin
// gets this inserted before its validator/controller in the chain:
//   router.post('/', protect, createXRules, validate, createX);
const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new ApiError(401, 'Not authorized — no token provided'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Re-fetch from the DB rather than trusting the token payload alone —
    // this way a deleted admin is locked out immediately, not just after
    // their existing token happens to expire.
    const admin = await adminRepo.findOneBy({ id: decoded.id });
    if (!admin) {
      next(new ApiError(401, 'Not authorized — admin no longer exists'));
      return;
    }

    req.user = { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
    next();
  } catch {
    next(new ApiError(401, 'Not authorized — invalid or expired token'));
  }
};

export default protect;
