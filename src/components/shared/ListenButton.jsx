import React, { useState, useRef } from 'react';
import { Headphones, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateSpeech } from '@/api/speech';

// Strip URLs and other potential SSRF vectors from text before sending to TTS
function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/https?:\/\/[^\s]+/gi, '') // strip URLs
    .replace(/file:\/\/[^\s]+/gi, '')   // strip file URIs
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '') // strip raw IPs
    .replace(/\s+/g, ' ')
    .trim();
}

export default function ListenButton({ text, isPremium }) {
  const [state, setState] = useState('idle'); // idle | loading | playing
  const audioRef = useRef(null);

  if (!isPremium) return null;

  const handleListen = async () => {
    if (state === 'playing') {
      audioRef.current?.pause();
      audioRef.current = null;
      setState('idle');
      return;
    }

    const sanitized = sanitizeText(text).slice(0, 4000);
    if (!sanitized) return;

    setState('loading');
    try {
      const result = await generateSpeech({
        text: sanitized,
        voice: 'honey', // warm, soft — perfect for readings
      });

      if (!result?.url || typeof result.url !== 'string') {
        setState('idle');
        return;
      }

      const audio = new Audio(result.url);
      audioRef.current = audio;
      audio.onended = () => setState('idle');
      audio.onerror = () => setState('idle');
      audio.play();
      setState('playing');
    } catch {
      setState('idle');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleListen}
      disabled={state === 'loading'}
      className={`gap-2 text-xs border-border/50 ${state === 'playing' ? 'text-teal border-teal/40' : 'text-muted-foreground'}`}
    >
      {state === 'loading' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : state === 'playing' ? (
        <Square className="w-3 h-3" />
      ) : (
        <Headphones className="w-3 h-3" />
      )}
      {state === 'loading' ? 'Loading...' : state === 'playing' ? 'Stop' : 'Listen'}
    </Button>
  );
}
