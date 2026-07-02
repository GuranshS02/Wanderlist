import express from 'express';
import {
  listReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
} from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Reviews nested under an itinerary
router.get('/itineraries/:id/reviews', listReviews);
router.post('/itineraries/:id/reviews', requireAuth, createReview);
router.get('/itineraries/:id/my-review', requireAuth, getMyReview);

// Direct review operations
router.put('/reviews/:reviewId', requireAuth, updateReview);
router.delete('/reviews/:reviewId', requireAuth, deleteReview);

export default router;