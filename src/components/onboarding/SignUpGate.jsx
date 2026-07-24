import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';

const SKIP_KEY = 'signup_gate_skipped';

export default function SignUpGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        if (sessionStorage.getItem(SKIP_KEY)) return;
        const authed = await base44.auth.isAuthenticated();
        if (!authed) setShow(true);
      } catch {
        // can't determine auth — don't block
      }
    }
    check();
  }, []);

  if (!show) return null;

  const handleSignUp = () => {
    trackEvent('signup_gate_accepted');
    base44.auth.redirectToLogin('/');
  };

  const handleSkip = () => {
    sessionStorage.setItem(SKIP_KEY, '1');
    trackEvent('signup_gate_skipped');
    setShow(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-card rounded-3xl border border-violet/30 max-w-md w-full p-8 text-center"
      >
        <div className="flex justify-center gap-3 mb-5">
          <Star className="w-5 h-5 text-gold animate-twinkle" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet/20 glow-violet">
            <Moon className="w-7 h-7 text-violet" />
          </div>
          <Star className="w-5 h-5 text-teal animate-twinkle" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-3">
          <span className="shimmer-text">Claim Your Place Among the Stars</span>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Create your free account to save your readings, cast your birth chart, build your altar, and receive messages meant only for you. It takes ten seconds.
        </p>
        <Button
          onClick={handleSignUp}
          className="w-full bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2 py-6 rounded-xl text-base"
        >
          <Sparkles className="w-4 h-4" />
          Create My Free Account
        </Button>
        <button
          onClick={handleSkip}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-3 mt-1"
        >
          Just looking around for now
        </button>
      </motion.div>
    </motion.div>
  );
}