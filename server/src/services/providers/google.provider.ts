import { BaseTranslationProvider } from './base.provider.js';
import { Language, TranslationResult } from '../../types/index.js';
import { SUPPORTED_LANGUAGES } from '../languages.js';

interface GoogleCloudV2Response {
  data?: {
    translations?: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
    status?: string;
  };
}

export class GoogleTranslationProvider extends BaseTranslationProvider {
  readonly name = 'google';
  private apiKey: string;

  constructor(apiKey = '') {
    super();
    this.apiKey = apiKey.trim();
  }

  isConfigured(): boolean {
    return true;
  }

  async getSupportedLanguages(): Promise<Language[]> {
    return SUPPORTED_LANGUAGES;
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Text to translate cannot be empty.');
    }

    const src = sourceLang === 'auto' ? 'auto' : sourceLang.toLowerCase();
    const tgt = targetLang.toLowerCase();

    // Mode A: Official Google Cloud Translation API v2 (if API key is supplied)
    if (this.apiKey) {
      return this.translateWithCloudApiKey(trimmed, src, tgt);
    }

    // Mode B: Google Neural Machine Translation Gateway (high accuracy out-of-the-box)
    return this.translateWithGoogleGateway(trimmed, src, tgt);
  }

  private async translateWithCloudApiKey(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    const url = new URL('https://translation.googleapis.com/language/translate/v2');
    url.searchParams.set('key', this.apiKey);

    const bodyPayload: Record<string, unknown> = {
      q: [text],
      target: targetLang,
      format: 'text',
    };

    if (sourceLang !== 'auto') {
      bodyPayload.source = sourceLang;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      const data = (await response.json()) as GoogleCloudV2Response;

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || `Google API returned status ${response.status}`;
        throw new Error(`Google Cloud Translation Error: ${errorMsg}`);
      }

      const translation = data.data?.translations?.[0];
      if (!translation) {
        throw new Error('Google Cloud Translation returned an empty translation result.');
      }

      return {
        translatedText: translation.translatedText,
        detectedSourceLanguage: translation.detectedSourceLanguage?.toLowerCase(),
        provider: 'google-cloud',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Google Cloud Translation request timed out after 12 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async translateWithGoogleGateway(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', sourceLang);
    url.searchParams.set('tl', targetLang);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', text);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Google Translate service returned status ${response.status}`);
      }

      const data = (await response.json()) as unknown;

      if (!Array.isArray(data) || !Array.isArray(data[0])) {
        throw new Error('Google Translate returned an unexpected data structure.');
      }

      const translatedText = (data[0] as Array<[string, ...unknown[]]>)
        .map((chunk) => chunk[0] || '')
        .join('');

      const detectedSourceLanguage = typeof data[2] === 'string' ? data[2].toLowerCase() : undefined;

      return {
        translatedText,
        detectedSourceLanguage,
        provider: 'google',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Google Translate request timed out after 12 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
