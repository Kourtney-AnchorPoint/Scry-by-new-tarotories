import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

function PlacementCard({ placement, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
      >
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold text-gold">{placement.planet}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{placement.headline}</p>
        </div>
        <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{placement.meaning}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function PlacementDeepDive({ placements }) {
  if (!placements || placements.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gold" />
        <h2 className="font-heading text-sm font-semibold text-gold uppercase tracking-wider">Placement Deep Dives</h2>
      </div>
      {placements.map((p, i) => (
        <PlacementCard key={i} placement={p} index={i} />
      ))}
    </div>
  );
}