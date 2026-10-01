import { ValidationChain } from 'express-validator';
import { AppDataSource } from '../config/data-source';
import { Tour } from '../entities/Tour';

const tourRepo = AppDataSource.getRepository(Tour);

export const tourExistsRule = (chain: ValidationChain): ValidationChain =>
  chain
    .isInt().withMessage('tourId must be an integer')
    .bail()
    .custom(async (value: string) => {
      const exists = await tourRepo.existsBy({ id: Number(value) });
      if (!exists) throw new Error('No tour exists with that id');
      return true;
    })
    .toInt();
