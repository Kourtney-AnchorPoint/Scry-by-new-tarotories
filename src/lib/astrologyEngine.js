// Real astronomical calculation engine for natal charts, transits, and synastry.
// Based on Paul Schlyter's "Computing Planetary Positions" method.
// Uses simplified Keplerian orbital elements valid ~1800-2050.

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

// ─── Zodiac Constants ───
export const ZODIAC = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export const ZODIAC_SYMBOLS = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
};

export const PLANET_SYMBOLS = {
  sun: '☉', moon: '☾', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄'
};

export const PLANET_NAMES = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn'
};

export const HOUSE_INFO = [
  { num: 1, name: '1st House', theme: 'Self & Identity', color: 'text-violet' },
  { num: 2, name: '2nd House', theme: 'Money & Values', color: 'text-gold' },
  { num: 3, name: '3rd House', theme: 'Mind & Communication', color: 'text-teal' },
  { num: 4, name: '4th House', theme: 'Home & Roots', color: 'text-violet' },
  { num: 5, name: '5th House', theme: 'Creativity & Romance', color: 'text-gold' },
  { num: 6, name: '6th House', theme: 'Health & Daily Life', color: 'text-teal' },
  { num: 7, name: '7th House', theme: 'Relationships & Partners', color: 'text-violet' },
  { num: 8, name: '8th House', theme: 'Transformation & Power', color: 'text-gold' },
  { num: 9, name: '9th House', theme: 'Wisdom & Expansion', color: 'text-teal' },
  { num: 10, name: '10th House', theme: 'Career & Legacy', color: 'text-violet' },
  { num: 11, name: '11th House', theme: 'Community & Hopes', color: 'text-gold' },
  { num: 12, name: '12th House', theme: 'Soul & Hidden Realms', color: 'text-teal' },
];

// ─── Utility Functions ───
function rev(x) {
  return ((x % 360) + 360) % 360;
}

function julianDay(year, month, day, ut) {
  return 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4)
    + Math.floor(275 * month / 9) + day + 1721013.5 + ut / 24;
}

function dayNumber(date) {
  return julianDay(
    date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  ) - 2451543.5;
}

function signFromLongitude(lon) {
  return ZODIAC[Math.floor(rev(lon) / 30)];
}

function degreesInSign(lon) {
  return rev(lon) % 30;
}

