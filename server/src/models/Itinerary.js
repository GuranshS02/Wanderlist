import mongoose from 'mongoose';

// Sub-schema for a single activity inside a day
const activitySchema = new mongoose.Schema(
  {
    time: { type: String }, // e.g. "9:00 AM"
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    cost: { type: Number, default: 0, min: 0 },
    type: {
      type: String,
      enum: ['food', 'sight', 'activity', 'transport', 'accommodation', 'tip', 'other'],
      default: 'other',
    },
  },
  { _id: false }
);

// Sub-schema for a single day in the itinerary
const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    activities: [activitySchema],
    estimatedCost: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// Main itinerary schema
const itinerarySchema = new mongoose.Schema(
  {
    // ─── BASIC INFO ──────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    highlight: {
      type: String,
      trim: true,
      maxlength: [120, 'Highlight cannot exceed 120 characters'],
    },

    // ─── LOCATION ────────────────────────────
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    flag: {
      type: String, // emoji
      default: '🌍',
    },

    // ─── TRIP DETAILS ────────────────────────
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Trip must be at least 1 day'],
      max: [60, 'Trip cannot exceed 60 days'],
    },
    stops: {
      type: Number,
      default: 0,
    },
    bestSeason: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'year-round'],
      default: 'year-round',
    },
    estimatedBudget: {
      type: Number,
      min: 0,
    },

    // ─── PRICING ─────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [500, 'Price cannot exceed $500'],
    },
    currency: {
      type: String,
      default: 'USD',
    },

    // ─── CONTENT (the actual itinerary) ──────
    coverImage: {
      type: String,
      default: '',
    },
    gallery: [{ type: String }],
    dayPlans: [daySchema],

    // ─── METADATA ────────────────────────────
    tags: [{
      type: String,
      enum: ['Culture', 'Adventure', 'Budget', 'Luxury', 'Coast', 'Nature', 'Food', 'Family', 'Solo', 'Romantic', 'Trekking', 'Photography'],
    }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },

    // ─── PERFORMANCE METRICS (denormalized for speed) ──
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },

    // ─── FEATURED / BADGES ───────────────────
    isFeatured: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      enum: ['Bestseller', 'Top Rated', 'Trending', 'New', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── INDEXES (for fast searches) ──────────
itinerarySchema.index({ country: 1, status: 1 });
itinerarySchema.index({ tags: 1, status: 1 });
itinerarySchema.index({ price: 1, status: 1 });
itinerarySchema.index({ salesCount: -1, status: 1 });
itinerarySchema.index({ createdAt: -1, status: 1 });
itinerarySchema.index({
  title: 'text',
  description: 'text',
  country: 'text',
  city: 'text',
});

// ─── MIDDLEWARE: auto-generate slug from title ──
itinerarySchema.pre('save', async function () {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80)
      + '-' + Math.random().toString(36).substring(2, 8);
  }

  // Auto-set stops count from dayPlans if not provided
  if (this.dayPlans && this.dayPlans.length > 0 && !this.stops) {
    this.stops = this.dayPlans.reduce(
      (sum, day) => sum + (day.activities?.length || 0),
      0
    );
  }
});

// ─── INSTANCE METHODS ────────────────────────
itinerarySchema.methods.toCard = function () {
  // Lightweight version for list views (no full dayPlans)
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    highlight: this.highlight,
    country: this.country,
    city: this.city,
    flag: this.flag,
    days: this.days,
    stops: this.stops,
    price: this.price,
    coverImage: this.coverImage,
    tags: this.tags,
    salesCount: this.salesCount,
    averageRating: this.averageRating,
    reviewCount: this.reviewCount,
    badge: this.badge,
    creator: this.creator,
    createdAt: this.createdAt,
  };
};

const Itinerary = mongoose.model('Itinerary', itinerarySchema);
export default Itinerary;