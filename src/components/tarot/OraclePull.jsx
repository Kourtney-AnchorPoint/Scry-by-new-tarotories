import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { ORACLE_CARDS } from '@/lib/tarotData';

export default function OraclePull({ readingContext }) {
  const [oracleCard, setOracleCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pullOracle = async () => {
    setLoading(true);
    setError(null);
    const card = ORACLE_CARDS[Math.floor(Math.random() * ORACLE_CARDS.length)];

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `The user just completed a tarot reading. The core message was: "${readingContext}".

An oracle card was drawn: ${card.name}.
Keywords: ${card.keywords?.join(', ')}
Meaning: ${card.meaning}

In 2-3 sentences, connect this oracle card's energy directly to the tarot reading above. How does this oracle message deepen or clarify what the cards already said? Write in second person ("you"), warm and direct.`,
        response_json_schema: {
          type: 'object',
          properties: {
            connection: { type: 'string' },
          },
          required: ['connection'],
        },
      });

      setOracleCard({ ...card, interpretation: result.connection });
    } catch (err) {
      setError('The oracle is silent right now. Try again.');
      setOracleCard(card);
    }
    setLoading(false);
  };

  return (
    <div className="border border-teal/20 rounded-2xl p-5 bg-teal/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal" />
          <h4 className="font-heading text-sm font-semibold text-teal">Oracle Clarity</h4>
        </div>
        {!oracleCard && (
          <Button
            onClick={pullOracle}
            disabled={loading}
            size="sm"
            className="gap-2 bg-gradient-to-r from-teal to-teal-dark text-white hover:opacity-90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Pulling...' : 'Pull an Oracle Card'}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {oracleCard && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 items-start"
          >
            <div className="flex-shrink-0">
              {oracleCard.image && (
                <img
                  src={oracleCard.image}
                  alt={oracleCard.name}
                  className="w-16 h-24 object-cover rounded-lg border border-teal/30"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-heading font-semibold text-foreground">{oracleCard.name}</p>
              {oracleCard.interpretation ? (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{oracleCard.interpretation}</p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{oracleCard.meaning}</p>
              )}
              <Button
                onClick={pullOracle}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-teal hover:text-teal-light gap-1"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Pull Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}