import { verifyAccessToken } from '../utils/tokens.js';
import User from '../models/User.js';

/**
 * Middleware that protects routes by verifying the access token.
 * If valid, attaches the user to req.user for downstream handlers.
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token (throws if invalid or expired)
    const decoded = verifyAccessToken(token);

    // Fetch the user from DB to ensure they still exist and are active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }

    // Attach user to request for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to require a specific role (e.g., creator, admin).
 * Use AFTER requireAuth.
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};