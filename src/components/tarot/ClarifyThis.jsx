import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { MAJOR_ARCANA } from '@/lib/tarotData';

export default function ClarifyThis({ drawnCards, spreadPositions }) {
  const [clarifiers, setClarifiers] = useState([]);
  const [loading, setLoading] = useState(false);

  const drawClarifier = async () => {
    setLoading(true);
    const usedNames = [...drawnCards.map(c => c.name), ...clarifiers.map(c => c.name)];
    const available = MAJOR_ARCANA.filter(c => !usedNames.includes(c.name));
    const pool = available.length > 0 ? available : MAJOR_ARCANA;
    const drawn = pool[Math.floor(Math.random() * pool.length)];
    const isReversed = Math.random() > 0.7;
    const clarifier = { ...drawn, isReversed };

    const originalCards = drawnCards.map((c, i) =>
      `${spreadPositions[i] || 'Card'}: ${c.name}${c.isReversed ? ' (Reversed)' : ''}`
    ).join(', ');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `A tarot reading was done with these cards: ${originalCards}.

A clarifying card was drawn: ${clarifier.name}${clarifier.isReversed ? ' (Reversed)' : ''}.

In 2-3 sentences, explain the direct connection between the clarifying card and the original reading. How does this card shed light on or reframe what came before? Be specific and direct. Write in second person ("you").`,
      response_json_schema: {
        type: 'object',
        properties: {
          connection: { type: 'string' },
        }
      }
    });

    const response = result?.response ? result.response : result;
    setClarifiers(prev => [...prev, { ...clarifier, interpretation: response.connection }]);
    setLoading(false);
  };

  return (
    <div className="border border-violet/20 rounded-2xl p-5 bg-violet/5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-heading text-sm font-semibold text-violet">Need more clarity?</h4>
        <Button
          onClick={drawClarifier}
          disabled={loading}
          size="sm"
          className="gap-2 bg-gradient-to-r from-violet to-violet-dark text-white hover:opacity-90"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Drawing...' : '🔍 Clarify This'}
        </Button>
      </div>

      {clarifiers.map((c, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="flex-shrink-0">
            {c.image ? (
              <img src={c.image} alt={c.name} className={`w-12 h-16 object-cover rounded-lg ${c.isReversed ? 'rotate-180' : ''}`} />
            ) : (
              <div className="w-12 h-16 bg-secondary rounded-lg flex items-center justify-center">
                <p className="text-[10px] text-center text-muted-foreground px-1">{c.name}</p>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-heading font-semibold text-foreground">{c.name}{c.isReversed ? ' (Reversed)' : ''}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{c.interpretation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}