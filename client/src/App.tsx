import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { LanguageSelector } from './components/LanguageSelector.js';
import { TranslationInput } from './components/TranslationInput.js';
import { TranslationOutput } from './components/TranslationOutput.js';
import { AlertBanner } from './components/AlertBanner.js';
import { Footer } from './components/Footer.js';
import { getSupportedLanguages, translateText, getHealth, ApiError } from './services/api.js';
import { Language, HealthInfo } from './types/translation.js';
import './styles/App.css';

const DEFAULT_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

const SAMPLE_PROMPTS = [
  { label: '👋 Greeting', text: 'Hello, how are you doing today?' },
  { label: '✈️ Travel', text: 'Where is the nearest train station?' },
  { label: '💼 Work', text: 'Can you please review this project proposal?' },
  { label: '✨ Polite', text: 'Thank you very much for your kind support.' },
];

const MAX_CHAR_LIMIT = 5000;

export const App: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string | undefined>(undefined);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const [langList, health] = await Promise.allSettled([
          getSupportedLanguages(),
          getHealth(),
        ]);

        if (!mounted) return;

        if (langList.status === 'fulfilled' && langList.value.length > 0) {
          setLanguages(langList.value);
        }

        if (health.status === 'fulfilled') {
          setHealthInfo(health.value);
          setServerError(false);
        } else {
          setServerError(true);
        }
      } catch {
        if (mounted) setServerError(true);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const handleTranslate = useCallback(async (customText?: string) => {
    const textToTranslate = typeof customText === 'string' ? customText : sourceText;
    const trimmed = textToTranslate.trim();

    if (!trimmed) {
      setErrorMessage('Please enter or paste text to translate.');
      return;
    }

    if (trimmed.length > MAX_CHAR_LIMIT) {
      setErrorMessage(`Text exceeds maximum allowed length of ${MAX_CHAR_LIMIT.toLocaleString()} characters.`);
      return;
    }

    setErrorMessage(null);
    setIsTranslating(true);

    try {
      const response = await translateText(trimmed, sourceLang, targetLang);
      setTranslatedText(response.translatedText);
      setProvider(response.provider);
      setDetectedLang(response.detectedSourceLanguage);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred during translation.');
      }
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  const handleSwap = () => {
    if (sourceLang === 'auto' || isTranslating) return;

    const previousSource = sourceLang;
    const previousTarget = targetLang;

    setSourceLang(previousTarget);
    setTargetLang(previousSource);

    if (translatedText.trim()) {
      const prevOutput = translatedText;
      const prevInput = sourceText;
      setSourceText(prevOutput);
      setTranslatedText(prevInput);
    }
  };

  const handleSamplePromptClick = (text: string) => {
    setSourceText(text);
    setErrorMessage(null);
    handleTranslate(text);
  };

  const handleClearInput = () => {
    setSourceText('');
    setErrorMessage(null);
  };

  const handleClearOutput = () => {
    setTranslatedText('');
    setProvider('');
    setDetectedLang(undefined);
  };

  return (
    <div className="app-container">
      <Header healthInfo={healthInfo} serverError={serverError} />

      <main className="main-content">
        {/* Error notification banner */}
        <AlertBanner
          message={errorMessage}
          type="error"
          onDismiss={() => setErrorMessage(null)}
        />

        {/* Language selector controls */}
        <LanguageSelector
          languages={languages}
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSourceChange={(lang) => {
            setSourceLang(lang);
            setErrorMessage(null);
          }}
          onTargetChange={(lang) => {
            setTargetLang(lang);
            setErrorMessage(null);
          }}
          onSwap={handleSwap}
          isTranslating={isTranslating}
        />

        {/* Translation workspace grid */}
        <div className="translation-grid">
          {/* Source Input Card */}
          <TranslationInput
            value={sourceText}
            sourceLang={sourceLang}
            onChange={(val) => {
              setSourceText(val);
              if (errorMessage) setErrorMessage(null);
            }}
            onClear={handleClearInput}
            onTranslate={() => handleTranslate()}
            isTranslating={isTranslating}
            maxLength={MAX_CHAR_LIMIT}
          />

          {/* Target Output Card */}
          <TranslationOutput
            translatedText={translatedText}
            isTranslating={isTranslating}
            targetLang={targetLang}
            provider={provider}
            detectedLang={detectedLang}
            onClear={handleClearOutput}
          />
        </div>

        {/* Quick-try sample chips */}
        <div className="quick-try-section" aria-label="Sample sentences to try">
          <span className="quick-try-label">Try Samples:</span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={`sample-${idx}`}
              type="button"
              className="sample-chip"
              onClick={() => handleSamplePromptClick(prompt.text)}
              disabled={isTranslating}
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Main Action Bar */}
        <div className="action-bar">
          <div className="shortcut-hint">
            <span>Press</span>
            <kbd className="kbd">Ctrl</kbd>
            <span>+</span>
            <kbd className="kbd">Enter</kbd>
            <span>to translate instantly</span>
          </div>

          <button
            type="button"
            className="translate-btn"
            onClick={() => handleTranslate()}
            disabled={isTranslating || !sourceText.trim()}
            aria-label="Translate source text"
          >
            {isTranslating ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 8 6 6" />
                  <path d="m4 14 6-6 2-3" />
                  <path d="M2 5h12" />
                  <path d="M7 2h1" />
                  <path d="m22 22-5-10-5 10" />
                  <path d="M14 18h6" />
                </svg>
                <span>Translate with Omni</span>
              </>
            )}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
