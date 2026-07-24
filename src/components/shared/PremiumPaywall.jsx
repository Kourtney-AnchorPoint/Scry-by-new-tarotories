import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Sparkles, Zap, Heart, Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { isPlayStoreApp } from '@/lib/platform';

export default function PremiumPaywall({ isOpen, onClose, title = "Unlock Premium", description }) {
  if (!isOpen) return null;

  const perks = [
    { icon: Zap, text: "Unlimited Channeled Downloads" },
    { icon: Crown, text: "Higher Self & Spirit Guide channels" },
    { icon: Heart, text: "Deep-dive Love spreads (Twin Flame, Shadow Work)" },
    { icon: Sparkles, text: "2026 Personal Year Forecast & Digital Altar" },
    { icon: Star, text: "🎧 Audio playback for all messages" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="glass-card rounded-3xl p-7 max-w-sm w-full border border-violet/30 glow-violet relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>

          {/* Crown */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet to-gold flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="font-heading text-xl font-bold text-center mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
            {description || "This is serious soul-work. Unlock full access for $9.99/mo."}
          </p>

          <div className="space-y-2.5 mb-6">
            {perks.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                <div className="w-7 h-7 rounded-lg bg-violet/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-violet-light" />
                </div>
                {text}
              </div>
            ))}
          </div>

          {isPlayStoreApp() ? (
            /* Google Play policy: no outside payment systems in the Play build */
            <p className="text-xs text-muted-foreground text-center">
              Premium subscriptions aren't available in this version of the app.
            </p>
          ) : (
            <>
              <Link to="/premium" onClick={onClose}>
                <Button className="w-full bg-gradient-to-r from-violet to-gold text-white hover:opacity-90 gap-2 py-5 text-base rounded-xl">
                  <Crown className="w-4 h-4" />
                  Get Unlimited Downloads — $9.99/mo
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground/50 text-center mt-3">Cancel anytime. No pressure.</p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}