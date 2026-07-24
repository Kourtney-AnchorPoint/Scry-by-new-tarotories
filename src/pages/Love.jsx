import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, Save, Share2, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/shared/SectionHeader';
import TarotCard from '@/components/tarot/TarotCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import RitualOverlay from '@/components/tarot/RitualOverlay';
import LoveSpreadSelector from '@/components/love/LoveSpreadSelector';
import ListenButton from '@/components/shared/ListenButton';
import { useUserProfile } from '@/hooks/useUserProfile';
import { MAJOR_ARCANA, LOVE_SPREADS, CHANNELED_SPREADS, ORACLE_ONLY_SPREADS, UNFILTERED_TRUTH_ORACLE } from '@/lib/tarotData';

const RELATIONSHIP_TYPES = [
  "Romantic Partner", "Ex / Former Partner", "Situationship", "Someone I'm Dating",
  "Crush / New Connection", "Family Member", "Close Friend", "Estranged Person", "Twin Flame / Soulmate",
];

function getSpreadByKey(key, category) {
  if (category === 'tarot') return LOVE_SPREADS[key];
  if (category === 'channeled') return CHANNELED_SPREADS[key];
  if (category === 'oracle') return ORACLE_ONLY_SPREADS[key];
  return LOVE_SPREADS[key] || CHANNELED_SPREADS[key] || ORACLE_ONLY_SPREADS[key];
}

