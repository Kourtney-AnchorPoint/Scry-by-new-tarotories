import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Crown, Sparkles, CalendarDays, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionHeader from '@/components/shared/SectionHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ActivityFeed from '@/components/insights/ActivityFeed';
import EventPulse from '@/components/insights/EventPulse';

export default function Insights() {
  const [state, setState] = useState({ loading: true, denied: false });
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      let me;
      try { me = await base44.auth.me(); } catch { me = null; }
      if (!me || me.role !== 'admin') {
        setState({ loading: false, denied: true });
        return;
      }
      const [users, readings, journals, profiles, events] = await Promise.all([
        base44.entities.User.list('-created_date', 200),
        base44.entities.Reading.list('-created_date', 200),
        base44.entities.JournalEntry.list('-created_date', 100),
        base44.entities.UserProfile.list('-created_date', 200),
        base44.entities.AppEvent.list('-created_date', 1000).catch(() => []),
      ]);

      const userMap = {};
      users.forEach(u => { userMap[u.id] = u; });

      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const readingsThisWeek = readings.filter(r => new Date(r.created_date).getTime() > weekAgo).length;
      const premiumCount = profiles.filter(p => p.is_premium).length;

      const byType = {};
      readings.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });

      const feed = [
        ...readings.map(r => ({ id: r.id, type: r.type, title: r.title, created_date: r.created_date, created_by_id: r.created_by_id })),
        ...journals.map(j => ({ id: j.id, type: 'journal', title: j.title || 'Journal entry', created_date: j.created_date, created_by_id: j.created_by_id })),
      ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 40);

      setData({ users, userMap, readings, readingsThisWeek, premiumCount, byType, feed, events });
      setState({ loading: false, denied: false });
    }
    load();
  }, []);

  if (state.loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12"><LoadingSpinner message="Gathering the records..." /></div>;
  }

  if (state.denied) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">This chamber is for admins only.</p>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'Total Users', value: data.users.length, color: 'text-violet' },
    { icon: Crown, label: 'Premium Members', value: data.premiumCount, color: 'text-gold' },
    { icon: Sparkles, label: 'Saved Readings', value: data.readings.length, color: 'text-teal' },
    { icon: CalendarDays, label: 'Readings This Week', value: data.readingsThisWeek, color: 'text-pink' },
  ];

  const maxType = Math.max(1, ...Object.values(data.byType));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader icon={BarChart3} title="Insights" subtitle="Who's here and what they're seeking — your app's living pulse" color="violet" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => {
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

      <EventPulse events={data.events} />

      {Object.keys(data.byType).length > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="font-heading text-sm font-semibold text-violet uppercase tracking-wider mb-4">Readings by Type</h3>
          <div className="space-y-3">
            {Object.entries(data.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground capitalize">{type.replace('_', ' ')}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet to-teal" style={{ width: `${(count / maxType) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading text-sm font-semibold text-teal uppercase tracking-wider mb-4">Recent Activity</h3>
        <ActivityFeed items={data.feed} userMap={data.userMap} />
      </div>
    </div>
  );
}