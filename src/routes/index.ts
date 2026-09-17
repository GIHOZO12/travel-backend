import { Router } from 'express';

import authRoutes from './auth.routes';
import destinationRoutes from './destination.routes';
import tourRoutes from './tour.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/tours', tourRoutes);

export default router;
