import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.js';
import * as api from '../services/api.js';

vi.mock('../services/api.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api.js')>();
  return {
    ...actual,
    getSupportedLanguages: vi.fn(),
    translateText: vi.fn(),
    getHealth: vi.fn(),
  };
});

describe('App Component Workflow & Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getSupportedLanguages).mockResolvedValue([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'hi', name: 'Hindi' },
      { code: 'fr', name: 'French' },
    ]);
    vi.mocked(api.getHealth).mockResolvedValue({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 120,
      activeProvider: 'google',
      version: '1.0.0',
    });
  });

  it('renders application title and initial layout', async () => {
    render(<App />);
    expect(screen.getByText('OmniTranslater')).toBeDefined();
    expect(screen.getByPlaceholderText(/Type, paste, or select a sample phrase/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Neural Online • google/i)).toBeDefined();
    });
  });

  it('Test 2: Empty Input — does not call API and handles empty state cleanly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Neural Online • google/i)).toBeDefined();
    });

    const translateBtn = screen.getByRole('button', { name: /Translate/i });
    expect(translateBtn.hasAttribute('disabled')).toBe(true);
    expect(api.translateText).not.toHaveBeenCalled();
  });

  it('Test 1: Normal Translation — renders translated text on successful API response', async () => {
    vi.mocked(api.translateText).mockResolvedValue({
      translatedText: 'हैलो, आप कैसे हैं?',
      sourceLang: 'en',
      targetLang: 'hi',
      provider: 'google',
      timestamp: new Date().toISOString(),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Neural Online • google/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Type, paste, or select a sample phrase/i);
    fireEvent.change(textarea, { target: { value: 'Hello, how are you?' } });

    const translateBtn = screen.getByRole('button', { name: /Translate/i });
    expect(translateBtn.hasAttribute('disabled')).toBe(false);

    fireEvent.click(translateBtn);

    await waitFor(() => {
      expect(screen.getByText('हैलो, आप कैसे हैं?')).toBeDefined();
    });
    expect(api.translateText).toHaveBeenCalledWith('Hello, how are you?', 'en', 'hi');
  });

  it('Test 4 & 5: API / Network Failure — displays accessible error alert', async () => {
    vi.mocked(api.translateText).mockRejectedValue(
      new api.ApiError('Network connection error. Please check your internet connection.', 'NETWORK_ERROR')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Neural Online • google/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Type, paste, or select a sample phrase/i);
    fireEvent.change(textarea, { target: { value: 'Translate this please' } });

    const translateBtn = screen.getByRole('button', { name: /Translate/i });
    fireEvent.click(translateBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/Network connection error/i)).toBeDefined();
    });
  });

  it('Test 7: Language Swap — swaps source and target languages properly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Neural Online • google/i)).toBeDefined();
    });

    const swapBtn = screen.getByRole('button', { name: /Swap source and target languages/i });
    const sourceSelect = screen.getByRole('combobox', { name: 'Source Language' }) as HTMLSelectElement;
    const targetSelect = screen.getByRole('combobox', { name: 'Target Language' }) as HTMLSelectElement;

    expect(sourceSelect.value).toBe('en');
    expect(targetSelect.value).toBe('hi');

    fireEvent.click(swapBtn);

    expect(sourceSelect.value).toBe('hi');
    expect(targetSelect.value).toBe('en');
  });
});
