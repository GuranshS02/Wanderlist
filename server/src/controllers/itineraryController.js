import Itinerary from '../models/Itinerary.js';
import { z } from 'zod';

// ─── VALIDATION SCHEMAS ────────────────────────────────
const activityZodSchema = z.object({
  time: z.string().optional(),
  title: z.string().min(1, 'Activity title is required').max(120),
  description: z.string().optional(),
  location: z.string().optional(),
  cost: z.number().min(0).optional(),
  type: z.enum(['food', 'sight', 'activity', 'transport', 'accommodation', 'tip', 'other']).optional(),
});

const dayZodSchema = z.object({
  dayNumber: z.number().min(1),
  title: z.string().min(1, 'Day title is required').max(120),
  summary: z.string().optional(),
  activities: z.array(activityZodSchema).optional(),
  estimatedCost: z.number().min(0).optional(),
});

const createItinerarySchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(50).max(2000),
  highlight: z.string().max(120).optional(),
  country: z.string().min(1),
  city: z.string().optional(),
  flag: z.string().optional(),
  days: z.number().min(1).max(60),
  stops: z.number().min(0).optional(),
  bestSeason: z.enum(['spring', 'summer', 'fall', 'winter', 'year-round']).optional(),
  estimatedBudget: z.number().min(0).optional(),
  price: z.number().min(0).max(500),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  dayPlans: z.array(dayZodSchema).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

// ─── GET /api/itineraries ──────────────────────────────
// Public — list itineraries with optional filters and search
export const listItineraries = async (req, res, next) => {
  try {
    const {
      search,
      country,
      tag,
      minPrice,
      maxPrice,
      minDays,
      maxDays,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Build the query
    const query = { status: 'published' };

    // Full-text search across title, description, country, city
    if (search) {
      query.$text = { $search: search };
    }

    if (country) query.country = country;
    if (tag) query.tags = tag;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minDays || maxDays) {
      query.days = {};
      if (minDays) query.days.$gte = Number(minDays);
      if (maxDays) query.days.$lte = Number(maxDays);
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { salesCount: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1, reviewCount: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query in parallel for speed
    const [itineraries, total] = await Promise.all([
      Itinerary.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate('creator', 'name avatar')
        .lean(),
      Itinerary.countDocuments(query),
    ]);

    res.json({
      itineraries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + itineraries.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/itineraries/:id ──────────────────────────
// Public — get full details of one itinerary
export const getItinerary = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try finding by slug first, then by ID
    let itinerary = await Itinerary.findOne({ slug: id, status: 'published' })
      .populate('creator', 'name avatar')
      .lean();

    if (!itinerary && id.match(/^[0-9a-fA-F]{24}$/)) {
      itinerary = await Itinerary.findOne({ _id: id, status: 'published' })
        .populate('creator', 'name avatar')
        .lean();
    }

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Increment view count (fire-and-forget, no await)
    Itinerary.updateOne({ _id: itinerary._id }, { $inc: { viewCount: 1 } }).catch(() => {});

    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/itineraries ─────────────────────────────
// Auth required — create new itinerary
export const createItinerary = async (req, res, next) => {
  try {
    const result = createItinerarySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }

    const itinerary = await Itinerary.create({
      ...result.data,
      creator: req.user._id,
    });

    res.status(201).json({ itinerary });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/itineraries/:id ──────────────────────────
// Auth required — update your own itinerary (accepts ID or slug)
export const updateItinerary = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Resolve identifier: try ObjectId first, then slug
    let itinerary;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      itinerary = await Itinerary.findById(id);
    }
    if (!itinerary) {
      itinerary = await Itinerary.findOne({ slug: id });
    }
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Only the creator can update
    if (itinerary.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own itineraries' });
    }

    const result = createItinerarySchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }

    Object.assign(itinerary, result.data);
    await itinerary.save();

    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
};
// ─── DELETE /api/itineraries/:id ───────────────────────
// Auth required — soft-delete your own itinerary
export const deleteItinerary = async (req, res, next) => {
  try {
    const { id } = req.params;

    let itinerary;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      itinerary = await Itinerary.findById(id);
    }
    if (!itinerary) {
      itinerary = await Itinerary.findOne({ slug: id });
    }
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    if (itinerary.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own itineraries' });
    }

    itinerary.status = 'archived';
    await itinerary.save();

    res.json({ message: 'Itinerary archived successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/itineraries/me/listings ──────────────────
// Auth required — get all of MY itineraries (including drafts)
export const getMyListings = async (req, res, next) => {
  try {
    const { status } = req.query; // optional filter

    const query = { creator: req.user._id };
    if (status) query.status = status;

    const itineraries = await Itinerary.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ itineraries });
  } catch (error) {
    next(error);
  }
};