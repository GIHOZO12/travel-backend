import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Destination } from '../entities/Destination';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import slugify from '../utils/slugify';

const destinationRepo = AppDataSource.getRepository(Destination);

// GET /api/destinations
// Public listing — only published destinations, newest first.
const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const destinations = await destinationRepo.find({
    where: { isPublished: true },
    order: { createdAt: 'DESC' },
  });

  res.json({ success: true, data: destinations });
});

// GET /api/destinations/:slug
// Public detail page — includes its published tours (SRS §21-22).
const getDestinationBySlug = asyncHandler(async (req: Request, res: Response) => {
  // Express 5 types route params as `string | string[]` (to account for
  // wildcard routes that can capture multiple segments). Our `/:slug`
  // route never does that, but we satisfy the type honestly rather than
  // asserting it away.
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  // QueryBuilder rather than find(): we want every destination column but
  // only a few columns of each tour, and only the published tours — the
  // condition goes in the JOIN itself, so a destination with no published
  // tours still comes back (with tours: []).
  const destination = await destinationRepo
    .createQueryBuilder('destination')
    .leftJoin('destination.tours', 'tour', 'tour.isPublished = :isPublished', { isPublished: true })
    .addSelect([
      'tour.id',
      'tour.name',
      'tour.slug',
      'tour.durationDays',
      'tour.durationNights',
      'tour.startingPrice',
      'tour.featuredImage',
    ])
    .where('destination.slug = :slug', { slug })
    .getOne();

  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  res.json({ success: true, data: destination });
});

// POST /api/destinations
// Admin-only in Phase 4 — left open for now so we can test it directly.
const createDestination = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    country,
    overview,
    attractions,
    activities,
    bestTimeToVisit,
    heroImage,
    images,
    isFeatured,
    isPublished,
  } = req.body;

  const slug = slugify(name);

  const existing = await destinationRepo.findOneBy({ slug });
  if (existing) {
    throw new ApiError(409, `A destination named "${name}" already exists`);
  }

  const destination = await destinationRepo.save(
    destinationRepo.create({
      name,
      slug,
      country,
      overview,
      attractions: attractions || [],
      activities: activities || [],
      bestTimeToVisit,
      heroImage,
      images: images || [],
      isFeatured: isFeatured ?? false,
      isPublished: isPublished ?? true,
    }),
  );

  res.status(201).json({ success: true, data: destination });
});

// PUT /api/destinations/:id
const updateDestination = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await destinationRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Destination not found');
  }

  const data = { ...req.body };
  // Re-slug only if the name actually changed, so existing links don't
  // silently break every time someone edits an unrelated field.
  if (data.name && data.name !== existing.name) {
    data.slug = slugify(data.name);
  }

  const destination = await destinationRepo.save(destinationRepo.merge(existing, data));
  res.json({ success: true, data: destination });
});

// DELETE /api/destinations/:id
const deleteDestination = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await destinationRepo.findOneBy({ id });
  if (!existing) {
    throw new ApiError(404, 'Destination not found');
  }

  await destinationRepo.delete(id);
  res.json({ success: true, message: 'Destination deleted' });
});

export {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
};
