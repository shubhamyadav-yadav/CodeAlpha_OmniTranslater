import { Language, TranslationResult } from '../../types/index.js';

export abstract class BaseTranslationProvider {
  abstract readonly name: string;

  /**
   * Translate text from source language to target language.
   */
  abstract translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult>;

  /**
   * Return supported languages for this provider.
   */
  abstract getSupportedLanguages(): Promise<Language[]>;

  /**
   * Check whether this provider is properly configured and ready to use.
   */
  abstract isConfigured(): boolean;
}
