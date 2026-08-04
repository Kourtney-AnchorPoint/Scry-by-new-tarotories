import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, BookOpen, History, Save, Share2, Check } from 'lucide-react';
import { invokeLLM } from '@/api/ai';
import { Reading } from '@/api/entities';
import { auth } from '@/api/auth';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/shared/SectionHeader';
import { Link } from 'react-router-dom';
import PremiumGate from '@/components/shared/PremiumGate';
import SpreadSelector from '@/components/tarot/SpreadSelector';
import DeckSelector from '@/components/tarot/DeckSelector';
import ReadingCategorySelector from '@/components/tarot/ReadingCategorySelector';
import TarotCard from '@/components/tarot/TarotCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ListenButton from '@/components/shared/ListenButton';
import ShareActions from '@/components/shared/ShareActions';
import { useUserProfile } from '@/hooks/useUserProfile';
import ReadingDisclaimer from '@/components/shared/ReadingDisclaimer';
import { MAJOR_ARCANA, SPREADS } from '@/lib/tarotData';
import { DECKS, READING_CATEGORIES } from '@/lib/decks';
import { playMysticHum, playTap, vibrate } from '@/lib/mysticSounds';
import { trackEvent } from '@/lib/analytics';

export default function Tarot() {
  const { isPremium } = useUserProfile();
  const [selectedSpread, setSelectedSpread] = useState('single');
  const [selectedDeck, setSelectedDeck] = useState('classic');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [drawnCards, setDrawnCards] = useState([]);
  const [flippedCount, setFlippedCount] = useState(0);
  const [reading, setReading] = useState(null);
  const [phase, setPhase] = useState('select'); // select | shuffle | drawn | reading
  const [loadingReading, setLoadingReading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [readingError, setReadingError] = useState(null);

  const spread = SPREADS[selectedSpread];
  const allFlipped = drawnCards.length > 0 && flippedCount >= drawnCards.length;

  const readingToText = (includeFooter = false) => {
    if (!reading) return '';

    const text = [
      reading.opening,
      reading.synthesis,
      reading.closing,
    ].filter(Boolean).join('\n\n');

    if (!includeFooter) return text;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://main.d9v72l1if77fe.amplifyapp.com';
    return `✨ My Tarot Reading: ${spread.name}\n\n${text}\n\n🔮 Get your own reading at ${appUrl}`;
  };

  const handleSpreadSelect = (spreadKey) => {
    setSelectedSpread(spreadKey);
    setPhase('select');
    setDrawnCards([]);
    setReading(null);
    setSaved(false);
    setShared(false);
    setShareOpen(false);
    setFlippedCount(0);
  };

  const doShuffle = useCallback(() => {
    trackEvent('tarot_reading_started', {
      spread_type: selectedSpread,
      spread_name: spread.name,
      is_premium: isPremium,
    });
    playMysticHum();
    vibrate([10, 40, 10, 40, 80]);
    setPhase('shuffle');
    setReading(null);
    setSaved(false);
    setShared(false);
    setShareOpen(false);
    setFlippedCount(0);

    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    const cards = shuffled.slice(0, spread.count).map(card => ({
      ...card,
      isReversed: Math.random() > 0.7,
    }));

    setTimeout(() => {
      setDrawnCards(cards);
      setPhase('drawn');
    }, 1500);
  }, [spread]);

  const handleShuffle = doShuffle;

  const handleCardFlip = useCallback(() => {
    setFlippedCount(prev => prev + 1);
  }, []);

  const handleGetReading = async () => {
    setLoadingReading(true);
    const isChanneled = spread.channeled === true;
    const isSelfLove = spread.selflove === true;
    const isThreeCard = selectedSpread === 'three_card';

    try {
      const result = await invokeLLM({
        action: 'tarot_reading',
        params: {
          spreadName: spread.name,
          cards: drawnCards.map((card, i) => ({
            name: card.name,
            position: spread.positions[i],
            isReversed: card.isReversed,
            meaning: card.isReversed ? card.reversed : card.meaning,
          })),
          isChanneled,
          isSelfLove,
          isThreeCard,
        },
      });

      setReading(result);
      setPhase('reading');
      setLoadingReading(false);
      setReadingError(null);
      trackEvent('tarot_reading_completed', {
        spread_type: selectedSpread,
        spread_name: spread.name,
        card_count: drawnCards.length,
        is_premium: isPremium,
      });
    } catch (error) {
      // The recovered Base44 AI endpoint may be unavailable while the AWS
      // replacement is being connected. Keep the core reading experience
      // functional with the deck's authored meanings instead of showing a 404.
      const cardReadings = drawnCards.map((card, index) => ({
        position: spread.positions[index],
        card: card.name,
        interpretation: card.isReversed ? card.reversed : card.meaning,
      }));
      const names = drawnCards.map((card) => card.name).join(', ');
      const localReading = {
        opening: 'The cards are not asking you to predict your life. They are asking you to notice what is already moving inside it.',
        card_readings: cardReadings,
        synthesis: `Together, ${names} point to a moment that needs honesty more than urgency. Notice the pattern connecting these cards: what you are carrying, what needs your attention now, and what becomes possible when you respond deliberately. You do not have to solve everything today. Choose the next decision that brings you closer to your own peace.`,
        closing: 'You are doing the best you can with what you have—be as kind to yourself as you would be to someone you love.',
      };
      setReading(localReading);
      setPhase('reading');
      setLoadingReading(false);
      setReadingError(null);
      console.info('Using the local tarot reading engine while the AWS reading service is unavailable.', error);
    }
  };

  const handleSave = async () => {
    if (saved || saving || !reading) return;
    if (!(await auth.isAuthenticated())) {
      auth.redirectToLogin(window.location.pathname);
      return;
    }
    setSaving(true);
    try {
      await Reading.create({
        type: 'tarot',
        title: `${spread.name} Reading`,
        spread_type: selectedSpread,
        cards_drawn: drawnCards.map((c, i) => ({ name: c.name, position: spread.positions[i], reversed: c.isReversed })),
        reading_text: `${reading.opening}\n\n${reading.synthesis}\n\n${reading.closing}`,
        summary: reading.opening?.slice(0, 120),
      });
      setSaved(true);
      trackEvent('reading_saved', { type: 'tarot', spread_type: selectedSpread });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!reading) return;
    trackEvent('reading_shared', { type: 'tarot', spread_type: selectedSpread });
    const text = readingToText(true);
    if (navigator.share) {
      await navigator.share({ title: `${spread.name} Tarot Reading`, text });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleReset = () => {
    setPhase('select');
    setDrawnCards([]);
    setReading(null);
    setSaved(false);
    setShared(false);
    setShareOpen(false);
    setFlippedCount(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader
        icon={Sparkles}
        title="Tarot Reading"
        subtitle="Choose your spread and reveal the wisdom within"
        color="violet"
      />
      <div className="flex justify-center mb-6">
        <Link to="/tarot/history">
          <Button variant="outline" size="sm" className="gap-2 border-border/50 text-muted-foreground hover:text-foreground rounded-full">
            <History className="w-4 h-4" />
            History
          </Button>
        </Link>
      </div>

      {/* Spread Selection */}
      {phase === 'select' && (
        <div className="space-y-6">
          <SpreadSelector
            selectedSpread={selectedSpread}
            onSelect={handleSpreadSelect}
            isPremium={isPremium}
          />
          {SPREADS[selectedSpread]?.premium && !isPremium ? (
            <PremiumGate feature="advanced spreads" />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-8">
              <Button
                onClick={handleShuffle}
                className="bg-gradient-to-r from-violet to-violet-dark text-white hover:opacity-90 px-8 py-6 text-base gap-3 rounded-xl select-none min-h-[44px]"
              >
                <Sparkles className="w-5 h-5" />
                Shuffle & Draw
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Shuffling Animation */}
      {phase === 'shuffle' && (
        <div className="flex flex-col items-center py-16">
          <motion.div
            animate={{ rotate: [0, 10, -10, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: 0 }}
            className="w-32 h-48 glass-card rounded-xl border-2 border-violet/40 glow-violet flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-violet animate-pulse" />
          </motion.div>
          <p className="text-muted-foreground text-sm mt-6 animate-pulse">Shuffling the cosmic deck...</p>
        </div>
      )}

      {/* Drawn Cards */}
      {(phase === 'drawn' || phase === 'reading') && (
        <div className="space-y-8">
          {/* Cards — wrap tighter so dropdowns don't overflow */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {drawnCards.map((card, i) => (
              <TarotCard
                key={card.id}
                card={card}
                position={spread.positions[i]}
                delay={i * 0.2}
                onFlip={handleCardFlip}
              />
            ))}
          </div>

          {/* Hint while not all flipped */}
          {phase === 'drawn' && !allFlipped && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-muted-foreground"
            >
              Tap each card to reveal it ({flippedCount}/{drawnCards.length} revealed)
            </motion.p>
          )}

          {/* "Get Your Reading" — shown when all flipped, no reading yet */}
          {phase === 'drawn' && allFlipped && !loadingReading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-3"
            >
              <Button
                onClick={handleGetReading}
                className="bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2 px-6 select-none min-h-[44px]"
              >
                <BookOpen className="w-4 h-4" />
                Get Your Reading
              </Button>
              <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50">
                <RotateCcw className="w-4 h-4" />
                Reshuffle
              </Button>
            </motion.div>
          )}

          {loadingReading && <LoadingSpinner message="The cards speak their wisdom..." />}

          {/* Error state */}
          {readingError && phase === 'drawn' && !loadingReading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 text-center space-y-4 mt-4"
            >
              <p className="text-sm text-destructive">{readingError}</p>
              <Button onClick={handleGetReading} className="gap-2 bg-gradient-to-r from-violet to-teal text-white">
                <Sparkles className="w-4 h-4" />
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Reading Display */}
          <AnimatePresence>
            {reading && phase === 'reading' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 mt-8"
              >
                <div className="space-y-5">
                  {reading.opening && (
                    <p className="text-foreground italic text-center leading-relaxed">{reading.opening}</p>
                  )}
                  {reading.synthesis && (
                    <div className="border-t border-border/30 pt-6">
                      <h4 className="font-heading text-sm font-semibold text-teal mb-2">Reading</h4>
                      <p className="text-sm text-foreground leading-relaxed">{reading.synthesis}</p>
                    </div>
                  )}
                  {reading.closing && (
                    <p className="text-center text-sm text-gold italic">{reading.closing}</p>
                  )}
                </div>

                {/* Save & Share */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <ListenButton
                    text={readingToText(false)}
                    isPremium={isPremium}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={saved || saving}
                    variant="outline"
                    className={`gap-2 border-border/50 ${saved ? 'text-teal border-teal/40' : ''}`}
                  >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : saved ? 'Kept!' : 'Keep This'}
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className={`gap-2 border-border/50 ${shared ? 'text-teal border-teal/40' : ''}`}
                  >
                    {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    {shared ? 'Copied!' : 'Share Reading'}
                  </Button>
                  <Button onClick={() => setShareOpen((value) => !value)} variant="outline" className="gap-2 border-border/50">
                    <Share2 className="w-4 h-4" />
                    Share Options
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50">
                    <RotateCcw className="w-4 h-4" />
                    New Reading
                  </Button>
                </div>

                {shareOpen && (
                  <ShareActions
                    title={`${spread.name} Tarot Reading`}
                    text={`✨ My Tarot Reading: ${spread.name}\n\n${readingToText(false)}`}
                    onShared={() => {
                      setShared(true);
                      setTimeout(() => setShared(false), 2000);
                      trackEvent('reading_shared', { type: 'tarot', spread_type: selectedSpread, surface: 'share_options' });
                    }}
                  />
                )}

                <ReadingDisclaimer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
