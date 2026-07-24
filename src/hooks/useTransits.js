import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PHASES_SCHEMA = {
  type: "object",
  properties: {
    phases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "number" },
          name: { type: "string" },
          meaning: { type: "string" }
        },
        required: ["index", "name", "meaning"]
      }
    }
  },
  required: ["phases"]
};

// Jargon-free fallback title if the AI narration fails — never show raw planet names
const DOMAIN = {
  sun: 'Your Identity', moon: 'Your Inner World', mercury: 'Your Mind & Voice',
  venus: 'Love & Self-Worth', mars: 'Your Drive', jupiter: 'Your Growth', saturn: 'Your Foundations',
};
const PRESSURE = {
  conjunction: 'A New Chapter for', square: 'Pressure On', opposition: 'A Tug-of-War Over',
  trine: 'A Green Light for', sextile: 'An Open Door for',
};
function humanFallbackName(tr) {
  return `${PRESSURE[tr.aspect] || 'A Shift In'} ${DOMAIN[tr.natal_point] || 'Your Life'}`;
}

// Shared daily transit engine — Dashboard and Astrology use the same cache,
// so the sky is only computed and narrated once per day.
export function useTransits(profile) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chartKey = profile
    ? `${profile.birth_date}_${profile.birth_time}_${profile.birth_location}_${profile.birth_zip}`
    : '';

  const fetchTransits = async () => {
    const d = new Date();
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const cacheKey = `transits_v2_${dateKey}_${chartKey}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setData(JSON.parse(cached)); return; } catch { localStorage.removeItem(cacheKey); }
    }
    setLoading(true);
    setError(null);
    try {
      // Real transit math from today's actual sky vs. the natal chart
      const res = await base44.functions.invoke('calculateTransits', {
        birth_date: profile.birth_date,
        birth_time: profile.birth_time || 'unknown',
        birth_location: profile.birth_location,
        birth_zip: profile.birth_zip,
      });
      const t = res.data;
      if (!t || t.error) throw new Error(t?.error || 'Transit calculation failed');

      let phases = [];
      if (t.transits.length > 0) {
        const transitList = t.transits
          .map((tr, i) => `${i + 1}. Transiting ${tr.transiting}${tr.retrograde ? ' (retrograde)' : ''} ${tr.aspect} natal ${tr.natal_point} — orb ${tr.orb}°, ${tr.applying ? 'APPLYING (building toward exact — intensity rising)' : 'SEPARATING (past exact — lessons integrating)'}`)
          .join('\n');
        const houseList = (t.house_transits || [])
          .map(h => `Transiting ${h.planet} is moving through their natal House ${h.house} (in ${h.sign})`)
          .join('\n');

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a deeply psychological astrologer in the style of "The Pattern" app. Direct, raw, second person. No jargon in the output — translate everything into plain emotional language.

These are the REAL transits active in this person's chart RIGHT NOW (computed from live ephemeris data, today's date: ${t.date}):
${transitList}

Current house journeys for context (weave in where relevant):
${houseList || 'not available'}

For EACH numbered transit, return:
- "index": the transit's number from the list
- "name": a plain-English phase name, like The Pattern uses — e.g. "Identity Earthquake", "Relationship Testing Period", "Money Rebuild", "Finding Your Voice". NO planet names in the phase name.
- "meaning": 2 paragraphs. First: what this actually FEELS like right now — the internal experience, the friction, the urges, the restlessness or stuckness. Second: what it's here to teach and what to actively do (or stop doing) while it lasts. If applying, note the pressure is still building; if separating, note the peak has passed and this is integration time. Be specific and piercing — no horoscope fluff.

ABSOLUTE RULE: Never use planet names, sign names, aspect names (square, trine, conjunction, etc.), the word "transit", or any astrology terminology ANYWHERE in the name or meaning. Write only about the human experience — as if you know exactly what is happening inside this person.

Return one entry per numbered transit, in order.`,
          response_json_schema: PHASES_SCHEMA,
          model: "claude_sonnet_4_6"
        });

        phases = t.transits.map((tr, i) => {
          const narrated = (result.phases || []).find(p => p.index === i + 1);
          return { ...tr, name: narrated?.name || humanFallbackName(tr), meaning: narrated?.meaning || '' };
        });
      }

      const final = { date: t.date, phases, house_transits: t.house_transits };
      localStorage.setItem(cacheKey, JSON.stringify(final));
      setData(final);
    } catch {
      setError('Unable to read the current sky. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.birth_date) fetchTransits();
  }, [chartKey]);

  return { data, loading, error, retry: fetchTransits };
}