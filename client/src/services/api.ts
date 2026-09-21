import { Language, TranslationData, TranslationApiResponse, HealthInfo } from '../types/translation.js';

const API_BASE_URL = '/api';

export class ApiError extends Error {
  public code: string;
  public status?: number;

  constructor(message: string, code = 'UNKNOWN_ERROR', status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Fetch supported languages list from backend
 */
export async function getSupportedLanguages(): Promise<Language[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages`);
    if (!response.ok) {
      throw new ApiError(`Failed to fetch languages (HTTP ${response.status})`, 'FETCH_LANGUAGES_FAILED', response.status);
    }
    const json = (await response.json()) as { success: boolean; data: Language[] };
    return json.data || [];
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to translation server. Please ensure the backend is running.', 'NETWORK_ERROR');
  }
}

/**
 * Translate input text through backend API
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
      }),
      signal: controller.signal,
    });

    const json = (await response.json()) as TranslationApiResponse;

    if (!response.ok || !json.success) {
      const errorMessage = json.error?.message || `Translation failed with HTTP status ${response.status}`;
      const errorCode = json.error?.code || 'TRANSLATION_FAILED';
      throw new ApiError(errorMessage, errorCode, response.status);
    }

    if (!json.data) {
      throw new ApiError('Invalid response received from translation server.', 'INVALID_RESPONSE');
    }

    return json.data;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Translation request timed out. Please try again.', 'TIMEOUT_ERROR');
    }
    throw new ApiError(
      'Network connection error. Please check your internet connection or verify the server is running.',
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check backend health
 */
export async function getHealth(): Promise<HealthInfo> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new ApiError('Health check failed', 'HEALTH_CHECK_FAILED', response.status);
  }
  return response.json();
}
