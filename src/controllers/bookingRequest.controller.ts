import { Request, Response } from 'express';
import { BookingStatus } from '@prisma/client';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';

// POST /api/booking-requests
// PUBLIC — any website visitor can submit this. No auth required
// (SRS §31-32).
const createBookingRequest = asyncHandler(async (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    nationality,
    travelDate,
    numberOfTravelers,
    accommodationPref,
    specialRequests,
    tourId,
  } = req.body;

  const bookingRequest = await prisma.bookingRequest.create({
    data: {
      fullName,
      email,
      phone,
      nationality,
      travelDate,
      numberOfTravelers,
      accommodationPref,
      specialRequests,
      tour: { connect: { id: tourId } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Your booking request has been received. Our team will contact you to confirm availability.',
    data: bookingRequest,
  });
});

// GET /api/booking-requests
// Admin-only. Supports optional ?status=PENDING filtering.
const getBookingRequests = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const isValidStatus = typeof status === 'string' && Object.values(BookingStatus).includes(status as BookingStatus);

  const bookingRequests = await prisma.bookingRequest.findMany({
    where: isValidStatus ? { status: status as BookingStatus } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      tour: { select: { id: true, name: true, slug: true } },
    },
  });

  res.json({ success: true, data: bookingRequests });
});

// GET /api/booking-requests/:id
// Admin-only.
const getBookingRequestById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const bookingRequest = await prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      tour: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!bookingRequest) {
    throw new ApiError(404, 'Booking request not found');
  }

  res.json({ success: true, data: bookingRequest });
});

// PUT /api/booking-requests/:id
// Admin-only. Used to progress `status` through the booking workflow
// (New -> Pending -> Confirmed -> Completed, or Cancelled/Rejected at any
// point — SRS §60).
const updateBookingRequest = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Booking request not found');
  }

  const { tourId, ...rest } = req.body;
  const data: Record<string, unknown> = { ...rest };

  if (tourId) {
    data.tour = { connect: { id: tourId } };
  }

  const bookingRequest = await prisma.bookingRequest.update({
    where: { id },
    data,
    include: {
      tour: { select: { id: true, name: true, slug: true } },
    },
  });

  res.json({ success: true, data: bookingRequest });
});

// DELETE /api/booking-requests/:id
// Admin-only. Mainly for clearing out spam submissions.
const deleteBookingRequest = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Booking request not found');
  }

  await prisma.bookingRequest.delete({ where: { id } });
  res.json({ success: true, message: 'Booking request deleted' });
});

export {
  createBookingRequest,
  getBookingRequests,
  getBookingRequestById,
  updateBookingRequest,
  deleteBookingRequest,
};
