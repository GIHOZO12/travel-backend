import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { BookingRequest } from '../entities/BookingRequest';
import { BookingStatus } from '../entities/enums';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import { notifyBookingStatusChange, notifyNewBooking } from '../services/notifications';

const bookingRepo = AppDataSource.getRepository(BookingRequest);

// Every booking column plus a small summary of its tour (id, name, slug).
const bookingWithTour = () =>
  bookingRepo
    .createQueryBuilder('booking')
    .leftJoin('booking.tour', 'tour')
    .addSelect(['tour.id', 'tour.name', 'tour.slug']);

const findBookingById = (id: number) => bookingWithTour().where('booking.id = :id', { id }).getOne();

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

  const saved = await bookingRepo.save(
    bookingRepo.create({
      fullName,
      email,
      phone,
      nationality,
      travelDate,
      numberOfTravelers,
      accommodationPref,
      specialRequests,
      tourId,
    }),
  );
  // Re-read to include the tour summary — the emails need the tour's name.
  const bookingRequest = (await findBookingById(saved.id))!;

  // Fire-and-forget: the response doesn't wait for (or fail because of) email.
  void notifyNewBooking(bookingRequest);

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

  const query = bookingWithTour().orderBy('booking.createdAt', 'DESC');
  if (isValidStatus) {
    query.where('booking.status = :status', { status });
  }
  const bookingRequests = await query.getMany();

  res.json({ success: true, data: bookingRequests });
});

// GET /api/booking-requests/:id
// Admin-only.
const getBookingRequestById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const bookingRequest = await findBookingById(id);

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

  const existing = await bookingRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Booking request not found');
  }

  // Remember the old status before merge() overwrites it on `existing`.
  const previousStatus = existing.status;

  await bookingRepo.save(bookingRepo.merge(existing, req.body));
  const bookingRequest = (await findBookingById(id))!;

  // Email the customer when staff move the booking to a new status.
  if (bookingRequest.status !== previousStatus) {
    void notifyBookingStatusChange(bookingRequest);
  }

  res.json({ success: true, data: bookingRequest });
});

// DELETE /api/booking-requests/:id
// Admin-only. Mainly for clearing out spam submissions.
const deleteBookingRequest = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await bookingRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Booking request not found');
  }

  await bookingRepo.delete(id);
  res.json({ success: true, message: 'Booking request deleted' });
});

export {
  createBookingRequest,
  getBookingRequests,
  getBookingRequestById,
  updateBookingRequest,
  deleteBookingRequest,
};
