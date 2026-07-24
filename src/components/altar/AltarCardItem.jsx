import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AltarCardItem({ card, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="glass-card rounded-xl overflow-hidden border border-border/30"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary/40">
        <img
          src={card.card_image_url}
          alt={card.card_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <p className="absolute bottom-2 left-3 right-3 font-heading text-sm font-semibold text-foreground truncate">
          {card.card_name}
        </p>
      </div>

      {card.notes && (
        <div className="px-3 py-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs text-muted-foreground select-none"
          >
            <span>Notes</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-xs text-foreground/70 leading-relaxed mt-1 overflow-hidden"
              >
                {card.notes}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={() => onDelete(card.id)}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors select-none border-t border-border/20"
      >
        <Trash2 className="w-3 h-3" />
        Remove
      </button>
    </motion.div>
  );
}