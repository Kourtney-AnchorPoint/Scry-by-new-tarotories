import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, RotateCcw, Lock, Save, Check, Share2, Crown, Loader2, Sparkles } from 'lucide-react';
import ListenButton from '@/components/shared/ListenButton';
import ShareActions from '@/components/shared/ShareActions';
import { invokeLLM } from '@/api/ai';
import { Reading } from '@/api/entities';
import { auth } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SectionHeader from '@/components/shared/SectionHeader';
import OracleSpreadCard from '@/components/oracle/OracleSpreadCard';
import PremiumPaywall from '@/components/shared/PremiumPaywall';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ORACLE_CARDS } from '@/lib/tarotData';
import { playMysticHum, playSparkle, vibrate } from '@/lib/mysticSounds';
import { trackEvent } from '@/lib/analytics';
import { unwrapAiResult } from '@/lib/aiResult';

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
  try {
    return parseInt(localStorage.getItem(`oracle_draws_${getTodayKey()}`) || '0', 10);
  } catch {
    return 0;
  }
}

function markDrawnToday() {
  try {
    const nextCount = Math.min(FREE_DAILY_LIMIT, getDrawCount() + 1);
    localStorage.setItem(`oracle_draws_${getTodayKey()}`, nextCount.toString());
    return nextCount;
  } catch {
    return getDrawCount();
  }
}

