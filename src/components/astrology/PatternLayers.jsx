import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Mountain, Heart } from 'lucide-react';

const SECTIONS = [
  { key: 'core', title: 'Your Core', icon: Eye, color: 'text-gold', border: 'border-gold/20' },
  { key: 'development', title: 'Your Development', icon: Mountain, color: 'text-teal', border: 'border-teal/20' },
  { key: 'relationships', title: 'Your Relationships', icon: Heart, color: 'text-pink', border: 'border-pink/20' },
];

export default function PatternLayers({ layers }) {
  if (!layers) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-sm font-semibold text-violet uppercase tracking-wider">Your Pattern</h2>
      {SECTIONS.map((section, i) => (
        <motion.div
          key={section.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`glass-card rounded-2xl p-5 ${section.border}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <section.icon className={`w-4 h-4 ${section.color}`} />
            <h3 className={`font-heading text-sm font-semibold ${section.color}`}>{section.title}</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{layers[section.key]}</p>
        </motion.div>
      ))}
    </div>
  );
}