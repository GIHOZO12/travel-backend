import { Request, Response } from 'express';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import slugify from '../utils/slugify';

// GET /api/destinations
// Public listing — only published destinations, newest first.
const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const destinations = await prisma.destination.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
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

  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: {
      tours: {
        where: { isPublished: true },
        select: {
          id: true,
          name: true,
          slug: true,
          durationDays: true,
          durationNights: true,
          startingPrice: true,
          featuredImage: true,
        },
      },
    },
  });

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

  const existing = await prisma.destination.findUnique({ where: { slug } });
  if (existing) {
    throw new ApiError(409, `A destination named "${name}" already exists`);
  }

  const destination = await prisma.destination.create({
    data: {
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
    },
  });

  res.status(201).json({ success: true, data: destination });
});

// PUT /api/destinations/:id
const updateDestination = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.destination.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Destination not found');
  }

  const data = { ...req.body };
  // Re-slug only if the name actually changed, so existing links don't
  // silently break every time someone edits an unrelated field.
  if (data.name && data.name !== existing.name) {
    data.slug = slugify(data.name);
  }

  const destination = await prisma.destination.update({ where: { id }, data });
  res.json({ success: true, data: destination });
});

// DELETE /api/destinations/:id
const deleteDestination = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.destination.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Destination not found');
  }

  await prisma.destination.delete({ where: { id } });
  res.json({ success: true, message: 'Destination deleted' });
});

export {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
};
