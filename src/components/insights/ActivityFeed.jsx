import React from 'react';
import { Sparkles, Sun, Star, Hash, Zap, BookOpen } from 'lucide-react';
import moment from 'moment';

const TYPE_ICONS = {
  tarot: Sparkles,
  astrology: Sun,
  oracle: Star,
  numerology: Hash,
  cosmic_snapshot: Zap,
  journal: BookOpen,
};

export default function ActivityFeed({ items, userMap }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] || Sparkles;
        const who = userMap[item.created_by_id];
        return (
          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 border border-border/30">
            <div className="w-8 h-8 rounded-lg bg-violet/15 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {who ? (who.full_name || who.email) : 'Unknown user'}
                {who?.full_name && who?.email ? ` · ${who.email}` : ''}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{moment(item.created_date).fromNow()}</span>
          </div>
        );
      })}
    </div>
  );
}