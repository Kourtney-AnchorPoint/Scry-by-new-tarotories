import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, DollarSign, User, Moon, Users, Baby, PawPrint, Sparkles, Target } from 'lucide-react';
import { READING_CATEGORIES } from '@/lib/decks';

const ICONS = {
  general: Sparkles,
  love: Heart,
  career: Briefcase,
  money: DollarSign,
  self: User,
  shadow: Moon,
  family: Users,
  children: Baby,
  pets: PawPrint,
  manifestation: Target,
};

export default function ReadingCategorySelector({ selectedCategory, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm font-semibold text-center text-muted-foreground uppercase tracking-wider mb-4">
        Reading Focus
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {READING_CATEGORIES.map((cat, i) => {
          const Icon = ICONS[cat.key] || Sparkles;
          const isSelected = selectedCategory === cat.key;
          return (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(cat.key)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all duration-300 border ${
                isSelected
                  ? 'bg-violet/20 border-violet/50 text-foreground glow-violet'
                  : 'glass-card border-border/30 hover:border-violet/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-violet' : ''}`} />
              <div>
                <p className="text-xs font-heading font-semibold">{cat.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{cat.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}