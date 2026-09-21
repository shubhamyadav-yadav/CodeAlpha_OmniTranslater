export type ProviderName = 'mymemory' | 'google' | 'libretranslate';

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  success: boolean;
  data?: {
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    detectedSourceLanguage?: string;
    provider: string;
    timestamp: string;
  };
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  provider: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  activeProvider: string;
  version: string;
}
