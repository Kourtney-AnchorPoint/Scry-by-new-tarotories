import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, Save, Share2, Check, ChevronDown, ChevronUp, Crown, Eye, Music, ImageDown } from 'lucide-react';
import { createMessageImage } from '@/lib/messageImage';
import { SmartSelect, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import FollowUpQuestion from '@/components/downloads/FollowUpQuestion';
import ReadingDisclaimer from '@/components/shared/ReadingDisclaimer';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { trackEvent } from '@/lib/analytics';
import RitualOverlay from '@/components/tarot/RitualOverlay';
import ListenButton from '@/components/shared/ListenButton';
import PremiumPaywall from '@/components/shared/PremiumPaywall';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UNFILTERED_TRUTH_ORACLE } from '@/lib/tarotData';

// Free = Partner, Crush, Ex only (1/day). Premium sources gated.
const FREE_RELATIONSHIP_TYPES = [
  "Romantic Partner", "Ex / Former Partner", "Situationship", "Someone I'm Dating",
  "Crush / New Connection", "Family Member", "Close Friend", "Estranged Person",
  "Twin Flame / Soulmate", "Coworker", "Best Friend", "Neighbor", "New Person",
  "Mentor / Teacher", "Boss", "Other",
];
const PREMIUM_RELATIONSHIP_TYPES = [
  { label: "My Higher Self", premium: true },
  { label: "My Spirit Guides", premium: true },
];

// All subjects free — generous freemium
const FREE_SUBJECTS = [
  "General", "Love & Feelings", "What Happened Between Us", "Where We Stand",
  "Should I Reach Out", "Closure", "Career & Life Path", "What They Really Think of Me",
  "What They Need Right Now", "Future Potential",
];
const PREMIUM_SUBJECTS = [];

const FREE_DAILY_LIMIT = 3;

const DAILY_KEY = () => `channel_daily_${new Date().toISOString().split('T')[0]}`;

function getDailyCount() {
  try { return parseInt(localStorage.getItem(DAILY_KEY()) || '0', 10); } catch { return 0; }
}
function incrementDailyCount() {
  try { localStorage.setItem(DAILY_KEY(), (getDailyCount() + 1).toString()); } catch {}
}

function normalizeChanneledPayload(result) {
  let payload = result?.response ?? result;

  // Providers sometimes return the requested JSON as text or a fenced code
  // block. Parse it before rendering so the user sees prose, not source code.
  if (typeof payload === 'string') {
    const cleaned = payload.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    try {
      payload = JSON.parse(cleaned);
    } catch {
      return { message: cleaned, visual_omens: [], song_sign: '' };
    }
  }

  if (typeof payload?.message === 'string') {
    const nested = payload.message.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    if (nested.startsWith('{')) {
      try {
        payload = { ...payload, ...JSON.parse(nested) };
      } catch {
        // Keep ordinary prose unchanged.
      }
    }
  }

  return {
    message: typeof payload?.message === 'string' ? payload.message : '',
    visual_omens: Array.isArray(payload?.visual_omens) ? payload.visual_omens : [],
    song_sign: typeof payload?.song_sign === 'string' ? payload.song_sign : '',
  };
}