function drawUniqueCards(count) {
  const shuffled = [...ORACLE_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildLocalOracleReading(cards, spread) {
  const cardNames = cards.map((card) => card.name).join(', ');
  const cardLines = cards
    .map((card, index) => `${spread.positions[index]} — ${card.name}: ${card.meaning}`)
    .join('\n\n');
  const affirmation = cards[0]?.affirmation || 'I trust the message that meets me where I am.';

  return {
    opening: cards.length === 1
      ? `${cards[0].name} is not whispering something random. It is pointing at the exact energy asking for your attention right now.`
      : `${spread.name} is showing a pattern, not isolated messages. These cards want you to look at how the pieces are speaking to each other.`,
    card_readings: [],
    synthesis: cards.length === 1
      ? `The message is simple but not small: ${cards[0].meaning} Let this be less about chasing certainty and more about responding honestly to what you already know.`
      : `Together, ${cardNames} describe a movement through your current energy: what is loud, what is hidden, and what is asking to be honored next. ${cardLines} The deeper message is to stop treating these as separate signs. They are one conversation asking you to trust your perception, choose the cleaner path, and stop giving your power away to confusion.`,
    affirmation,
  };
}

function normalizeOracleReading(result, fallback) {
  const payload = unwrapAiResult(result);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return fallback;

  return {
    opening: payload.opening || fallback.opening,
    card_readings: [],
    synthesis: payload.synthesis || payload.message || payload.reading || fallback.synthesis,
    affirmation: payload.affirmation || fallback.affirmation,
  };
}

export default function Oracle() {
  const { isPremium } = useUserProfile();
  const [spreadId, setSpreadId] = useState('single');
  const [drawnCards, setDrawnCards] = useState([]);
  const [oracleReading, setOracleReading] = useState(null);
  const [loadingSynthesis, setLoadingSynthesis] = useState(false);
  const [phase, setPhase] = useState('ready');
  const [blocked, setBlocked] = useState(false);
  const [drawCount, setDrawCount] = useState(() => getDrawCount());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const spread = SPREADS.find(s => s.id === spreadId) || SPREADS[0];
  const drawnCard = drawnCards[0] || null;

  const synthesizeOracleReading = async (cards, activeSpread) => {
    const fallback = buildLocalOracleReading(cards, activeSpread);
    setOracleReading(fallback);
    setLoadingSynthesis(true);

    try {
      const result = await invokeLLM({
        action: 'oracle_reading',
        params: {
          spreadName: activeSpread.name,
          positions: activeSpread.positions,
          cards: cards.map((card, index) => ({
            name: card.name,
            position: activeSpread.positions[index],
            keywords: card.keywords || [],
            meaning: card.meaning,
            affirmation: card.affirmation,
          })),
        },
      });
      setOracleReading(normalizeOracleReading(result, fallback));
      trackEvent('oracle_synthesis_completed', { spread: activeSpread.id, card_count: cards.length });
    } catch (error) {
      console.info('Using local Oracle synthesis while the AI reading service is unavailable.', error);
      setOracleReading(fallback);
    } finally {
      setLoadingSynthesis(false);
    }
  };

  const handleSelectSpread = (s) => {
    if (s.premium && !isPremium) {
      setPaywallOpen(true);
      return;
    }
    setSpreadId(s.id);
  };

  const handleDraw = () => {
    const currentDrawCount = getDrawCount();
    if (!isPremium && currentDrawCount >= FREE_DAILY_LIMIT) {
      setDrawCount(currentDrawCount);
      setBlocked(true);
      trackEvent('oracle_daily_limit_hit');
      return;
    }

    if (!isPremium) {
      setDrawCount(markDrawnToday());
    }

    setBlocked(false);
    setPhase('drawing');
    setDrawnCards([]);
    setOracleReading(null);
    setLoadingSynthesis(false);
    playMysticHum();
    vibrate([10, 40, 10, 40, 80]);

    setTimeout(() => {
      const cards = drawUniqueCards(spread.count);
      setDrawnCards(cards);
      setPhase('revealed');
      setSaved(false);
      setShared(false);
      setShareOpen(false);
      playSparkle();
      vibrate([20, 30, 60]);
      trackEvent('oracle_card_drawn', { card: cards[0].name, spread: spread.id, is_premium: isPremium });
      synthesizeOracleReading(cards, spread);
    }, 1400);
  };

  const readingText = () => {
    if (oracleReading) {
      return [
        oracleReading.opening,
        oracleReading.synthesis,
        oracleReading.affirmation ? `Affirmation: ${oracleReading.affirmation}` : '',
      ].filter(Boolean).join('\n\n');
    }

    return drawnCards
      .map((card, index) => `${spread.positions[index]}: ${card.name} — ${card.meaning}`)
      .join('\n\n');
  };

  const shareText = () => {
    if (!drawnCards.length) return '';
    return `✨ Oracle ${spread.count === 1 ? `Card: ${drawnCard.name}` : `Spread: ${spread.name}`}\n\n${readingText()}`;
  };

  const handleSave = async () => {
    if (saved || saving || !drawnCards.length) return;
    if (!(await auth.isAuthenticated())) {
      auth.redirectToLogin(window.location.pathname);
      return;
    }
    setSaving(true);
    try {
      await Reading.create({
        type: 'oracle',
        title: spread.count === 1 ? `Oracle: ${drawnCard.name}` : `Oracle Spread: ${spread.name}`,
        spread_type: spread.id,
        cards_drawn: drawnCards.map(c => ({ name: c.name })),
        reading_text: readingText(),
        summary: (oracleReading?.synthesis || readingText()).slice(0, 120),
      });
      setSaved(true);
      trackEvent('reading_saved', { type: 'oracle', spread: spread.id });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!drawnCards.length) return;
    trackEvent('reading_shared', { type: 'oracle', spread: spread.id });
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://main.d9v72l1if77fe.amplifyapp.com';
    const text = `${shareText()}\n\n🔮 Get your own reading at ${appUrl}`;
    if (navigator.share) {
      await navigator.share({ title: 'Oracle Reading', text });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleReset = () => {
    const currentDrawCount = getDrawCount();
    if (!isPremium && currentDrawCount >= FREE_DAILY_LIMIT) {
      setDrawCount(currentDrawCount);
      setBlocked(true);
      setPhase('ready');
      setDrawnCards([]);
      setOracleReading(null);
      setLoadingSynthesis(false);
      return;
    }

    setPhase('ready');
    setDrawnCards([]);
    setOracleReading(null);
    setLoadingSynthesis(false);
    setBlocked(false);
    setShared(false);
    setShareOpen(false);
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

      {!isPremium && (
        <p className="text-center text-xs text-muted-foreground mb-6">
          Free tier: {Math.max(0, FREE_DAILY_LIMIT - drawCount)} of {FREE_DAILY_LIMIT} draws left today · <Link to="/premium" className="text-teal underline underline-offset-2">Upgrade for unlimited draws</Link>
        </p>
      )}

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

      <AnimatePresence>
        {phase === 'revealed' && drawnCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {spread.count === 1 ? (
              <>
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
              </>
            ) : (
              <div className={`grid gap-4 ${spread.count === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {drawnCards.map((card, i) => (
                  <OracleSpreadCard key={card.name} card={card} position={spread.positions[i]} delay={i * 0.15} />
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 border border-teal/20"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal" />
                  <h3 className="font-heading text-sm font-semibold text-teal">Oracle Synthesis</h3>
                </div>
                {loadingSynthesis && (
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deepening...
                  </span>
                )}
              </div>

              <p className="text-sm text-foreground italic leading-relaxed">{oracleReading?.opening}</p>

              {oracleReading?.synthesis && (
                <div className="border-t border-border/30 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Reading</p>
                  <p className="text-sm text-foreground leading-relaxed">{oracleReading.synthesis}</p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-4 border-t border-border/30"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your Affirmation</p>
              <p className="text-base text-teal italic font-medium">"{oracleReading?.affirmation || drawnCard.affirmation}"</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3">
              <ListenButton
                text={readingText()}
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
              <Button onClick={() => setShareOpen((value) => !value)} variant="outline" className="gap-2 border-border/50">
                <Share2 className="w-4 h-4" />
                Share Options
              </Button>
              <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50">
                <RotateCcw className="w-4 h-4" />
                Draw Again
              </Button>
            </div>

            {shareOpen && (
              <ShareActions
                title="Oracle Reading"
                text={shareText()}
                onShared={() => {
                  setShared(true);
                  setTimeout(() => setShared(false), 2000);
                  trackEvent('reading_shared', { type: 'oracle', spread: spread.id, surface: 'share_options' });
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
