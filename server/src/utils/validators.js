import { z } from 'zod';

/**
 * Schema for user registration.
 * Validates name, email format, and strong password.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z
    .string()
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

/**
 * Schema for user login.
 * Looser validation - just needs email and any password to attempt.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
});