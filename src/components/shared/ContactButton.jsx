import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, MessageSquare, HelpCircle, Bug } from 'lucide-react';

const PHONE_NUMBER = '405-300-0114';

const FAQS = [
  { q: 'How do I get a tarot reading?', a: 'Tap Tarot, choose a deck and spread, then shuffle & draw. Flip each card to reveal it, then tap "Get Your Reading".' },
  { q: 'What is the Altar?', a: 'Your Altar is your personal magical workspace — upload card photos, browse spells, keep a journal, and revisit saved readings.' },
  { q: 'How do I save a reading?', a: 'After any reading, tap "Keep This" to save it to your Journal and Altar.' },
  { q: 'What does Premium include?', a: 'Premium unlocks advanced spreads, unlimited oracle draws, deep numerology, and full birth charts. Visit your Account page to upgrade.' },
  { q: 'Can I share my readings?', a: 'Yes! Every reading has a Share button — share to social media or copy the text.' },
];

export default function ContactButton() {
  const [open, setOpen] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-violet to-teal text-white flex items-center justify-center shadow-lg shadow-violet/30 hover:scale-110 transition-transform select-none"
        aria-label="Contact & Help"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-36 right-4 z-50 w-72 glass-card rounded-2xl p-5 space-y-3 border-violet/20"
          >
            <div className="text-center mb-2">
              <h3 className="font-heading text-base font-semibold shimmer-text">Need a hand?</h3>
              <p className="text-xs text-muted-foreground mt-1">Reach out — we're here for you.</p>
            </div>

            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-violet/20">
                <Phone className="w-4 h-4 text-violet" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Call Kourtney</p>
                <p className="text-xs text-muted-foreground">{PHONE_NUMBER}</p>
              </div>
            </a>

            <a
              href={`sms:${PHONE_NUMBER}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-teal/20">
                <MessageSquare className="w-4 h-4 text-teal" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Text Kourtney</p>
                <p className="text-xs text-muted-foreground">{PHONE_NUMBER}</p>
              </div>
            </a>

            <button
              onClick={() => setShowFAQ(!showFAQ)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gold/20">
                <HelpCircle className="w-4 h-4 text-gold" />
              </div>
              <p className="text-sm font-medium text-foreground">Help & FAQ</p>
            </button>

            <AnimatePresence>
              {showFAQ && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {FAQS.map((faq, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background/40 border border-border/30">
                      <p className="text-xs font-semibold text-foreground mb-1">{faq.q}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <a
              href="mailto:support@cosmicencounters.app?subject=Bug Report"
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-destructive/20">
                <Bug className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Report a Bug</p>
                <p className="text-xs text-muted-foreground">Tell us what went wrong</p>
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}