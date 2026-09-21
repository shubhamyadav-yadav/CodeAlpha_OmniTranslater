import { BaseTranslationProvider } from './base.provider.js';
import { Language, TranslationResult } from '../../types/index.js';
import { SUPPORTED_LANGUAGES } from '../languages.js';

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match?: number;
  };
  responseStatus: number;
  responseDetails?: string;
  matches?: Array<{
    segment?: string;
    translation?: string;
    source?: string;
    target?: string;
  }>;
}

/**
 * Decodes common HTML entities often returned by translation APIs.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

export class MyMemoryProvider extends BaseTranslationProvider {
  readonly name = 'mymemory';
  private email: string;
  private apiKey: string;

  constructor(email = '', apiKey = '') {
    super();
    this.email = email;
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    // MyMemory has a free tier that works without keys
    return true;
  }

  async getSupportedLanguages(): Promise<Language[]> {
    return SUPPORTED_LANGUAGES;
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const src = sourceLang === 'auto' ? 'autodetect' : sourceLang.toLowerCase();
    const tgt = targetLang.toLowerCase();
    const langPair = `${src}|${tgt}`;

    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', langPair);

    if (this.email) {
      url.searchParams.set('de', this.email);
    }
    if (this.apiKey) {
      url.searchParams.set('key', this.apiKey);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LanguageTranslationTool/1.0',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`MyMemory API returned HTTP status ${response.status}`);
      }

      const data = (await response.json()) as MyMemoryResponse;

      if (data.responseStatus !== 200) {
        const errorMsg = data.responseDetails || 'MyMemory translation service failed.';
        throw new Error(`MyMemory Error (${data.responseStatus}): ${errorMsg}`);
      }

      let translated = data.responseData?.translatedText || '';
      translated = decodeHtmlEntities(translated);

      let detectedLang: string | undefined;
      if (sourceLang === 'auto' && data.matches && data.matches.length > 0) {
        const firstMatchSource = data.matches[0].source;
        if (firstMatchSource) {
          detectedLang = firstMatchSource.split('-')[0].toLowerCase();
        }
      }

      return {
        translatedText: translated,
        detectedSourceLanguage: detectedLang,
        provider: this.name,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Translation request timed out after 12 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
