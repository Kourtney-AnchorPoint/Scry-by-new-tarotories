import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function TransitPhaseCard({ phase, index }) {
  const [open, setOpen] = useState(false);
  const building = phase.applying;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <button onClick={() => setOpen(!open)} className="w-full p-4 text-left">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="font-heading text-sm font-semibold text-foreground">{phase.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              building ? 'text-gold border-gold/30 bg-gold/5' : 'text-teal border-teal/30 bg-teal/5'
            }`}>
              {building ? 'Intensifying' : 'Settling'}
            </span>
            <motion.span animate={{ rotate: open ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.span>
          </div>
        </div>
        {!open && phase.meaning && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
            {phase.meaning.split('\n')[0]}
          </p>
        )}
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${phase.progress}%` }}
            transition={{ duration: 1, delay: 0.2 + index * 0.06 }}
            className="h-full rounded-full bg-gradient-to-r from-violet to-teal"
          />
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic">
          {building
            ? 'This feeling is still building toward its peak.'
            : 'The peak has passed — what it stirred up is settling in.'}
        </p>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{phase.meaning}</p>
        </div>
      )}
    </motion.div>
  );
}