function OracleCardDisplay({ card, position, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card rounded-2xl p-5 border border-gold/30 max-w-xs w-full"
    >
      {position && <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{position}</p>}
      <h3 className="font-heading text-lg font-bold text-gold mb-2">{card.name}</h3>
      <div className="flex flex-wrap gap-1 mb-3">
        {card.keywords.map((kw, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-gold/10 border border-gold/20 text-gold">{kw}</span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{card.meaning}</p>
    </motion.div>
  );
}

export default function Love() {
  const { isPremium } = useUserProfile();
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [spreadCategory, setSpreadCategory] = useState(null);
  const [personName, setPersonName] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [drawnCards, setDrawnCards] = useState([]);
  const [oracleCards, setOracleCards] = useState([]);
  const [flippedCount, setFlippedCount] = useState(0);
  const [reading, setReading] = useState(null);
  const [phase, setPhase] = useState('select'); // select | context | ritual | loading | reading | drawn (non-channeled only)
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
  const [showRitual, setShowRitual] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const messageRef = useRef(null);

  const spread = selectedSpread ? getSpreadByKey(selectedSpread, spreadCategory) : null;
  const isOracleOnly = spread?.isOracleOnly === true;
  const isChanneled = spread?.isChanneled === true || spread?.channeled === true;
  const isMessage = spread?.isMessage === true;
  const tarotCardCount = spread?.tarotCount || (isOracleOnly ? 0 : spread?.count || 0);
  const oracleCardCount = spread?.oracleCount || 0;
  const allFlipped = isOracleOnly
    ? oracleCards.length >= oracleCardCount
    : (drawnCards.length > 0 && flippedCount >= drawnCards.length);

  const handleSpreadSelect = (key, category) => {
    const s = getSpreadByKey(key, category);
    if (s?.premium && !isPremium) return;
    setSelectedSpread(key);
    setSpreadCategory(category);
    setPhase('context');
    setDrawnCards([]);
    setOracleCards([]);
    setReading(null);
    setSaved(false);
    setShared(false);
    setFlippedCount(0);
    setShowCards(false);
  };

  const handleContextSubmit = () => {
    if (!personName.trim() || !relationshipType) return;
    setShowRitual(true);
  };

  const handleRitualComplete = () => {
    setShowRitual(false);
    const shuffledOracle = [...UNFILTERED_TRUTH_ORACLE].sort(() => Math.random() - 0.5);
    const newOracleCards = oracleCardCount > 0 ? shuffledOracle.slice(0, oracleCardCount) : [];

    const shuffledTarot = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    const newTarotCards = tarotCardCount > 0
      ? shuffledTarot.slice(0, tarotCardCount).map(card => ({ ...card, isReversed: Math.random() > 0.7 }))
      : [];

    setDrawnCards(newTarotCards);
    setOracleCards(newOracleCards);
    setFlippedCount(0);

    if (isChanneled || isMessage) {
      generateReading(newTarotCards, newOracleCards);
    } else {
      setPhase('drawn');
    }
  };

  const drawCards = (cards, oCards) => {
    setDrawnCards(cards);
    setOracleCards(oCards);
    setFlippedCount(0);
    setPhase('drawn');
  };

  const generateReading = async (tarotCards, oracCards) => {
    setPhase('loading');

    const tc = tarotCards || drawnCards;
    const oc = oracCards || oracleCards;

    let cardDescriptions = '';
    if (tc.length > 0) {
      cardDescriptions += `TAROT CARDS:\n` + tc.map((card, i) =>
        `${card.name}${card.isReversed ? ' (Reversed)' : ''} — ${card.isReversed ? card.reversed : card.meaning}`
      ).join('\n');
    }
    if (oc.length > 0) {
      cardDescriptions += `\n\nORACLE CARD:\n` + oc.map(card => `${card.name} — ${card.meaning}`).join('\n');
    }

    const drawnOracleName = oc.length > 0 ? oc[0].name : '';

    const personContext = `Person: "${personName}" | Relationship: "${relationshipType}" | Context: "${additionalContext || 'None'}"`;

    const oracleInstruction = isOracleOnly
      ? `These are Unfiltered Truth Oracle cards. Be direct, warm but blunt. No spiritual bypassing. Call out the real pattern.`
      : '';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${isChanneled || isMessage ? `
YOU ARE ${personName}. You are NOT an AI. You are a real ${relationshipType} with a real heart.
You are speaking directly to the person doing this reading — raw, honest, no performance.

${personContext}

CARDS (use as emotional fuel — do NOT name or explain them, just let their truth move through you):
${cardDescriptions}

HOW TO SPEAK:
- If the energy is heavy: be heavy. Don't soften it.
- If the energy is light: let the warmth through.
- Sound like a real person talking, not a reading.
- No spiritual language, no metaphors about stars or the universe. Just human words.

RULES:
✅ Every sentence: "I", "I'm", "I've", "I want", "I need", "I feel"
✅ Start with "I" — no warm-ups, no "Hey" no "Look"
✅ Vary the length: sometimes 2 blunt sentences, sometimes 5 raw ones
✅ End abruptly — no sign-offs, just stop when the feeling stops
✅ Specific to ${personName} as a ${relationshipType} — if someone else read this, it shouldn't fit them

FORBIDDEN:
❌ "Your peace matters more than my silence" — NEVER, not even close
❌ Any psychic clichés or spiritual bypassing
❌ Generic sentences that could fit anyone
❌ "Hey," / "Look," / "I've been reflecting on our dynamic"

LAST LINE must match:
${relationshipType.includes('Ex') ? `Ex: unresolved, honest. e.g. "I'm staying in my corner for now." / "I still don't know what to say to you."` : relationshipType.includes('Crush') || relationshipType.includes('Dating') ? `Crush/Dating: hopeful, not pushy. e.g. "I hope you feel this too." / "I keep almost saying something."` : relationshipType.includes('Partner') ? `Partner: direct, intimate. e.g. "I need us to actually talk." / "I'm still here, I just need you to meet me halfway."` : `Emotionally honest, specific to ${personName} as a ${relationshipType}.`}

Write ONLY the channeled_message for ${personName}. Raw, real, in first person. No AI commentary or advice.

 ` : `You are a Compassionate Truth-Teller — warm, direct, no judgment.

${personContext}
Spread: "${spread?.name}"
${cardDescriptions}
${oracleInstruction}
`}

RESPONSE FIELDS:
${isChanneled || isMessage ? `
- channeled_message: ${personName} in first person ONLY. Raw, real, human.
- card_readings: Brief insight per card for the seeker (second person). No position labels.
` : `
- opening: 2-3 warm sentences. No generic intros.
- card_readings: Each position interpreted emotionally. 2-3 sentences each.
- synthesis: All cards woven into one narrative.
- closing: One powerful sentence.
`}`,
      response_json_schema: {
        type: "object",
        properties: {
          opening: { type: "string" },
          card_readings: { type: "array", items: { type: "object", properties: { position: { type: "string" }, interpretation: { type: "string" } } } },
          channeled_message: { type: "string" },
          synthesis: { type: "string" },
          closing: { type: "string" },
        }
      }
    });

    setReading(result);
    setPhase('reading');
    setShowCards(false);
    setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleCardFlip = useCallback(() => {
    setFlippedCount(prev => prev + 1);
  }, []);

  const handleSave = async () => {
    if (saved || saving || !reading) return;
    setSaving(true);
    const allCardsSaved = [
      ...drawnCards.map((c, i) => ({ name: c.name, position: spread.positions[i], reversed: c.isReversed, deck: 'tarot' })),
      ...oracleCards.map((c, i) => ({ name: c.name, position: spread.positions[drawnCards.length + i], deck: 'oracle' })),
    ];
    const readingText = isChanneled || isMessage
      ? reading.channeled_message
      : `${reading.opening}\n\n${reading.synthesis}\n\n${reading.closing}`;
    await base44.entities.Reading.create({
      type: 'tarot',
      title: `${spread.name} — ${personName} (${relationshipType})`,
      spread_type: selectedSpread,
      cards_drawn: allCardsSaved,
      reading_text: readingText,
      summary: (isChanneled || isMessage ? reading.channeled_message : reading.opening)?.slice(0, 120),
    });
    setSaving(false);
    setSaved(true);
  };

  const handleShare = async () => {
    if (!reading) return;
    const appUrl = 'https://tarotories.base44.app';
    const text = isChanneled || isMessage
      ? `💕 ${spread.name} — ${personName}\n\n"${reading.channeled_message}"\n\n🔮 ${appUrl}`
      : `💕 ${spread.name}\n\n${reading.opening}\n\n${reading.synthesis}\n\n🔮 ${appUrl}`;
    if (navigator.share) {
      await navigator.share({ title: `${spread.name}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleReset = () => {
    setSelectedSpread(null);
    setSpreadCategory(null);
    setPersonName('');
    setRelationshipType('');
    setAdditionalContext('');
    setPhase('select');
    setDrawnCards([]);
    setOracleCards([]);
    setReading(null);
    setSaved(false);
    setShared(false);
    setFlippedCount(0);
    setShowCards(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <AnimatePresence>
        {showRitual && <RitualOverlay onComplete={handleRitualComplete} />}
      </AnimatePresence>

      <SectionHeader
        icon={Heart}
        title="Love Readings"
        subtitle="Enter a name, set your intention, receive their message."
        color="teal"
      />

      {/* Spread Selection */}
      {phase === 'select' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoveSpreadSelector onSelect={handleSpreadSelect} isPremium={isPremium} />
        </motion.div>
      )}

      {/* Context Input */}
      {phase === 'context' && spread && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="text-center">
              <h2 className="font-heading text-xl font-semibold mb-1">{spread.name}</h2>
              <p className="text-xs text-muted-foreground">{spread.description}</p>
              {isOracleOnly && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-gold/10 border border-gold/20 text-gold">🔥 Unfiltered Truth Oracle</span>
              )}
              {(isChanneled || isMessage) && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-teal/10 border border-teal/20 text-teal">💬 Channeled Message</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Who is this about?</label>
              <input
                type="text"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                placeholder="Their name..."
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Your relationship with them</label>
              <div className="grid grid-cols-2 gap-2">
                {RELATIONSHIP_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setRelationshipType(type)}
                    className={`text-xs rounded-xl px-3 py-2.5 border transition-all duration-200 text-left ${
                      relationshipType === type
                        ? 'bg-primary/20 border-primary text-foreground'
                        : 'bg-secondary/30 border-border/40 text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Anything else? <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <textarea
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                placeholder="e.g. We haven't spoken in 3 weeks..."
                rows={2}
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setPhase('select')} className="flex-1 border-border/50">Back</Button>
              <Button
                onClick={handleContextSubmit}
                disabled={!personName.trim() || !relationshipType}
                className="flex-1 bg-gradient-to-r from-pink to-violet text-white hover:opacity-90 disabled:opacity-40"
              >
                <Heart className="w-4 h-4 mr-2" />
                {isChanneled || isMessage ? 'Open the Channel' : isOracleOnly ? 'Pull Cards' : 'Draw Cards'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading — for channeled: skip straight here after ritual */}
      {phase === 'loading' && (
        <LoadingSpinner message="Reaching through the veil..." />
      )}

      {/* Non-channeled: drawn card phase */}
      {phase === 'drawn' && (
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink/10 border border-pink/20 text-xs text-pink">
              <Heart className="w-3 h-3" />
              {personName} · {relationshipType}
            </span>
          </motion.div>

          {drawnCards.length > 0 && (
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
          )}

          {oracleCards.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {oracleCards.map((card, i) => (
                <OracleCardDisplay
                  key={card.id}
                  card={card}
                  position={spread.positions[drawnCards.length + i]}
                  delay={i * 0.15}
                />
              ))}
            </div>
          )}

          {!allFlipped && !isOracleOnly && (
            <p className="text-center text-xs text-muted-foreground">
              Tap each card to reveal it ({flippedCount}/{drawnCards.length} revealed)
            </p>
          )}

          {allFlipped && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-3">
              <Button
                onClick={() => generateReading(drawnCards, oracleCards)}
                className="bg-gradient-to-r from-pink to-violet text-white hover:opacity-90 gap-2 px-6"
              >
                <Heart className="w-4 h-4" />
                {isOracleOnly ? 'Get The Truth' : 'Get Your Reading'}
              </Button>
              <Button onClick={() => {
                const t = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5).slice(0, tarotCardCount).map(c => ({ ...c, isReversed: Math.random() > 0.7 }));
                const o = [...UNFILTERED_TRUTH_ORACLE].sort(() => Math.random() - 0.5).slice(0, oracleCardCount);
                drawCards(t, o);
              }} variant="outline" className="gap-2 border-border/50">
                <RotateCcw className="w-4 h-4" />
                Reshuffle
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Reading result */}
      {phase === 'reading' && reading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* ── CHANNELED ── */}
          {(isChanneled || isMessage) && (
            <>
              {/* THE MESSAGE */}
              <div ref={messageRef} className="glass-card rounded-2xl border border-teal/30 overflow-hidden">
                <div className="px-6 pt-5 pb-3 border-b border-teal/10">
                  <p className="text-xs text-teal/80 uppercase tracking-widest font-heading">From {personName}</p>
                </div>
                <div className="px-6 py-6">
                  <p className="text-base text-foreground leading-loose italic">"{reading.channeled_message}"</p>
                </div>
              </div>

              {/* LISTEN */}
              <div className="flex justify-center">
                <ListenButton text={reading.channeled_message} isPremium={isPremium} />
              </div>

              {/* VIEW THE CARDS */}
              <div>
                <button
                  onClick={() => setShowCards(v => !v)}
                  className="w-full text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors py-3 flex items-center justify-center gap-2"
                >
                  {showCards ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showCards ? 'hide the cards' : 'see the cards that came through'}
                </button>
                <AnimatePresence>
                  {showCards && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-4">
                        {drawnCards.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-6">
                            {drawnCards.map((card, i) => (
                              <TarotCard
                                key={`reveal-${card.id}`}
                                card={card}
                                position={spread.positions[i]}
                                delay={i * 0.1}
                                onFlip={() => {}}
                              />
                            ))}
                          </div>
                        )}
                        {oracleCards.map((card, i) => (
                          <motion.div
                            key={`oracle-reveal-${card.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-2xl p-4 border border-gold/20 max-w-xs mx-auto text-center"
                          >
                            <h3 className="font-heading text-base font-bold text-gold">{card.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.meaning.slice(0, 180)}...</p>
                          </motion.div>
                        ))}
                        {reading.card_readings?.length > 0 && (
                          <div className="space-y-2">
                            {reading.card_readings.map((cr, i) => (
                              <div key={i} className="px-4 py-3 rounded-xl bg-secondary/20 border border-border/20">
                                <p className="text-xs text-muted-foreground leading-relaxed">{cr.interpretation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </>
          )}

          {/* ── STANDARD / ORACLE ── */}
          {!isChanneled && !isMessage && (
            <>
              <div ref={messageRef}>
                {reading.opening && (
                  <div className="glass-card rounded-2xl p-6 mb-4">
                    <p className="text-foreground italic text-center leading-relaxed">{reading.opening}</p>
                  </div>
                )}
              </div>
              {reading.card_readings?.length > 0 && (
                <div className="space-y-3">
                  {reading.card_readings.map((cr, i) => (
                    <div key={i} className="glass-card rounded-xl p-4 border border-border/30">
                      <h4 className="font-heading text-sm font-semibold text-pink mb-1">{cr.position}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cr.interpretation}</p>
                    </div>
                  ))}
                </div>
              )}
              {reading.synthesis && (
                <div className="glass-card rounded-2xl border border-pink/20 p-5 bg-pink/5">
                  <p className="text-sm text-foreground leading-relaxed italic">{reading.synthesis}</p>
                </div>
              )}
              {reading.closing && (
                <p className="text-center text-sm text-gold italic px-2">{reading.closing}</p>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saved || saving} variant="outline" className={`gap-2 border-border/50 ${saved ? 'text-teal border-teal/40' : ''}`}>
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saved ? 'Kept!' : 'Keep This'}
            </Button>
            <Button onClick={handleShare} variant="outline" className={`gap-2 border-border/50 ${shared ? 'text-teal border-teal/40' : ''}`}>
              {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Copied!' : 'Share'}
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50">
              <RotateCcw className="w-4 h-4" />
              New Reading
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}