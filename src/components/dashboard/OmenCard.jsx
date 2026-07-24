import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, Flame } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const STREAK_KEY = 'omen_streak';

function readStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}'); } catch { return {}; }
}

export default function OmenCard({ omen, delay = 0 }) {
  const [streak, setStreak] = useState(readStreak);
  const todayKey = new Date().toDateString();
  const confirmedToday = streak.lastDate === todayKey;

  const handleConfirm = () => {
    if (confirmedToday) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const next = {
      lastDate: todayKey,
      count: streak.lastDate === yesterday.toDateString() ? (streak.count || 0) + 1 : 1,
    };
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(next)); } catch {}
    setStreak(next);
    trackEvent('omen_confirmed', { sign: omen?.sign || '', streak: next.count });
  };

  if (!omen) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-5 border border-gold/20"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gold" />
          <h3 className="font-heading text-sm font-semibold text-gold">Visual Omen of the Day</h3>
        </div>
        {(streak.count || 0) > 0 && (
          <span className="flex items-center gap-1 text-xs text-gold">
            <Flame className="w-3 h-3" />{streak.count}
          </span>
        )}
      </div>
      <p className="text-base font-semibold text-foreground mb-1">Watch for: {omen.sign}</p>
      <p className="text-xs text-muted-foreground leading-relaxed italic mb-3">{omen.message}</p>
      {confirmedToday ? (
        <div className="flex items-center gap-1.5 text-xs text-teal font-medium">
          <Check className="w-3.5 h-3.5" /> Confirmed — the universe sees you ✦
        </div>
      ) : (
        <button
          onClick={handleConfirm}
          className="w-full py-2 rounded-xl border border-gold/30 bg-gold/10 text-gold text-xs font-semibold hover:bg-gold/20 transition-colors"
        >
          ✦ I saw it!
        </button>
      )}
    </motion.div>
  );
}