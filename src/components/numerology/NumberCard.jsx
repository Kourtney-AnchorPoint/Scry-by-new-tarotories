import React from 'react';

const COLOR_CLASSES = {
  pink: { border: 'border-pink/30', text: 'text-pink' },
  gold: { border: 'border-gold/30', text: 'text-gold' },
  teal: { border: 'border-teal/30', text: 'text-teal' },
  violet: { border: 'border-violet/30', text: 'text-violet' },
};

export default function NumberCard({ label, number, meaning, color = 'violet', hint }) {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.violet;
  return (
    <div className={`glass-card rounded-2xl p-5 text-center border ${c.border}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <span className={`text-3xl font-heading font-bold ${c.text}`}>{number}</span>
      {meaning?.title && <h4 className="font-heading text-xs font-semibold mt-1.5">{meaning.title}</h4>}
      {hint && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}