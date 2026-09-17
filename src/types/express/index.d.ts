// Module augmentation: adds `user` to Express's Request type, set by the
// `protect` middleware once a JWT has been verified. Without this, every
// controller reading `req.user` would fail to typecheck.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
