import { Request, Response } from 'express';
import { InquiryStatus } from '@prisma/client';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import { notifyNewInquiry } from '../services/notifications';

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

  const inquiry = await prisma.inquiry.create({
    data: {
      fullName,
      email,
      phone,
      destinationName,
      preferredDate,
      numberOfTravelers,
      message,
      // tourId is optional on this model — only attach the relation if
      // one was actually provided.
      ...(tourId ? { tour: { connect: { id: tourId } } } : {}),
    },
    include: { tour: { select: { id: true, name: true, slug: true } } },
  });

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

  const inquiries = await prisma.inquiry.findMany({
    where: isValidStatus ? { status: status as InquiryStatus } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      tour: { select: { id: true, name: true, slug: true } },
    },
  });

  res.json({ success: true, data: inquiries });
});

// GET /api/inquiries/:id
// Admin-only.
const getInquiryById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      tour: { select: { id: true, name: true, slug: true } },
    },
  });

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

  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Inquiry not found');
  }

  const { tourId, ...rest } = req.body;
  const data: Record<string, unknown> = { ...rest };

  if (tourId) {
    data.tour = { connect: { id: tourId } };
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data,
    include: {
      tour: { select: { id: true, name: true, slug: true } },
    },
  });

  res.json({ success: true, data: inquiry });
});

// DELETE /api/inquiries/:id
// Admin-only. Mainly for clearing out spam submissions.
const deleteInquiry = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Inquiry not found');
  }

  await prisma.inquiry.delete({ where: { id } });
  res.json({ success: true, message: 'Inquiry deleted' });
});

export { createInquiry, getInquiries, getInquiryById, updateInquiry, deleteInquiry };
