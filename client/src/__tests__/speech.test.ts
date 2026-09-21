import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech.js';

describe('Speech Utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect if speech synthesis is supported', () => {
    expect(typeof isSpeechSupported()).toBe('boolean');
  });

  it('should gracefully handle speech playback when window.speechSynthesis exists', () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();

    // Mock window.speechSynthesis
    Object.assign(window, {
      speechSynthesis: {
        speak: speakMock,
        cancel: cancelMock,
        getVoices: () => [],
      },
      SpeechSynthesisUtterance: class {
        text: string;
        lang = '';
        rate = 1;
        constructor(text: string) {
          this.text = text;
        }
      },
    });

    speakText('Hola', 'es');
    expect(cancelMock).toHaveBeenCalled();
    expect(speakMock).toHaveBeenCalled();

    stopSpeaking();
    expect(cancelMock).toHaveBeenCalledTimes(2);
  });
});
