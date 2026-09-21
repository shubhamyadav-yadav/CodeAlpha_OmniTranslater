export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

export interface TranslationData {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  detectedSourceLanguage?: string;
  provider: string;
  timestamp: string;
}

export interface TranslationApiResponse {
  success: boolean;
  data?: TranslationData;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export interface HealthInfo {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  activeProvider: string;
  version: string;
}
