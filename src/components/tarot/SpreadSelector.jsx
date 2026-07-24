import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { SPREADS } from '@/lib/tarotData';

export default function SpreadSelector({ selectedSpread, onSelect, isPremium }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Object.entries(SPREADS).map(([key, spread], i) => {
        const isLocked = spread.premium && !isPremium;
        const isSelected = selectedSpread === key;

        return (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => !isLocked && onSelect(key)}
            disabled={isLocked}
            className={`relative rounded-xl p-4 text-center transition-all duration-300 border ${
              isSelected
                ? 'bg-primary/20 border-primary text-foreground glow-violet'
                : isLocked
                ? 'bg-secondary/30 border-border/30 opacity-50 cursor-not-allowed'
                : 'glass-card border-border/50 hover:border-primary/50 text-foreground'
            }`}
          >
            {isLocked && (
              <Crown className="absolute top-2 right-2 w-3.5 h-3.5 text-gold" />
            )}
            <p className="font-heading text-sm font-semibold">{spread.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{spread.count} card{spread.count > 1 ? 's' : ''}</p>
          </motion.button>
        );
      })}
    </div>
  );
}