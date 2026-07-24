import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Check, RotateCcw, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/shared/SectionHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ZODIAC_SIGNS } from '@/lib/tarotData';

function ZodiacPicker({ label, selected, onSelect, exclude }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {ZODIAC_SIGNS.map(z => (
          <button
            key={z.sign}
            onClick={() => onSelect(z.sign)}
            disabled={z.sign === exclude}
            className={`rounded-xl p-2.5 text-center transition-all border text-xs ${
              selected === z.sign
                ? 'bg-primary/20 border-primary/60 glow-violet'
                : z.sign === exclude
                ? 'opacity-20 cursor-not-allowed glass-card border-border/20'
                : 'glass-card border-border/30 hover:border-primary/40'
            }`}
          >
            <span className="text-lg block mb-0.5">{z.symbol}</span>
            <p className="capitalize font-medium text-[10px] leading-none">{z.sign}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Compatibility() {
  const [signA, setSignA] = useState(null);
  const [signB, setSignB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  const signDataA = ZODIAC_SIGNS.find(z => z.sign === signA);
  const signDataB = ZODIAC_SIGNS.find(z => z.sign === signB);

  const handleRead = async () => {
    if (!signA || !signB) return;
    setLoading(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Compassionate Truth-Teller astrologer. Speak directly, warmly, and honestly — like a wise friend who's seen it all.

Generate a cosmic compatibility reading for ${signA} and ${signB}.

Be honest about the real tensions and friction points, but always frame them as growth opportunities. Don't sugarcoat, but don't catastrophize either. End on genuine hope.

Include:
1. overall_vibe: 2-3 sentences on the general energy and feel of this pairing. What's the magnetic pull?
2. score: A compatibility score from 1-100 (integer). Be honest — not everything is a 90.
3. strengths: 2-3 specific things this pairing does really well together.
4. challenges: 2-3 honest friction points or recurring tensions they'll face.
5. growth_areas: 2-3 specific ways this relationship can help both people evolve if they lean in.
6. advice: One direct, warm paragraph of honest advice for making this pairing work. Real talk.
7. vibe_tag: A short 2-4 word label for this pairing (e.g. "Magnetic but volatile", "Slow burn soulmates", "Friendly power struggle")`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_vibe: { type: "string" },
          score: { type: "number" },
          vibe_tag: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          challenges: { type: "array", items: { type: "string" } },
          growth_areas: { type: "array", items: { type: "string" } },
          advice: { type: "string" },
        }
      }
    });

    setResult(res);
    setLoading(false);
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `💫 ${signDataA?.symbol} ${signA} + ${signDataB?.symbol} ${signB} Compatibility\n\n"${result.overall_vibe}"\n\nScore: ${result.score}/100 — ${result.vibe_tag}\n\n🔮 https://tarotories.base44.app`;
    if (navigator.share) {
      await navigator.share({ title: 'Cosmic Compatibility', text });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleReset = () => {
    setSignA(null);
    setSignB(null);
    setResult(null);
  };

  const scoreColor = result
    ? result.score >= 75 ? 'text-teal' : result.score >= 50 ? 'text-gold' : 'text-rose-400'
    : '';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader
        icon={Heart}
        title="Cosmic Compatibility"
        subtitle="Two signs. One honest reading. No illusions."
        color="teal"
      />

      {!result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-6">
            <ZodiacPicker label="Your sign" selected={signA} onSelect={setSignA} exclude={signB} />
            <div className="border-t border-border/20" />
            <ZodiacPicker label="Their sign" selected={signB} onSelect={setSignB} exclude={signA} />
          </div>

          {signA && signB && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
              <Button
                onClick={handleRead}
                disabled={loading}
                className="bg-gradient-to-r from-pink-500/80 to-violet text-white hover:opacity-90 gap-2 px-8 py-5 text-base rounded-xl"
              >
                <Heart className="w-4 h-4" />
                Read Our Compatibility
              </Button>
            </motion.div>
          )}

          {!signA && !signB && (
            <p className="text-center text-xs text-muted-foreground">Select both signs above to begin</p>
          )}
        </motion.div>
      )}

      {loading && <LoadingSpinner message="Reading the stars between you..." />}

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Header */}
            <div className="glass-card rounded-2xl p-6 text-center glow-violet">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <span className="text-4xl block">{signDataA?.symbol}</span>
                  <p className="text-xs capitalize text-muted-foreground mt-1">{signA}</p>
                </div>
                <Heart className="w-6 h-6 text-pink-400" />
                <div className="text-center">
                  <span className="text-4xl block">{signDataB?.symbol}</span>
                  <p className="text-xs capitalize text-muted-foreground mt-1">{signB}</p>
                </div>
              </div>
              <div className={`text-5xl font-heading font-bold ${scoreColor}`}>{result.score}<span className="text-2xl text-muted-foreground">/100</span></div>
              <p className="text-sm text-muted-foreground mt-1 italic">{result.vibe_tag}</p>
            </div>

            {/* Overall vibe */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-foreground leading-relaxed italic">"{result.overall_vibe}"</p>
            </div>

            {/* Strengths, Challenges, Growth */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-teal" />
                  <h4 className="font-heading text-xs font-semibold text-teal uppercase tracking-wider">Strengths</h4>
                </div>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-teal mt-0.5 shrink-0">◆</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h4 className="font-heading text-xs font-semibold text-rose-400 uppercase tracking-wider">Challenges</h4>
                </div>
                <ul className="space-y-2">
                  {result.challenges?.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-rose-400 mt-0.5 shrink-0">◆</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  <h4 className="font-heading text-xs font-semibold text-gold uppercase tracking-wider">Growth</h4>
                </div>
                <ul className="space-y-2">
                  {result.growth_areas?.map((g, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-gold mt-0.5 shrink-0">◆</span>{g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Advice */}
            <div className="glass-card rounded-2xl p-5 border border-violet/20 bg-violet/5">
              <p className="text-xs text-violet/70 uppercase tracking-widest font-heading mb-3">Honest Advice</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{result.advice}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
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
      </AnimatePresence>
    </div>
  );
}