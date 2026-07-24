import React from 'react';

const PLANET_MEANINGS = {
  sun: 'your vitality and where life wants your focus',
  moon: 'your moods and emotional needs',
  mercury: 'your mind, words, and conversations',
  venus: 'love, money, and what feels good',
  mars: 'your drive, ambition, and temper',
  jupiter: 'luck, growth, and open doors',
  saturn: 'discipline, pressure, and hard-won lessons',
  uranus: 'sudden change and the urge to break free',
  neptune: 'dreams, intuition, and fog',
  pluto: 'deep transformation and power struggles',
};

const HOUSE_MEANINGS = {
  1: 'your identity and how you show up in the world',
  2: 'your money, security, and self-worth',
  3: 'communication, learning, and everyday life',
  4: 'home, family, and your roots',
  5: 'creativity, romance, and joy',
  6: 'work, health, and daily routines',
  7: 'partnerships and one-on-one bonds',
  8: 'intimacy, shared resources, and transformation',
  9: 'beliefs, travel, and the bigger picture',
  10: 'career and public reputation',
  11: 'friendships, community, and future dreams',
  12: 'rest, the subconscious, and quiet endings',
};

const ordinal = (n) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

export default function HouseTransitList({ houseTransits }) {
  if (!houseTransits?.length) return null;
  return (
    <div className="space-y-2 mb-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-heading">Where the planets are visiting you</p>
      {houseTransits.map(h => (
        <div key={h.planet} className="glass-card rounded-xl px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="capitalize font-semibold text-gold">{h.planet}</span>
            <span className="text-muted-foreground"> — the planet of {PLANET_MEANINGS[h.planet?.toLowerCase()] || 'its own energy'} — </span>
            is moving through your <span className="font-semibold">{ordinal(h.house)} house</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            That's the part of your life governing {HOUSE_MEANINGS[h.house] || 'this area of life'}. Expect its themes to feel louder than usual.
          </p>
        </div>
      ))}
    </div>
  );
}