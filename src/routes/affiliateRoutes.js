import express from 'express';
import { protect, checkLimits } from '../middleware/auth.js';
import {
  searchProducts,
  generateAffiliateLink,
  getTrendingProducts,
  batchGenerateLinks
} from '../controllers/affiliateController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Product search with rate limiting
router.get('/products/search', checkLimits('searches'), searchProducts);

// Get trending products
router.get('/products/trending', getTrendingProducts);

// Generate single affiliate link
router.post('/links/generate', generateAffiliateLink);

// Batch generate links for campaigns
router.post('/links/batch', batchGenerateLinks);

export default router;
