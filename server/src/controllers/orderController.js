import Order from '../models/order.js';
import Itinerary from '../models/Itinerary.js';
import {
  sendPurchaseReceiptEmail,
  sendCreatorSaleEmail,
} from '../services/emailService.js';
import User from '../models/user.js';

// ─── POST /api/orders/claim/:itineraryId ─────────
// TEMPORARY: lets a user "purchase" an itinerary for free.
// Will be replaced by Stripe webhook when payments are wired.
export const claimItinerary = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary || itinerary.status !== 'published') {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Can't claim your own itinerary
    if (itinerary.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot claim your own itinerary' });
    }

    // Check if already claimed
    const existingOrder = await Order.findOne({
      buyer: req.user._id,
      itinerary: itinerary._id,
      status: 'paid',
    });
    if (existingOrder) {
      return res.status(400).json({
        error: 'You already own this itinerary',
        orderId: existingOrder._id,
      });
    }

    // Create a paid order (free during testing phase)
    const amountTotal = Math.round(itinerary.price * 100);
    const platformFee = Math.round(amountTotal * 0.15);
    const creatorEarning = amountTotal - platformFee;

    const order = await Order.create({
      buyer: req.user._id,
      itinerary: itinerary._id,
      creator: itinerary.creator,
      amountTotal,
      platformFee,
      creatorEarning,
      buyerEmail: req.user.email,
      itineraryTitle: itinerary.title,
      status: 'paid',
      paidAt: new Date(),
    });

    // Increment the itinerary's sales count
    await Itinerary.updateOne(
      { _id: itinerary._id },
      { $inc: { salesCount: 1 } }
    );

    // ─── FIRE-AND-FORGET EMAILS ───
// Receipt to buyer
sendPurchaseReceiptEmail({
  to: req.user.email,
  buyerName: req.user.name,
  itineraryTitle: itinerary.title,
  itinerarySlug: itinerary.slug || itinerary._id,
  amount: (amountTotal / 100).toFixed(2),
  orderId: order._id.toString(),
}).catch(err => console.error('Receipt email error:', err));

// Sale notification to creator (need to fetch their email)
User.findById(itinerary.creator).select('email name').lean()
  .then(creator => {
    if (creator?.email) {
      sendCreatorSaleEmail({
        to: creator.email,
        creatorName: creator.name,
        itineraryTitle: itinerary.title,
        buyerName: req.user.name,
        earnings: (creatorEarning / 100).toFixed(2),
      });
    }
  })
  .catch(err => console.error('Creator email error:', err));

    res.status(201).json({
      order: order.toReceipt(),
      message: 'Itinerary claimed successfully (test mode)',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/orders/me ──────────────────────────
// Returns all paid orders for the current user (their library)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      buyer: req.user._id,
      status: 'paid',
    })
      .sort({ paidAt: -1 })
      .populate('itinerary', 'title slug coverImage days price flag country city averageRating')
      .populate('creator', 'name avatar')
      .lean();

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/orders/:id ─────────────────────────
// Get full details of one order (for receipt page)
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      buyer: req.user._id,
    })
      .populate('itinerary')
      .populate('creator', 'name avatar')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};