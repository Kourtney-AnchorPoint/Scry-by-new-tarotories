import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ReadingDisclaimer() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-4 border border-border/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span className="uppercase tracking-wider font-heading">A Note on Your Power</span>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-xs text-muted-foreground/50 leading-relaxed">
              Tarot and channeled guidance are mirror reflections for your inner world—tools for expansion, not absolute scripts. While the energies here offer deep perspective, always use your raw discernment, trust your real-world observations, and remember that you are the ultimate architect of your life.{' '}
              <em>For entertainment and reflection purposes only.</em>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}