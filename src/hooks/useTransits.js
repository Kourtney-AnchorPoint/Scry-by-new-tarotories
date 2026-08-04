import { useState, useEffect } from 'react';
import { astronomy } from '@/api/functions/astronomy';
import { invokeLLM } from '@/api/ai';

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
      const res = await astronomy.calculateTransits({
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

        const result = await invokeLLM({
          action: 'astrology_transits',
          params: { transitList, houseList, date: t.date },
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