export default function Downloads() {
  const { isPremium } = useUserProfile();
  const [phase, setPhase] = useState('input');
  const [personName, setPersonName] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [subject, setSubject] = useState('');
  const [showRitual, setShowRitual] = useState(false);
  const [message, setMessage] = useState('');
  const [sourceCard, setSourceCard] = useState(null);
  const [showSource, setShowSource] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallMsg, setPaywallMsg] = useState('');
  const messageRef = useRef(null);

  const [customRelationship, setCustomRelationship] = useState('');
  const [selectedRelationshipOption, setSelectedRelationshipOption] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [selectedSubjectOption, setSelectedSubjectOption] = useState('');
  const [visualOmens, setVisualOmens] = useState([]);
  const [songSign, setSongSign] = useState('');

  const isHigherSelf = relationshipType === 'My Higher Self';
  const isSpiritGuides = relationshipType === 'My Spirit Guides';
  const isPremiumSource = isHigherSelf || isSpiritGuides;
  const isPremiumSubject = PREMIUM_SUBJECTS.includes(subject);
  const isDailyLimitType = !isPremiumSource;

  const canSubmit = personName.trim() && relationshipType && subject;

  const openPaywall = (msg) => { setPaywallMsg(msg); setPaywallOpen(true); };

  const handleRelationshipSelect = (value) => {
    const isPremiumType = PREMIUM_RELATIONSHIP_TYPES.some(p => p.label === value);
    if (isPremiumType && !isPremium) {
      openPaywall("Higher Self & Spirit Guides are Premium-only channels. These are the deepest, most sacred messages.");
      return;
    }
    setSelectedRelationshipOption(value);
    if (value === 'Other') {
      setRelationshipType('');
    } else {
      setRelationshipType(value);
      setCustomRelationship('');
    }
  };

  const handleSubjectSelect = (value) => {
    setSelectedSubjectOption(value);
    if (value === 'Other / Custom') {
      setSubject('');
      setCustomSubject('');
    } else {
      setSubject(value);
      setCustomSubject('');
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Check daily limit for free users on applicable types
    if (!isPremium && isDailyLimitType) {
      if (getDailyCount() >= FREE_DAILY_LIMIT) {
        openPaywall("You've used today's 3 free channeled messages. Upgrade to Premium for unlimited messages, signs, songs, and follow-up questions.");
        return;
      }
    }

    setShowRitual(true);
  };

  const handleRitualComplete = () => {
    setShowRitual(false);
    if (!isPremium && isDailyLimitType) incrementDailyCount();
    const card = UNFILTERED_TRUTH_ORACLE[Math.floor(Math.random() * UNFILTERED_TRUTH_ORACLE.length)];
    setSourceCard(card);
    generateMessage(card);
  };

  const generateMessage = async (card) => {
    setPhase('loading');

    const isSpiritual = isHigherSelf || isSpiritGuides;

    const toneGuide = isHigherSelf
      ? 'Speak as the person\'s deepest, wisest inner voice — the part that already knows the answer. Warm, grounded, clear. Not mystical or floaty. End with something actionable and empowering.'
      : isSpiritGuides
      ? 'Speak as a collective of loving, unseen guides who have been watching over this person. Gentle but direct. No vague platitudes — give them something real and specific to hold onto.'
      : relationshipType.includes('Ex')
      ? 'End unresolved and honest. e.g. "I still don\'t know what to say to you." / "I\'m staying in my corner for now."'
      : relationshipType.includes('Crush') || relationshipType.includes('Dating')
      ? 'End hopeful but not pushy. e.g. "I hope you feel this too." / "I keep almost saying something."'
      : relationshipType.includes('Partner')
      ? 'End direct and intimate. e.g. "I need us to actually talk." / "I\'m still here, I just need you to meet me halfway."'
      : 'End emotionally honest and specific.';

    const spiritualPrompt = isSpiritual ? `YOU ARE ${personName}'s ${relationshipType}.
${isHigherSelf
  ? `You are the deepest, truest part of them — the version of them that isn't afraid, isn't confused, and already knows the way forward. You are not external. You are them, at their most clear.`
  : `You are a collective of loving guides who have been with them since before they were born. You see the full picture — not just this moment, but the arc of their soul's journey.`}
Subject they are asking about: "${subject}"
Energetic frequency shaping this message (do NOT name this): ${card.name} — ${card.meaning.slice(0, 200)}

WRITE 4-6 SENTENCES IN FIRST PERSON ("I" — speaking as ${relationshipType}).

RULES:
✅ Start with "I" — no warm-ups
✅ Be specific to this person's question about "${subject}"
✅ ${toneGuide}
✅ Speak with love but without sugarcoating — say the thing they need to hear
✅ Sound like a real voice, not a generic spiritual reading

FORBIDDEN:
❌ Vague platitudes like "trust the journey" or "you are loved"
❌ Generic advice that could apply to anyone
❌ Sign-offs, closings, titles

Now write the message from ${personName}'s ${relationshipType} about: ${subject}` : `YOU ARE ${personName}. A real ${relationshipType}. You are NOT an AI.
You are sending a raw, honest voice note directly to the person reading this.
Subject they are asking about: "${subject}"
Energy frequency shaping your tone (do NOT name this, just let it move through you): ${card.name} — ${card.meaning.slice(0, 200)}

WRITE 4-6 SENTENCES IN FIRST PERSON ONLY.

RULES:
✅ Start with "I" — no warm-ups
✅ Every sentence uses I / I'm / I've / I feel / I need / I want
✅ Sound like a real person, not a reading
✅ Be specific to ${personName} as a ${relationshipType} on the subject of "${subject}"
✅ ${toneGuide}

ABSOLUTELY FORBIDDEN:
❌ "Your peace matters more than my silence" — NEVER, ever
❌ Any variation of that phrase
❌ Psychic clichés, spiritual language, cosmic metaphors
❌ Generic sentences that could fit anyone
❌ Sign-offs, closings, "With love", "Sincerely"

EXAMPLE TONE (Ex, subject = closure):
"I keep starting to write this and then deleting it because I don't know how to say what I actually feel. I'm not over what happened. I've been telling myself I am, but I'm not. I don't know if I'm ready to talk yet. I just need you to know I haven't stopped thinking about it."

Now write the message for ${personName} (${relationshipType}) about: ${subject}`;

    const fullPrompt = spiritualPrompt + `\n\nAlso generate:
- visual_omens: 2-3 SIMPLE, COMMON everyday signs to watch for today as cosmic confirmation. Each must be something anyone, anywhere, could realistically encounter in a normal day — e.g. "a feather on the ground", "the number 3 anywhere", "a butterfly or bird crossing your path", "someone wearing red", "hearing an old song you love". NEVER hyper-specific scenarios with exact times, exact places, or multi-part conditions — the whole point is that they're EASY to actually confirm.
- song_sign: One REAL, well-known song (title + artist) whose energy or lyrics would confirm this message if heard today. Match the emotional tone precisely.

CRITICAL JSON FORMAT RULES:
- "message": This field must contain the ACTUAL channeled message you wrote above — the full 4-6 sentences in first person as ${isHigherSelf || isSpiritGuides ? relationshipType : personName}. Do NOT summarize it. Do NOT describe what you did. Do NOT add commentary like "Here is the message" or "This message conveys...". Put the raw, in-character message word for word.
- "visual_omens": Array of 2-3 specific signs.
- "song_sign": One song title + artist string.
The "message" field IS the product. Everything else is supplementary.`;

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            visual_omens: { type: "array", items: { type: "string" } },
            song_sign: { type: "string" }
          },
          required: ["message"]
        }
      });
    } catch (err) {
      console.error('Channeling InvokeLLM error:', err?.message || err);
      setPhase('error');
      return;
    }

    const payload = normalizeChanneledPayload(result);

    const msg = payload?.message || '';
    if (!msg) {
      setPhase('error');
      return;
    }
    setMessage(msg);
    setVisualOmens(payload?.visual_omens || []);
    setSongSign(payload?.song_sign || '');
    setPhase('result');
    trackEvent('download_completed', {
      relationship_type: relationshipType,
      subject,
      is_premium: isPremium,
      is_spiritual: isHigherSelf || isSpiritGuides,
    });
    setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleSave = async () => {
    if (saved || saving || !message) return;
    setSaving(true);
    await base44.entities.Reading.create({
      type: 'oracle',
      title: `Channeled Message: ${personName} — ${subject}`,
      spread_type: 'intuitive_download',
      cards_drawn: [{ name: sourceCard?.name, deck: 'oracle' }],
      reading_text: message,
      summary: message.slice(0, 120),
    });
    setSaving(false);
    setSaved(true);
  };

  const buildImageBlob = () => createMessageImage({
    from: isPremiumSource ? relationshipType : personName,
    subject,
    message,
    songSign,
  });

  const handleSaveImage = async () => {
    if (!message || imgBusy) return;
    setImgBusy(true);
    try {
      const blob = await buildImageBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `channeled-message-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // canvas unavailable — nothing to save
    }
    setImgBusy(false);
  };

  const handleShare = async () => {
    if (!message) return;
    try {
      // Prefer sharing the image card itself (mobile)
      const blob = await buildImageBlob();
      const file = new File([blob], 'channeled-message.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'A Channeled Message' });
        return;
      }
      const text = `🕯️ A Channeled Message from ${personName}\n\n"${message}"\n\n🔮 Cosmic Encounters`;
      if (navigator.share) {
        await navigator.share({ title: `Message from ${personName}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user cancelled the share sheet — not an error
    }
  };

  const handleReset = () => {
    setPhase('input');
    setPersonName('');
    setRelationshipType('');
    setSelectedRelationshipOption('');
    setCustomRelationship('');
    setSubject('');
    setSelectedSubjectOption('');
    setCustomSubject('');
    setMessage('');
    setSourceCard(null);
    setShowSource(false);
    setSaved(false);
    setShared(false);
    setVisualOmens([]);
    setSongSign('');
  };

  const dailyCount = getDailyCount();
  const dailyLimitReached = !isPremium && dailyCount >= FREE_DAILY_LIMIT;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <AnimatePresence>
        {showRitual && <RitualOverlay onComplete={handleRitualComplete} />}
      </AnimatePresence>

      <PremiumPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title="Get Unlimited Channeled Messages"
        description={paywallMsg}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-4 text-teal">
          <Zap className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">Channeled Messages</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          Pure channeling. No cards, no analysis.<br />Their voice — or yours — direct to you.
        </p>
        {/* Daily limit indicator */}
        {!isPremium && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/50 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-teal" />
            {dailyLimitReached ? (
              <span className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-gold">All 3 free messages used today.</span>
                <button onClick={() => openPaywall("Upgrade for unlimited channeled messages.")} className="underline text-gold/80 hover:text-gold text-xs">Upgrade</button>
              </span>
            ) : (
              <span>{FREE_DAILY_LIMIT - dailyCount} free {FREE_DAILY_LIMIT - dailyCount === 1 ? 'message' : 'messages'} remaining today</span>
            )}
          </div>
        )}
      </motion.div>

      {/* INPUT PHASE */}
      {phase === 'input' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="glass-card rounded-2xl p-6 space-y-5">

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Who is speaking?</label>
              <input
                type="text"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                placeholder="Their name (or 'My Higher Self')..."
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Relationship types */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Your relationship</label>
              <SmartSelect value={selectedRelationshipOption} onValueChange={handleRelationshipSelect}>
                <SelectTrigger className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm h-auto min-h-[44px]">
                  <SelectValue placeholder="Select relationship type..." />
                </SelectTrigger>
                <SelectContent>
                  {FREE_RELATIONSHIP_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  {PREMIUM_RELATIONSHIP_TYPES.map(({ label }) => (
                    <SelectItem key={label} value={label}>{label}{!isPremium ? ' 👑' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </SmartSelect>
              {selectedRelationshipOption === 'Other' && (
                <input
                  type="text"
                  value={customRelationship}
                  onChange={e => {
                    setCustomRelationship(e.target.value);
                    setRelationshipType(e.target.value);
                  }}
                  placeholder="Describe the relationship (e.g. old friend, neighbor, therapist...)"
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              )}
            </div>

            {/* Subjects */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">What do you need to hear about?</label>
              <SmartSelect value={selectedSubjectOption} onValueChange={handleSubjectSelect}>
                <SelectTrigger className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm h-auto min-h-[44px]">
                  <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {FREE_SUBJECTS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                  <SelectItem value="Other / Custom">Something else (type it in)</SelectItem>
                </SelectContent>
              </SmartSelect>
              {selectedSubjectOption === 'Other / Custom' && (
                <textarea
                  value={customSubject}
                  onChange={e => {
                    setCustomSubject(e.target.value);
                    setSubject(e.target.value);
                  }}
                  placeholder="What do you need to hear about? Be as specific as you want..."
                  rows={3}
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-teal/50 transition-colors resize-none"
                />
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-gradient-to-r from-teal to-violet text-white hover:opacity-90 disabled:opacity-40 py-6 text-base gap-2 rounded-xl select-none min-h-[44px]"
            >
              <Zap className="w-5 h-5" />
              Open the Channel
            </Button>
          </div>
        </motion.div>
      )}

      {/* LOADING */}
      {phase === 'loading' && (
        <LoadingSpinner message="Reaching through the veil..." />
      )}

      {/* ERROR */}
      {phase === 'error' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">The signal didn't come through clearly. The veil was thick — try again.</p>
          <Button onClick={() => generateMessage(sourceCard)} variant="outline" className="gap-2 border-border/50">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </motion.div>
      )}

      {/* RESULT */}
      {phase === 'result' && message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div ref={messageRef} className="glass-card rounded-2xl border border-teal/30 overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-teal/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-teal/80 uppercase tracking-widest font-heading">
                  {isHigherSelf || isSpiritGuides ? relationshipType : `From ${personName}`}
                </p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">re: {subject}</p>
              </div>
              {!isHigherSelf && !isSpiritGuides && (
                <span className="text-xs text-muted-foreground/40 font-heading">{relationshipType}</span>
              )}
            </div>
            <div className="px-6 py-7">
              <p className="text-base text-foreground leading-loose italic">"{message}"</p>
            </div>
          </div>

          {/* Signs to Watch For */}
          {isPremium && (visualOmens.length > 0 || songSign) && (
            <div className="border border-teal/20 rounded-2xl p-5 bg-teal/5 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-teal" />
                <p className="text-xs text-teal uppercase tracking-widest font-heading">Signs to Watch For</p>
              </div>
              <p className="text-xs text-muted-foreground/60 mb-2">If you encounter these today, the message is confirmed.</p>
              {visualOmens.map((omen, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-teal text-sm mt-0.5">◆</span>
                  <p className="text-sm text-foreground">{omen}</p>
                </div>
              ))}
              {songSign && (
                <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/40 border border-border/30">
                  <Music className="w-4 h-4 text-violet flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground text-xs mr-1">Song:</span>{songSign}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Listen button — premium only */}
          <div className="flex justify-center">
            {isPremium ? (
              <ListenButton text={message} isPremium={isPremium} />
            ) : (
              <button
                onClick={() => openPaywall("Audio playback is a Premium luxury. Hear the message in a warm voice — upgrade to unlock 🎧")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/30 bg-gold/5 text-gold/80 text-xs hover:border-gold/60 transition-colors"
              >
                🎧 Listen <Crown className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleSave} disabled={saved || saving} variant="outline" className={`gap-2 border-border/50 ${saved ? 'text-teal border-teal/40' : ''}`}>
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saved ? 'Kept!' : 'Keep This'}
            </Button>
            <Button onClick={handleSaveImage} disabled={imgBusy} variant="outline" className="gap-2 border-border/50">
              <ImageDown className="w-4 h-4" />
              {imgBusy ? 'Creating...' : 'Save Image'}
            </Button>
            <Button onClick={handleShare} variant="outline" className={`gap-2 border-border/50 ${shared ? 'text-teal border-teal/40' : ''}`}>
              {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Copied!' : 'Share'}
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50">
              <RotateCcw className="w-4 h-4" />
              New Message
            </Button>
          </div>

          {/* Soft premium nudge after last free message */}
          {!isPremium && dailyLimitReached && (
            <div className="glass-card rounded-2xl p-5 border border-gold/30 text-center space-y-3">
              <p className="text-sm text-foreground">🕯️ That was your last free message today — but the channel stays open all night for Premium members.</p>
              <Button
                onClick={() => openPaywall("Unlimited channeled messages, anytime the veil calls you. Plus Higher Self & Spirit Guide channels.")}
                className="bg-gradient-to-r from-gold to-violet text-white hover:opacity-90 gap-2"
              >
                <Crown className="w-4 h-4" />
                Keep the Channel Open
              </Button>
            </div>
          )}

          {/* One Follow-Up Question — Premium keeps the channel open */}
          {message && isPremium && (
            <FollowUpQuestion
              originalMessage={message}
              personName={personName}
              relationshipType={relationshipType}
              subject={subject}
              sourceCardName={sourceCard?.name}
            />
          )}

          {message && !isPremium && (
            <button
              onClick={() => openPaywall("Premium unlocks signs, the matching song, a follow-up question, audio playback, and unlimited channeled messages.")}
              className="w-full glass-card rounded-2xl p-5 border border-gold/30 text-center hover:border-gold/60 transition-colors"
            >
              <Crown className="w-5 h-5 text-gold mx-auto mb-2" />
              <span className="block text-sm text-foreground">Unlock the rest of this channel</span>
              <span className="block text-xs text-muted-foreground mt-1">Signs, song, follow-up question, audio, and unlimited messages</span>
            </button>
          )}

          {sourceCard && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowSource(v => !v)}
                className="text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors flex items-center gap-1.5 mx-auto"
              >
                {showSource ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                View the source frequency
              </button>
              <AnimatePresence>
                {showSource && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-muted-foreground/50 mt-2 italic"
                  >
                    {sourceCard.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
          <ReadingDisclaimer />
        </motion.div>
      )}
    </div>
  );
}
