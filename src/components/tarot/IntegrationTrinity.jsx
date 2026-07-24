import React from 'react';
import { Music, Activity, Key } from 'lucide-react';

export default function IntegrationTrinity({ trinity }) {
  if (!trinity) return null;

  const cards = [
    {
      icon: Music,
      label: 'Sonic Alignment',
      value: trinity.sonic_alignment,
      border: 'border-teal/20',
      bg: 'bg-teal/5',
      text: 'text-teal',
    },
    {
      icon: Activity,
      label: 'Somatic Integration',
      value: trinity.somatic_integration,
      border: 'border-violet/20',
      bg: 'bg-violet/5',
      text: 'text-violet',
    },
    {
      icon: Key,
      label: 'Shadow Key',
      value: trinity.shadow_key,
      border: 'border-gold/20',
      bg: 'bg-gold/5',
      text: 'text-gold',
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-heading text-base font-semibold text-center text-foreground">The Integration Trinity</h4>
      <div className="grid gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-2xl p-4 border ${card.border} ${card.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${card.text}`} />
                <h5 className={`font-heading text-sm font-semibold ${card.text}`}>{card.label}</h5>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}