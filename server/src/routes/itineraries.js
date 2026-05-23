import express from 'express';
import {
  listItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  getMyListings,
} from '../controllers/itineraryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────
router.get('/', listItineraries);

// ─── AUTH ROUTES ──────────────────────────────
// Note: /me/listings must come BEFORE /:id to avoid clash
router.get('/me/listings', requireAuth, getMyListings);
router.post('/', requireAuth, createItinerary);
router.put('/:id', requireAuth, updateItinerary);
router.delete('/:id', requireAuth, deleteItinerary);

// ─── PUBLIC ROUTES (parametric, must come last) ──
router.get('/:id', getItinerary);

export default router;