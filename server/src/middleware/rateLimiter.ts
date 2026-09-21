import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export const translationRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    error: {
      message: 'Too many translation requests from this IP. Please wait a moment before trying again.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});
