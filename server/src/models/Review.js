import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // ─── WHO REVIEWED WHAT ──────────────────────
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itinerary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    // ─── THE REVIEW CONTENT ─────────────────────
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },

    // ─── BUYER SNAPSHOT (for display) ───────────
    buyerName: { type: String, required: true },

    // ─── MODERATION ─────────────────────────────
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── CRITICAL: one review per buyer per itinerary ──
reviewSchema.index({ buyer: 1, itinerary: 1 }, { unique: true });

// Index for fetching all reviews on an itinerary (sorted by recency)
reviewSchema.index({ itinerary: 1, isHidden: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;