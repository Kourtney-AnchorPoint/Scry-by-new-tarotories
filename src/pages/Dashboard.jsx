import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Star, Hash, ArrowRight, Moon, Flame, Heart, Gem, Zap, BookOpen, Triangle, Hexagon, Circle, Square } from 'lucide-react';
import BotanicalDivider from '@/components/shared/BotanicalDivider';
import { Link } from 'react-router-dom';
import { invokeLLM } from '@/api/ai';
import GlassCard from '@/components/shared/GlassCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { calculateDailyNumber } from '@/lib/numerologyUtils';
import { MAJOR_ARCANA } from '@/lib/tarotData';
import CardDetailModal from '@/components/tarot/CardDetailModal';
import DailyTransitCard from '@/components/dashboard/DailyTransitCard';
import AltarTarotCard from '@/components/dashboard/AltarTarotCard';
import OmenCard from '@/components/dashboard/OmenCard';
import SongCard from '@/components/dashboard/SongCard';
import { trackEvent } from '@/lib/analytics';
import { unwrapAiResult } from '@/lib/aiResult';

const ZODIAC_WHEEL_IMG = 'https://media.base44.com/images/public/69e0a15fb28fbe3a6b439ba3/f0661ff37_generated_image.png';

const QUICK_LINKS = [
  { path: '/tarot', label: 'Tarot', icon: Sparkles },
  { path: '/astrology', label: 'Astrology', icon: Sun },
  { path: '/oracle', label: 'Oracle', icon: Star },
  { path: '/pendulum', label: 'Pendulum', icon: Gem },
  { path: '/altar', label: 'Altar', icon: Flame },
  { path: '/numerology', label: 'Numbers', icon: Hash },
  { path: '/channeled', label: 'Messages', icon: Zap },
];

function getCosmicFallback(dailyNumber) {
  return {
    daily_affirmation: "I am exactly where I need to be, and I trust what's unfolding.",
    cosmic_overview: "Today's energy asks you to slow down and check in with yourself. You've been giving a lot. Make sure you're also receiving.",
    crystal: { name: "Rose Quartz", property: "Opens the heart to self-compassion and gentle healing", chakra: "Heart", element: "Water" },
    spell: { name: "Self-Love Mirror Spell", intent: "To see yourself through kinder eyes", instruction: "Stand before a mirror, place a hand on your heart, and say 'I choose me today' three times." },
    tarot: { name: "The Star", number: 17, theme: "Hope", keyword: "Renewal", message: "Healing is happening, even when you can't see it." },
    oracle: { name: "The Still Point", deck: "Lunar Oracle", message: "Pause. The answer you're looking for is in the silence." },
    numerology: { number: dailyNumber, name: "The Seeker", meaning: "A day for asking questions and staying curious", energy: "Today invites you to explore rather than conclude." },
    sacred_geometry: { name: "Flower of Life", meaning: "Interconnectedness of all living things", shape: "circle" },
    astro_energy: "Channel today's tension into clarity about what - and who - is actually worth your energy.",
    color_of_day: "Soft Pink",
    color_message: "Today is for being gentle with yourself.",
    visual_omen: { sign: "a white feather", message: "When you spot it, take it as confirmation that you're being looked after today." },
    song: { title: "Landslide", artist: "Fleetwood Mac", why: "Today's energy is about accepting change gently - let this one find you." },
  };
}

function mergeCosmicData(result, dailyNumber) {
  const fallback = getCosmicFallback(dailyNumber);
  const payload = unwrapAiResult(result);
  const data = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};

  return {
    ...fallback,
    ...data,
    crystal: { ...fallback.crystal, ...(data.crystal || {}) },
    spell: { ...fallback.spell, ...(data.spell || {}) },
    tarot: { ...fallback.tarot, ...(data.tarot || {}) },
    oracle: { ...fallback.oracle, ...(data.oracle || {}) },
    numerology: { ...fallback.numerology, ...(data.numerology || {}) },
    sacred_geometry: { ...fallback.sacred_geometry, ...(data.sacred_geometry || {}) },
    visual_omen: { ...fallback.visual_omen, ...(data.visual_omen || {}) },
    song: { ...fallback.song, ...(data.song || {}) },
  };
}

