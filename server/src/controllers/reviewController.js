import Review from '../models/Review.js';
import Order from '../models/order.js';
import Itinerary from '../models/Itinerary.js';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ─── HELPER: recompute aggregate rating on the itinerary ──
async function recomputeItineraryRating(itineraryId) {
  const reviews = await Review.find({
    itinerary: itineraryId,
    isHidden: false,
  }).lean();

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  await Itinerary.updateOne(
    { _id: itineraryId },
    {
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10, // 1 decimal place
    }
  );
}

// ─── GET /api/itineraries/:id/reviews ────────────
// Public — list all reviews for an itinerary
export const listReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Allow lookup by slug or ID
    let itinerary;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      itinerary = await Itinerary.findById(id).select('_id').lean();
    }
    if (!itinerary) {
      itinerary = await Itinerary.findOne({ slug: id }).select('_id').lean();
    }
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const reviews = await Review.find({
      itinerary: itinerary._id,
      isHidden: false,
    })
      .sort({ createdAt: -1 })
      .populate('buyer', 'name avatar')
      .lean();

    // Rating distribution: how many 1-star, 2-star, etc.
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.json({ reviews, distribution });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/itineraries/:id/reviews ───────────
// Auth required — create a review (must own the itinerary)
export const createReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate input
    const result = reviewSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }

    // Find the itinerary
    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // VERIFY THE BUYER OWNS THIS ITINERARY (critical anti-fraud check)
    const order = await Order.findOne({
      buyer: req.user._id,
      itinerary: itinerary._id,
      status: 'paid',
    });

    if (!order) {
      return res.status(403).json({
        error: 'You must own this itinerary to review it',
      });
    }

    // Check for existing review (we have a unique index but also catch it cleanly here)
    const existing = await Review.findOne({
      buyer: req.user._id,
      itinerary: itinerary._id,
    });

    if (existing) {
      return res.status(409).json({
        error: 'You have already reviewed this itinerary',
        reviewId: existing._id,
      });
    }

    // Create the review
    const review = await Review.create({
      buyer: req.user._id,
      itinerary: itinerary._id,
      order: order._id,
      rating: result.data.rating,
      comment: result.data.comment || '',
      buyerName: req.user.name,
    });

    // Recompute aggregate stats on the itinerary
    await recomputeItineraryRating(itinerary._id);

    // Populate buyer info before returning
    await review.populate('buyer', 'name avatar');

    res.status(201).json({ review });
  } catch (error) {
    // Catch the database-level duplicate key error as a safety net
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already reviewed this itinerary' });
    }
    next(error);
  }
};

// ─── PUT /api/reviews/:reviewId ──────────────────
// Auth required — update your own review
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only the author can edit
    if (review.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own review' });
    }

    const result = reviewSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }

    review.rating = result.data.rating;
    review.comment = result.data.comment || '';
    await review.save();

    await recomputeItineraryRating(review.itinerary);
    await review.populate('buyer', 'name avatar');

    res.json({ review });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/reviews/:reviewId ───────────────
// Auth required — delete your own review
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own review' });
    }

    const itineraryId = review.itinerary;
    await review.deleteOne();
    await recomputeItineraryRating(itineraryId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/itineraries/:id/my-review ──────────
// Auth required — get the current user's review for this itinerary (if any)
// Used by the UI to know whether to show "Write review" or "Edit review"
export const getMyReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      buyer: req.user._id,
      itinerary: id,
    }).lean();

    res.json({ review: review || null });
  } catch (error) {
    next(error);
  }
};