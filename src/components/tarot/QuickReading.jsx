import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeLLM } from '@/api/ai';
import { MAJOR_ARCANA } from '@/lib/tarotData';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReadingDisclaimer from '@/components/shared/ReadingDisclaimer';

const TOPICS = [
  { id: 'general', label: '🌙 General', color: 'border-violet/40 text-violet' },
  { id: 'love', label: '❤️ Love', color: 'border-rose-400/40 text-rose-400' },
  { id: 'money', label: '💰 Money', color: 'border-gold/40 text-gold' },
  { id: 'career', label: '✨ Career', color: 'border-teal/40 text-teal' },
  { id: 'self', label: '🌿 Self', color: 'border-emerald-400/40 text-emerald-400' },
];

export default function QuickReading() {
  const [topic, setTopic] = useState(null);
  const [card, setCard] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);

  const drawCard = () => {
    const drawn = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
    const isReversed = Math.random() > 0.7;
    setCard({ ...drawn, isReversed });
    setFlipped(false);
    setReading(null);
  };

  const handleTopicSelect = (t) => {
    setTopic(t);
    const drawn = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
    const isReversed = Math.random() > 0.7;
    setCard({ ...drawn, isReversed });
    setFlipped(false);
    setReading(null);
  };

  const handleFlip = async () => {
    if (flipped || !card) return;
    setFlipped(true);
    setLoading(true);

    const meaning = card.isReversed ? card.reversed : card.meaning;

    try {
      const result = await invokeLLM({
        action: 'quick_tarot_reading',
        params: {
          cardName: card.name,
          isReversed: card.isReversed,
          meaning,
          topicLabel: topic.label.replace(/[^\w\s]/gi, '').trim(),
        },
      });
      setReading(result);
    } catch {
      setReading(null);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setTopic(null);
    setCard(null);
    setFlipped(false);
    setReading(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Topic selector */}
      {!topic && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest text-center">What do you need guidance on?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTopicSelect(t)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all hover:scale-105 select-none ${t.color} bg-secondary/30 hover:bg-secondary/60`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Card + flip */}
      {card && topic && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <p className="text-xs text-muted-foreground text-center uppercase tracking-widest">
            {topic.label} — tap the card to reveal
          </p>

          {/* Card flip */}
          <div className="flex justify-center">
            <div
              onClick={handleFlip}
              className="cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d', position: 'relative', width: 140, height: 220 }}
              >
                {/* Back */}
                <div
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  className="absolute inset-0 glass-card rounded-2xl border-2 border-violet/40 glow-violet flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-violet animate-pulse" />
                </div>
                {/* Front */}
                <div
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-teal/40"
                >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.name}
                      className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <p className="text-xs text-center text-muted-foreground px-2">{card.name}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Card name after flip */}
          <AnimatePresence>
            {flipped && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <p className="font-heading text-lg font-semibold text-foreground">{card.name}</p>
                {card.isReversed && <p className="text-xs text-muted-foreground mt-0.5">Reversed</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && <LoadingSpinner message="Reading the cards..." />}

          {/* Reading sections */}
          <AnimatePresence>
            {reading && !loading && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* Topic sections */}
                {[
                  { key: 'general', label: '🌙 General' },
                  { key: 'love', label: '❤️ Love' },
                  { key: 'money', label: '💰 Money' },
                  { key: 'career', label: '✨ Career' },
                  { key: 'self', label: '🌿 Self' },
                ].map(({ key, label }) =>
                  reading[key] ? (
                    <div key={key} className={`rounded-xl p-4 border ${key === topic.id ? 'bg-primary/10 border-primary/30' : 'bg-secondary/20 border-border/20'}`}>
                      <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                      <p className="text-sm text-foreground leading-relaxed">{reading[key]}</p>
                    </div>
                  ) : null
                )}

                {/* Synthesis */}
                {reading.synthesis && (
                  <div className="rounded-xl p-4 border border-gold/30 bg-gold/5">
                    <p className="text-xs font-heading uppercase tracking-wider text-gold mb-1">✦ Synthesis</p>
                    <p className="text-sm text-foreground leading-relaxed italic">{reading.synthesis}</p>
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <Button onClick={handleReset} variant="outline" size="sm" className="gap-2 border-border/50 select-none min-h-[44px]">
                    <RotateCcw className="w-3.5 h-3.5" />
                    New Reading
                  </Button>
                </div>

                <ReadingDisclaimer />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}