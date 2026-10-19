import type { AdminRole } from '../../entities/enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: AdminRole;
      };
    }
  }
}

export {};