export default function Dashboard() {
  const [cosmicData, setCosmicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const dailyNumber = calculateDailyNumber();
  const today = new Date();
  const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const moonPhase = moonPhases[Math.floor((today.getDate() % 29.5) / 3.69)];

  // Use LOCAL date for cache key — toISOString gives UTC, which can roll over before midnight
  const CACHE_VERSION = 'v6';
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const cacheKey = `cosmic_${dateKey}_${CACHE_VERSION}`;

  useEffect(() => {
    async function fetchCosmic() {
      const fallback = getCosmicFallback(dailyNumber);

      // Check if we already have today's data cached
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setCosmicData(mergeCosmicData(JSON.parse(cached), dailyNumber));
        setLoading(false);
        return;
      }

      // Show the authored Room immediately. The AI/backend layer can enhance
      // it, but the homepage must never look like a dead loading frame.
      setCosmicData(fallback);
      setLoading(false);

      try {
        const result = await Promise.race([
          invokeLLM({
            action: 'daily_cosmic_altar',
            params: {
              dateLabel: today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
              dateKey,
              dailyNumber,
            },
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Daily room backend timed out')), 8000)),
        ]);
        const merged = mergeCosmicData(result, dailyNumber);
        sessionStorage.setItem(cacheKey, JSON.stringify(merged));
        setCosmicData(merged);
      } catch {
        setCosmicData({
          daily_affirmation: "I am exactly where I need to be, and I trust what's unfolding.",
          cosmic_overview: "Today's energy asks you to slow down and check in with yourself. You've been giving a lot. Make sure you're also receiving.",
          crystal: { name: "Rose Quartz", property: "Opens the heart to self-compassion and gentle healing", chakra: "Heart", element: "Water" },
          spell: { name: "Self-Love Mirror Spell", intent: "To see yourself through kinder eyes", instruction: "Stand before a mirror, place a hand on your heart, and say 'I choose me today' three times." },
          tarot: { name: "The Star", number: 17, theme: "Hope", keyword: "Renewal", message: "Healing is happening, even when you can't see it." },
          oracle: { name: "The Still Point", deck: "Lunar Oracle", message: "Pause. The answer you're looking for is in the silence." },
          numerology: { number: dailyNumber, name: "The Seeker", meaning: "A day for asking questions and staying curious", energy: "Today invites you to explore rather than conclude." },
          sacred_geometry: { name: "Flower of Life", meaning: "Interconnectedness of all living things", shape: "circle" },
          astro_energy: "Channel today's tension into clarity about what — and who — is actually worth your energy.",
          color_of_day: "Soft Pink",
          color_message: "Today is for being gentle with yourself.",
          visual_omen: { sign: "a white feather", message: "When you spot it, take it as confirmation that you're being looked after today." },
          song: { title: "Landslide", artist: "Fleetwood Mac", why: "Today's energy is about accepting change gently — let this one find you." },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchCosmic();
  }, [cacheKey]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border/50 text-xs text-muted-foreground mb-6">
          <Moon className="w-3.5 h-3.5" />
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          <span>{moonPhase}</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">
          <span className="shimmer-text">The Room</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Your daily ritual dashboard — crystals, spells, cards, and the patterns of the day.
        </p>
      </motion.div>

      {loading ? (
        <LoadingSpinner message="Aligning the cosmos..." />
      ) : (
        <>
          {/* Affirmation — arched altar banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-t-[70px] rounded-b-2xl border border-gold/40 p-1.5 mb-6"
          >
            <div className="rounded-t-[62px] rounded-b-xl border border-gold/20 glass px-6 py-8 sm:py-9 text-center">
              <Flame className="w-5 h-5 text-gold mx-auto mb-3" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Today's Affirmation</p>
              <p className="text-foreground leading-relaxed text-base sm:text-lg font-light italic max-w-xl mx-auto">
                "{cosmicData?.daily_affirmation}"
              </p>
            </div>
          </motion.div>

          {/* Today's Biggest Energy — real transit from live ephemeris */}
          <DailyTransitCard />

          {/* The Altar Table */}
          <div className="relative mb-6">
            <img
              src={ZODIAC_WHEEL_IMG}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 m-auto w-[560px] max-w-full opacity-25 mix-blend-screen pointer-events-none select-none"
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.35fr_1fr] gap-4 items-start">
              {/* Left column */}
              <div className="space-y-4 order-2 lg:order-1">
                {cosmicData?.crystal && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5 border border-gold/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Gem className="w-4 h-4 text-teal" />
                      <h3 className="font-heading text-sm font-semibold text-teal">Crystal of the Day</h3>
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">{cosmicData.crystal.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{cosmicData.crystal.property}</p>
                    <div className="flex flex-wrap gap-2">
                      {cosmicData.crystal.chakra && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet/10 border border-violet/20 text-violet">{cosmicData.crystal.chakra}</span>
                      )}
                      {cosmicData.crystal.element && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-teal/10 border border-teal/20 text-teal capitalize">{cosmicData.crystal.element}</span>
                      )}
                    </div>
                  </motion.div>
                )}

                {cosmicData?.spell && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-5 border border-gold/20">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-gold" />
                      <h3 className="font-heading text-sm font-semibold text-gold">Spell of the Day</h3>
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">{cosmicData.spell.name}</p>
                    <p className="text-xs text-muted-foreground italic mb-2">Intent: {cosmicData.spell.intent}</p>
                    <p className="text-xs text-foreground leading-relaxed">{cosmicData.spell.instruction}</p>
                  </motion.div>
                )}

                <OmenCard omen={cosmicData?.visual_omen} delay={0.5} />
              </div>

              {/* Center — the card on the altar */}
              <div className="order-1 lg:order-2">
                <AltarTarotCard
                  tarot={cosmicData?.tarot}
                  onOpen={(card) => {
                    trackEvent('daily_tarot_card_opened', { card: card.name });
                    setSelectedCard(card);
                  }}
                />
              </div>

              {/* Right column */}
              <div className="space-y-4 order-3">
                {cosmicData?.sacred_geometry && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5 border border-gold/20">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
                        {cosmicData.sacred_geometry.shape === 'triangle' && <Triangle className="w-5 h-5 text-gold" />}
                        {cosmicData.sacred_geometry.shape === 'hexagon' && <Hexagon className="w-5 h-5 text-gold" />}
                        {cosmicData.sacred_geometry.shape === 'square' && <Square className="w-5 h-5 text-gold" />}
                        {(cosmicData.sacred_geometry.shape === 'circle' || !cosmicData.sacred_geometry.shape) && <Circle className="w-5 h-5 text-gold" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-sm font-semibold text-gold mb-1">Sacred Geometry</h3>
                        <p className="text-base font-semibold text-foreground mb-1">{cosmicData.sacred_geometry.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{cosmicData.sacred_geometry.meaning}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {cosmicData?.oracle && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-5 border border-gold/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-teal" />
                      <h3 className="font-heading text-sm font-semibold text-teal">Oracle Card of the Day</h3>
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">{cosmicData.oracle.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">From: {cosmicData.oracle.deck}</p>
                    <p className="text-xs text-foreground leading-relaxed italic">{cosmicData.oracle.message}</p>
                    <Link to="/oracle" className="text-xs text-teal mt-2 inline-block">Go deeper →</Link>
                  </motion.div>
                )}

                <SongCard song={cosmicData?.song} delay={0.5} />
              </div>
            </div>
          </div>

          {/* Today's Energy */}
          {cosmicData?.cosmic_overview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-2xl p-5 mb-4 text-center border border-gold/20"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Today's Energy</p>
              <p className="text-sm text-foreground leading-relaxed italic max-w-2xl mx-auto">{cosmicData.cosmic_overview}</p>
            </motion.div>
          )}

          {/* Numerology + Astro + Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {cosmicData?.numerology && (
              <GlassCard glow="violet" className="p-5 border border-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-violet" />
                  <h3 className="font-heading text-sm font-semibold text-violet">Numerology</h3>
                </div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-heading font-bold text-violet">{cosmicData.numerology.number}</span>
                  <p className="text-base font-semibold text-foreground">{cosmicData.numerology.name}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{cosmicData.numerology.meaning}</p>
              </GlassCard>
            )}
            {cosmicData?.astro_energy && (
              <GlassCard glow="gold" className="p-5 border border-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-gold" />
                  <h3 className="font-heading text-sm font-semibold text-gold">Astro Energy</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{cosmicData.astro_energy}</p>
              </GlassCard>
            )}
            {cosmicData?.color_of_day && (
              <GlassCard glow="pink" className="p-5 border border-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-pink" />
                  <h3 className="font-heading text-sm font-semibold text-pink">Color of the Day</h3>
                </div>
                <p className="text-base font-semibold text-foreground mb-1">{cosmicData.color_of_day}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{cosmicData.color_message}</p>
              </GlassCard>
            )}
          </div>
        </>
      )}

      {/* Botanical divider */}
      <BotanicalDivider />

      {/* Card Detail Modal */}
      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        {QUICK_LINKS.map((link, i) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <Link
                to={link.path}
                className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 text-center border border-gold/20 hover:glow-gold transition-all duration-500 group"
              >
                <div className="p-3 rounded-xl bg-secondary group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-foreground">{link.label}</p>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
