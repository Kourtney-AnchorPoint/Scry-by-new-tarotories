import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

const CANDLE_KEY = 'candle_lit_date';

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export default function DigitalCandle() {
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    const litDate = localStorage.getItem(CANDLE_KEY);
    if (litDate === getTodayKey()) {
      setIsLit(true);
    }
  }, []);

  const toggleCandle = () => {
    const newLit = !isLit;
    setIsLit(newLit);
    if (newLit) {
      localStorage.setItem(CANDLE_KEY, getTodayKey());
    } else {
      localStorage.removeItem(CANDLE_KEY);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card rounded-2xl p-5 mb-4 text-center border border-gold/20"
    >
      <h3 className="font-heading text-sm font-semibold text-gold mb-3">Daily Candle</h3>
      <button
        onClick={toggleCandle}
        className="relative inline-flex items-center justify-center select-none"
        aria-label={isLit ? 'Extinguish candle' : 'Light candle'}
      >
        {/* Candle body */}
        <div className="flex flex-col items-center">
          {/* Flame */}
          <div className="relative h-12 mb-1">
            <AnimatePresence>
              {isLit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2"
                >
                  {/* Outer glow */}
                  <div className="absolute inset-0 -m-4 rounded-full bg-gold/20 blur-md animate-pulse" />
                  {/* Flame shape */}
                  <motion.div
                    animate={{
                      scaleY: [1, 1.15, 0.95, 1.1, 1],
                      scaleX: [1, 0.95, 1.05, 0.98, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-3 h-6 rounded-full"
                    style={{
                      background: 'linear-gradient(to top, #FBBF24 0%, #FDE047 40%, #FFFFFF 100%)',
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                      boxShadow: '0 0 12px rgba(251, 191, 36, 0.6), 0 0 24px rgba(251, 191, 36, 0.3)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Wick */}
          <div className="w-0.5 h-2 bg-foreground/30" />
          {/* Candle */}
          <div
            className={`w-8 h-20 rounded-t-md transition-all duration-500 ${
              isLit
                ? 'bg-gradient-to-b from-gold/30 to-gold/10 border border-gold/40'
                : 'bg-gradient-to-b from-secondary to-secondary/50 border border-border/40'
            }`}
          />
        </div>
      </button>
      <p className="text-xs text-muted-foreground mt-3">
        {isLit ? 'Your candle is lit for today ✨' : 'Tap to light your daily candle'}
      </p>
    </motion.div>
  );
}