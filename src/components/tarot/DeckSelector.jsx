import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { DECKS } from '@/lib/decks';

export default function DeckSelector({ selectedDeck, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm font-semibold text-center text-muted-foreground uppercase tracking-wider mb-4">
        Choose Your Deck
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {Object.entries(DECKS).map(([key, deck], i) => {
          const isSelected = selectedDeck === key;
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(key)}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                isSelected
                  ? 'border-violet glow-violet scale-[1.03]'
                  : 'border-border/30 hover:border-violet/40'
              }`}
            >
              <div className="aspect-[2/3] relative">
                <img
                  src={deck.cardBack}
                  alt={deck.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="p-2 text-center">
                <p className="text-xs font-heading font-semibold text-foreground leading-tight">{deck.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{deck.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}