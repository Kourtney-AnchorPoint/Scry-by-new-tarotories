import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, ArrowRight, Save, Check, Crown, Lock } from 'lucide-react';
import ListenButton from '@/components/shared/ListenButton';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SectionHeader from '@/components/shared/SectionHeader';
import GlassCard from '@/components/shared/GlassCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PremiumPaywall from '@/components/shared/PremiumPaywall';
import { useUserProfile } from '@/hooks/useUserProfile';
import { calculateLifePathNumber, calculateDailyNumber, calculateExpressionNumber, calculateSoulUrgeNumber, calculatePersonalityNumber, calculateBirthdayNumber, LIFE_PATH_MEANINGS } from '@/lib/numerologyUtils';
import NumberCard from '@/components/numerology/NumberCard';
import { trackEvent } from '@/lib/analytics';

function calculatePersonalYear(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = 2026;
  const digits = `${month}${day}${year}`.split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export default function Numerology() {
  const { profile, saveOrUpdate, isPremium } = useUserProfile();
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [results, setResults] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [personalYearInsight, setPersonalYearInsight] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    if (profile?.birth_date) setBirthDate(profile.birth_date);
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile]);

  const dailyNumber = calculateDailyNumber();

  const handleCalculate = async () => {
    setSaved(false);
    const lifePathNum = calculateLifePathNumber(birthDate);
    const expressionNum = calculateExpressionNumber(fullName);
    const soulUrgeNum = calculateSoulUrgeNumber(fullName);
    const personalityNum = calculatePersonalityNumber(fullName);
    const birthdayNum = calculateBirthdayNumber(birthDate);

    setResults({
      lifePath: lifePathNum,
      expression: expressionNum,
      soulUrge: soulUrgeNum,
      personality: personalityNum,
      birthday: birthdayNum,
      daily: dailyNumber,
      lifePathMeaning: LIFE_PATH_MEANINGS[lifePathNum],
      expressionMeaning: LIFE_PATH_MEANINGS[expressionNum],
    });

    await saveOrUpdate({ birth_date: birthDate, full_name: fullName, life_path_number: lifePathNum });
    trackEvent('numerology_calculated', { life_path: lifePathNum, is_premium: isPremium });

    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Compassionate Truth-Teller numerologist who speaks from lived experience. You've studied these numbers not just academically but through your own life's journey. Share that warmth and relatability — phrases like "I've seen this Life Path number show up in people who..." or "I remember when someone with your same numbers realized..." make the wisdom land in the heart, not just the head.

Voice: Direct but warm. Second person ("You"). Always connect numbers to real growth and self-love. End with a closing message that reminds them: you are doing the best you can with what you have.

Provide a personalized reading for:
- Life Path Number: ${lifePathNum} (${LIFE_PATH_MEANINGS[lifePathNum]?.title})
- Expression Number: ${expressionNum || 'unknown'}
- Soul Urge Number (what their heart secretly craves): ${soulUrgeNum || 'unknown'}
- Personality Number (the mask they show the world): ${personalityNum || 'unknown'}
- Birthday Number (their special gift): ${birthdayNum || 'unknown'}
- Today's Daily Number: ${dailyNumber}

Provide:
1. How their core numbers interact — especially any tension between their Soul Urge (what they secretly want) and their Personality (what they show the world). What gifts they're carrying AND where they tend to get in their own way (3-4 sentences, specific and kind)
2. What today's daily number means for their self-care and growth today — one concrete thing it's inviting them to do for themselves (2-3 sentences)
3. A warm, empowering guidance message for today — sounds like a friend who knows their potential and isn't letting them settle for less`,
      response_json_schema: {
        type: "object",
        properties: {
          number_interaction: { type: "string" },
          daily_guidance: { type: "string" },
          message: { type: "string" },
        }
      }
    });

    setAiInsight(result);
    setLoading(false);
  };

  const handleGetForecast = async () => {
    if (!isPremium) { setPaywallOpen(true); return; }
    if (!birthDate) return;
    const pyNum = calculatePersonalYear(birthDate);
    setLoadingForecast(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a warm, direct numerology guide. 
Personal Year Number for 2026: ${pyNum}
Life Path: ${results?.lifePath || 'unknown'}
Give a 2026 Personal Year Forecast: 
- What major theme governs this year for them
- Key months to watch (pick 3)
- What to let go of entering 2026
- What to call in / build in 2026
- One powerful sentence to carry through the year
Keep it specific, warm, real — not vague platitudes.`,
      response_json_schema: {
        type: "object",
        properties: {
          personal_year: { type: "number" },
          theme: { type: "string" },
          key_months: { type: "string" },
          release: { type: "string" },
          build: { type: "string" },
          power_sentence: { type: "string" },
        }
      }
    });
    setPersonalYearInsight({ ...result, personal_year: pyNum });
    setLoadingForecast(false);
    trackEvent('personal_year_forecast_viewed', { personal_year: pyNum });
  };

  const handleSave = async () => {
    if (saved || saving || !aiInsight || !results) return;
    setSaving(true);
    await base44.entities.Reading.create({
      type: 'numerology',
      title: `Life Path ${results.lifePath} Reading`,
      reading_text: `${aiInsight.number_interaction}\n\n${aiInsight.daily_guidance}\n\n${aiInsight.message}`,
      summary: aiInsight.message?.slice(0, 120),
    });
    setSaving(false);
    setSaved(true);
    trackEvent('reading_saved', { type: 'numerology', life_path: results.lifePath });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PremiumPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title="2026 Personal Year Forecast 👑"
        description="Your full year-by-year numerology forecast is a Premium feature. See what 2026 has in store."
      />
      <SectionHeader
        icon={Hash}
        title="Numerology"
        subtitle="Discover the hidden meaning in your numbers and unlock cosmic patterns"
        color="violet"
      />

      {/* Daily Number Display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 text-center mb-8 glow-violet"
      >
        <p className="text-xs text-muted-foreground mb-2">Today's Universal Number</p>
        <span className="text-5xl font-heading font-bold text-violet">{dailyNumber}</span>
        <p className="text-sm text-muted-foreground mt-3">
          {LIFE_PATH_MEANINGS[dailyNumber]?.description?.slice(0, 80)}...
        </p>
      </motion.div>

      {/* Input Form */}
      <GlassCard className="mb-8">
        <h3 className="font-heading text-lg font-semibold mb-4">Calculate Your Numbers</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Full Birth Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full birth name"
              className="bg-background/50 border-border/50 mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Date of Birth</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-background/50 border-border/50 mt-1"
            />
          </div>
          <Button
            onClick={handleCalculate}
            disabled={!birthDate}
            className="w-full bg-gradient-to-r from-violet to-violet-dark text-white hover:opacity-90 gap-2"
          >
            Calculate My Numbers
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </GlassCard>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Number Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-6 text-center border border-violet/30">
              <p className="text-xs text-muted-foreground mb-2">Life Path Number</p>
              <span className="text-4xl font-heading font-bold text-violet">{results.lifePath}</span>
              <h4 className="font-heading text-sm font-semibold mt-2">{results.lifePathMeaning?.title}</h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{results.lifePathMeaning?.description}</p>
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-xs"><span className="text-teal">Strengths:</span> {results.lifePathMeaning?.strengths}</p>
                <p className="text-xs mt-1"><span className="text-gold">Challenges:</span> {results.lifePathMeaning?.challenges}</p>
              </div>
            </div>

            {results.expression && (
              <div className="glass-card rounded-2xl p-6 text-center border border-teal/30">
                <p className="text-xs text-muted-foreground mb-2">Expression Number</p>
                <span className="text-4xl font-heading font-bold text-teal">{results.expression}</span>
                <h4 className="font-heading text-sm font-semibold mt-2">{results.expressionMeaning?.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{results.expressionMeaning?.description}</p>
              </div>
            )}
          </div>

          {/* Deeper numbers */}
          {(results.soulUrge || results.personality || results.birthday) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {results.soulUrge && (
                <NumberCard
                  label="Soul Urge"
                  number={results.soulUrge}
                  meaning={LIFE_PATH_MEANINGS[results.soulUrge]}
                  color="pink"
                  hint="What your heart secretly craves beneath everything"
                />
              )}
              {results.personality && (
                <NumberCard
                  label="Personality"
                  number={results.personality}
                  meaning={LIFE_PATH_MEANINGS[results.personality]}
                  color="gold"
                  hint="The mask you show the world before they know you"
                />
              )}
              {results.birthday && (
                <NumberCard
                  label="Birthday Number"
                  number={results.birthday}
                  meaning={LIFE_PATH_MEANINGS[results.birthday]}
                  color="teal"
                  hint="A special gift you carried in with you"
                />
              )}
            </div>
          )}

          {/* AI Insight */}
          {loading ? (
            <LoadingSpinner message="Decoding your numerical blueprint..." />
          ) : aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-heading text-sm font-semibold text-violet">Your Personalized Insight</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight.number_interaction}</p>
              <div className="border-t border-border/30 pt-4">
                <h4 className="font-heading text-xs font-semibold text-teal mb-1">Today's Guidance</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight.daily_guidance}</p>
              </div>
              <div className="bg-violet/10 rounded-xl p-4 text-center border border-violet/20">
                <p className="text-sm text-foreground italic">"{aiInsight.message}"</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <ListenButton
                  text={`${aiInsight.number_interaction} ${aiInsight.daily_guidance} ${aiInsight.message}`}
                  isPremium={isPremium}
                />
                <Button
                  onClick={handleSave}
                  disabled={saved || saving}
                  variant="outline"
                  className={`gap-2 border-border/50 ${saved ? 'text-teal border-teal/40' : ''}`}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : saved ? 'Saved to Journal!' : 'Save Reading'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* 2026 Personal Year Forecast */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-gold/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-heading text-sm font-semibold text-gold">2026 Personal Year Forecast</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your numerology blueprint for the year ahead</p>
              </div>
              {!isPremium && <Crown className="w-5 h-5 text-gold" />}
            </div>
            {personalYearInsight ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-heading font-bold text-gold">{personalYearInsight.personal_year}</span>
                  <span className="text-xs text-muted-foreground">Personal Year</span>
                </div>
                <p className="text-sm text-foreground font-medium">{personalYearInsight.theme}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="text-teal font-medium">Key months:</span> {personalYearInsight.key_months}</p>
                  <p><span className="text-destructive/70 font-medium">Release:</span> {personalYearInsight.release}</p>
                  <p><span className="text-violet-light font-medium">Build:</span> {personalYearInsight.build}</p>
                </div>
                <div className="bg-gold/10 rounded-xl p-3 border border-gold/20 text-center">
                  <p className="text-sm text-gold italic">"{personalYearInsight.power_sentence}"</p>
                </div>
              </div>
            ) : loadingForecast ? (
              <LoadingSpinner message="Mapping your 2026 blueprint..." />
            ) : (
              <Button
                onClick={handleGetForecast}
                className={`w-full mt-2 gap-2 ${isPremium ? 'bg-gradient-to-r from-gold to-violet text-white hover:opacity-90' : 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20'}`}
                disabled={!results}
              >
                {!isPremium && <Lock className="w-4 h-4" />}
                {isPremium ? 'Reveal My 2026 Forecast' : <>Unlock 2026 Forecast <Crown className="w-4 h-4" /></>}
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}