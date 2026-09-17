import { Router } from 'express';

import { login, getMe, createAdmin } from '../controllers/auth.controller';
import protect from '../middleware/protect';
import validate from '../middleware/validate';
import { loginRules, createAdminRules } from '../validators/auth.validator';

const router = Router();

router.post('/login', loginRules, validate, login);

// Protected — requires a valid token from /login first.
router.get('/me', protect, getMe);
router.post('/admins', protect, createAdminRules, validate, createAdmin);

export default router;
