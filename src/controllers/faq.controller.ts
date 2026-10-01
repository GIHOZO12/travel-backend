import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Faq } from '../entities/Faq';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';

const faqRepo = AppDataSource.getRepository(Faq);

// GET /api/faqs — public, published only, ordered by `order` (the
// admin-controlled display sequence from SRS §45), then id as a tiebreak.
const getFAQs = asyncHandler(async (req: Request, res: Response) => {
  const faqs = await faqRepo.find({
    where: { isPublished: true },
    order: { order: 'ASC', id: 'ASC' },
  });

  res.json({ success: true, data: faqs });
});

// POST /api/faqs — admin-only
const createFAQ = asyncHandler(async (req: Request, res: Response) => {
  const { question, answer, order, isPublished } = req.body;

  // create() only builds the object in memory; save() INSERTs it and fills
  // in the generated id.
  const faq = await faqRepo.save(
    faqRepo.create({
      question,
      answer,
      order: order ?? 0,
      isPublished: isPublished ?? true,
    }),
  );

  res.status(201).json({ success: true, data: faq });
});

// PUT /api/faqs/:id — admin-only
const updateFAQ = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await faqRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'FAQ not found');
  }

  // merge() copies the request's fields onto the loaded entity (ignoring
  // anything that isn't a column); save() then UPDATEs just what changed.
  const faq = await faqRepo.save(faqRepo.merge(existing, req.body));
  res.json({ success: true, data: faq });
});

// DELETE /api/faqs/:id — admin-only
const deleteFAQ = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await faqRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'FAQ not found');
  }

  await faqRepo.delete(id);
  res.json({ success: true, message: 'FAQ deleted' });
});

export { getFAQs, createFAQ, updateFAQ, deleteFAQ };
