import crypto from 'crypto';
import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';

import { UPLOAD_DIR } from '../config/uploads';
import protect from '../middleware/protect';
import ApiError from '../utils/ApiError';

const router = Router();

// The file extension is taken from the (checked) MIME type, never from the
// uploader's filename, and the name itself is random — so an upload can't
// overwrite another file or smuggle in something like "evil.html".
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only JPG, PNG or WebP images are allowed'));
    }
  },
});

// Runs multer and turns its errors into our normal ApiError responses.
function receiveImage(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (maximum 5 MB)' : err.message;
      return next(new ApiError(400, message));
    }
    if (err) return next(err);
    next();
  });
}

/**
 * @openapi
 * /uploads:
 *   post:
 *     summary: Upload an image (admin-only)
 *     description: 'Accepts one JPG, PNG or WebP image up to 5 MB in the multipart field "file". Returns a path like /uploads/<name>.jpg to store in heroImage / featuredImage / images.'
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image saved.
 *       400:
 *         description: Missing file, wrong type or too large.
 *       401:
 *         description: Missing, invalid or expired token.
 */
// `protect` runs BEFORE multer so anonymous requests are rejected before any
// file is read from the network.
router.post('/', protect, receiveImage, (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new ApiError(400, 'No image file received (use the "file" field)'));
  }
  res.status(201).json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
});

export default router;
