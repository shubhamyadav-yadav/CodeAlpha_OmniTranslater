/**
 * Web Speech API Text-to-Speech (TTS) helper.
 */

export interface SpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(text: string, langCode: string, options?: SpeechOptions): void {
  if (!isSpeechSupported() || !text || text.trim() === '') {
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;

  // Try to find a voice matching the requested language code
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.rate = 0.95; // Slightly slower for clear pronunciation

  if (options?.onStart) {
    utterance.onstart = () => options.onStart?.();
  }
  if (options?.onEnd) {
    utterance.onend = () => options.onEnd?.();
  }
  if (options?.onError) {
    utterance.onerror = (e) => {
      // Chrome fires error 'interrupted' or 'canceled' if stopped manually; ignore that
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options.onError?.(e);
      } else {
        options.onEnd?.();
      }
    };
  }

  window.speechSynthesis.speak(utterance);
}
