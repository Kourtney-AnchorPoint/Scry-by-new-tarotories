import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CosmicEnergyCard({ icon: Icon, title, subtitle, color, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const colorStyles = {
    violet: 'from-violet/20 to-violet/5 text-violet border-violet/30',
    teal: 'from-teal/20 to-teal/5 text-teal border-teal/30',
    gold: 'from-gold/20 to-gold/5 text-gold border-gold/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`rounded-2xl p-5 bg-gradient-to-br ${colorStyles[color]} border backdrop-blur-lg`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-start gap-3"
      >
        <div className="p-2 rounded-lg bg-background/50 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{title}</h3>
          <p className={`text-xs text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
            {subtitle}
          </p>
        </div>
        <div className="shrink-0 mt-0.5 ml-2">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>
    </motion.div>
  );
}