// ─── City Geocoding ───
const CITY_COORDS = {
  'new york': [40.71, -74.01], 'los angeles': [34.05, -118.24], 'chicago': [41.88, -87.63],
  'houston': [29.76, -95.37], 'phoenix': [33.45, -112.07], 'philadelphia': [39.95, -75.17],
  'san antonio': [29.42, -98.49], 'san diego': [32.72, -117.16], 'dallas': [32.78, -96.80],
  'san francisco': [37.77, -122.42], 'austin': [30.27, -97.74], 'seattle': [47.61, -122.33],
  'denver': [39.74, -104.99], 'boston': [42.36, -71.06], 'atlanta': [33.75, -84.39],
  'miami': [25.76, -80.19], 'detroit': [42.33, -83.05], 'minneapolis': [44.98, -93.27],
  'portland': [45.52, -122.67], 'las vegas': [36.17, -115.14], 'nashville': [36.16, -86.78],
  'memphis': [35.15, -90.05], 'louisville': [38.25, -85.76], 'baltimore': [39.29, -76.61],
  'milwaukee': [43.04, -87.91], 'albuquerque': [35.08, -106.65], 'tucson': [32.22, -110.93],
  'fresno': [36.74, -119.77], 'sacramento': [38.58, -121.49], 'kansas city': [39.10, -94.58],
  'cleveland': [41.50, -81.69], 'st louis': [38.63, -90.20], 'st. louis': [38.63, -90.20],
  'pittsburgh': [40.44, -80.00], 'cincinnati': [39.10, -84.51], 'orlando': [28.54, -81.38],
  'tampa': [27.95, -82.46], 'new orleans': [29.95, -90.07], 'washington': [38.90, -77.04],
  'salt lake city': [40.76, -111.89], 'london': [51.51, -0.13], 'paris': [48.86, 2.35],
  'toronto': [43.65, -79.38], 'sydney': [-33.87, 151.21], 'mumbai': [19.08, 72.88],
  'tokyo': [35.68, 139.69], 'mexico city': [19.43, -99.13], 'berlin': [52.52, 13.40],
  'madrid': [40.42, -3.70], 'rome': [41.90, 12.50], 'amsterdam': [52.37, 4.90],
  'dublin': [53.35, -6.26], 'barcelona': [41.39, 2.17], 'montreal': [45.50, -73.57],
  'vancouver': [49.28, -123.12], 'calgary': [51.05, -114.07], 'ottawa': [45.42, -75.70],
  'edmonton': [53.55, -113.49], 'winnipeg': [49.90, -97.14], 'halifax': [44.65, -63.57],
  'oklahoma city': [35.47, -97.52], 'moore': [35.34, -97.49], 'norman': [35.22, -97.44],
  'tulsa': [36.15, -95.99], 'broken arrow': [36.05, -95.79], 'edmond': [35.65, -97.48],
  'stillwater': [36.12, -97.06], 'lawton': [34.60, -98.39], 'ennis': [33.13, -96.63],
  'durham': [35.99, -78.90], 'raleigh': [35.78, -78.64], 'charlotte': [35.23, -80.84],
  'nashville': [36.16, -86.78], 'knoxville': [35.96, -83.94], 'chattanooga': [35.05, -85.31],
  'jacksonville': [30.33, -81.66], 'columbus': [39.96, -82.99], 'indianapolis': [39.77, -86.16],
  'fort worth': [32.76, -97.33], 'arlington': [32.74, -97.11], 'plano': [33.02, -96.70],
  'garland': [32.91, -96.63], 'irving': [32.81, -96.95], 'frisco': [33.15, -96.82],
  'lubbock': [33.58, -101.85], 'amarillo': [35.22, -101.83], 'midland': [31.99, -102.08],
  'beaumont': [30.09, -94.10], 'waco': [31.55, -97.13], 'carrollton': [32.95, -96.89],
  'mesa': [33.42, -111.83], 'scottsdale': [33.49, -111.93], 'chandler': [33.28, -111.84],
  'tempe': [33.41, -111.94], 'glendale': [33.54, -112.18], 'peoria': [33.58, -112.24],
  'reno': [39.53, -119.81], 'boise': [43.60, -116.20], 'spokane': [47.66, -117.43],
  'tacoma': [47.25, -122.44], 'fresno': [36.74, -119.77], 'bakersfield': [35.37, -119.01],
  'stockton': [37.96, -121.29], 'riverside': [33.95, -117.40], 'long beach': [33.77, -118.19],
  'anaheim': [33.84, -117.91], 'santa ana': [33.75, -117.87], 'bakersfield': [35.37, -119.01],
  'buffalo': [42.89, -78.88], 'rochester': [43.16, -77.61], 'yonkers': [40.93, -73.90],
  'fresno': [36.74, -119.77], 'garland': [32.91, -96.63], 'henderson': [36.04, -115.00],
  'norfolk': [36.85, -76.28], 'virginia beach': [36.85, -75.98], 'newport news': [36.70, -76.46],
  'chattanooga': [35.05, -85.31], 'shreveport': [32.52, -93.75], 'lafayette': [30.22, -92.02],
  'baton rouge': [30.45, -91.14], 'mobile': [30.70, -88.04], 'huntsville': [34.73, -86.59],
  'birmingham': [33.52, -86.80], 'montgomery': [32.36, -86.30], 'anchorage': [61.22, -149.90],
  'honolulu': [21.31, -157.86], 'manchester': [42.99, -71.45], 'worcester': [42.26, -71.80],
  'providence': [41.82, -71.41], 'hartford': [41.76, -72.67], 'new haven': [41.31, -72.92],
  'bridgeport': [41.17, -73.19], 'stamford': [41.05, -73.54], 'albany': [42.65, -73.75],
  'syracuse': [43.05, -76.15], 'dayton': [39.76, -84.19], 'toledo': [41.65, -83.54],
  'akron': [41.08, -81.52], 'canton': [40.80, -81.37], 'youngstown': [41.10, -80.65],
  'des moines': [41.59, -93.62], 'cedar rapids': [41.98, -91.67], 'sioux falls': [43.55, -96.73],
  'fargo': [46.88, -96.79], 'wichita': [37.69, -97.34], 'overland park': [38.98, -94.67],
  'kansas city': [39.10, -94.58], 'topeka': [39.05, -95.68], 'lincoln': [40.81, -96.71],
  'omaha': [41.25, -95.93], 'boise': [43.60, -116.20], 'birmingham': [33.52, -86.80],
};

