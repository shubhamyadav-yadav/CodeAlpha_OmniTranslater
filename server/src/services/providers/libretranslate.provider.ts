import { BaseTranslationProvider } from './base.provider.js';
import { Language, TranslationResult } from '../../types/index.js';
import { SUPPORTED_LANGUAGES } from '../languages.js';

interface LibreTranslateResponse {
  translatedText?: string;
  error?: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
}

export class LibreTranslateProvider extends BaseTranslationProvider {
  readonly name = 'libretranslate';
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl = 'https://libretranslate.com', apiKey = '') {
    super();
    this.apiUrl = apiUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiUrl.trim().length > 0);
  }

  async getSupportedLanguages(): Promise<Language[]> {
    return SUPPORTED_LANGUAGES;
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const url = `${this.apiUrl}/translate`;

    const bodyPayload: Record<string, unknown> = {
      q: text,
      source: sourceLang === 'auto' ? 'auto' : sourceLang.toLowerCase(),
      target: targetLang.toLowerCase(),
      format: 'text',
    };

    if (this.apiKey) {
      bodyPayload.api_key = this.apiKey;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      const data = (await response.json()) as LibreTranslateResponse;

      if (!response.ok || data.error) {
        const errorMsg = data.error || `LibreTranslate returned HTTP status ${response.status}`;
        throw new Error(`LibreTranslate Error: ${errorMsg}`);
      }

      if (typeof data.translatedText !== 'string') {
        throw new Error('LibreTranslate returned an invalid response structure.');
      }

      return {
        translatedText: data.translatedText,
        detectedSourceLanguage: data.detectedLanguage?.language?.toLowerCase(),
        provider: this.name,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('LibreTranslate request timed out after 12 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
