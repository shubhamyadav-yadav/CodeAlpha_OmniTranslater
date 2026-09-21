import { Router } from 'express';
import { translateController } from '../controllers/translate.controller.js';
import { validateTranslationRequest } from '../middleware/validateRequest.js';
import { translationRateLimiter } from '../middleware/rateLimiter.js';

export const translateRouter = Router();

// Health check endpoint
translateRouter.get('/health', (req, res) => translateController.getHealth(req, res));

// Get list of supported languages
translateRouter.get('/languages', (req, res, next) => translateController.getLanguages(req, res, next));

// Translate text endpoint with rate limiting and schema validation
translateRouter.post('/translate', translationRateLimiter, validateTranslationRequest, (req, res, next) =>
  translateController.translate(req, res, next)
);
