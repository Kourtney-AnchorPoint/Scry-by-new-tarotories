import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function CardDetailModal({ card, onClose, synthesis }) {
  if (!card) return null;
  const isReversed = card.isReversed;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative z-10 glass-card rounded-2xl p-6 max-w-sm w-full border-2 ${
            isReversed ? 'border-red-500/30' : 'border-violet/40'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-5">
            {card.image ? (
              <div className={`inline-block mb-3 ${isReversed ? 'rotate-180' : ''}`}>
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-32 h-48 object-cover rounded-xl border-2 border-violet/30 mx-auto"
                />
              </div>
            ) : (
              <div className={`text-5xl mb-3 inline-block ${isReversed ? 'rotate-180' : ''}`}>
                {card.id <= 7 ? '✨' : card.id <= 14 ? '🌙' : '⭐'}
              </div>
            )}
            <h2 className="font-heading text-xl font-bold">{card.name}</h2>
            {isReversed && <p className="text-red-400 text-xs font-medium mt-1">Reversed</p>}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                {isReversed ? 'Reversed Meaning' : 'Upright Meaning'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isReversed ? card.reversed : card.meaning}
              </p>
            </div>

            {isReversed && card.meaning && (
              <div>
                <h3 className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Upright Energy
                </h3>
                <p className="text-sm text-muted-foreground/60 leading-relaxed">{card.meaning}</p>
              </div>
            )}

            {synthesis && (
              <div className="border-t border-border/30 pt-4">
                <h3 className="font-heading text-xs font-semibold text-teal uppercase tracking-wider mb-1.5">
                  Combined Reading Summary
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{synthesis}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}