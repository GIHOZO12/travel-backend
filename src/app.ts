import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import routes from './routes';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';

const app = express();

// --- Security & parsing middleware (runs on every request, in order) ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Basic rate limiting across the API — the SRS calls for spam protection
// on public forms (§35, §68); this is the first, coarse layer of that.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api', routes);

// --- 404 + centralized error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
