import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Inquiry } from '../entities/Inquiry';
import { InquiryStatus } from '../entities/enums';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import { notifyNewInquiry } from '../services/notifications';

const inquiryRepo = AppDataSource.getRepository(Inquiry);

// Every inquiry column plus a small summary of its tour (id, name, slug).
// LEFT join because the tour is optional — inquiries without one still come
// back.
const inquiryWithTour = () =>
  inquiryRepo
    .createQueryBuilder('inquiry')
    .leftJoin('inquiry.tour', 'tour')
    .addSelect(['tour.id', 'tour.name', 'tour.slug']);

const findInquiryById = (id: number) => inquiryWithTour().where('inquiry.id = :id', { id }).getOne();

// POST /api/inquiries
// PUBLIC — any website visitor can submit this. No auth required. This is
// the "expression of interest" form from SRS §34.
const createInquiry = asyncHandler(async (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    destinationName,
    tourId,
    preferredDate,
    numberOfTravelers,
    message,
  } = req.body;

  const saved = await inquiryRepo.save(
    inquiryRepo.create({
      fullName,
      email,
      phone,
      destinationName,
      preferredDate,
      numberOfTravelers,
      message,
      // tourId is optional on this model — null when none was provided.
      tourId: tourId || null,
    }),
  );
  // Re-read to include the tour summary — the emails need the tour's name.
  const inquiry = (await findInquiryById(saved.id))!;

  // Fire-and-forget: the response doesn't wait for (or fail because of) email.
  void notifyNewInquiry(inquiry);

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been received. Our team will contact you shortly.',
    data: inquiry,
  });
});

// GET /api/inquiries
// Admin-only. Supports optional ?status=NEW filtering (SRS §60 "search
// bookings").
const getInquiries = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const isValidStatus = typeof status === 'string' && Object.values(InquiryStatus).includes(status as InquiryStatus);

  const query = inquiryWithTour().orderBy('inquiry.createdAt', 'DESC');
  if (isValidStatus) {
    query.where('inquiry.status = :status', { status });
  }
  const inquiries = await query.getMany();

  res.json({ success: true, data: inquiries });
});

// GET /api/inquiries/:id
// Admin-only.
const getInquiryById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const inquiry = await findInquiryById(id);

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  res.json({ success: true, data: inquiry });
});

// PUT /api/inquiries/:id
// Admin-only. Used to change status (NEW -> CONTACTED -> CLOSED) or
// correct a submitted field.
const updateInquiry = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await inquiryRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Inquiry not found');
  }

  await inquiryRepo.save(inquiryRepo.merge(existing, req.body));
  const inquiry = await findInquiryById(id);

  res.json({ success: true, data: inquiry });
});

// DELETE /api/inquiries/:id
// Admin-only. Mainly for clearing out spam submissions.
const deleteInquiry = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await inquiryRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Inquiry not found');
  }

  await inquiryRepo.delete(id);
  res.json({ success: true, message: 'Inquiry deleted' });
});

export { createInquiry, getInquiries, getInquiryById, updateInquiry, deleteInquiry };
