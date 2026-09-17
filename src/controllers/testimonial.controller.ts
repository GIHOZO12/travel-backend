import { Request, Response } from 'express';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';

// GET /api/testimonials — public, approved only (SRS §46: "shall not
// contain fabricated customer testimonials or misleading reviews" — the
// approval step is how we keep that true).
const getTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: testimonials });
});

// GET /api/testimonials/all — admin-only. Includes unapproved ones so an
// admin can review and approve them.
const getAllTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: testimonials });
});

// POST /api/testimonials — admin-only
const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const { customerName, country, category, content, photo, isApproved } = req.body;

  const testimonial = await prisma.testimonial.create({
    data: {
      customerName,
      country,
      category,
      content,
      photo,
      isApproved: isApproved ?? false,
    },
  });

  res.status(201).json({ success: true, data: testimonial });
});

// PUT /api/testimonials/:id — admin-only. Also how a pending testimonial
// gets approved: PUT { "isApproved": true }.
const updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Testimonial not found');
  }

  const testimonial = await prisma.testimonial.update({ where: { id }, data: req.body });
  res.json({ success: true, data: testimonial });
});

// DELETE /api/testimonials/:id — admin-only
const deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Testimonial not found');
  }

  await prisma.testimonial.delete({ where: { id } });
  res.json({ success: true, message: 'Testimonial deleted' });
});

export {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
