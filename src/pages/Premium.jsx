import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, Sun, Star, Hash, Moon, Zap, Flame, BookOpen, ScanLine, Wand2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/shared/SectionHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { trackEvent } from '@/lib/analytics';
import { stripe } from '@/api/functions/stripe';
import { auth } from '@/api/auth';
import { isPlayStoreApp } from '@/lib/platform';
import confetti from 'canvas-confetti';

const PREMIUM_FEATURES = [
  { icon: Sparkles, label: 'Unlimited Tarot Readings', desc: 'No daily caps — read as often as you need' },
  { icon: Crown, label: 'All Premium Spreads', desc: 'Life Path, Celtic Cross, Shadow Work, Spiritual Alignment' },
  { icon: Star, label: 'Unlimited Oracle Draws', desc: 'Pull oracle cards whenever guidance calls' },
  { icon: Wand2, label: 'Spell Generator', desc: 'AI-crafted spells and rituals tailored to your intention' },
  { icon: ScanLine, label: 'Personal Card Scanning', desc: 'Upload a photo of any card and get instant interpretation' },
  { icon: Sun, label: 'Astrology Transits', desc: 'Real-time planetary transits and how they affect you' },
  { icon: BookOpen, label: 'Journal', desc: 'Save and revisit every reading with personal notes' },
  { icon: Ban, label: 'Priority Access', desc: 'First access to new decks, spreads, and features' },
];

export default function Premium() {
  const { isPremium } = useUserProfile();
  const [plan, setPlan] = useState('annual');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId && !isPremium) {
      setVerifying(true);
      auth.me()
        .then((me) => stripe.verifyCheckoutSession({ session_id: sessionId, user_email: me.email }))
        .then(() => {
          window.location.replace('/premium?welcome=1');
        })
        .catch(() => {
          setVerifying(false);
          setSubscribeError("We couldn't confirm your payment. If you were charged, contact us and we'll fix it right away.");
        });
    }
  }, []);

  // Celebration when premium first activates
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') && isPremium) {
      const colors = ['#FBBF24', '#A855F7', '#22D3EE', '#F472B6'];
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.35 }, colors });
      setTimeout(() => confetti({ particleCount: 80, spread: 130, origin: { y: 0.5 }, colors }), 450);
      window.history.replaceState({}, '', '/premium');
    }
  }, [isPremium]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    setSubscribeError(null);
    trackEvent('premium_subscribe_clicked', { price: plan === 'annual' ? '80/year' : '9.99/month' });
    try {
      if (!(await auth.isAuthenticated())) {
        auth.redirectToLogin('/premium');
        return;
      }
      const me = await auth.me();
      const res = await stripe.createCheckoutSession({
        plan,
        success_url: window.location.origin + '/premium?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: window.location.origin + '/premium',
        user_email: me.email,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setSubscribeError('Something went wrong opening checkout. Please try again.');
      }
    } catch (err) {
      setSubscribeError('Checkout is not available yet. If you are signed in and still see this, Stripe needs to be connected before launch.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader
        icon={Crown}
        title="Scry Premium"
        subtitle="Unlock every spread, every deck, every reading — ad-free, unlimited"
        color="gold"
      />

      {verifying ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-8 h-8 text-gold" />
          </motion.div>
          <p className="text-muted-foreground text-sm">Confirming your payment and unlocking Premium...</p>
        </div>
      ) : isPremium ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 text-center glow-gold max-w-md mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-violet flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">You Have Premium Access</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Every feature is unlocked. Enjoy unlimited readings, all spreads, oracle cards, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PREMIUM_FEATURES.slice(0, 4).map((f, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs bg-gold/10 border border-gold/20 text-gold">
                {f.label}
              </span>
            ))}
          </div>
        </motion.div>
      ) : isPlayStoreApp() ? (
        /* Google Play policy: no outside payment systems in the Play build */
        <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
          <Crown className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium subscriptions aren't available in this version of the app.
          </p>
        </div>
      ) : (
        <>
          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 sm:p-8 border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-violet/5 to-teal/5 glow-gold max-w-lg mx-auto mb-10"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold mb-4">
                <Zap className="w-3 h-3" />
                Premium Membership
              </div>
              {/* Plan Toggle */}
              <div className="inline-flex rounded-xl bg-background/50 border border-border/50 p-1 mb-5">
                <button
                  onClick={() => setPlan('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${plan === 'monthly' ? 'bg-gold/20 text-gold' : 'text-muted-foreground'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPlan('annual')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${plan === 'annual' ? 'bg-gold/20 text-gold' : 'text-muted-foreground'}`}
                >
                  Annual <span className="text-teal">· Save 33%</span>
                </button>
              </div>

              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-heading font-bold">{plan === 'annual' ? '$80' : '$9.99'}</span>
                <span className="text-sm text-muted-foreground font-normal">{plan === 'annual' ? '/year' : '/month'}</span>
              </div>
              {plan === 'annual' && (
                <p className="text-xs text-teal mt-1">That's just $6.67/month</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">3-day free trial · Cancel anytime</p>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full bg-gradient-to-r from-gold to-violet text-white hover:opacity-90 gap-2 py-6 text-base rounded-xl"
            >
              {subscribing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Connecting to the cosmos...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Start 3-Day Free Trial — {plan === 'annual' ? '$80/year' : '$9.99/month'}
                </>
              )}
            </Button>

            {subscribeError && (
              <p className="text-center text-xs text-muted-foreground mt-3">{subscribeError}</p>
            )}
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PREMIUM_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="glass-card rounded-xl p-5 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-gold/15 shrink-0">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{feature.desc}</p>
                  </div>
                  <Check className="w-4 h-4 text-gold shrink-0 mt-1" />
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Premium supports the continued development of Scry. Thank you for being here. ✨
          </p>
        </>
      )}
    </div>
  );
}
