import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import * as Astronomy from 'npm:astronomy-engine@2.1.19';

const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const ASPECTS = [[0, 'conjunction'], [60, 'sextile'], [90, 'square'], [120, 'trine'], [180, 'opposition']];
const ORBS = { mars: 2.5, jupiter: 3, saturn: 3, uranus: 3, neptune: 3, pluto: 3 };
const WEIGHT = { pluto: 6, neptune: 5, uranus: 4, saturn: 3, jupiter: 2, mars: 1 };

function norm360(x) {
  return ((x % 360) + 360) % 360;
}

function separation(a, b) {
  let d = Math.abs(norm360(a) - norm360(b));
  if (d > 180) d = 360 - d;
  return d;
}

function eclipticLon(body, time) {
  const bodyMap = {
    mars: Astronomy.Body.Mars,
    jupiter: Astronomy.Body.Jupiter,
    saturn: Astronomy.Body.Saturn,
    uranus: Astronomy.Body.Uranus,
    neptune: Astronomy.Body.Neptune,
    pluto: Astronomy.Body.Pluto,
  };
  const vec = Astronomy.GeoVector(bodyMap[body], time, true);
  return Astronomy.Ecliptic(vec).elon;
}

function houseOf(lon, cusps) {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = norm360(b - a);
    if (norm360(lon - a) < span) return i + 1;
  }
  return 12;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    if (!payload.birth_date) return Response.json({ error: 'birth_date is required' }, { status: 400 });

    // Natal chart from the same real ephemeris engine
    const natalRes = await base44.functions.invoke('calculateChart', payload);
    const natal = natalRes?.data ?? natalRes;
    if (!natal || natal.error) {
      return Response.json({ error: natal?.error || 'Could not calculate natal chart' }, { status: 400 });
    }

    // Current sky (transiting planets, true ecliptic of date)
    const now = new Date();
    const time = Astronomy.MakeTime(now);
    const timeNext = Astronomy.MakeTime(new Date(now.getTime() + 86400000));
    const transitBodies = ['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const current = {};
    const next = {};
    for (const b of transitBodies) {
      current[b] = eclipticLon(b, time);
      next[b] = eclipticLon(b, timeNext);
    }

    // Natal points to aspect against
    const natalPoints = {};
    for (const [name, p] of Object.entries(natal.planets)) natalPoints[name] = p.total;
    if (natal.ascendant) natalPoints.ascendant = natal.ascendant.total;
    if (natal.midheaven) natalPoints.midheaven = natal.midheaven.total;

    // Find active aspects
    const transits = [];
    for (const t of transitBodies) {
      const maxOrb = ORBS[t];
      for (const [pointName, natLon] of Object.entries(natalPoints)) {
        const d = separation(current[t], natLon);
        for (const [angle, aspectName] of ASPECTS) {
          const orb = Math.abs(d - angle);
          if (orb <= maxOrb) {
            const orbTomorrow = Math.abs(separation(next[t], natLon) - angle);
            const applying = orbTomorrow < orb;
            // 0-50% while building toward exact, 50-100% while integrating afterward
            const progress = Math.round(applying ? (1 - orb / maxOrb) * 50 : 50 + (1 - orb / maxOrb) * 50);
            transits.push({
              transiting: t,
              natal_point: pointName,
              aspect: aspectName,
              orb: Math.round(orb * 10) / 10,
              applying,
              progress,
              retrograde: ((next[t] - current[t] + 540) % 360) - 180 < 0,
            });
          }
        }
      }
    }
    transits.sort((a, b) => (WEIGHT[b.transiting] - WEIGHT[a.transiting]) || (a.orb - b.orb));

    // Which natal house each transiting planet is moving through
    let houseTransits = null;
    if (natal.houses) {
      const cusps = natal.houses.map(h => h.total);
      houseTransits = transitBodies.map(b => ({
        planet: b,
        house: houseOf(current[b], cusps),
        sign: SIGNS[Math.floor(norm360(current[b]) / 30)],
      }));
    }

    return Response.json({
      date: now.toISOString().split('T')[0],
      transits: transits.slice(0, 7),
      house_transits: houseTransits,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});