import React from 'react';
import { motion } from 'framer-motion';

export default function OracleSpreadCard({ card, position, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl overflow-hidden border border-teal/20 min-w-0"
    >
      <div className="relative aspect-[3/4] max-h-72 overflow-hidden bg-black/30">
        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/40" />
        <span className="absolute top-3 left-3 right-3 rounded-full bg-black/45 px-3 py-1 text-center text-[10px] font-heading uppercase tracking-widest text-teal backdrop-blur-sm">{position}</span>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-heading text-base font-bold leading-snug text-white">{card.name}</h3>
        <div className="flex flex-wrap gap-1.5">
          {card.keywords.slice(0, 3).map((kw, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-teal/10 border border-teal/20 text-teal">{kw}</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed break-words">{card.meaning}</p>
      </div>
    </motion.div>
  );
}
