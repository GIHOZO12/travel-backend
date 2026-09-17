import { Router } from 'express';

import authRoutes from './auth.routes';
import destinationRoutes from './destination.routes';
import tourRoutes from './tour.routes';
import inquiryRoutes from './inquiry.routes';
import bookingRequestRoutes from './bookingRequest.routes';
import faqRoutes from './faq.routes';
import testimonialRoutes from './testimonial.routes';
import blogPostRoutes from './blogPost.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/tours', tourRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/booking-requests', bookingRequestRoutes);
router.use('/faqs', faqRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/blog', blogPostRoutes);

export default router;
