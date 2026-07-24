import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, AlertCircle, Star, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/shared/SectionHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import BirthDataForm from '@/components/astrology/BirthDataForm';
import NatalChart from '@/components/astrology/NatalChart';
import PatternLayers from '@/components/astrology/PatternLayers';
import CurrentTransits from '@/components/astrology/CurrentTransits';
import ConnectionHub from '@/components/astrology/ConnectionHub';
import SynastryReport from '@/components/astrology/SynastryReport';
import { useUserProfile } from '@/hooks/useUserProfile';
import PlacementDeepDive from '@/components/astrology/PlacementDeepDive';
import HouseDeepDive from '@/components/astrology/HouseDeepDive';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';

const HOUSES_SCHEMA = {
  type: "object",
  properties: {
    houses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          house: { type: "number" },
          headline: { type: "string" },
          meaning: { type: "string" }
        },
        required: ["house", "headline", "meaning"]
      }
    }
  },
  required: ["houses"]
};

const PATTERN_SCHEMA = {
  type: "object",
  properties: {
    core_layers: {
      type: "object",
      properties: {
        core: { type: "string" },
        development: { type: "string" },
        relationships: { type: "string" },
      },
      required: ["core", "development", "relationships"]
    },
    placements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          planet: { type: "string" },
          headline: { type: "string" },
          meaning: { type: "string" }
        },
        required: ["planet", "headline", "meaning"]
      }
    }
  },
  required: ["core_layers", "placements"]
};

