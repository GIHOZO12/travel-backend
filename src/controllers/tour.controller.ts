import { Request, Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Tour } from '../entities/Tour';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import slugify from '../utils/slugify';

const tourRepo = AppDataSource.getRepository(Tour);

// Every column of the tour, plus a lightweight summary of its destination
// (so a tour card can show "Rwanda" without a second request). find() can't
// pick only some columns of a relation without also listing every Tour
// column, so this uses a QueryBuilder: select all of `tour`, join
// `destination` and add just four of its columns.
const tourWithDestination = () =>
  tourRepo
    .createQueryBuilder('tour')
    .leftJoin('tour.destination', 'destination')
    .addSelect(['destination.id', 'destination.name', 'destination.slug', 'destination.country']);

// One tour with its destination summary and full day-by-day itinerary.
// Used by the detail page and as the response for create/update.
const findTourDetails = (where: FindOptionsWhere<Tour>) =>
  tourWithDestination()
    .leftJoinAndSelect('tour.itineraryDays', 'itineraryDay')
    .where(where)
    .orderBy('itineraryDay.dayNumber', 'ASC')
    .getOne();

// GET /api/tours
// Public listing — only published tours, newest first, with a lightweight
// summary of the destination each one belongs to (so a tour card can show
// "Rwanda" without the frontend needing a second request).
const getTours = asyncHandler(async (req: Request, res: Response) => {
  const tours = await tourWithDestination()
    .where('tour.isPublished = :isPublished', { isPublished: true })
    .orderBy('tour.createdAt', 'DESC')
    .getMany();

  res.json({ success: true, data: tours });
});

// GET /api/tours/:slug
// Public detail page — full day-by-day itinerary + parent destination
// summary (SRS §25-27).
const getTourBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const tour = await findTourDetails({ slug });

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

  const existing = await tourRepo.findOneBy({ slug });
  if (existing) {
    throw new ApiError(409, `A tour named "${name}" already exists`);
  }

  // destinationId is already known-good here — destinationExistsRule ran
  // in the validator chain before this function was ever called. If that
  // check had failed, `validate` middleware would have returned a 400
  // before Express reached this handler at all.
  const saved = await tourRepo.save(
    tourRepo.create({
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
      destinationId,
      // Inserted together with the tour, in one transaction, because the
      // Tour.itineraryDays relation has `cascade: ['insert']`.
      itineraryDays: (itineraryDays || []).map((day: { dayNumber: number; title: string; activities?: string[] }) => ({
        dayNumber: day.dayNumber,
        title: day.title,
        activities: day.activities || [],
      })),
    }),
  );

  // Re-read so the response has the same shape as GET /api/tours/:slug
  // (destination summary, itinerary in day order).
  const tour = await findTourDetails({ id: saved.id });

  res.status(201).json({ success: true, data: tour });
});

// PUT /api/tours/:id
const updateTour = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await tourRepo.findOneBy({ id });
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

  // A new destinationId (if sent) is just a column here — save() writes it
  // straight into tours."destinationId".
  await tourRepo.save(tourRepo.merge(existing, data));
  const tour = await findTourDetails({ id });

  res.json({ success: true, data: tour });
});

// DELETE /api/tours/:id
const deleteTour = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await tourRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Tour not found');
  }

  // No manual cleanup needed for itineraryDays — the ItineraryDay entity
  // defines `onDelete: 'CASCADE'` on its relation to Tour, so Postgres
  // removes them automatically when the tour row goes.
  await tourRepo.delete(id);
  res.json({ success: true, message: 'Tour deleted' });
});

export { getTours, getTourBySlug, createTour, updateTour, deleteTour };
