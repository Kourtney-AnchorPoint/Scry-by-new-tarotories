import React from 'react';
import { motion } from 'framer-motion';

export default function OracleSpreadCard({ card, position, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl overflow-hidden border border-teal/20"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        <span className="absolute top-2 left-3 text-xs font-heading uppercase tracking-widest text-teal">{position}</span>
        <h3 className="absolute bottom-2 left-3 right-3 font-heading text-base font-bold text-white">{card.name}</h3>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {card.keywords.slice(0, 3).map((kw, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-teal/10 border border-teal/20 text-teal">{kw}</span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{card.meaning}</p>
      </div>
    </motion.div>
  );
}