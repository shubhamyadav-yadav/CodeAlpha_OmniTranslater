import React, { useRef } from 'react';

interface TranslationInputProps {
  value: string;
  sourceLang: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onTranslate: () => void;
  isTranslating: boolean;
  maxLength: number;
}

export const TranslationInput: React.FC<TranslationInputProps> = ({
  value,
  sourceLang,
  onChange,
  onClear,
  onTranslate,
  isTranslating,
  maxLength,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onTranslate();
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
          onChange(value ? `${value} ${clipboardText}` : clipboardText);
        }
      }
    } catch {
      // Permission denied or not supported
    }
  };

  const currentLength = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isNearLimit = currentLength > maxLength * 0.85;
  const isAtLimit = currentLength >= maxLength;

  return (
    <div className="card-panel input-panel" role="region" aria-label="Translation source text area">
      {/* Panel Header */}
      <div className="card-header-bar">
        <span className="card-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
          </svg>
          Source Input
        </span>
        <span className="card-tag accent">
          {sourceLang === 'auto' ? 'Auto Detecting' : sourceLang.toUpperCase()}
        </span>
      </div>

      <div className="textarea-container">
        <label htmlFor="source-text-input" style={{ display: 'none' }}>
          Enter text to translate
        </label>
        <textarea
          id="source-text-input"
          ref={textareaRef}
          className="translation-textarea"
          placeholder="Type, paste, or select a sample phrase below... (Press Ctrl + Enter to translate)"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTranslating}
          aria-describedby="char-counter-info"
          spellCheck="true"
        />
      </div>

      <div className="card-footer">
        <div className="stats-group">
          <div
            id="char-counter-info"
            className={`char-counter ${isAtLimit ? 'limit-reached' : isNearLimit ? 'limit-near' : ''}`}
            aria-live="polite"
          >
            {currentLength.toLocaleString()} / {maxLength.toLocaleString()} chars
          </div>
          <span>&bull;</span>
          <div>{wordCount} {wordCount === 1 ? 'word' : 'words'}</div>
        </div>

        <div className="action-buttons">
          {/* Paste button */}
          <button
            type="button"
            className="icon-btn"
            onClick={handlePaste}
            disabled={isTranslating || isAtLimit}
            title="Paste text from clipboard"
            aria-label="Paste text from clipboard"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
            <span>Paste</span>
          </button>

          {/* Clear button */}
          {value.length > 0 && (
            <button
              type="button"
              className="icon-btn"
              onClick={onClear}
              disabled={isTranslating}
              title="Clear input text"
              aria-label="Clear input text"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
