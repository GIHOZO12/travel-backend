import { Request, Response } from 'express';
import prisma from '../config/prisma';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import slugify from '../utils/slugify';

// GET /api/blog — public, published only, newest first.
const getBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: posts });
});

// GET /api/blog/:slug — public
const getBlogPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post) {
    throw new ApiError(404, 'Blog post not found');
  }

  res.json({ success: true, data: post });
});

// POST /api/blog — admin-only
const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, featuredImage, author, category, tags, isPublished } = req.body;

  const slug = slugify(title);

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    throw new ApiError(409, `A blog post titled "${title}" already exists`);
  }

  const published = isPublished ?? true;

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      featuredImage,
      author,
      category,
      tags: tags || [],
      isPublished: published,
      // publishedAt records when it actually went live, separate from
      // isPublished — a post can be unpublished/republished later without
      // losing its original publish date.
      publishedAt: published ? new Date() : null,
    },
  });

  res.status(201).json({ success: true, data: post });
});

// PUT /api/blog/:id — admin-only
const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Blog post not found');
  }

  const data = { ...req.body };

  if (data.title && data.title !== existing.title) {
    data.slug = slugify(data.title);
  }

  // Only stamp publishedAt the FIRST time a post goes live — re-saving an
  // already-published post, or toggling isPublished off then back on,
  // shouldn't keep resetting its original publish date.
  if (data.isPublished === true && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const post = await prisma.blogPost.update({ where: { id }, data });
  res.json({ success: true, data: post });
});

// DELETE /api/blog/:id — admin-only
const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Blog post not found');
  }

  await prisma.blogPost.delete({ where: { id } });
  res.json({ success: true, message: 'Blog post deleted' });
});

export { getBlogPosts, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost };
