import React from 'react';
import { Flame, Crown } from 'lucide-react';

export default function DigitalAltarToggle({ altarMode, onToggle, isPremium, onPaywallOpen }) {
  const handleClick = () => {
    if (!isPremium) {
      onPaywallOpen?.();
      return;
    }
    onToggle(!altarMode);
  };

  return (
    <div className="flex items-center justify-between glass-card rounded-2xl px-5 py-3 border border-gold/20 mb-5">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-gold" />
        <div>
          <p className="text-sm font-semibold text-foreground">Digital Altar</p>
          <p className="text-xs text-muted-foreground">Read your own physical cards</p>
        </div>
        {!isPremium && <Crown className="w-3.5 h-3.5 text-gold ml-1" />}
      </div>
      <button
        onClick={handleClick}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
          altarMode && isPremium ? 'bg-gold' : 'bg-secondary'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
          altarMode && isPremium ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}