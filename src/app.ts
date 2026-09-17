import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';
import swaggerSpec from './config/swagger';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';

const app = express();

// --- Security & parsing middleware (runs on every request, in order) ---
//
// Swagger UI (mounted below at /api/docs) needs inline <script>/<style>
// tags to render, which helmet's default CSP blocks. Rather than weaken
// CSP for the whole API (every other route only ever returns JSON, so CSP
// doesn't affect them anyway), we apply helmet's strict defaults to every
// path EXCEPT /api/docs.
app.use((req, res, next) => {
  if (req.path.startsWith('/api/docs')) {
    return next();
  }
  return helmet()(req, res, next);
});
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Raw spec JSON — useful for importing into Postman (Import -> Link) or
// any other OpenAPI-aware tool, without opening a browser.
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
