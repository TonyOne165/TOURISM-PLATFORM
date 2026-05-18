import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'chatbot_tts_enabled';

/**
 * Thin wrapper around the Web Speech Synthesis API for the chatbot's voice mode.
 *
 * - `enabled` persists in localStorage so the preference survives reloads.
 * - `speak()` is a no-op when disabled or unsupported — callers don't need to gate themselves.
 * - The hook cancels any active utterance on unmount and whenever the user flips the toggle off.
 */
export function useTextToSpeech() {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [speaking, setSpeaking] = useState(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Cancel any pending speech when the consumer unmounts.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabledRef.current) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      // Always cancel pending speech before queueing a new utterance so messages don't pile up.
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = 'es-CO';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [supported],
  );

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* localStorage may be blocked (private mode / quota) — preference becomes session-only */
      }
      if (!next && supported) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
      return next;
    });
  }, [supported]);

  return { enabled, supported, speaking, speak, cancel, toggle };
}
