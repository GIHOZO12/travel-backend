const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');

// GET /api/destinations
// Public listing — only published destinations, newest first.
const getDestinations = asyncHandler(async (req, res) => {
  const destinations = await prisma.destination.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: destinations });
});

// GET /api/destinations/:slug
// Public detail page — includes its published tours (SRS §21-22).
const getDestinationBySlug = asyncHandler(async (req, res) => {
  const destination = await prisma.destination.findUnique({
    where: { slug: req.params.slug },
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
const createDestination = asyncHandler(async (req, res) => {
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
const updateDestination = asyncHandler(async (req, res) => {
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
const deleteDestination = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.destination.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Destination not found');
  }

  await prisma.destination.delete({ where: { id } });
  res.json({ success: true, message: 'Destination deleted' });
});

module.exports = {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
};