export function geocodeLocation(locationString) {
  if (!locationString) return { lat: 0, lon: 0 };
  const parts = locationString.toLowerCase().split(',').map(s => s.trim());
  const city = parts[0];
  if (CITY_COORDS[city]) {
    return { lat: CITY_COORDS[city][0], lon: CITY_COORDS[city][1] };
  }
  for (const key in CITY_COORDS) {
    if (city.includes(key) || key.includes(city)) {
      return { lat: CITY_COORDS[key][0], lon: CITY_COORDS[key][1] };
    }
  }
  return { lat: 0, lon: 0 };
}

// ─── Parse Birth Data ───
export function parseBirthData(birthDate, birthTime, birthLocation) {
  const [year, month, day] = birthDate.split('-').map(Number);
  let hours = 12, minutes = 0;
  const birthTimeUnknown = !birthTime || birthTime === 'unknown';
  if (!birthTimeUnknown) {
    const [h, m] = birthTime.split(':').map(Number);
    hours = h;
    minutes = m;
  }
  const { lat, lon } = geocodeLocation(birthLocation);
  const tzOffset = Math.round(lon / 15);
  let utHours = hours - tzOffset;
  let utDay = day, utMonth = month, utYear = year;
  if (utHours < 0) { utHours += 24; utDay -= 1; }
  if (utHours >= 24) { utHours -= 24; utDay += 1; }
  if (utDay < 1) { utMonth -= 1; utDay = 31; }
  if (utDay > 31) { utMonth += 1; utDay = 1; }
  if (utMonth < 1) { utYear -= 1; utMonth = 12; }
  if (utMonth > 12) { utYear += 1; utMonth = 1; }
  const date = new Date(Date.UTC(utYear, utMonth - 1, utDay, Math.floor(utHours), minutes));
  return { date, lat, lon, birthTimeUnknown };
}

