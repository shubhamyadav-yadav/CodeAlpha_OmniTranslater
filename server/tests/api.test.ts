import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('API Endpoints Verification', () => {
  describe('GET /api/health', () => {
    it('should return 200 OK with health status and active provider', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('activeProvider');
      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(typeof res.body.uptimeSeconds).toBe('number');
    });
  });

  describe('GET /api/languages', () => {
    it('should return a list of supported languages with codes and names', async () => {
      const res = await request(app).get('/api/languages');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(5);

      const english = res.body.data.find((lang: { code: string }) => lang.code === 'en');
      expect(english).toBeDefined();
      expect(english.name).toBe('English');
    });
  });

  describe('POST /api/translate Validation Tests', () => {
    it('should return 400 if text is empty', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: '', sourceLang: 'en', targetLang: 'es' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('Text cannot be empty');
    });

    it('should return 400 if text is only whitespace', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: '    ', sourceLang: 'en', targetLang: 'es' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if target language is "auto"', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello', sourceLang: 'en', targetLang: 'auto' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('Target language');
    });

    it('should return 400 if source language format is invalid', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello', sourceLang: 'invalid_lang_code!!', targetLang: 'es' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if text exceeds max length limit', async () => {
      const longText = 'a'.repeat(5001);
      const res = await request(app)
        .post('/api/translate')
        .send({ text: longText, sourceLang: 'en', targetLang: 'es' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('exceeds maximum allowed length');
    });

    it('should return direct match immediately if source and target are identical', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({ text: 'Hello world', sourceLang: 'en', targetLang: 'en' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.translatedText).toBe('Hello world');
      expect(res.body.data.provider).toBe('direct-match');
    });
  });

  describe('404 Route Catch-All', () => {
    it('should return structured 404 for unknown endpoints', async () => {
      const res = await request(app).get('/api/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
