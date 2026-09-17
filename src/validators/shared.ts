import { ValidationChain } from 'express-validator';
import prisma from '../config/prisma';


export const tourExistsRule = (chain: ValidationChain): ValidationChain =>
  chain
    .isInt().withMessage('tourId must be an integer')
    .bail()
    .custom(async (value: string) => {
      const tour = await prisma.tour.findUnique({ where: { id: Number(value) } });
      if (!tour) throw new Error('No tour exists with that id');
      return true;
    })
    .toInt();