export default function Astrology() {
  const { profile, isLoading } = useUserProfile();
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [connectionChart, setConnectionChart] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [patternData, setPatternData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [patternLoading, setPatternLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [patternError, setPatternError] = useState(null);
  const [houseData, setHouseData] = useState(null);
  const [houseLoading, setHouseLoading] = useState(false);
  const chartKeyRef = useRef('');

  const hasBirthData = profile?.birth_date && (profile?.birth_location || profile?.birth_zip);
  const birthLocationDisplay = profile?.birth_location
    ? `${profile.birth_location}${profile.birth_zip ? ', ' + profile.birth_zip : ''}`
    : profile?.birth_zip || '';
  const birthTimeUnknown = !profile?.birth_time || profile?.birth_time === 'unknown';

  const fetchChart = async () => {
    if (!profile?.birth_date) return;
    const cacheKey = `natal_chart_v3_${profile.birth_date}_${profile.birth_time}_${profile.birth_location}_${profile.birth_zip}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setChartData(JSON.parse(cached)); return; } catch { localStorage.removeItem(cacheKey); }
    }
    setChartLoading(true);
    setChartError(null);
    try {
      // Real astronomical calculation (ephemeris + Placidus houses) — no AI estimation
      const res = await base44.functions.invoke('calculateChart', {
        birth_date: profile.birth_date,
        birth_time: birthTimeUnknown ? 'unknown' : profile.birth_time,
        birth_location: profile.birth_location,
        birth_zip: profile.birth_zip,
      });
      const d = res.data;
      if (!d || d.error) throw new Error(d?.error || 'Calculation failed');

      const asDecimal = (p) => p.degrees + p.minutes / 60;
      const houses = (d.houses || []).map(h => ({
        number: h.house,
        sign: h.sign,
        degrees: asDecimal(h),
        planets: Object.entries(d.planets)
          .filter(([, p]) => p.house === h.house)
          .map(([name]) => name),
      }));

      const pick = (p) => ({ sign: p.sign, degrees: asDecimal(p), house: p.house, retrograde: p.retrograde });
      const result = {
        big_three: {
          sun: pick(d.planets.sun),
          moon: pick(d.planets.moon),
          rising: d.ascendant ? { sign: d.ascendant.sign, degrees: asDecimal(d.ascendant) } : null,
        },
        planets: {
          mercury: pick(d.planets.mercury),
          venus: pick(d.planets.venus),
          mars: pick(d.planets.mars),
          jupiter: pick(d.planets.jupiter),
          saturn: pick(d.planets.saturn),
          uranus: pick(d.planets.uranus),
          neptune: pick(d.planets.neptune),
          pluto: pick(d.planets.pluto),
        },
        midheaven: d.midheaven,
        houses,
        location: d.location,
        birthTimeUnknown: d.unknownTime,
      };

      localStorage.setItem(cacheKey, JSON.stringify(result));
      setChartData(result);
      trackEvent('natal_chart_calculated', { has_birth_time: !birthTimeUnknown });
    } catch {
      setChartError('Unable to calculate your birth chart. Please try again.');
    }
    setChartLoading(false);
  };

  const fetchPattern = async () => {
    if (!chartData) return;
    const patternKey = `natal_pattern_v3_${chartKeyRef.current}`;
    const cachedPattern = localStorage.getItem(patternKey);
    if (cachedPattern) {
      try { setPatternData(JSON.parse(cachedPattern)); return; } catch { localStorage.removeItem(patternKey); }
    }
    setPatternLoading(true);
    setPatternError(null);
    try {
      const bt = chartData.big_three || {};
      const pl = chartData.planets || {};
      const line = (name, p) => p ? `${name}: ${p.sign} ${Number(p.degrees).toFixed(1)}°${p.house ? ` (House ${p.house})` : ''}${p.retrograde ? ' Retrograde' : ''}` : '';
      const chartSummary = [
        line('Sun', bt.sun),
        line('Moon', bt.moon),
        bt.rising ? line('Rising', bt.rising) : 'Rising: Unknown',
        line('Mercury', pl.mercury),
        line('Venus', pl.venus),
        line('Mars', pl.mars),
        line('Jupiter', pl.jupiter),
        line('Saturn', pl.saturn),
        line('Uranus', pl.uranus),
        line('Neptune', pl.neptune),
        line('Pluto', pl.pluto),
      ].filter(Boolean).join('\n');
      const houseMap = (chartData.houses || [])
        .flatMap(h => (h.planets || []).map(p => `${p} in House ${h.number} (${h.sign})`))
        .join(', ') || 'not available';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a deeply psychological astrologer in the style of "The Pattern" app. You speak in first person, direct, raw, and piercing. No jargon. No "the cosmos whispers." You read energy like you're seeing someone's soul.

Here is the natal chart:
${chartSummary}

Write three core psychological layers:

1. "Your Core" — Synthesize the Sun and Ascendant. This is about identity, ego, and how you approach life. Multi-paragraph, direct, psychological.

2. "Your Development" — Synthesize Saturn and the Midheaven (10th house). This is about career struggles, responsibilities, and growth focus. Multi-paragraph.

3. "Your Relationships" — Synthesize the Moon, Venus, and Descendant (7th house). This is about emotional needs, attachment styles, and love language. Multi-paragraph.

Finally, write a detailed deep-dive for EVERY placement: Rising, Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn. For each one return:
- "planet": a label like "Moon in Cancer — 2nd House"
- "headline": one punchy sentence capturing its essence
- "meaning": 2-3 paragraphs of raw, specific psychological insight weaving together what the sign AND the house placement mean for this person. No generic keyword lists — write like you can see their soul.

House placements (use these exact houses): ${houseMap}`,
        response_json_schema: PATTERN_SCHEMA,
        model: "claude_sonnet_4_6"
      });
      localStorage.setItem(patternKey, JSON.stringify(result));
      setPatternData(result);
    } catch {
      setPatternError('Unable to generate your pattern analysis. Please try again.');
    }
    setPatternLoading(false);
  };

  const fetchHouses = async () => {
    if (!chartData?.houses?.length) return;
    const key = `natal_houses_v3_${chartKeyRef.current}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try { setHouseData(JSON.parse(cached)); return; } catch { localStorage.removeItem(key); }
    }
    setHouseLoading(true);
    try {
      const houseList = chartData.houses
        .map(h => `House ${h.number}: ${h.sign} on the cusp${h.planets?.length ? ' — contains ' + h.planets.join(', ') : ' — empty'}`)
        .join('\n');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a deeply psychological astrologer in the style of "The Pattern" app. Direct, raw, second person, no jargon, no "the cosmos whispers."

Here are this person's exact Placidus houses, calculated from real ephemeris data:
${houseList}

For EACH of the 12 houses, write a full interpretation:
- "house": the house number (1-12)
- "headline": short title like "2nd House — Cancer · Money & Security"
- "meaning": 1-2 full paragraphs. First explain what this area of life actually is in plain language, then what the sign on this cusp means for how THIS person specifically lives it. If planets sit in the house, weave in what their presence intensifies or complicates. Be specific and psychological — no generic keyword lists.

Return all 12 houses in order.`,
        response_json_schema: HOUSES_SCHEMA,
        model: "claude_sonnet_4_6"
      });
      localStorage.setItem(key, JSON.stringify(result));
      setHouseData(result);
    } catch {
      // houses section simply won't render; retry happens on next visit
    }
    setHouseLoading(false);
  };

  useEffect(() => {
    const key = `${profile?.birth_date}_${profile?.birth_time}_${profile?.birth_location}_${profile?.birth_zip}`;
    if (hasBirthData && key !== chartKeyRef.current) {
      chartKeyRef.current = key;
      setChartData(null);
      setPatternData(null);
      fetchChart();
    }
  }, [profile?.birth_date, profile?.birth_time, profile?.birth_location, profile?.birth_zip]);

  useEffect(() => {
    if (chartData && !patternData && !patternLoading) {
      fetchPattern();
    }
    if (chartData && !houseData && !houseLoading) {
      fetchHouses();
    }
  }, [chartData]);

  const handleSelectConnection = (conn, chart) => {
    setSelectedConnection(conn);
    setConnectionChart(chart);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading your chart data..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader
        icon={Sun}
        title="Astrology"
        subtitle="Your celestial blueprint, psychological pattern, and relationship dynamics"
        color="gold"
      />

      {!hasBirthData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-gold/20"
        >
          <div className="text-center mb-5">
            <Star className="w-8 h-8 text-gold mx-auto mb-2" />
            <h3 className="font-heading text-lg font-semibold mb-1">Enter Your Birth Data</h3>
            <p className="text-sm text-muted-foreground">
              Add your birth date, time, and location to unlock your full natal chart, psychological pattern, and compatibility readings.
            </p>
          </div>
          <BirthDataForm compact />
        </motion.div>
      )}

      {hasBirthData && chartLoading && (
        <LoadingSpinner message="Calculating your natal chart from live ephemeris data..." />
      )}

      {hasBirthData && chartError && !chartLoading && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{chartError}</p>
          <Button size="sm" variant="outline" className="gap-2 border-gold/30 text-gold" onClick={fetchChart}>
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </Button>
        </div>
      )}

      {hasBirthData && chartData && !chartLoading && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <NatalChart chartData={chartData} />

            {houseLoading ? (
              <LoadingSpinner message="Interpreting your twelve houses..." />
            ) : (
              <HouseDeepDive houses={houseData?.houses} />
            )}

            {patternLoading ? (
              <LoadingSpinner message="Revealing your psychological pattern..." />
            ) : patternError ? (
              <div className="glass-card rounded-2xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-violet mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">{patternError}</p>
                <Button size="sm" variant="outline" className="gap-2 border-violet/30 text-violet" onClick={fetchPattern}>
                  <RotateCcw className="w-3.5 h-3.5" /> Try Again
                </Button>
              </div>
            ) : (
              patternData && (
                <>
                  <PlacementDeepDive placements={patternData.placements} />
                  <PatternLayers layers={patternData.core_layers} />
                </>
              )
            )}

            <CurrentTransits profile={profile} />

            <div>
              <h2 className="font-heading text-sm font-semibold text-violet uppercase tracking-wider mb-4">
                Relationship Compatibility
              </h2>
              <ConnectionHub
                onSelectConnection={handleSelectConnection}
                selectedConnectionId={selectedConnection?.id}
              />
            </div>

            {selectedConnection && connectionChart && (
              <div>
                <h2 className="font-heading text-sm font-semibold text-pink uppercase tracking-wider mb-4">
                  Synastry: You & {selectedConnection.name}
                </h2>
                <SynastryReport
                  userChartData={chartData}
                  connection={selectedConnection}
                  connectionChartData={connectionChart}
                />
              </div>
            )}

            <div className="glass-card rounded-2xl p-5">
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Update your birth data
                </summary>
                <div className="mt-4">
                  <BirthDataForm compact />
                </div>
              </details>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}