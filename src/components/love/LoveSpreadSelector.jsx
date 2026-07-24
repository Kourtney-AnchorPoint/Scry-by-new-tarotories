import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, MessageCircle, Zap } from 'lucide-react';
import { LOVE_SPREADS, ORACLE_ONLY_SPREADS } from '@/lib/tarotData';

const CATEGORIES = [
  {
    key: 'tarot',
    label: '✨ Tarot Readings',
    badge: '✨ Free',
    badgeClass: 'bg-violet/10 border-violet/20 text-violet-light',
    spreads: Object.entries(LOVE_SPREADS),
    description: 'Classic tarot spreads with the Compassionate Truth-Teller persona.',
  },
  {
    key: 'oracle',
    label: '🔥 Oracle — Unfiltered Truth',
    badge: '🔥 Oracle',
    badgeClass: 'bg-gold/10 border-gold/20 text-gold',
    spreads: Object.entries(ORACLE_ONLY_SPREADS),
    description: 'Pure Oracle deck pulls. No filters. No sugarcoating.',
  },
];

export default function LoveSpreadSelector({ onSelect, isPremium }) {
  return (
    <div className="space-y-8">
      {CATEGORIES.map((cat, ci) => (
        <div key={cat.key}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-heading text-base font-semibold text-foreground">{cat.label}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs border ${cat.badgeClass}`}>{cat.badge}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{cat.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.spreads.map(([key, spread], i) => {
              const isLocked = spread.premium && !isPremium;
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (ci * 0.1) + i * 0.06 }}
                  onClick={() => !isLocked && onSelect(key, cat.key)}
                  disabled={isLocked}
                  className={`relative rounded-2xl p-4 text-left transition-all duration-300 border ${
                    isLocked
                      ? 'bg-secondary/20 border-border/20 opacity-50 cursor-not-allowed'
                      : cat.key === 'oracle'
                      ? 'glass-card border-gold/20 hover:border-gold/50 hover:glow-gold cursor-pointer'
                      : cat.key === 'channeled'
                      ? 'glass-card border-teal/20 hover:border-teal/50 hover:glow-teal cursor-pointer'
                      : 'glass-card border-border/50 hover:border-pink-400/50 hover:glow-violet cursor-pointer'
                  }`}
                >
                  {isLocked && <Crown className="absolute top-3 right-3 w-4 h-4 text-gold" />}
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-heading text-sm font-semibold text-foreground pr-6">{spread.name}</h4>
                    <span className="text-xs text-muted-foreground shrink-0">{spread.count} card{spread.count > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{spread.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {cat.key === 'channeled' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal/10 border border-teal/20 text-teal">
                        <MessageCircle className="w-3 h-3" /> Channeled
                      </span>
                    )}
                    {cat.key === 'oracle' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gold/10 border border-gold/20 text-gold">
                        <Zap className="w-3 h-3" /> Oracle Only
                      </span>
                    )}
                    {cat.key === 'tarot' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet/10 border border-violet/20 text-violet-light">
                        <Sparkles className="w-3 h-3" /> Tarot
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gold/10 border border-gold/20 text-gold">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}