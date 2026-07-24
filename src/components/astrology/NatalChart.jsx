import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, ArrowUp } from 'lucide-react';
import { ZODIAC_SYMBOLS, PLANET_SYMBOLS, PLANET_NAMES, HOUSE_INFO } from '@/lib/astrologyEngine';
import { HOUSE_LIFE_AREAS, SIGN_STYLES } from '@/lib/astrologyText';

export default function NatalChart({ chartData }) {
  if (!chartData) return null;
  const { big_three, planets, houses, birthTimeUnknown } = chartData;

  const bigThree = [
    { icon: Sun, label: 'Sun', data: big_three?.sun, color: 'text-gold' },
    { icon: Moon, label: 'Moon', data: big_three?.moon, color: 'text-teal' },
    { icon: ArrowUp, label: 'Rising', data: big_three?.rising, color: 'text-violet' },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 glow-gold">
        <h2 className="font-heading text-base font-semibold text-gold mb-4 uppercase tracking-wider">The Big Three</h2>
        <div className="grid grid-cols-3 gap-4">
          {bigThree.map((item) => {
            const sign = item.data?.sign?.toLowerCase();
            return (
              <div key={item.label} className="text-center">
                <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-1`} />
                <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                <p className={`font-heading text-sm font-semibold capitalize ${item.color}`}>
                  {sign || (item.label === 'Rising' ? 'Unknown' : '—')}
                </p>
                {item.data?.degrees != null && (
                  <p className="text-xs text-muted-foreground/60">{Number(item.data.degrees).toFixed(1)}°</p>
                )}
              </div>
            );
          })}
        </div>
        {birthTimeUnknown && (
          <p className="text-xs text-muted-foreground/70 mt-3 text-center italic">
            Birth time unknown — Rising sign omitted. Add your birth time for a complete chart.
          </p>
        )}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-heading text-sm font-semibold text-violet mb-3 uppercase tracking-wider">Planetary Placements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(planets || {}).map(([key, p]) => {
            const sign = p.sign?.toLowerCase();
            return (
              <div key={key} className="flex items-center gap-2 bg-background/30 rounded-lg p-2">
                <span className="text-lg">{PLANET_SYMBOLS[key]}</span>
                <div>
                  <p className="text-xs text-muted-foreground">{PLANET_NAMES[key]}</p>
                  <p className="text-sm font-semibold capitalize">{sign} {ZODIAC_SYMBOLS[sign]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-sm font-semibold text-teal uppercase tracking-wider mb-4">The 12 Houses (Placidus — exact cusps)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(houses || []).map((house, i) => {
            const info = HOUSE_INFO[i] || {};
            const sign = house.sign?.toLowerCase();
            return (
              <motion.div
                key={house.number || i + 1}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                    <span className={`font-heading text-xs font-bold ${info.color || 'text-foreground'}`}>{house.number || i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className={`font-heading text-sm font-semibold ${info.color || 'text-foreground'}`}>{info.name || `House ${i + 1}`}</h3>
                      <span className="text-xs text-muted-foreground">{info.theme}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{ZODIAC_SYMBOLS[sign]}</span>
                      <p className="text-xs text-muted-foreground capitalize">{sign}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">
                      This house governs {HOUSE_LIFE_AREAS[house.number || i + 1]}.
                      {sign && SIGN_STYLES[sign] && (
                        <> With <span className="capitalize text-foreground/80">{sign}</span> here, you approach it {SIGN_STYLES[sign]}.</>
                      )}
                    </p>
                    {house.planets && house.planets.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {house.planets.map((p, idx) => {
                          const pk = typeof p === 'string' ? p.toLowerCase() : '';
                          return (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-xs bg-violet/10 border border-violet/20 text-violet">
                              {PLANET_SYMBOLS[pk]} {PLANET_NAMES[pk] || p}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}