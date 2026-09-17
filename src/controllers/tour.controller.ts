import { Request, Response } from 'express';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import slugify from '../utils/slugify';

// GET /api/tours
// Public listing — only published tours, newest first, with a lightweight
// summary of the destination each one belongs to (so a tour card can show
// "Rwanda" without the frontend needing a second request).
const getTours = asyncHandler(async (req: Request, res: Response) => {
  const tours = await prisma.tour.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      destination: {
        select: { id: true, name: true, slug: true, country: true },
      },
    },
  });

  res.json({ success: true, data: tours });
});

// GET /api/tours/:slug
// Public detail page — full day-by-day itinerary + parent destination
// summary (SRS §25-27).
const getTourBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      destination: {
        select: { id: true, name: true, slug: true, country: true },
      },
      itineraryDays: {
        orderBy: { dayNumber: 'asc' },
      },
    },
  });

  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  res.json({ success: true, data: tour });
});

// POST /api/tours
// Admin-only in Phase 4 — left open for now so we can test it directly.
const createTour = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    category,
    durationDays,
    durationNights,
    startingPrice,
    currency,
    overview,
    highlights,
    inclusions,
    exclusions,
    requirements,
    featuredImage,
    images,
    isFeatured,
    isPublished,
    destinationId,
    itineraryDays, // expected shape: [{ dayNumber, title, activities: [...] }, ...]
  } = req.body;

  const slug = slugify(name);

  const existing = await prisma.tour.findUnique({ where: { slug } });
  if (existing) {
    throw new ApiError(409, `A tour named "${name}" already exists`);
  }

  // destinationId is already known-good here — destinationExistsRule ran
  // in the validator chain before this function was ever called. If that
  // check had failed, `validate` middleware would have returned a 400
  // before Express reached this handler at all.
  const tour = await prisma.tour.create({
    data: {
      name,
      slug,
      category,
      durationDays,
      durationNights,
      startingPrice,
      currency,
      overview,
      highlights: highlights || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      requirements: requirements || [],
      featuredImage,
      images: images || [],
      isFeatured: isFeatured ?? false,
      isPublished: isPublished ?? true,
      destination: { connect: { id: destinationId } },
      itineraryDays: {
        create: (itineraryDays || []).map((day: { dayNumber: number; title: string; activities?: string[] }) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          activities: day.activities || [],
        })),
      },
    },
    include: {
      destination: {
        select: { id: true, name: true, slug: true, country: true },
      },
      itineraryDays: {
        orderBy: { dayNumber: 'asc' },
      },
    },
  });

  res.status(201).json({ success: true, data: tour });
});

// PUT /api/tours/:id
const updateTour = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.tour.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Tour not found');
  }

  // Scalar fields only — this route doesn't touch itineraryDays. Editing
  // a tour's day-by-day plan is a different, more careful operation
  // (you'd need to decide whether to replace all days or patch individual
  // ones) and deserves its own endpoint later rather than being bolted on
  // here.
  const { itineraryDays, ...rest } = req.body;
  const data = { ...rest };

  if (data.name && data.name !== existing.name) {
    data.slug = slugify(data.name);
  }

  if (data.destinationId) {
    data.destination = { connect: { id: data.destinationId } };
    delete data.destinationId;
  }

  const tour = await prisma.tour.update({
    where: { id },
    data,
    include: {
      destination: {
        select: { id: true, name: true, slug: true, country: true },
      },
      itineraryDays: {
        orderBy: { dayNumber: 'asc' },
      },
    },
  });

  res.json({ success: true, data: tour });
});

// DELETE /api/tours/:id
const deleteTour = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.tour.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Tour not found');
  }

  // No manual cleanup needed for itineraryDays — the schema defines
  // `onDelete: Cascade` on ItineraryDay's relation to Tour, so Postgres
  // removes them automatically when the tour row goes.
  await prisma.tour.delete({ where: { id } });
  res.json({ success: true, message: 'Tour deleted' });
});

export { getTours, getTourBySlug, createTour, updateTour, deleteTour };
