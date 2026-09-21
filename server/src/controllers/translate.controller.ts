import { Request, Response, NextFunction } from 'express';
import { translationService } from '../services/translation.service.js';
import { TranslationRequest, TranslationResponse, HealthResponse } from '../types/index.js';

export class TranslateController {
  public async translate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, sourceLang, targetLang } = req.body as TranslationRequest;

      const result = await translationService.translate(text, sourceLang, targetLang);

      const response: TranslationResponse = {
        success: true,
        data: {
          translatedText: result.translatedText,
          sourceLang,
          targetLang,
          detectedSourceLanguage: result.detectedSourceLanguage,
          provider: result.provider,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getLanguages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const languages = await translationService.getSupportedLanguages();
      res.status(200).json({
        success: true,
        data: languages,
      });
    } catch (err) {
      next(err);
    }
  }

  public getHealth(req: Request, res: Response): void {
    const health: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      activeProvider: translationService.getActiveProviderName(),
      version: '1.0.0',
    };

    res.status(200).json(health);
  }
}

export const translateController = new TranslateController();
