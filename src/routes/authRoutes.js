import express from 'express';
import { register, login, getProfile, updateApiKeys } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/api-keys', protect, updateApiKeys);

export default router;
