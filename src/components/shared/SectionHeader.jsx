import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeader({ icon: Icon, title, subtitle, color = 'violet' }) {
  const colorMap = {
    violet: 'text-violet',
    teal: 'text-teal',
    gold: 'text-gold',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      {Icon && (
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-4 ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}