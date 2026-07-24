import React, { useState } from 'react';
import { MAJOR_ARCANA } from '@/lib/tarotData';
import { Check, RotateCcw, Flame, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CardSelectGrid({ positions, onConfirm }) {
  const [selected, setSelected] = useState(Array(positions.length).fill(null));
  const [activeSlot, setActiveSlot] = useState(0);
  const [isReversed, setIsReversed] = useState(Array(positions.length).fill(false));
  const [search, setSearch] = useState('');

  const handleCardPick = (card) => {
    if (activeSlot >= positions.length) return;
    const newSelected = [...selected];
    newSelected[activeSlot] = card;
    setSelected(newSelected);
    if (activeSlot < positions.length - 1) setActiveSlot(activeSlot + 1);
  };

  const toggleReversed = (i) => {
    const r = [...isReversed];
    r[i] = !r[i];
    setIsReversed(r);
  };

  const allChosen = selected.every(Boolean);

  const handleConfirm = () => {
    const cards = selected.map((card, i) => ({ ...card, isReversed: isReversed[i] }));
    onConfirm(cards);
  };

  return (
    <div className="space-y-5">
      {/* Slots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {positions.map((pos, i) => (
          <button
            key={i}
            onClick={() => setActiveSlot(i)}
            className={`px-3 py-2 rounded-xl text-xs border transition-all ${
              activeSlot === i
                ? 'bg-gold/20 border-gold text-gold'
                : selected[i]
                ? 'bg-teal/10 border-teal/40 text-teal'
                : 'bg-secondary/30 border-border/40 text-muted-foreground'
            }`}
          >
            {selected[i] ? (
              <span className="flex items-center gap-1"><Check className="w-3 h-3" />{selected[i].name}</span>
            ) : (
              pos
            )}
          </button>
        ))}
      </div>

      {/* Reversed toggles for selected */}
      {selected.some(Boolean) && (
        <div className="flex flex-wrap gap-2 justify-center">
          {selected.map((card, i) => card && (
            <button
              key={i}
              onClick={() => toggleReversed(i)}
              className={`px-2 py-1 rounded-lg text-xs border transition-all ${
                isReversed[i] ? 'bg-destructive/10 border-destructive/40 text-destructive' : 'bg-secondary/20 border-border/30 text-muted-foreground'
              }`}
            >
              {card.name} {isReversed[i] ? '↓ Reversed' : '↑ Upright'}
            </button>
          ))}
        </div>
      )}

      {/* Search + Card grid */}
      <p className="text-xs text-muted-foreground text-center">Selecting: <span className="text-gold">{positions[activeSlot]}</span></p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search card name..."
          className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
        {MAJOR_ARCANA.filter(card => card.name.toLowerCase().includes(search.toLowerCase())).map(card => {
          const alreadyPicked = selected.some(s => s?.id === card.id);
          return (
            <button
              key={card.id}
              onClick={() => { if (!alreadyPicked) { handleCardPick(card); setSearch(''); } }}
              disabled={alreadyPicked}
              className={`text-xs rounded-xl px-2 py-2.5 border transition-all text-left ${
                alreadyPicked
                  ? 'opacity-30 cursor-not-allowed bg-secondary/10 border-border/20'
                  : 'bg-secondary/30 border-border/40 hover:border-violet/50 hover:bg-violet/10 text-foreground'
              }`}
            >
              {card.name}
            </button>
          );
        })}
      </div>

      {allChosen && (
        <div className="flex justify-center gap-3">
          <Button
            onClick={handleConfirm}
            className="bg-gradient-to-r from-gold to-violet text-white hover:opacity-90 gap-2"
          >
            <Flame className="w-4 h-4" />
            Read My Altar Cards
          </Button>
          <Button onClick={() => { setSelected(Array(positions.length).fill(null)); setActiveSlot(0); }} variant="outline" className="gap-2 border-border/50">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}