import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = 'violet', onClick, animate = true }) {
  const glowClass = {
    violet: 'hover:glow-violet',
    teal: 'hover:glow-teal',
    gold: 'hover:glow-gold',
    pink: 'hover:glow-pink',
    none: '',
  }[glow] || '';

  const Wrapper = animate ? motion.div : 'div';
  const animProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  } : {};

  return (
    <Wrapper
      {...animProps}
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 transition-all duration-500 ${glowClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </Wrapper>
  );
}