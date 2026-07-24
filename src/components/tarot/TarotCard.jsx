import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { playCardFlip, playSparkle, vibrate } from '@/lib/mysticSounds';

export default function TarotCard({ card, position, delay = 0, onFlip }) {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isReversed = card?.isReversed;

  const handleClick = () => {
    if (!flipped) {
      playCardFlip();
      vibrate([20, 30, 50]);
      setTimeout(() => playSparkle(), 200);
      setFlipped(true);
      setExpanded(true);
      onFlip?.();
    }
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {position && (
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{position}</span>
      )}

      {/* The card itself */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        onClick={handleClick}
        className="relative w-32 h-48 sm:w-36 sm:h-52 cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Card Back */}
          <div
            className="absolute inset-0 rounded-xl glass-card border-2 border-violet/30 flex items-center justify-center glow-violet"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet/30 to-teal/30 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-7 h-7 text-violet" />
              </div>
              <p className="text-xs text-violet/60 font-heading">Tap to reveal</p>
            </div>
          </div>

          {/* Card Front */}
          <div
            className={`absolute inset-0 rounded-xl border-2 overflow-hidden ${
              isReversed ? 'border-red-500/30' : 'border-violet/40'
            }`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {card?.image ? (
              <img
                src={card.image}
                alt={card.name}
                className={`w-full h-full object-cover ${isReversed ? 'rotate-180' : ''}`}
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center ${
                isReversed
                  ? 'bg-gradient-to-b from-red-950/50 to-background'
                  : 'bg-gradient-to-b from-violet/20 to-background'
              }`}>
                <div className={`text-3xl mb-2 ${isReversed ? 'rotate-180' : ''}`}>
                  {card?.id <= 7 ? '✨' : card?.id <= 14 ? '🌙' : '⭐'}
                </div>
              </div>
            )}
            {/* Name overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
              <p className="font-heading text-xs font-semibold text-white leading-tight text-center">{card?.name}</p>
              {isReversed && <p className="text-red-400 text-xs text-center">(Rev.)</p>}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Inline expandable detail — shown after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden w-36 sm:w-44"
          >
            <div
              className={`rounded-xl border p-3 text-left ${
                isReversed
                  ? 'bg-red-950/20 border-red-500/20'
                  : 'bg-violet/10 border-violet/20'
              }`}
            >
              <button
                onClick={toggleExpand}
                className="w-full flex items-center justify-between gap-1 min-h-0"
              >
                <span className="text-xs font-heading font-semibold truncate">
                  {card?.name}
                </span>
                {expanded
                  ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                }
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2">
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isReversed ? 'text-red-400' : 'text-violet'}`}>
                        {isReversed ? 'Reversed' : 'Upright'}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isReversed ? card?.reversed : card?.meaning}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}