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
// TODO: your turn. Mirror getDestinationBySlug — findUnique by slug,
// 404 via ApiError if not found, but this time include BOTH the parent
// destination AND the itineraryDays (ordered by dayNumber) since a tour
// detail page needs the full day-by-day breakdown (SRS §27).

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

  // TODO: build the create call.
  //
  // Two things to work out:
  //
  // 1. destinationId — note we DON'T need to re-check it exists here.
  //    Why? Look at tour.validator.ts's destinationExistsRule — that
  //    already ran (and would have rejected the request with a 400)
  //    before this controller function is even called. Trust your
  //    middleware chain; don't re-validate what already ran.
  //
  // 2. itineraryDays — Prisma's nested-write syntax lets you create a
  //    Tour and its related ItineraryDay rows in ONE atomic call:
  //
  //      const tour = await prisma.tour.create({
  //        data: {
  //          name, slug, category, /* ...the rest of the scalar fields... */
  //          destination: { connect: { id: destinationId } },
  //          itineraryDays: {
  //            create: (itineraryDays || []).map((day: any) => ({
  //              dayNumber: day.dayNumber,
  //              title: day.title,
  //              activities: day.activities || [],
  //            })),
  //          },
  //        },
  //        include: { itineraryDays: true },
  //      });
  //
  //    Note the pattern: `destination: { connect: { id: destinationId } }`
  //    is how you link to an EXISTING related row (vs `create`, which
  //    makes a NEW one). You're connecting to a destination that already
  //    exists, not creating one.
  //
  // Fill in the rest of the scalar fields (mirror how createDestination
  // handles `|| []` defaults for array fields and `?? false`/`?? true`
  // for booleans), then res.status(201).json({ success: true, data: tour }).
});

export { getTours, createTour };
