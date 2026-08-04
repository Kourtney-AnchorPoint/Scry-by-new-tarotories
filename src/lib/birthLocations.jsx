export const BIRTH_LOCATION_SUGGESTIONS = [
  'Oklahoma City, Oklahoma, United States',
  'Moore, Oklahoma, United States',
  'Norman, Oklahoma, United States',
  'Tulsa, Oklahoma, United States',
  'Edmond, Oklahoma, United States',
  'Lawton, Oklahoma, United States',
  'Dallas, Texas, United States',
  'Fort Worth, Texas, United States',
  'Houston, Texas, United States',
  'Austin, Texas, United States',
  'Chicago, Illinois, United States',
  'New York, New York, United States',
  'Los Angeles, California, United States',
  'Phoenix, Arizona, United States',
  'Denver, Colorado, United States',
  'Atlanta, Georgia, United States',
  'Miami, Florida, United States',
  'Seattle, Washington, United States',
  'London, England, United Kingdom',
  'Paris, France',
  'Toronto, Ontario, Canada',
  'Vancouver, British Columbia, Canada',
  'Mexico City, Mexico',
  'Berlin, Germany',
  'Madrid, Spain',
  'Rome, Italy',
  'Dublin, Ireland',
  'Sydney, New South Wales, Australia',
  'Tokyo, Japan',
  'Mumbai, Maharashtra, India',
];

const US_STATE_MAP = {
  al: 'Alabama', ak: 'Alaska', az: 'Arizona', ar: 'Arkansas', ca: 'California', co: 'Colorado',
  ct: 'Connecticut', de: 'Delaware', fl: 'Florida', ga: 'Georgia', hi: 'Hawaii', id: 'Idaho',
  il: 'Illinois', in: 'Indiana', ia: 'Iowa', ks: 'Kansas', ky: 'Kentucky', la: 'Louisiana',
  me: 'Maine', md: 'Maryland', ma: 'Massachusetts', mi: 'Michigan', mn: 'Minnesota',
  ms: 'Mississippi', mo: 'Missouri', mt: 'Montana', ne: 'Nebraska', nv: 'Nevada',
  nh: 'New Hampshire', nj: 'New Jersey', nm: 'New Mexico', ny: 'New York',
  nc: 'North Carolina', nd: 'North Dakota', oh: 'Ohio', ok: 'Oklahoma', or: 'Oregon',
  pa: 'Pennsylvania', ri: 'Rhode Island', sc: 'South Carolina', sd: 'South Dakota',
  tn: 'Tennessee', tx: 'Texas', ut: 'Utah', vt: 'Vermont', va: 'Virginia',
  wa: 'Washington', wv: 'West Virginia', wi: 'Wisconsin', wy: 'Wyoming',
};

function titleCase(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function normalizeBirthLocation(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';

  const exact = BIRTH_LOCATION_SUGGESTIONS.find(
    (suggestion) => suggestion.toLowerCase() === raw.toLowerCase()
  );
  if (exact) return exact;

  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 1) return titleCase(parts[0]);

  const normalized = parts.map((part, index) => {
    const key = part.toLowerCase();
    if (index === 1 && US_STATE_MAP[key]) return US_STATE_MAP[key];
    if (key === 'usa' || key === 'us' || key === 'u.s.' || key === 'u.s.a.') return 'United States';
    return titleCase(part);
  });

  return normalized.join(', ');
}

export function BirthLocationDatalist({ id = 'birth-location-options' }) {
  return (
    <datalist id={id}>
      {BIRTH_LOCATION_SUGGESTIONS.map((location) => (
        <option key={location} value={location} />
      ))}
    </datalist>
  );
}
