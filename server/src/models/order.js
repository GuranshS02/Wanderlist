import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // ─── WHO BOUGHT WHAT ────────────────────────
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
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ─── MONEY (stored in cents to avoid float errors) ──
    amountTotal: {
      type: Number, // cents — e.g. 1800 = $18.00
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
    },
    platformFee: {
      type: Number, // 15% to Wanderlist
      default: 0,
    },
    creatorEarning: {
      type: Number, // 85% to creator
      default: 0,
    },

    // ─── STATUS ─────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // ─── STRIPE REFERENCES (populated later) ────
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },

    // ─── BUYER SNAPSHOT (for receipts/history) ──
    buyerEmail: { type: String, required: true },
    itineraryTitle: { type: String, required: true },

    // ─── METADATA ───────────────────────────────
    paidAt: { type: Date },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ─── INDEXES ────────────────────────────────────
orderSchema.index({ buyer: 1, status: 1, createdAt: -1 });
orderSchema.index({ creator: 1, status: 1, createdAt: -1 });

// ─── INSTANCE METHODS ───────────────────────────
orderSchema.methods.toReceipt = function () {
  return {
    id: this._id,
    itineraryTitle: this.itineraryTitle,
    amount: (this.amountTotal / 100).toFixed(2),
    currency: this.currency.toUpperCase(),
    status: this.status,
    paidAt: this.paidAt,
    createdAt: this.createdAt,
  };
};

const Order = mongoose.model('Order', orderSchema);
export default Order;