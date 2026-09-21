import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { config } from '../config/env.js';

const langCodeRegex = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]+)?$/;

export const translationRequestSchema = z.object({
  text: z
    .string({
      required_error: 'Text to translate is required.',
      invalid_type_error: 'Text must be a string.',
    })
    .trim()
    .min(1, 'Text cannot be empty.')
    .max(
      config.maxTextLength,
      `Text exceeds maximum allowed length of ${config.maxTextLength} characters.`
    ),
  sourceLang: z
    .string({
      required_error: 'Source language is required.',
      invalid_type_error: 'Source language must be a string.',
    })
    .trim()
    .refine((val) => val === 'auto' || langCodeRegex.test(val), {
      message: "Source language must be 'auto' or a valid ISO language code (e.g., 'en', 'es', 'zh-CN').",
    }),
  targetLang: z
    .string({
      required_error: 'Target language is required.',
      invalid_type_error: 'Target language must be a string.',
    })
    .trim()
    .refine((val) => val !== 'auto' && langCodeRegex.test(val), {
      message: "Target language must be a valid ISO language code (e.g., 'es', 'fr', 'hi') and cannot be 'auto'.",
    }),
});

export function validateTranslationRequest(req: Request, res: Response, next: NextFunction): void {
  const result = translationRequestSchema.safeParse(req.body);

  if (!result.success) {
    const errorMessages = result.error.errors.map((err) => err.message);
    res.status(400).json({
      success: false,
      error: {
        message: errorMessages[0],
        code: 'VALIDATION_ERROR',
        details: errorMessages,
      },
    });
    return;
  }

  // Assign validated and trimmed data back to req.body
  req.body = result.data;
  next();
}
