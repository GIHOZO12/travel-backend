import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';
import swaggerSpec from './config/swagger';
import { UPLOAD_DIR } from './config/uploads';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';

const app = express();

// Render (and most hosts) put a proxy in front of the app that sets
// X-Forwarded-For. Trusting exactly one hop makes req.ip the real client IP,
// which the rate limiter below needs. Override with TRUST_PROXY if the number
// of proxies differs (0 = none, e.g. running without Docker locally).
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));

app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  express.static(UPLOAD_DIR, { maxAge: '7d', immutable: true }),
);


app.use((req, res, next) => {
  if (req.path.startsWith('/api/docs')) {
    return next();
  }
  return helmet()(req, res, next);
});
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
