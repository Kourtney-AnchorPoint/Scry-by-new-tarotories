import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, History, RotateCcw, ShieldCheck } from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import { trackEvent } from '@/lib/analytics';

const ANSWERS = [
  { key: 'yes', label: 'Yes', message: 'Move with it—but keep your eyes open.' },
  { key: 'no', label: 'No', message: 'Stop forcing the door. It is not yours right now.' },
  { key: 'unclear', label: 'Unclear', message: 'The question is carrying too many questions. Ask again more cleanly.' },
];

function answerFor(question) {
  const score = [...question.trim().toLowerCase()].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
  return ANSWERS[score % ANSWERS.length];
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('scry_pendulum_history') || '[]'); }
  catch { return []; }
}

export default function Pendulum() {
  const [question, setQuestion] = useState('');
  const [isSwinging, setIsSwinging] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const canAsk = question.trim().length >= 5 && !isSwinging;

  const ask = () => {
    if (!canAsk) return;
    setResult(null);
    setIsSwinging(true);
    trackEvent('pendulum_started', { question_length: question.trim().length });
    window.setTimeout(() => {
      const next = answerFor(question);
      const entry = { id: Date.now(), question: question.trim(), answer: next.label };
      const updated = [entry, ...history].slice(0, 8);
      localStorage.setItem('scry_pendulum_history', JSON.stringify(updated));
      setHistory(updated);
      setResult(next);
      setIsSwinging(false);
      trackEvent('pendulum_completed', { answer: next.key });
    }, 1800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.28em] uppercase text-teal mb-4">
          <Gem className="w-4 h-4" /> The Pendulum
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-semibold mb-4">Ask cleanly.</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">You usually feel the answer before the pendulum stops moving. Pay attention to that.</p>
      </div>

      <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-6">
        <GlassCard className="p-6 sm:p-8">
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-3">Your private yes-or-no question</label>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Is this mine to pursue right now?"
            maxLength={240}
            className="w-full min-h-32 rounded-xl bg-background/70 border border-border px-4 py-4 text-foreground placeholder:text-muted-foreground/50 focus:border-teal focus:ring-1 focus:ring-teal outline-none resize-y"
          />
          <div className="flex items-center justify-between gap-3 mt-2 text-[11px] text-muted-foreground"><span>{question.length}/240</span><span>Yes-or-no questions work best.</span></div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={ask} disabled={!canAsk} className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink to-violet text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
              {isSwinging ? 'Listening...' : 'Ask the pendulum'}
            </button>
            <button onClick={() => { setQuestion(''); setResult(null); }} className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-7 rounded-xl border border-gold/35 bg-gold/5 p-5">
              <p className="text-xs tracking-[0.25em] uppercase text-gold mb-2">The answer</p>
              <p className="font-heading text-3xl mb-2">{result.label}</p>
              <p className="text-muted-foreground">{result.message}</p>
            </motion.div>
          )}
          <div className="flex gap-3 mt-7 p-4 rounded-xl bg-secondary/40 text-xs text-muted-foreground leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-teal shrink-0" />
            Your question stays on this device. Analytics records only that a session happened—not what you asked.
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px] overflow-hidden">
          <div className={`relative h-72 w-64 flex justify-center origin-top ${isSwinging ? 'animate-pendulum' : ''}`}>
            <div className="absolute top-0 w-px h-48 bg-gradient-to-b from-gold via-gold/70 to-gold/30" />
            <div className="absolute top-[184px] text-gold text-6xl drop-shadow-[0_0_20px_rgba(255,211,77,.45)]">◆</div>
            <span className="absolute bottom-0 left-0 text-[10px] tracking-widest text-muted-foreground">NO</span>
            <span className="absolute bottom-0 text-[10px] tracking-widest text-muted-foreground">UNCLEAR</span>
            <span className="absolute bottom-0 right-0 text-[10px] tracking-widest text-muted-foreground">YES</span>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">{isSwinging ? 'Let the question settle.' : result ? result.message : 'Get still before you ask.'}</p>
        </GlassCard>
      </div>

      {history.length > 0 && (
        <GlassCard className="mt-6 p-6">
          <div className="flex items-center gap-2 mb-4"><History className="w-4 h-4 text-violet" /><h2 className="font-heading text-lg">Recent sessions on this device</h2></div>
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
                <p className="text-sm text-muted-foreground">{entry.question}</p>
                <span className="text-xs uppercase tracking-widest text-teal shrink-0">{entry.answer}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
