import { Request, Response } from 'express';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';

// GET /api/faqs — public, published only, ordered by `order` (the
// admin-controlled display sequence from SRS §45), then id as a tiebreak.
const getFAQs = asyncHandler(async (req: Request, res: Response) => {
  const faqs = await prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  res.json({ success: true, data: faqs });
});

// POST /api/faqs — admin-only
const createFAQ = asyncHandler(async (req: Request, res: Response) => {
  const { question, answer, order, isPublished } = req.body;

  const faq = await prisma.fAQ.create({
    data: {
      question,
      answer,
      order: order ?? 0,
      isPublished: isPublished ?? true,
    },
  });

  res.status(201).json({ success: true, data: faq });
});

// PUT /api/faqs/:id — admin-only
const updateFAQ = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.fAQ.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'FAQ not found');
  }

  const faq = await prisma.fAQ.update({ where: { id }, data: req.body });
  res.json({ success: true, data: faq });
});

// DELETE /api/faqs/:id — admin-only
const deleteFAQ = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.fAQ.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'FAQ not found');
  }

  await prisma.fAQ.delete({ where: { id } });
  res.json({ success: true, message: 'FAQ deleted' });
});

export { getFAQs, createFAQ, updateFAQ, deleteFAQ };
