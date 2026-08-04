import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Crown, Sparkles, CalendarDays, Lock, ShieldCheck } from 'lucide-react';
import { auth } from '@/api/auth';
import { User, Reading, JournalEntry, UserProfile, AppEvent } from '@/api/entities';
import SectionHeader from '@/components/shared/SectionHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ActivityFeed from '@/components/insights/ActivityFeed';
import EventPulse from '@/components/insights/EventPulse';

export default function Insights() {
  const [state, setState] = useState({ loading: true, denied: false });
  const [data, setData] = useState(null);
  const [savingPremiumId, setSavingPremiumId] = useState(null);

  async function loadInsights() {
      let me;
      try { me = await auth.me(); } catch { me = null; }
      if (!me || me.role !== 'admin') {
        setState({ loading: false, denied: true });
        return;
      }
      const [users, readings, journals, profiles, events] = await Promise.all([
        User.list('-created_date', 200),
        Reading.list('-created_date', 200),
        JournalEntry.list('-created_date', 100),
        UserProfile.list('-created_date', 200),
        AppEvent.list('-created_date', 1000).catch(() => []),
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

      setData({ users, userMap, readings, readingsThisWeek, premiumCount, byType, feed, events, profiles });
      setState({ loading: false, denied: false });
  }

  useEffect(() => {
    loadInsights();
  }, []);

  async function setPremium(profile, isPremium) {
    setSavingPremiumId(profile.id);
    try {
      await UserProfile.update(profile.id, { is_premium: isPremium });
      await loadInsights();
    } finally {
      setSavingPremiumId(null);
    }
  }

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

      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-gold" />
          <h3 className="font-heading text-sm font-semibold text-gold uppercase tracking-wider">Premium Access</h3>
        </div>
        <div className="space-y-3">
          {data.profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No profiles yet.</p>
          ) : data.profiles.map((profile) => (
            <div key={profile.id} className="flex flex-col gap-3 rounded-xl border border-border/40 bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile.display_name || profile.full_name || profile.email || 'Unnamed user'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{profile.email || 'No email on profile'}</p>
                <p className={`mt-1 text-xs ${profile.is_premium ? 'text-gold' : 'text-muted-foreground'}`}>
                  {profile.is_premium ? 'Premium active' : 'Free account'}
                  {profile.stripe_customer_id ? ' via Stripe' : profile.is_premium ? ' manual grant' : ''}
                </p>
              </div>
              <button
                onClick={() => setPremium(profile, !profile.is_premium)}
                disabled={savingPremiumId === profile.id}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                  profile.is_premium
                    ? 'border border-border/50 text-muted-foreground hover:bg-secondary/50'
                    : 'border border-gold/40 bg-gold/10 text-gold hover:bg-gold/15'
                }`}
              >
                {savingPremiumId === profile.id
                  ? 'Saving...'
                  : profile.is_premium ? 'Revoke Premium' : 'Grant Premium'}
              </button>
            </div>
          ))}
        </div>
      </div>

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
