import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, BookOpen, History, Save, Share2, Check, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/shared/SectionHeader';
import { Link } from 'react-router-dom';
import PremiumGate from '@/components/shared/PremiumGate';
import SpreadSelector from '@/components/tarot/SpreadSelector';
import DeckSelector from '@/components/tarot/DeckSelector';
import ReadingCategorySelector from '@/components/tarot/ReadingCategorySelector';
import TarotCard from '@/components/tarot/TarotCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ClarifyThis from '@/components/tarot/ClarifyThis';
import OraclePull from '@/components/tarot/OraclePull';
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
  const [readingError, setReadingError] = useState(null);

  const spread = SPREADS[selectedSpread];
  const allFlipped = drawnCards.length > 0 && flippedCount >= drawnCards.length;

  const handleSpreadSelect = (spreadKey) => {
    setSelectedSpread(spreadKey);
    setPhase('select');
    setDrawnCards([]);
    setReading(null);
    setSaved(false);
    setShared(false);
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
    const cardDescriptions = drawnCards.map((card, i) =>
      `Position "${spread.positions[i]}": ${card.name}${card.isReversed ? ' (Reversed)' : ''} - ${card.isReversed ? card.reversed : card.meaning}`
    ).join('\n');

    const channeledInstruction = isChanneled
      ? `IMPORTANT: Write the synthesis entirely in FIRST PERSON ("I"), as if you are the person of interest speaking directly and honestly to the querent. Be emotionally real and conversational. Always end by bringing the focus back to the querent's own peace and growth — not the other person's drama.`
      : '';

    const selfLoveInstruction = isSelfLove
      ? `This is a self-love and healing spread. Make every interpretation warm, empowering, and growth-focused. You are calling them UP, not calling them out. Remind them that self-love is not weakness — it is the foundation of everything.`
      : '';

    const threeCardInstruction = isThreeCard
      ? `CRITICAL STRUCTURE RULE: This is the Past / Present / Future spread. You MUST follow this exact structure every single time, no exceptions:
- card_readings[0] = PAST: What energy, pattern, or experience from the past is shaping this moment. What did it teach them?
- card_readings[1] = PRESENT: Exactly where they are RIGHT NOW. What is alive, active, and demanding their attention today?
- card_readings[2] = FUTURE: The direction energy is moving IF they apply the wisdom of the past and present cards. Empowering and specific.
The synthesis must weave all three timeframes into one cohesive narrative arc: where they've been → where they are → where they're headed.`
      : '';

    try {
      let result;
      const awsApiUrl = import.meta.env.VITE_SCRY_API_URL;
      if (awsApiUrl) {
        const awsResponse = await fetch(`${awsApiUrl.replace(/\/$/, '')}/readings/tarot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spread: { id: selectedSpread, name: spread.name },
            cards: drawnCards.map((card, index) => ({
              name: card.name,
              position: spread.positions[index],
              reversed: card.isReversed,
              meaning: card.isReversed ? card.reversed : card.meaning,
            })),
          }),
        });
        if (!awsResponse.ok) throw new Error(`AWS reading service returned ${awsResponse.status}`);
        result = await awsResponse.json();
      } else {
        result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Compassionate Truth-Teller — a tarot reader who speaks like a mentor who has been through the fire themselves. You have lived experience. You've felt heartbreak, confusion, self-doubt, and you came out the other side. You share that wisdom with warmth, never from a place of judgment.

Your voice: Direct but gentle. Second person ("You"). Use relatable human moments — phrases like "I've been exactly where you are," "I remember feeling this same confusion," or "I know how hard this is, because I've sat in it too." Always hold the user's hand through the hard truth and guide them toward the solution. The goal is self-love, not just being right.

CLOSING RULE: Every single reading must end with this energy — even when the cards are difficult, the final message must carry: "You are doing the best you can with what you have. Be as kind to yourself as I am being to you right now."

Spread: "${spread.name}"

Cards drawn:
${cardDescriptions}

${channeledInstruction}
${selfLoveInstruction}
${threeCardInstruction}

Provide the following sections:
1. opening: A direct, warm opening that sets the energy (2-3 sentences). Honest but kind.
2. card_readings: Each card's position + an empathetic, direct interpretation (2-3 sentences each). Always connect back to their growth.
3. synthesis: A cohesive narrative weaving all cards together. CRITICAL: Do NOT repeat or summarize the individual card meanings one by one — the user already sees them on screen. Jump straight into the integrated, overarching message of how the cards interlock and speak to each other. ${isChanneled ? 'Write this ENTIRELY in first person ("I") as the person of interest speaking. End by redirecting focus to the querent\'s own healing and peace.' : 'Honest, warm, and empowering. End with a note of genuine hope or strength.'}
4. closing: One powerful, warm closing sentence that leaves them feeling seen and capable.
5. power_move_action: One self-love homework assignment rooted in genuine self-care (e.g., "Buy yourself flowers today — not for anyone else, just because you deserve them" or "Spend 20 minutes doing something you love, completely guilt-free"). Focus on putting their own energy back into themselves.
6. power_move_affirmation: One warm, powerful "I am" or "I deserve" statement.
7. visual_omen: A vivid, specific visual symbol or image from nature that mirrors the reading's core energy. Describe it poetically (e.g., "A single red cardinal on a snow-dusted branch, turning its head toward the morning light").
8. song_sign: A specific song and artist that matches the reading's vibrational energy. Be concrete — pick a real song that embodies the emotional frequency of this reading (e.g., "Solange — Cranes in the Sky" or "Fleetwood Mac — Landslide").`,
        response_json_schema: {
          type: "object",
          properties: {
            opening: { type: "string" },
            card_readings: { type: "array", items: { type: "object", properties: { position: { type: "string" }, interpretation: { type: "string" } } } },
            synthesis: { type: "string" },
            closing: { type: "string" },
            power_move_action: { type: "string" },
            power_move_affirmation: { type: "string" },
            visual_omen: { type: "string" },
            song_sign: { type: "string" },
          },
          required: ["opening", "card_readings", "synthesis", "closing", "visual_omen", "song_sign"]
        }
        });
      }

      setReading(result);
      setPhase('reading');
      setLoadingReading(false);
      setReadingError(null);
      base44.analytics.track({
        eventName: 'tarot_reading_completed',
        properties: {
          spread_type: selectedSpread,
          spread_name: spread.name,
          card_count: drawnCards.length,
          is_premium: isPremium,
        },
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
        visual_omen: 'Watch for a small light appearing where you expected darkness.',
        song_sign: 'The next lyric that makes you stop and listen is part of the message.',
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
    setSaving(true);
    await base44.entities.Reading.create({
      type: 'tarot',
      title: `${spread.name} Reading`,
      spread_type: selectedSpread,
      cards_drawn: drawnCards.map((c, i) => ({ name: c.name, position: spread.positions[i], reversed: c.isReversed })),
      reading_text: `${reading.opening}\n\n${reading.synthesis}\n\n${reading.closing}`,
      summary: reading.opening?.slice(0, 120),
    });
    setSaving(false);
    setSaved(true);
    trackEvent('reading_saved', { type: 'tarot', spread_type: selectedSpread });
  };

  const handleShare = async () => {
    if (!reading) return;
    trackEvent('reading_shared', { type: 'tarot', spread_type: selectedSpread });
    const appUrl = 'https://newtarotories.base44.app';
    const text = `✨ My Tarot Reading: ${spread.name}\n\n${reading.opening}\n\n${reading.synthesis}\n\n${reading.closing}\n\n🔮 Get your own reading at ${appUrl}`;
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
                <p className="text-foreground italic text-center leading-relaxed">{reading.opening}</p>

                <div className="space-y-4">
                  {reading.card_readings?.map((cr, i) => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <h4 className="font-heading text-sm font-semibold text-primary mb-1">{cr.position}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cr.interpretation}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/30 pt-6">
                  <h4 className="font-heading text-sm font-semibold text-teal mb-2">Synthesis</h4>
                  <p className="text-sm text-foreground leading-relaxed">{reading.synthesis}</p>
                </div>

                <p className="text-center text-sm text-gold italic">{reading.closing}</p>

                {/* Visual Omen & Song Sign */}
                {(reading.visual_omen || reading.song_sign) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {reading.visual_omen && (
                      <div className="rounded-xl p-4 border border-violet/20 bg-violet/5">
                        <p className="text-xs font-heading uppercase tracking-wider text-violet mb-2">🔮 Visual Omen</p>
                        <p className="text-sm text-foreground leading-relaxed italic">{reading.visual_omen}</p>
                      </div>
                    )}
                    {reading.song_sign && (
                      <div className="rounded-xl p-4 border border-teal/20 bg-teal/5">
                        <p className="text-xs font-heading uppercase tracking-wider text-teal mb-2">🎵 Song Sign</p>
                        <p className="text-sm text-foreground leading-relaxed">{reading.song_sign}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Power Move */}
                {(reading.power_move_action || reading.power_move_affirmation) && (
                  <div className="border border-gold/20 rounded-2xl p-5 bg-gold/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-gold" />
                      <h4 className="font-heading text-sm font-semibold text-gold">Self-Love Homework 💛</h4>
                    </div>
                    {reading.power_move_action && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Action</p>
                        <p className="text-sm text-foreground font-medium">{reading.power_move_action}</p>
                      </div>
                    )}
                    {reading.power_move_affirmation && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Affirmation</p>
                        <p className="text-sm text-gold italic">"{reading.power_move_affirmation}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Oracle Clarity — pull an oracle card to add to the reading */}
                {reading?.synthesis && (
                  <OraclePull readingContext={reading.synthesis} />
                )}

                {/* Clarify This */}
                {drawnCards.length > 0 && (
                  <ClarifyThis drawnCards={drawnCards} spreadPositions={spread.positions} />
                )}

                {/* Save & Share */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
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
                  <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50">
                    <RotateCcw className="w-4 h-4" />
                    New Reading
                  </Button>
                </div>

                <ReadingDisclaimer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
