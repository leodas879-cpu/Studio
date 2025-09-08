
"use client";

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionOptions {
  onTranscriptChanged?: (transcript: string) => void;
  onListeningChanged?: (listening: boolean) => void;
}

// Check if the browser supports the Web Speech API
const isBrowser = typeof window !== 'undefined';
const SpeechRecognition = isBrowser ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const { onTranscriptChanged, onListeningChanged } = options;

  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const fullTranscript = (transcript + ' ' + finalTranscript + interimTranscript).trim();
      setTranscript(fullTranscript);
      if (onTranscriptChanged) {
        onTranscriptChanged(fullTranscript);
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (onListeningChanged) {
        onListeningChanged(false);
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      if (onListeningChanged) {
        onListeningChanged(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscriptChanged, onListeningChanged]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript(''); // Reset transcript on new start
      recognitionRef.current.start();
      setListening(true);
      if (onListeningChanged) {
        onListeningChanged(true);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
       if (onListeningChanged) {
        onListeningChanged(false);
      }
    }
  };

  return {
    transcript,
    listening,
    isSpeechRecognitionSupported: !!SpeechRecognition,
    startListening,
    stopListening,
  };
}

    