import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, RotateCcw, Lock, Save, Check, Share2, Crown } from 'lucide-react';
import ListenButton from '@/components/shared/ListenButton';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SectionHeader from '@/components/shared/SectionHeader';
import OracleSpreadCard from '@/components/oracle/OracleSpreadCard';
import PremiumPaywall from '@/components/shared/PremiumPaywall';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ORACLE_CARDS } from '@/lib/tarotData';
import { playMysticHum, playSparkle, vibrate } from '@/lib/mysticSounds';
import { trackEvent } from '@/lib/analytics';

const FREE_DAILY_LIMIT = 3;

const SPREADS = [
  { id: 'single', name: 'Single Card', count: 1, positions: ['Your Message'], desc: 'One clear message for right now' },
  { id: 'mbs', name: 'Mind · Body · Spirit', count: 3, positions: ['Mind', 'Body', 'Spirit'], desc: 'A check-in across your whole being' },
  { id: 'path', name: 'The Path', count: 5, positions: ['Where You Are', 'Hidden Influence', 'Guidance', 'Challenge', "What's Coming"], desc: 'A full five-card illumination', premium: true },
];

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getDrawCount() {
  try { return parseInt(localStorage.getItem(`oracle_draws_${getTodayKey()}`) || '0', 10); } catch { return 0; }
}

function hasDrawnToday() {
  return getDrawCount() >= FREE_DAILY_LIMIT;
}

function markDrawnToday() {
  try { localStorage.setItem(`oracle_draws_${getTodayKey()}`, (getDrawCount() + 1).toString()); } catch {}
}

