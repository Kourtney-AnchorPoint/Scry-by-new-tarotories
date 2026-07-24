import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Ghost, UserCheck, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function EventPulse({ events }) {
  if (!events?.length) {
    return (
      <div className="glass-card rounded-2xl p-5 mb-6 text-center">
        <Activity className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No events captured yet — the pulse begins as visitors arrive.</p>
      </div>
    );
  }

  const sessions = new Set(events.map(e => e.session_id).filter(Boolean));
  const anonSessions = new Set(events.filter(e => e.is_anonymous).map(e => e.session_id).filter(Boolean));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const eventsThisWeek = events.filter(e => new Date(e.created_date).getTime() > weekAgo).length;

  const byName = {};
  events.forEach(e => { byName[e.event_name] = (byName[e.event_name] || 0) + 1; });
  const topEvents = Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxCount = Math.max(1, ...topEvents.map(([, c]) => c));

  const visitorStats = [
    { icon: Eye, label: 'Unique Visitors', value: sessions.size, color: 'text-teal' },
    { icon: Ghost, label: 'Anonymous', value: anonSessions.size, color: 'text-violet' },
    { icon: UserCheck, label: 'Signed In', value: sessions.size - anonSessions.size, color: 'text-gold' },
    { icon: Activity, label: 'Events (7 days)', value: eventsThisWeek, color: 'text-pink' },
  ];

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {visitorStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card rounded-2xl p-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading text-sm font-semibold text-teal uppercase tracking-wider mb-4">Top Events</h3>
        <div className="space-y-3">
          {topEvents.map(([name, count]) => (
            <div key={name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground">{name.replace(/_/g, ' ')}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal to-violet" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading text-sm font-semibold text-pink uppercase tracking-wider mb-4">Live Event Pulse</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {events.slice(0, 50).map(e => (
            <div key={e.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                {e.is_anonymous
                  ? <Ghost className="w-3.5 h-3.5 text-violet flex-shrink-0" />
                  : <UserCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{e.event_name.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {e.is_anonymous ? 'Anonymous visitor' : e.user_email}{e.path ? ` · ${e.path}` : ''}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                {formatDistanceToNow(new Date(e.created_date), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}