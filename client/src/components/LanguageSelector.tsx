import React from 'react';
import { Language } from '../types/translation.js';

interface LanguageSelectorProps {
  languages: Language[];
  sourceLang: string;
  targetLang: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
  isTranslating: boolean;
}

const POPULAR_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
  isTranslating,
}) => {
  const canSwap = sourceLang !== 'auto' && !isTranslating;

  return (
    <div className="language-toolbar" role="region" aria-label="Language selection controls">
      {/* Source Language Selector */}
      <div className="selector-container">
        <div className="selector-wrapper">
          <select
            id="source-language-select"
            className="lang-select"
            value={sourceLang}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={isTranslating}
            aria-label="Source Language"
          >
            {languages.map((lang) => (
              <option key={`src-${lang.code}`} value={lang.code}>
                {lang.name} {lang.nativeName && lang.nativeName !== lang.name ? `(${lang.nativeName})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Quick pills for source */}
        <div className="quick-pills" aria-label="Quick select source language">
          <button
            type="button"
            className={`pill-btn ${sourceLang === 'auto' ? 'active' : ''}`}
            onClick={() => onSourceChange('auto')}
            disabled={isTranslating}
          >
            Auto Detect
          </button>
          {POPULAR_LANGUAGES.map((p) => (
            <button
              key={`src-pill-${p.code}`}
              type="button"
              className={`pill-btn ${sourceLang === p.code ? 'active' : ''}`}
              onClick={() => onSourceChange(p.code)}
              disabled={isTranslating}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swap Languages Button */}
      <div className="swap-wrapper">
        <button
          type="button"
          className="swap-button"
          onClick={onSwap}
          disabled={!canSwap}
          aria-label={canSwap ? 'Swap source and target languages' : 'Cannot swap when source is Auto Detect'}
          title={canSwap ? 'Swap languages' : 'Cannot swap when source is Auto Detect'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3L4 7l4 4" />
            <path d="M4 7h16" />
            <path d="m16 21 4-4-4-4" />
            <path d="M20 17H4" />
          </svg>
        </button>
      </div>

      {/* Target Language Selector */}
      <div className="selector-container">
        <div className="selector-wrapper">
          <select
            id="target-language-select"
            className="lang-select"
            value={targetLang}
            onChange={(e) => onTargetChange(e.target.value)}
            disabled={isTranslating}
            aria-label="Target Language"
          >
            {languages
              .filter((lang) => lang.code !== 'auto')
              .map((lang) => (
                <option key={`tgt-${lang.code}`} value={lang.code}>
                  {lang.name} {lang.nativeName && lang.nativeName !== lang.name ? `(${lang.nativeName})` : ''}
                </option>
              ))}
          </select>
        </div>

        {/* Quick pills for target */}
        <div className="quick-pills" aria-label="Quick select target language">
          {POPULAR_LANGUAGES.map((p) => (
            <button
              key={`tgt-pill-${p.code}`}
              type="button"
              className={`pill-btn ${targetLang === p.code ? 'active' : ''}`}
              onClick={() => onTargetChange(p.code)}
              disabled={isTranslating}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