function drawUniqueCards(count) {
  const shuffled = [...ORACLE_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Oracle() {
  const { isPremium } = useUserProfile();
  const [spreadId, setSpreadId] = useState('single');
  const [drawnCards, setDrawnCards] = useState([]);
  const [phase, setPhase] = useState('ready'); // ready | drawing | revealed
  const [blocked, setBlocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const spread = SPREADS.find(s => s.id === spreadId) || SPREADS[0];
  const drawnCard = drawnCards[0] || null;

  const handleSelectSpread = (s) => {
    if (s.premium && !isPremium) {
      setPaywallOpen(true);
      return;
    }
    setSpreadId(s.id);
  };

  const handleDraw = () => {
    if (!isPremium && hasDrawnToday()) {
      setBlocked(true);
      trackEvent('oracle_daily_limit_hit');
      return;
    }
    setBlocked(false);
    setPhase('drawing');
    setDrawnCards([]);
    playMysticHum();
    vibrate([10, 40, 10, 40, 80]);

    setTimeout(() => {
      const cards = drawUniqueCards(spread.count);
      setDrawnCards(cards);
      setPhase('revealed');
      setSaved(false);
      setShared(false);
      playSparkle();
      vibrate([20, 30, 60]);
      if (!isPremium) markDrawnToday();
      trackEvent('oracle_card_drawn', { card: cards[0].name, spread: spread.id, is_premium: isPremium });
    }, 1400);
  };

  const readingText = () => drawnCards
    .map((c, i) => `${spread.positions[i]}: ${c.name} — ${c.meaning}`)
    .join('\n\n');

  const handleSave = async () => {
    if (saved || saving || !drawnCards.length) return;
    setSaving(true);
    await base44.entities.Reading.create({
      type: 'oracle',
      title: spread.count === 1 ? `Oracle: ${drawnCard.name}` : `Oracle Spread: ${spread.name}`,
      spread_type: spread.id,
      cards_drawn: drawnCards.map(c => ({ name: c.name })),
      reading_text: readingText(),
      summary: readingText().slice(0, 120),
    });
    setSaving(false);
    setSaved(true);
    trackEvent('reading_saved', { type: 'oracle', spread: spread.id });
  };

  const handleShare = async () => {
    if (!drawnCards.length) return;
    trackEvent('reading_shared', { type: 'oracle', spread: spread.id });
    const appUrl = 'https://newtarotories.base44.app';
    const text = `✨ Oracle ${spread.count === 1 ? `Card: ${drawnCard.name}` : `Spread: ${spread.name}`}\n\n${readingText()}\n\n🔮 Get your own reading at ${appUrl}`;
    if (navigator.share) {
      await navigator.share({ title: 'Oracle Reading', text });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleReset = () => {
    if (!isPremium && hasDrawnToday()) {
      setBlocked(true);
      setPhase('ready');
      setDrawnCards([]);
      return;
    }
    setPhase('ready');
    setDrawnCards([]);
    setBlocked(false);
    setShared(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PremiumPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title="The Path Spread 👑"
        description="The five-card Path spread is a Premium ritual — a full illumination of where you are, what's hidden, and what's coming."
      />

      <SectionHeader
        icon={Star}
        title="Oracle Cards"
        subtitle="Draw a card and let the oracle speak directly to where you are right now"
        color="teal"
      />

      {/* Free tier daily limit notice */}
      {!isPremium && (
        <p className="text-center text-xs text-muted-foreground mb-6">
          Free tier: {Math.max(0, FREE_DAILY_LIMIT - getDrawCount())} of {FREE_DAILY_LIMIT} draws left today · <Link to="/premium" className="text-teal underline underline-offset-2">Upgrade for unlimited draws</Link>
        </p>
      )}

      {/* Spread selector */}
      {phase === 'ready' && !blocked && (
        <div className="grid grid-cols-3 gap-2 mb-8">
          {SPREADS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelectSpread(s)}
              className={`glass-card rounded-xl p-3 text-center transition-all border ${
                spreadId === s.id ? 'border-teal/60 glow-teal' : 'border-border/30 hover:border-teal/30'
              }`}
            >
              <p className="font-heading text-xs font-semibold text-foreground flex items-center justify-center gap-1">
                {s.name}{s.premium && !isPremium && <Crown className="w-3 h-3 text-gold" />}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Ready / Blocked */}
      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 py-6"
        >
          {blocked ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-48 h-64 glass-card rounded-2xl border-2 border-border/30 flex flex-col items-center justify-center opacity-50">
                <Lock className="w-10 h-10 text-muted-foreground" />
                <p className="font-heading text-xs text-muted-foreground mt-3">Come back tomorrow</p>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                You've used your {FREE_DAILY_LIMIT} free oracle draws for today. Return tomorrow for more — or upgrade to Premium for unlimited draws.
              </p>
              <Link to="/premium">
                <Button className="bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2">
                  <Star className="w-4 h-4" />
                  Unlock Unlimited Draws
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDraw}
                className="w-48 h-64 rounded-2xl border-2 border-teal/40 overflow-hidden cursor-pointer hover:glow-teal transition-all duration-500 relative glass-card flex items-center justify-center"
              >
                <div className="text-center">
                  <Star className="w-12 h-12 text-teal animate-float mx-auto" />
                  <p className="font-heading text-sm text-teal/80 mt-4">
                    {spread.count === 1 ? 'Draw a Card' : `Draw ${spread.count} Cards`}
                  </p>
                </div>
              </motion.div>
              <p className="text-xs text-muted-foreground">Breathe, set your intention, then draw</p>
            </>
          )}
        </motion.div>
      )}

      {/* Drawing Animation */}
      {phase === 'drawing' && (
        <div className="flex flex-col items-center py-12">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 1.4 }}
            className="w-48 h-64 glass-card rounded-2xl border-2 border-teal/40 glow-teal flex items-center justify-center"
          >
            <Star className="w-12 h-12 text-teal animate-pulse" />
          </motion.div>
          <p className="text-muted-foreground text-sm mt-6 animate-pulse">The oracle is listening...</p>
        </div>
      )}

      {/* Revealed */}
      <AnimatePresence>
        {phase === 'revealed' && drawnCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {spread.count === 1 ? (
              <>
                {/* Single card — full ritual layout */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <div className="relative w-56 h-80 rounded-2xl overflow-hidden border-2 border-teal/40 glow-teal shadow-2xl">
                    <img src={drawnCard.image} alt={drawnCard.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4">
                      <h2 className="font-heading text-xl font-bold text-white text-center">{drawnCard.name}</h2>
                    </div>
                  </div>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-2">
                  {drawnCard.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-teal/10 border border-teal/20 text-teal">{kw}</span>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <p className="text-sm text-foreground leading-relaxed">{drawnCard.meaning}</p>
                </motion.div>
              </>
            ) : (
              /* Multi-card spread */
              <div className={`grid gap-4 ${spread.count === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {drawnCards.map((card, i) => (
                  <OracleSpreadCard key={card.name} card={card} position={spread.positions[i]} delay={i * 0.15} />
                ))}
              </div>
            )}

            {/* Affirmation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-4 border-t border-border/30"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your Affirmation</p>
              <p className="text-base text-teal italic font-medium">"{drawnCard.affirmation}"</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3">
              <ListenButton
                text={`${readingText()} ${drawnCard.affirmation}`}
                isPremium={isPremium}
              />
              <Button
                onClick={handleSave}
                disabled={saved || saving}
                variant="outline"
                className={`gap-2 border-border/50 ${saved ? 'text-teal border-teal/40' : ''}`}
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Reading'}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className={`gap-2 border-border/50 ${shared ? 'text-teal border-teal/40' : ''}`}
              >
                {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {shared ? 'Copied!' : 'Share'}
              </Button>
              <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50">
                <RotateCcw className="w-4 h-4" />
                Draw Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}