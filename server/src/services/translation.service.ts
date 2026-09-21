import { BaseTranslationProvider } from './providers/base.provider.js';
import { MyMemoryProvider } from './providers/mymemory.provider.js';
import { GoogleTranslationProvider } from './providers/google.provider.js';
import { LibreTranslateProvider } from './providers/libretranslate.provider.js';
import { config } from '../config/env.js';
import { Language, TranslationResult } from '../types/index.js';

export class TranslationService {
  private activeProvider: BaseTranslationProvider;
  private providers: Map<string, BaseTranslationProvider> = new Map();

  constructor() {
    // Register available providers
    const myMemory = new MyMemoryProvider(config.myMemoryEmail, config.myMemoryApiKey);
    const google = new GoogleTranslationProvider(config.googleTranslateApiKey);
    const libre = new LibreTranslateProvider(config.libreTranslateApiUrl, config.libreTranslateApiKey);

    this.providers.set('mymemory', myMemory);
    this.providers.set('google', google);
    this.providers.set('libretranslate', libre);

    // Select provider based on configuration
    const selected = this.providers.get(config.translationProvider);
    if (!selected) {
      console.warn(
        `[TranslationService] Unknown provider "${config.translationProvider}". Falling back to 'mymemory'.`
      );
      this.activeProvider = myMemory;
    } else {
      this.activeProvider = selected;
    }

    console.info(`[TranslationService] Initialized with active provider: "${this.activeProvider.name}"`);
  }

  public getActiveProviderName(): string {
    return this.activeProvider.name;
  }

  public async getSupportedLanguages(): Promise<Language[]> {
    return this.activeProvider.getSupportedLanguages();
  }

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Text to translate cannot be empty.');
    }

    // Optimization: If source and target are explicitly identical, return text without network call
    if (sourceLang !== 'auto' && sourceLang.toLowerCase() === targetLang.toLowerCase()) {
      return {
        translatedText: trimmed,
        detectedSourceLanguage: sourceLang.toLowerCase(),
        provider: 'direct-match',
      };
    }

    return this.activeProvider.translate(trimmed, sourceLang, targetLang);
  }
}

// Singleton export
export const translationService = new TranslationService();
