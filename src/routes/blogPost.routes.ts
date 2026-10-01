import { Router } from 'express';

import {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blogPost.controller';
import protect from '../middleware/protect';
import requireAdmin from '../middleware/requireAdmin';
import validate from '../middleware/validate';
import {
  idParamRule,
  createBlogPostRules,
  updateBlogPostRules,
} from '../validators/blogPost.validator';

const router = Router();

/**
 * @openapi
 * /blog:
 *   get:
 *     summary: List published blog posts
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Array of published posts, newest first.
 */
router.get('/', getBlogPosts);

/**
 * @openapi
 * /blog/{slug}:
 *   get:
 *     summary: Get a blog post by slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The blog post.
 *       404:
 *         description: No post with that slug.
 */
router.get('/:slug', getBlogPostBySlug);

/**
 * @openapi
 * /blog:
 *   post:
 *     summary: Create a blog post (any logged-in admin or staff account)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               featuredImage: { type: string }
 *               author: { type: string }
 *               category: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               isPublished: { type: boolean }
 *     responses:
 *       201:
 *         description: Blog post created.
 *       401:
 *         description: Missing, invalid or expired token.
 *       409:
 *         description: A post with that title/slug already exists.
 */
router.post('/', protect, createBlogPostRules, validate, createBlogPost);

/**
 * @openapi
 * /blog/{id}:
 *   put:
 *     summary: Update a blog post (any logged-in admin or staff account)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated blog post.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No post with that id.
 */
router.put('/:id', protect, updateBlogPostRules, validate, updateBlogPost);

/**
 * @openapi
 * /blog/{id}:
 *   delete:
 *     summary: Delete a blog post (admin-only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog post deleted.
 *       401:
 *         description: Missing, invalid or expired token.
 *       404:
 *         description: No post with that id.
 */
router.delete('/:id', protect, requireAdmin, idParamRule, validate, deleteBlogPost);

export default router;
