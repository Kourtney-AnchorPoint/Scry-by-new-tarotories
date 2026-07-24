import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Radar, ArrowRight } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTransits } from '@/hooks/useTransits';

export default function DailyTransitCard() {
  const { profile } = useUserProfile();
  const { data, loading } = useTransits(profile);

  if (!profile?.birth_date) return null;

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 mb-4 border border-gold/20">
        <p className="text-xs text-muted-foreground animate-pulse text-center">Reading today's sky against your chart...</p>
      </div>
    );
  }

  const top = data?.phases?.[0];
  if (!top) return null;

  const teaser = (top.meaning || '').split('\n')[0].split('. ').slice(0, 2).join('. ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Link to="/astrology" className="glass-card rounded-2xl p-5 mb-4 border border-gold/30 glow-gold block hover:border-gold/50 transition-colors">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-gold" />
            <h3 className="font-heading text-sm font-semibold text-gold">Today's Biggest Energy</h3>
          </div>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            top.applying ? 'text-gold border-gold/30 bg-gold/5' : 'text-teal border-teal/30 bg-teal/5'
          }`}>
            {top.applying ? 'Intensifying' : 'Settling'}
          </span>
        </div>
        <p className="text-base font-semibold text-foreground mb-2">{top.name}</p>
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${top.progress}%` }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-violet to-teal"
          />
        </div>
        {teaser && <p className="text-xs text-muted-foreground leading-relaxed mb-2">{teaser}.</p>}
        <span className="text-xs text-gold inline-flex items-center gap-1">
          See everything moving through you right now <ArrowRight className="w-3 h-3" />
        </span>
      </Link>
    </motion.div>
  );
}