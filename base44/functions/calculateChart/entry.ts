import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import * as Astronomy from 'npm:astronomy-engine@2.1.19';

const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const DEG = Math.PI / 180;

function norm360(x) {
  return ((x % 360) + 360) % 360;
}

function toSign(lon) {
  const l = norm360(lon);
  const idx = Math.floor(l / 30);
  const inSign = l - idx * 30;
  const deg = Math.floor(inSign);
  const min = Math.round((inSign - deg) * 60);
  return { sign: SIGNS[idx], degrees: deg, minutes: min, total: l };
}

// US standard timezone offset from longitude (approximate state-boundary bands)
function usStdOffset(lon) {
  if (lon >= -84.5) return -5;   // Eastern
  if (lon >= -104) return -6;    // Central
  if (lon >= -115) return -7;    // Mountain
  if (lon >= -130) return -8;    // Pacific
  return -9;                     // Alaska
}

function nthSunday(year, month, n) {
  // month 1-12; returns day of month of nth Sunday
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const firstSunday = first === 0 ? 1 : 8 - first;
  return firstSunday + (n - 1) * 7;
}

function lastSunday(year, month) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDow = new Date(Date.UTC(year, month - 1, daysInMonth)).getUTCDay();
  return daysInMonth - lastDow;
}

// US DST rules by era (1 if DST active on this local date)
function usDst(y, m, d) {
  let start, end; // [month, day]
  if (y >= 2007) {
    start = [3, nthSunday(y, 3, 2)];
    end = [11, nthSunday(y, 11, 1)];
  } else if (y >= 1987) {
    start = [4, nthSunday(y, 4, 1)];
    end = [10, lastSunday(y, 10)];
  } else {
    start = [4, lastSunday(y, 4)];
    end = [10, lastSunday(y, 10)];
  }
  const val = m * 100 + d;
  const s = start[0] * 100 + start[1];
  const e = end[0] * 100 + end[1];
  return val >= s && val < e ? 1 : 0;
}

function eclipticLon(body, time) {
  if (body === 'sun') return Astronomy.SunPosition(time).elon;
  if (body === 'moon') return Astronomy.EclipticGeoMoon(time).lon;
  const bodyMap = {
    mercury: Astronomy.Body.Mercury,
    venus: Astronomy.Body.Venus,
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

// Placidus intermediate cusp via semi-arc iteration.
// RA(cusp) = RAMC + offset + k * AD, where AD = asin(tan(dec) * tan(lat))
function placidusCusp(ramc, offset, k, eps, lat) {
  let ra = ramc + offset;
  for (let i = 0; i < 50; i++) {
    const dec = Math.atan(Math.tan(eps * DEG) * Math.sin(ra * DEG)) / DEG;
    let x = Math.tan(dec * DEG) * Math.tan(lat * DEG);
    x = Math.max(-1, Math.min(1, x));
    const ad = Math.asin(x) / DEG;
    const next = ramc + offset + k * ad;
    if (Math.abs(next - ra) < 0.00005) { ra = next; break; }
    ra = next;
  }
  // Ecliptic longitude of the ecliptic point with this RA
  return norm360(Math.atan2(Math.sin(ra * DEG), Math.cos(ra * DEG) * Math.cos(eps * DEG)) / DEG);
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

    const { birth_date, birth_time, birth_zip, birth_location } = await req.json();
    if (!birth_date) return Response.json({ error: 'birth_date is required' }, { status: 400 });

    // --- Geocode: US zip first (most precise), then city name ---
    let lat = null;
    let lon = null;
    let place = birth_location || '';
    let isUS = true;
    const zip = (birth_zip || '').trim();
    if (/^\d{5}$/.test(zip)) {
      const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (r.ok) {
        const data = await r.json();
        lat = parseFloat(data.places[0].latitude);
        lon = parseFloat(data.places[0].longitude);
        place = `${data.places[0]['place name']}, ${data.places[0]['state abbreviation']}`;
      }
    }
    if (lat === null && birth_location) {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(birth_location)}`,
        { headers: { 'User-Agent': 'CosmicEncounters/1.0 (astrology app)' } }
      );
      if (r.ok) {
        const results = await r.json();
        if (results[0]) {
          lat = parseFloat(results[0].lat);
          lon = parseFloat(results[0].lon);
          place = results[0].display_name.split(',').slice(0, 2).join(',').trim();
          isUS = /united states/i.test(results[0].display_name);
        }
      }
    }
    if (lat === null) {
      return Response.json({ error: 'Could not find that birth location. Try adding a US zip code.' }, { status: 400 });
    }

    const [y, m, d] = birth_date.split('-').map(Number);
    const unknownTime = !birth_time || birth_time === 'unknown';
    const [hh, mm] = unknownTime ? [12, 0] : birth_time.split(':').map(Number);

    // Local time -> UT
    const stdOffset = isUS ? usStdOffset(lon) : Math.round(lon / 15);
    const dst = isUS ? usDst(y, m, d) : 0;
    const utcOffset = stdOffset + dst;
    const utDate = new Date(Date.UTC(y, m - 1, d, hh - utcOffset, mm));
    const time = Astronomy.MakeTime(utDate);
    const timeNext = Astronomy.MakeTime(new Date(utDate.getTime() + 86400000));

    // --- Planetary positions (true ecliptic of date) ---
    const bodies = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const planets = {};
    for (const b of bodies) {
      const lonNow = eclipticLon(b, time);
      const lonLater = eclipticLon(b, timeNext);
      const delta = ((lonLater - lonNow + 540) % 360) - 180;
      planets[b] = { ...toSign(lonNow), retrograde: b !== 'sun' && b !== 'moon' && delta < 0 };
    }

    // --- Angles & Placidus houses (need exact birth time) ---
    // Mean obliquity of date
    const jd = utDate.getTime() / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    const eps = 23.4392911 - 0.0130042 * T;

    let ascendant = null;
    let midheaven = null;
    let houses = null;
    if (!unknownTime) {
      const gast = Astronomy.SiderealTime(time); // hours
      const ramc = norm360(gast * 15 + lon);

      const mcLon = norm360(Math.atan2(Math.sin(ramc * DEG), Math.cos(ramc * DEG) * Math.cos(eps * DEG)) / DEG);
      const ascLon = norm360(
        Math.atan2(
          Math.cos(ramc * DEG),
          -(Math.sin(ramc * DEG) * Math.cos(eps * DEG) + Math.tan(lat * DEG) * Math.sin(eps * DEG))
        ) / DEG
      );

      const c11 = placidusCusp(ramc, 30, 1 / 3, eps, lat);
      const c12 = placidusCusp(ramc, 60, 2 / 3, eps, lat);
      const c2 = placidusCusp(ramc, 120, 2 / 3, eps, lat);
      const c3 = placidusCusp(ramc, 150, 1 / 3, eps, lat);

      const cusps = [
        ascLon, c2, c3, norm360(mcLon + 180), norm360(c11 + 180), norm360(c12 + 180),
        norm360(ascLon + 180), norm360(c2 + 180), norm360(c3 + 180), mcLon, c11, c12,
      ];

      ascendant = toSign(ascLon);
      midheaven = toSign(mcLon);
      houses = cusps.map((c, i) => ({ house: i + 1, ...toSign(c) }));

      for (const b of bodies) {
        planets[b].house = houseOf(planets[b].total, cusps);
      }
    }

    return Response.json({
      location: { lat, lon, place },
      utc_offset: utcOffset,
      unknownTime,
      ascendant,
      midheaven,
      planets,
      houses,
      house_system: 'placidus',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});