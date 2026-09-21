import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../utils/clipboard.js';
import { speakText, stopSpeaking, isSpeechSupported } from '../utils/speech.js';

interface TranslationOutputProps {
  translatedText: string;
  isTranslating: boolean;
  targetLang: string;
  provider?: string;
  detectedLang?: string;
  onClear: () => void;
}

export const TranslationOutput: React.FC<TranslationOutputProps> = ({
  translatedText,
  isTranslating,
  targetLang,
  provider,
  detectedLang,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setCopied(false);
    stopSpeaking();
    setIsSpeaking(false);
  }, [translatedText]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleCopy = async () => {
    if (!translatedText) return;
    const success = await copyToClipboard(translatedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (!translatedText) return;

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    speakText(translatedText, targetLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const hasOutput = translatedText && translatedText.trim().length > 0;
  const speechAvailable = isSpeechSupported();

  return (
    <div className="card-panel output-panel" role="region" aria-label="Translation output area">
      {/* Panel Header */}
      <div className="card-header-bar">
        <span className="card-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Translated Output
        </span>
        <span className="card-tag accent">
          {targetLang.toUpperCase()}
          {detectedLang && ` (from ${detectedLang.toUpperCase()})`}
        </span>
      </div>

      <div className="textarea-container" aria-live="polite" aria-atomic="true">
        {isTranslating ? (
          <div className="loading-shimmer-container" aria-label="Translating text, please wait...">
            <div className="shimmer-line long" />
            <div className="shimmer-line medium" />
            <div className="shimmer-line short" />
          </div>
        ) : hasOutput ? (
          <div className="translation-output-text" tabIndex={0} role="textbox" aria-readonly="true">
            {translatedText}
          </div>
        ) : (
          <div className="translation-output-text translation-output-placeholder">
            Translation will appear here in real-time...
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="provider-info-badge">
          {hasOutput && provider ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>
                Engine: <strong style={{ textTransform: 'capitalize' }}>{provider}</strong>
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Ready</span>
          )}
        </div>

        <div className="action-buttons">
          {/* Text to Speech Button with Equalizer Soundwave */}
          {hasOutput && speechAvailable && (
            <button
              type="button"
              className={`icon-btn ${isSpeaking ? 'active-audio' : ''}`}
              onClick={handleSpeak}
              disabled={isTranslating}
              title={isSpeaking ? 'Stop listening' : 'Listen to translated speech'}
              aria-label={isSpeaking ? 'Stop speech audio' : 'Listen to translated speech audio'}
            >
              {isSpeaking ? (
                <>
                  <div className="soundwave" aria-hidden="true">
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                  </div>
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span>Listen</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
          {hasOutput && (
            <button
              type="button"
              className={`icon-btn ${copied ? 'success' : ''}`}
              onClick={handleCopy}
              disabled={isTranslating}
              title={copied ? 'Copied to clipboard' : 'Copy translation to clipboard'}
              aria-label={copied ? 'Copied to clipboard' : 'Copy translation to clipboard'}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {/* Clear Button */}
          {hasOutput && (
            <button
              type="button"
              className="icon-btn"
              onClick={onClear}
              disabled={isTranslating}
              title="Clear output text"
              aria-label="Clear output text"
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
