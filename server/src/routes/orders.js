import express from 'express';
import { claimItinerary, getMyOrders, getOrder } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrder);
router.post('/claim/:itineraryId', requireAuth, claimItinerary);

export default router;