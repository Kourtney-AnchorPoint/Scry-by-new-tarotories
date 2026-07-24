import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const INCANTATION = "I call upon my highest guidance. Only truth and light may enter this space. I am protected and I am ready to receive.";

export default function RitualOverlay({ onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [showIncantation, setShowIncantation] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setShowIncantation(true);
      const t = setTimeout(() => setReady(true), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/95 backdrop-blur-md px-4 sm:px-6 overflow-y-auto pt-8 sm:pt-16 pb-8"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-6 sm:p-10 max-w-md w-full text-center space-y-6"
      >
        {/* Breath timer */}
        <div className="space-y-3">
          <motion.div
            key={countdown}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-heading font-bold text-violet"
          >
            {countdown > 0 ? countdown : '🛡️'}
          </motion.div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {countdown > 0
              ? 'Center your energy and call in your protection.'
              : 'Your space is protected. You are safe here.'}
          </p>
        </div>

        {/* Protection Incantation */}
        <AnimatePresence>
          {showIncantation && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="border border-violet/30 rounded-2xl p-5 bg-violet/8 glow-violet"
            >
              <p className="text-xs text-violet uppercase tracking-widest mb-3 font-heading">Protection Ritual</p>
              <p className="text-sm text-foreground italic leading-relaxed">{INCANTATION}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Begin button — locked until countdown done */}
        <Button
          onClick={onComplete}
          disabled={!ready}
          className={`w-full gap-2 text-base py-6 rounded-xl transition-all duration-500 ${
            ready
              ? 'bg-gradient-to-r from-violet to-teal text-white hover:opacity-90'
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
          }`}
        >
          {ready ? 'I Am Ready' : countdown > 0 ? `Centering... ${countdown}` : 'Setting Protection...'}
        </Button>
      </motion.div>
    </motion.div>
  );
}