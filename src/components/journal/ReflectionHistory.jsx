import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const MOOD_MAP = {
  grateful: { emoji: '🙏', label: 'Grateful' },
  hopeful: { emoji: '✨', label: 'Hopeful' },
  peaceful: { emoji: '🌿', label: 'Peaceful' },
  energized: { emoji: '⚡', label: 'Energized' },
  reflective: { emoji: '🌙', label: 'Reflective' },
  confused: { emoji: '🌀', label: 'Confused' },
  heavy: { emoji: '🌧️', label: 'Heavy' },
  unsettled: { emoji: '🔥', label: 'Unsettled' },
};

function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const mood = entry.mood ? MOOD_MAP[entry.mood] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-xl p-4 sm:p-5 border border-border/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {mood && (
              <span className="text-sm">{mood.emoji}</span>
            )}
            <h3 className="font-heading text-sm font-semibold truncate">
              {entry.title || format(new Date(entry.created_date), 'MMMM d, yyyy')}
            </h3>
            {mood && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-violet/10 border border-violet/20 text-violet/80">
                {mood.label}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(entry.created_date), 'MMM d, yyyy · h:mm a')}
          </p>
          {!expanded && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {entry.content}
            </p>
          )}
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
            onClick={() => onDelete(entry.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                {entry.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ReflectionHistory({ entries, onDelete, isLoading }) {
  if (isLoading) return null;

  if (entries.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <BookHeart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No reflections yet</p>
        <p className="text-muted-foreground/50 text-xs mt-1">Write your first entry above to start tracking your growth</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
}