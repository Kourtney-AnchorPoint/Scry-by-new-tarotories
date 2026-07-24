import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import GuideChat from './GuideChat';

export default function GuideOrb() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (!open) trackEvent('guide_opened');
    setOpen(!open);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+130px)] sm:inset-x-auto sm:right-5 sm:bottom-24 sm:w-[380px] h-[60vh] sm:h-[480px] glass-card rounded-2xl border border-violet/30 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-violet/20 bg-violet/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-violet/25 flex items-center justify-center glow-violet">
                  <Moon className="w-4 h-4 text-violet" />
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-foreground">Luna</p>
                  <p className="text-[10px] text-muted-foreground">Your cosmic guide</p>
                </div>
              </div>
              <button onClick={toggle} className="w-9 h-9 rounded-lg hover:bg-secondary/50 flex items-center justify-center text-muted-foreground" aria-label="Close guide">
                <X className="w-4 h-4" />
              </button>
            </div>
            <GuideChat />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggle}
        className="fixed z-50 right-4 bottom-[calc(env(safe-area-inset-bottom)+72px)] md:bottom-20 w-12 h-12 rounded-full bg-gradient-to-br from-violet to-violet-dark glow-violet flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
        aria-label="Open Luna, your cosmic guide"
      >
        <Moon className="w-5 h-5" />
      </button>
    </>
  );
}