// ─── Sun Position ───
function sunPos(d) {
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const M = rev(356.0470 + 0.9856002585 * d) * DEG;
  let E = M;
  for (let i = 0; i < 10; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  const xv = Math.cos(E) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  return { lon: rev(v * RAD + w), lat: 0, r };
}

// ─── Moon Position ───
function moonPos(d) {
  const L = rev(218.316 + 13.176396 * d);
  const M = rev(134.963 + 13.064993 * d);
  const F = rev(93.272 + 13.229350 * d);
  const D = rev(297.850 + 12.190749 * d);
  const Ms = rev(356.047 + 0.9856002585 * d);
  let lon = L
    + 6.289 * Math.sin(M * DEG)
    - 1.274 * Math.sin((2 * D - M) * DEG)
    + 0.658 * Math.sin((2 * D) * DEG)
    - 0.186 * Math.sin(Ms * DEG)
    - 0.059 * Math.sin((2 * M - 2 * D) * DEG)
    - 0.057 * Math.sin((M - 2 * D + Ms) * DEG)
    + 0.053 * Math.sin((M + 2 * D) * DEG)
    + 0.046 * Math.sin((2 * D - Ms) * DEG)
    + 0.041 * Math.sin((M - Ms) * DEG)
    - 0.035 * Math.sin(D * DEG)
    - 0.031 * Math.sin((M + Ms) * DEG)
    - 0.015 * Math.sin((2 * F - 2 * D) * DEG)
    + 0.011 * Math.sin((2 * M - 2 * D) * DEG);
  lon = rev(lon);
  let lat = 5.128 * Math.sin(F * DEG)
    + 0.281 * Math.sin((M + F) * DEG)
    + 0.278 * Math.sin((M - F) * DEG)
    + 0.173 * Math.sin((2 * D - F) * DEG);
  return { lon, lat, r: 0 };
}

// ─── Planet Orbital Elements ───
const PLANET_ELEMENTS = {
  mercury: {
    N: d => 48.3313 + 3.24587e-5 * d, i: d => 7.0047 + 5.00e-8 * d,
    w: d => 29.1241 + 1.01444e-5 * d, a: 0.387098,
    e: d => 0.205635 + 5.59e-10 * d, M: d => 168.6562 + 4.0923344368 * d,
  },
  venus: {
    N: d => 76.6799 + 2.46590e-5 * d, i: d => 3.3946 + 2.75e-8 * d,
    w: d => 54.8910 + 1.38374e-5 * d, a: 0.723330,
    e: d => 0.006773 - 1.302e-9 * d, M: d => 48.1234 + 1.6021302244 * d,
  },
  mars: {
    N: d => 49.5574 + 2.11081e-5 * d, i: d => 1.8497 - 1.78e-8 * d,
    w: d => 286.5016 + 2.92961e-5 * d, a: 1.523688,
    e: d => 0.093405 + 2.516e-9 * d, M: d => 18.6021 + 0.5240207766 * d,
  },
  jupiter: {
    N: d => 100.4542 + 2.76854e-5 * d, i: d => 1.3030 - 1.557e-7 * d,
    w: d => 273.8777 + 1.64505e-5 * d, a: 5.20256,
    e: d => 0.048498 + 4.469e-9 * d, M: d => 19.8950 + 0.0830853001 * d,
  },
  saturn: {
    N: d => 113.6634 + 2.38980e-5 * d, i: d => 2.4886 - 1.081e-7 * d,
    w: d => 339.3939 + 2.97681e-5 * d, a: 9.55475,
    e: d => 0.055546 - 9.499e-9 * d, M: d => 316.9670 + 0.0334442282 * d,
  },
};

function planetPos(d, el) {
  const N = el.N(d), i = el.i(d), w = el.w(d), a = el.a, e = el.e(d);
  const M = rev(el.M(d)) * DEG;
  let E = M;
  for (let k = 0; k < 10; k++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const Nr = N * DEG, ir = i * DEG, wr = w * DEG;
  return {
    xh: r * (Math.cos(Nr) * Math.cos(v + wr) - Math.sin(Nr) * Math.sin(v + wr) * Math.cos(ir)),
    yh: r * (Math.sin(Nr) * Math.cos(v + wr) + Math.cos(Nr) * Math.sin(v + wr) * Math.cos(ir)),
    zh: r * Math.sin(v + wr) * Math.sin(ir),
    r,
  };
}

function earthPos(d) {
  const sun = sunPos(d);
  const lonsun = sun.lon * DEG;
  return { xh: -sun.r * Math.cos(lonsun), yh: -sun.r * Math.sin(lonsun), zh: 0 };
}

function geocentricPlanet(d, el) {
  const p = planetPos(d, el);
  const earth = earthPos(d);
  const xg = p.xh - earth.xh, yg = p.yh - earth.yh, zg = p.zh;
  return {
    lon: rev(Math.atan2(yg, xg) * RAD),
    lat: Math.atan2(zg, Math.sqrt(xg * xg + yg * yg)) * RAD,
    r: Math.sqrt(xg * xg + yg * yg + zg * zg),
  };
}

// ─── Ascendant Calculation ───
function calculateAscendant(d, lat, lon) {
  const eps = (23.4393 - 3.563e-7 * d) * DEG;
  const GMST0 = 18.697374558 + 24.06570982441908 * d;
  const LST = rev(GMST0 * 15 + lon);
  const LSTr = LST * DEG;
  const latr = lat * DEG;
  const asc = Math.atan2(
    Math.cos(LSTr),
    -(Math.sin(LSTr) * Math.cos(eps) + Math.tan(latr) * Math.sin(eps))
  );
  return rev(asc * RAD);
}

// ─── Calculate Full Natal Chart ───
export function calculateNatalChart(birthDate, birthTime, birthLocation) {
  const { date, lat, lon, birthTimeUnknown } = parseBirthData(birthDate, birthTime, birthLocation);
  const d = dayNumber(date);
  const sun = sunPos(d);
  const moon = moonPos(d);
  const mercury = geocentricPlanet(d, PLANET_ELEMENTS.mercury);
  const venus = geocentricPlanet(d, PLANET_ELEMENTS.venus);
  const mars = geocentricPlanet(d, PLANET_ELEMENTS.mars);
  const jupiter = geocentricPlanet(d, PLANET_ELEMENTS.jupiter);
  const saturn = geocentricPlanet(d, PLANET_ELEMENTS.saturn);

  const planets = {
    sun: { sign: signFromLongitude(sun.lon), degrees: degreesInSign(sun.lon), longitude: sun.lon },
    moon: { sign: signFromLongitude(moon.lon), degrees: degreesInSign(moon.lon), longitude: moon.lon },
    mercury: { sign: signFromLongitude(mercury.lon), degrees: degreesInSign(mercury.lon), longitude: mercury.lon },
    venus: { sign: signFromLongitude(venus.lon), degrees: degreesInSign(venus.lon), longitude: venus.lon },
    mars: { sign: signFromLongitude(mars.lon), degrees: degreesInSign(mars.lon), longitude: mars.lon },
    jupiter: { sign: signFromLongitude(jupiter.lon), degrees: degreesInSign(jupiter.lon), longitude: jupiter.lon },
    saturn: { sign: signFromLongitude(saturn.lon), degrees: degreesInSign(saturn.lon), longitude: saturn.lon },
  };

  let ascendant = null;
  if (!birthTimeUnknown) {
    const ascLon = calculateAscendant(d, lat, lon);
    ascendant = { sign: signFromLongitude(ascLon), degrees: degreesInSign(ascLon), longitude: ascLon };
  }

  const firstHouseSign = ascendant ? ascendant.sign : planets.sun.sign;
  const firstHouseIndex = ZODIAC.indexOf(firstHouseSign);

  const houses = HOUSE_INFO.map((info, i) => {
    const signIndex = (firstHouseIndex + i) % 12;
    const sign = ZODIAC[signIndex];
    const planetsInHouse = Object.entries(planets)
      .filter(([, p]) => p.sign === sign)
      .map(([name]) => name);
    return { ...info, sign, planets: planetsInHouse };
  });

  return { planets, ascendant, houses, birthTimeUnknown, date };
}

// ─── Build Chart From Ephemeris Positions (LLM-provided) ───
export function buildChartFromPositions(positions, birthDate, birthTime, birthLocation) {
  const { date, lat, lon, birthTimeUnknown } = parseBirthData(birthDate, birthTime, birthLocation);
  const d = dayNumber(date);

  const planets = {};
  for (const [name, lon] of Object.entries(positions)) {
    if (typeof lon !== 'number' || isNaN(lon)) continue;
    const normLon = rev(lon);
    planets[name] = {
      sign: signFromLongitude(normLon),
      degrees: degreesInSign(normLon),
      longitude: normLon,
    };
  }

  let ascendant = null;
  if (!birthTimeUnknown) {
    const ascLon = calculateAscendant(d, lat, lon);
    ascendant = { sign: signFromLongitude(ascLon), degrees: degreesInSign(ascLon), longitude: ascLon };
  }

  const firstHouseSign = ascendant ? ascendant.sign : planets.sun?.sign || 'aries';
  const firstHouseIndex = ZODIAC.indexOf(firstHouseSign);

  const houses = HOUSE_INFO.map((info, i) => {
    const signIndex = (firstHouseIndex + i) % 12;
    const sign = ZODIAC[signIndex];
    const planetsInHouse = Object.entries(planets)
      .filter(([, p]) => p.sign === sign)
      .map(([name]) => name);
    return { ...info, sign, planets: planetsInHouse };
  });

  return { planets, ascendant, houses, birthTimeUnknown, date };
}

// ─── Calculate Current Transits ───
export function calculateCurrentTransits(natalChart) {
  const d = dayNumber(new Date());
  const transitSun = sunPos(d);
  const transitMoon = moonPos(d);
  const transitMercury = geocentricPlanet(d, PLANET_ELEMENTS.mercury);
  const transitVenus = geocentricPlanet(d, PLANET_ELEMENTS.venus);
  const transitMars = geocentricPlanet(d, PLANET_ELEMENTS.mars);
  const transitJupiter = geocentricPlanet(d, PLANET_ELEMENTS.jupiter);
  const transitSaturn = geocentricPlanet(d, PLANET_ELEMENTS.saturn);

  const transits = {
    sun: { sign: signFromLongitude(transitSun.lon), degrees: degreesInSign(transitSun.lon), longitude: transitSun.lon },
    moon: { sign: signFromLongitude(transitMoon.lon), degrees: degreesInSign(transitMoon.lon), longitude: transitMoon.lon },
    mercury: { sign: signFromLongitude(transitMercury.lon), degrees: degreesInSign(transitMercury.lon), longitude: transitMercury.lon },
    venus: { sign: signFromLongitude(transitVenus.lon), degrees: degreesInSign(transitVenus.lon), longitude: transitVenus.lon },
    mars: { sign: signFromLongitude(transitMars.lon), degrees: degreesInSign(transitMars.lon), longitude: transitMars.lon },
    jupiter: { sign: signFromLongitude(transitJupiter.lon), degrees: degreesInSign(transitJupiter.lon), longitude: transitJupiter.lon },
    saturn: { sign: signFromLongitude(transitSaturn.lon), degrees: degreesInSign(transitSaturn.lon), longitude: transitSaturn.lon },
  };

  const ASPECT_ORBS = {
    conjunction: { angle: 0, orb: 8 },
    opposition: { angle: 180, orb: 8 },
    trine: { angle: 120, orb: 7 },
    square: { angle: 90, orb: 7 },
    sextile: { angle: 60, orb: 6 },
  };

  const aspects = [];
  for (const [planetName, natalPlanet] of Object.entries(natalChart.planets)) {
    const transitPlanet = transits[planetName];
    if (!transitPlanet) continue;
    const diff = Math.abs(rev(transitPlanet.longitude - natalPlanet.longitude + 180) - 180);
    for (const [aspectName, aspectData] of Object.entries(ASPECT_ORBS)) {
      const orb = Math.abs(diff - aspectData.angle);
      if (orb <= aspectData.orb) {
        aspects.push({
          planet: planetName,
          aspect: aspectName,
          natalSign: natalPlanet.sign,
          transitSign: transitPlanet.sign,
          orb: orb.toFixed(1),
        });
      }
    }
  }

  return { transits, aspects };
}

// ─── Calculate Synastry Between Two Charts ───
export function calculateSynastry(chart1, chart2) {
  const PERSONAL_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  const ASPECT_TYPES = {
    conjunction: { angle: 0, orb: 8 },
    opposition: { angle: 180, orb: 8 },
    square: { angle: 90, orb: 7 },
    trine: { angle: 120, orb: 7 },
    sextile: { angle: 60, orb: 6 },
  };

  const aspects = [];
  for (const p1 of PERSONAL_PLANETS) {
    for (const p2 of PERSONAL_PLANETS) {
      const planet1 = chart1.planets[p1];
      const planet2 = chart2.planets[p2];
      if (!planet1 || !planet2) continue;
      const diff = Math.abs(rev(planet1.longitude - planet2.longitude + 180) - 180);
      for (const [aspectName, aspectData] of Object.entries(ASPECT_TYPES)) {
        const orb = Math.abs(diff - aspectData.angle);
        if (orb <= aspectData.orb) {
          aspects.push({
            planet1: p1, planet2: p2, aspect: aspectName,
            orb: orb.toFixed(1), sign1: planet1.sign, sign2: planet2.sign,
          });
        }
      }
    }
  }

  const hardAspects = aspects.filter(a =>
    a.aspect === 'conjunction' || a.aspect === 'square' || a.aspect === 'opposition'
  );

  return { aspects, hardAspects };
}