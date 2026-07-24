import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Home } from 'lucide-react';

function HouseCard({ house, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="font-heading text-sm font-semibold text-teal">{house.headline}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{house.meaning}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function HouseDeepDive({ houses }) {
  if (!houses || houses.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-4 h-4 text-teal" />
        <h2 className="font-heading text-sm font-semibold text-teal uppercase tracking-wider">
          Your 12 Houses — What They Mean For You
        </h2>
      </div>
      <div className="space-y-3">
        {houses.map((h, i) => (
          <HouseCard key={h.house || i} house={h} index={i} />
        ))}
      </div>
    </div>
  );
}