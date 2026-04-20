import { useState, useEffect, useCallback } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Check browser support
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export const VoiceInput = ({ onTranscript, disabled }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (SpeechRecognitionAPI) {
      const rec = new SpeechRecognitionAPI();
      rec.lang = 'es-ES';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        const last = event.results[event.results.length - 1];
        const transcript = last[0].transcript;
        if (last.isFinal) {
          onTranscript(transcript);
          setIsListening(false);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
      setSupported(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleListening = useCallback(() => {
    if (!recognition || disabled) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        // Already started
        setIsListening(false);
      }
    }
  }, [recognition, isListening, disabled]);

  if (!supported) {
    return null; // Don't render if browser doesn't support speech recognition
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`btn btn-sm border-0 transition-all ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
          : 'bg-brand-beige text-brand-dark hover:bg-brand-brown hover:text-white'
      }`}
      title={isListening ? 'Detener grabación' : 'Hablar'}
    >
      {isListening ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
        </svg>
      )}
    </button>
  );
};
