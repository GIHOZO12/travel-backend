import jwt, { SignOptions } from 'jsonwebtoken';

const generateToken = (adminId: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign({ id: adminId }, secret, options);
};

export default generateToken;
