import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

export default function SongCard({ song, delay = 0 }) {
  if (!song) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-5 border border-pink/20"
    >
      <div className="flex items-center gap-2 mb-2">
        <Music className="w-4 h-4 text-pink" />
        <h3 className="font-heading text-sm font-semibold text-pink">Song of the Day</h3>
      </div>
      <p className="text-base font-semibold text-foreground mb-0.5">{song.title}</p>
      <p className="text-xs text-muted-foreground mb-2">{song.artist}</p>
      <p className="text-xs text-foreground leading-relaxed italic">{song.why}</p>
    </motion.div>
  );
}