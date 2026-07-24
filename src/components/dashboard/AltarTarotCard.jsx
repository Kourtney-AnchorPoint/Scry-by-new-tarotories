import React from 'react';
import { motion } from 'framer-motion';
import { MAJOR_ARCANA } from '@/lib/tarotData';

export default function AltarTarotCard({ tarot, onOpen }) {
  if (!tarot) return null;
  const matched = MAJOR_ARCANA.find(c => c.name.toLowerCase() === tarot.name?.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35 }}
      onClick={() => matched && onOpen(matched)}
      className="glass-card rounded-3xl p-4 sm:p-5 border border-gold/30 cursor-pointer hover:glow-gold transition-all duration-500"
    >
      {matched?.image ? (
        <img
          src={matched.image}
          alt={tarot.name}
          className="w-full rounded-2xl border border-gold/20 mb-4 object-cover"
        />
      ) : (
        <div className="w-full aspect-[3/5] rounded-2xl border border-gold/20 mb-4 bg-secondary/60 flex flex-col items-center justify-center gap-2">
          <span className="font-heading text-5xl text-gold">{tarot.number}</span>
          <span className="font-heading text-sm text-muted-foreground">{tarot.name}</span>
        </div>
      )}
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="font-heading text-xl font-bold text-foreground">{tarot.name}</h3>
        <span className="text-sm text-muted-foreground">#{tarot.number}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tarot.theme && (
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-violet/10 border border-violet/20 text-violet">{tarot.theme}</span>
        )}
        {tarot.keyword && (
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-teal/10 border border-teal/20 text-teal">{tarot.keyword}</span>
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-2">{tarot.message}</p>
      <p className="text-xs text-gold">Tap to go deeper →</p>
    </motion.div>
  );
}