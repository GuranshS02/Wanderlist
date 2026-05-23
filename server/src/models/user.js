import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // NEVER return password in queries by default
    },
    role: {
      type: String,
      enum: ['buyer', 'creator', 'admin'],
      default: 'buyer',
    },
    avatar: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    stripeConnectId: {
      type: String,
      default: '', // Only for creators
    },
    refreshToken: {
      type: String,
      select: false, // Never expose this in API responses
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── INDEXES ─────────────────────────────────────────
// Makes searching by email fast (also enforces uniqueness)
// Email index is auto-created by `unique: true` on the field
userSchema.index({ createdAt: -1 });

// ─── MIDDLEWARE (runs before saving) ─────────────────
userSchema.pre('save', async function () {
  // Only hash password if it was changed
  if (!this.isModified('password')) return;
  // Hash with cost factor 12 (strong but not too slow)
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── INSTANCE METHODS ────────────────────────────────
// Compare entered password with hashed one in DB
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Return safe user object (no sensitive fields)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
export default User;