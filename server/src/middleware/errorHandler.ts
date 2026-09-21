import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const timestamp = new Date().toISOString();

  // Extract error message safely
  let rawMessage = 'An unexpected server error occurred.';
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (err instanceof Error) {
    rawMessage = err.message;

    if (rawMessage.includes('timed out')) {
      statusCode = 504;
      errorCode = 'GATEWAY_TIMEOUT';
    } else if (rawMessage.includes('rate limit') || rawMessage.includes('quota')) {
      statusCode = 429;
      errorCode = 'PROVIDER_QUOTA_EXCEEDED';
    } else if (rawMessage.includes('not configured')) {
      statusCode = 503;
      errorCode = 'SERVICE_UNCONFIGURED';
    } else if (rawMessage.includes('Error (4') || rawMessage.includes('status 4')) {
      statusCode = 400;
      errorCode = 'PROVIDER_BAD_REQUEST';
    } else {
      statusCode = 502;
      errorCode = 'TRANSLATION_PROVIDER_ERROR';
    }
  }

  // Server-side technical logging (never leak to client)
  console.error(`[${timestamp}] [ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Mask any accidental secret strings in the error message
  let sanitizedMessage = rawMessage;
  if (config.googleTranslateApiKey) {
    sanitizedMessage = sanitizedMessage.replace(new RegExp(config.googleTranslateApiKey, 'g'), '[REDACTED]');
  }
  if (config.libreTranslateApiKey) {
    sanitizedMessage = sanitizedMessage.replace(new RegExp(config.libreTranslateApiKey, 'g'), '[REDACTED]');
  }
  if (config.myMemoryApiKey) {
    sanitizedMessage = sanitizedMessage.replace(new RegExp(config.myMemoryApiKey, 'g'), '[REDACTED]');
  }

  // Clean user-friendly message
  res.status(statusCode).json({
    success: false,
    error: {
      message: sanitizedMessage,
      code: errorCode,
    },
  });
}
