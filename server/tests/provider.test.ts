import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { GoogleTranslationProvider } from '../src/services/providers/google.provider.js';

const app = createApp();

describe('Translation Provider & Execution Quality', () => {
  it('should accurately translate "hlo how are you" to Hindi ("हेलो आप कैसे हैं")', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'hlo how are you',
        sourceLang: 'en',
        targetLang: 'hi',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.translatedText).toContain('हेलो आप कैसे हैं');
  }, 15000);

  it('should translate "Where is the nearest hospital?" to Hindi', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'Where is the nearest hospital?',
        sourceLang: 'en',
        targetLang: 'hi',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.translatedText).toContain('अस्पताल');
  }, 15000);

  it('should translate "Good morning, have a great day!" to Spanish and French', async () => {
    const resEs = await request(app)
      .post('/api/translate')
      .send({
        text: 'Good morning, have a great day!',
        sourceLang: 'en',
        targetLang: 'es',
      });

    expect(resEs.status).toBe(200);
    expect(resEs.body.data.translatedText.toLowerCase()).toContain('días');

    const resFr = await request(app)
      .post('/api/translate')
      .send({
        text: 'Good morning, have a great day!',
        sourceLang: 'en',
        targetLang: 'fr',
      });

    expect(resFr.status).toBe(200);
    expect(resFr.body.data.translatedText.toLowerCase()).toContain('bonjour');
  }, 20000);

  it('should support Google Cloud API key mode when key is present', () => {
    const providerWithKey = new GoogleTranslationProvider('AIzaSyDummyKey');
    expect(providerWithKey.isConfigured()).toBe(true);
  });
});
