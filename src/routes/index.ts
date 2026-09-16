import { Router } from 'express';

import destinationRoutes from './destination.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/destinations', destinationRoutes);

export default router;
