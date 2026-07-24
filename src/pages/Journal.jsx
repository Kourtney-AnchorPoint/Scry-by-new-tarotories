import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Sun, Star, Hash, Trash2, ChevronDown, ChevronUp, PenLine, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionHeader from '@/components/shared/SectionHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReflectionEditor from '@/components/journal/ReflectionEditor';
import ReflectionHistory from '@/components/journal/ReflectionHistory';
import { format } from 'date-fns';
import { trackEvent } from '@/lib/analytics';

const typeConfig = {
  tarot: { icon: Sparkles, color: 'text-violet', bg: 'bg-violet/20', label: 'Tarot' },
  astrology: { icon: Sun, color: 'text-gold', bg: 'bg-gold/20', label: 'Astrology' },
  oracle: { icon: Star, color: 'text-teal', bg: 'bg-teal/20', label: 'Oracle' },
  numerology: { icon: Hash, color: 'text-violet', bg: 'bg-violet/20', label: 'Numerology' },
  cosmic_snapshot: { icon: Sparkles, color: 'text-gold', bg: 'bg-gold/20', label: 'Cosmic' },
};

function ReadingEntry({ reading, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[reading.type] || typeConfig.tarot;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-heading text-sm font-semibold truncate">{reading.title}</h3>
              <Badge variant="secondary" className={`text-xs ${config.bg} ${config.color} border-0`}>
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(reading.created_date), 'MMM d, yyyy · h:mm a')}
            </p>
            {reading.summary && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{reading.summary}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(reading.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && reading.reading_text && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{reading.reading_text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Journal() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('reflections');

  // Readings (saved from tarot/oracle/etc)
  const { data: readings = [], isLoading: readingsLoading } = useQuery({
    queryKey: ['readings'],
    queryFn: async () => {
      const me = await base44.auth.me();
      return base44.entities.Reading.filter({ created_by_id: me.id }, '-created_date', 50);
    },
    initialData: [],
  });

  const deleteReading = useMutation({
    mutationFn: (id) => base44.entities.Reading.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['readings'] });
      const previous = queryClient.getQueryData(['readings']);
      queryClient.setQueryData(['readings'], (old) => old?.filter(r => r.id !== id) ?? []);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['readings'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });

  // Personal journal reflections
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['journal_entries'],
    queryFn: async () => {
      const me = await base44.auth.me();
      return base44.entities.JournalEntry.filter({ created_by_id: me.id }, '-created_date', 100);
    },
    initialData: [],
  });

  const saveEntry = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: (_result, data) => {
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      trackEvent('journal_entry_created', { mood: data?.mood || '' });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['journal_entries'] });
      const previous = queryClient.getQueryData(['journal_entries']);
      queryClient.setQueryData(['journal_entries'], (old) => old?.filter(e => e.id !== id) ?? []);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['journal_entries'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
    },
  });

  const filtered = filter === 'all' ? readings : readings.filter(r => r.type === filter);

  // Build unique month keys from filtered readings (sorted newest first)
  const monthKeys = React.useMemo(() => {
    const set = new Set();
    filtered.forEach(r => {
      if (r.created_date) set.add(format(new Date(r.created_date), 'yyyy-MM'));
    });
    return Array.from(set).sort().reverse();
  }, [filtered]);

  const monthLabel = (key) => {
    const [y, m] = key.split('-');
    return format(new Date(Number(y), Number(m) - 1, 1), 'MMMM yyyy');
  };

  const filteredByMonth = monthFilter === 'all'
    ? filtered
    : filtered.filter(r => r.created_date && format(new Date(r.created_date), 'yyyy-MM') === monthFilter);

  // Group remaining readings by month for section headers
  const grouped = React.useMemo(() => {
    const groups = {};
    filteredByMonth.forEach(r => {
      const key = r.created_date ? format(new Date(r.created_date), 'yyyy-MM') : 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredByMonth]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'tarot', label: 'Tarot' },
    { key: 'astrology', label: 'Astrology' },
    { key: 'oracle', label: 'Oracle' },
    { key: 'numerology', label: 'Numerology' },
  ];

  const tabs = [
    { key: 'reflections', label: 'My Reflections', icon: PenLine },
    { key: 'readings', label: 'Saved Readings', icon: BookOpen },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader
        icon={BookOpen}
        title="Journal"
        subtitle="Track your reflections and revisit your cosmic readings"
        color="violet"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-7 p-1 bg-secondary/40 rounded-xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Reflections Tab */}
      {activeTab === 'reflections' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ReflectionEditor
            onSave={(data) => saveEntry.mutateAsync(data)}
            saving={saveEntry.isPending}
          />
          <div>
            <p className="text-xs text-muted-foreground mb-4">
              {entries.length > 0 ? `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}` : ''}
            </p>
            <ReflectionHistory
              entries={entries}
              onDelete={(id) => deleteEntry.mutate(id)}
              isLoading={entriesLoading}
            />
          </div>
        </motion.div>
      )}

      {/* Saved Readings Tab */}
      {activeTab === 'readings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filter === f.key
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {monthKeys.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setMonthFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  monthFilter === 'all'
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                All Months
              </button>
              {monthKeys.map(mk => (
                <button
                  key={mk}
                  onClick={() => setMonthFilter(mk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    monthFilter === mk
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  {monthLabel(mk)}
                </button>
              ))}
            </div>
          )}

          {readingsLoading ? (
            <LoadingSpinner message="Loading your journal..." />
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No readings yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Your saved readings will appear here as you explore</p>
            </motion.div>
          ) : filteredByMonth.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No readings for this month</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([mk, items]) => (
                <div key={mk}>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-4 h-4 text-accent" />
                    <h3 className="font-heading text-sm font-semibold text-accent">
                      {mk === 'unknown' ? 'Unknown date' : monthLabel(mk)}
                    </h3>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                    <div className="flex-1 h-px bg-border/30" />
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {items.map(reading => (
                        <ReadingEntry key={reading.id} reading={reading} onDelete={(id) => deleteReading.mutate(id)} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}