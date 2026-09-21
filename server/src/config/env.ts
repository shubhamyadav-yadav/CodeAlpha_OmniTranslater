import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, fallback to root if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  clientOrigin: string;
  translationProvider: 'mymemory' | 'google' | 'libretranslate';
  googleTranslateApiKey: string;
  libreTranslateApiUrl: string;
  libreTranslateApiKey: string;
  myMemoryEmail: string;
  myMemoryApiKey: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  maxTextLength: number;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  translationProvider: (process.env.TRANSLATION_PROVIDER as AppConfig['translationProvider']) || 'google',
  googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY || '',
  libreTranslateApiUrl: process.env.LIBRETRANSLATE_API_URL || 'https://libretranslate.com',
  libreTranslateApiKey: process.env.LIBRETRANSLATE_API_KEY || '',
  myMemoryEmail: process.env.MYMEMORY_EMAIL || '',
  myMemoryApiKey: process.env.MYMEMORY_API_KEY || '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min default
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  maxTextLength: parseInt(process.env.MAX_TEXT_LENGTH || '5000', 10),
};
