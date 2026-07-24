import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Trash2, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionHeader from '@/components/shared/SectionHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const SPREAD_LABELS = {
  single: 'Single Card',
  universe_mic: 'Universe Has the Mic',
  three_card: 'Three Card',
  heart_recovery: 'Heart Recovery',
  boundary_builder: 'Boundary Builder',
  their_perspective: 'Their Perspective',
  what_are_they_thinking: 'Their Perspective',
  celtic_cross: 'Celtic Cross',
  shadow_work: 'Shadow Work',
};

function CardPill({ card }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${
      card.reversed
        ? 'bg-destructive/10 border-destructive/30 text-destructive'
        : 'bg-violet/10 border-violet/30 text-violet-light'
    }`}>
      <span>{card.name}</span>
      {card.reversed && <span className="opacity-60">(R)</span>}
    </span>
  );
}

function TarotReadingEntry({ reading, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const cards = reading.cards_drawn || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-xl p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-violet/20 shrink-0">
            <Sparkles className="w-4 h-4 text-violet" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-heading text-sm font-semibold">{reading.title}</h3>
              {reading.spread_type && (
                <Badge variant="secondary" className="text-xs bg-violet/10 text-violet-light border-0">
                  {SPREAD_LABELS[reading.spread_type] || reading.spread_type}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {format(new Date(reading.created_date), 'MMM d, yyyy · h:mm a')}
            </p>
            {/* Cards drawn pills */}
            {cards.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {cards.map((card, i) => (
                  <CardPill key={i} card={card} />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(reading.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded: full AI interpretation */}
      <AnimatePresence>
        {expanded && reading.reading_text && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
              {/* Card positions if available */}
              {cards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cards.map((card, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-0.5">{card.position || `Card ${i + 1}`}</p>
                      <p className="text-sm font-medium text-foreground">
                        {card.name}{card.reversed ? ' (Reversed)' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-primary mb-2">AI Interpretation</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {reading.reading_text}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TarotHistory() {
  const queryClient = useQueryClient();

  const { data: readings, isLoading } = useQuery({
    queryKey: ['tarotReadings'],
    queryFn: async () => {
      const me = await base44.auth.me();
      return base44.entities.Reading.filter({ type: 'tarot', created_by: me.email }, '-created_date', 50);
    },
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Reading.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarotReadings'] }),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader
        icon={Sparkles}
        title="Tarot History"
        subtitle="Revisit your past readings and the wisdom the cards revealed"
        color="violet"
      />

      {isLoading ? (
        <LoadingSpinner message="Loading your readings..." />
      ) : readings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No tarot readings yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1 mb-6">Complete a reading to see it here</p>
          <Link to="/tarot">
            <Button className="gap-2 bg-gradient-to-r from-violet to-violet-dark text-white hover:opacity-90">
              <RotateCcw className="w-4 h-4" />
              Start a Reading
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-4">{readings.length} reading{readings.length !== 1 ? 's' : ''} total</p>
          <AnimatePresence>
            {readings.map(reading => (
              <TarotReadingEntry
                key={reading.id}
                reading={reading}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}