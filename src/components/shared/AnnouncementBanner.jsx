import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBanner() {
  return (
    <div className="relative z-40 bg-gradient-to-r from-violet/25 via-gold/20 to-teal/25 border-b border-gold/30">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
        <Sparkles className="w-3.5 h-3.5 text-gold shrink-0 animate-twinkle" />
        <p className="text-xs sm:text-sm font-medium text-foreground">
          <span className="font-heading font-semibold text-gold">Coming Soon — New Update!</span>{' '}
          Full app rebuild in progress.
        </p>
      </div>
    </div>
  );
}