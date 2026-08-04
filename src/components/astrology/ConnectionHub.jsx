import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Connection } from '@/api/entities';
import { astronomy } from '@/api/functions/astronomy';
import { BirthLocationDatalist, normalizeBirthLocation } from '@/lib/birthLocations';
import { unwrapAiResult } from '@/lib/aiResult';
import { useUserProfile } from '@/hooks/useUserProfile';
import { auth } from '@/api/auth';

export default function ConnectionHub({ onSelectConnection, selectedConnectionId }) {
  const { user } = useUserProfile();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', birth_date: '', birth_time: '', birth_location: '', unknownTime: false });

  useEffect(() => {
    loadConnections();
  }, [user?.id]);

  const loadConnections = async () => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }
    try {
      const result = await Connection.list();
      setConnections(result);
    } catch {
      setConnections([]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.birth_date) return;
    if (!auth.isAuthenticated()) {
      auth.redirectToLogin(window.location.pathname);
      return;
    }
    setSaving(true);
    try {
      await Connection.create({
        name: form.name,
        birth_date: form.birth_date,
        birth_time: form.unknownTime ? 'unknown' : form.birth_time,
        birth_location: normalizeBirthLocation(form.birth_location),
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowForm(false); }, 1500);
      setForm({ name: '', birth_date: '', birth_time: '', birth_location: '', unknownTime: false });
      loadConnections();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await Connection.delete(id);
      setConnections(connections.filter(c => c.id !== id));
    } catch {
      // ignore
    }
  };

  const handleSelect = async (conn) => {
    setChartLoading(true);
    try {
      const timeUnknown = !conn.birth_time || conn.birth_time === 'unknown';
      // Real astronomical calculation — same engine as the user's own chart
      const res = await astronomy.calculateChart({
        birth_date: conn.birth_date,
        birth_time: timeUnknown ? 'unknown' : conn.birth_time,
        birth_location: conn.birth_location,
      });
      const d = unwrapAiResult(res.data);
      if (!d || d.error) throw new Error(d?.error || 'Calculation failed');
      const asDecimal = (p) => p.degrees + p.minutes / 60;
      const pick = (p) => ({ sign: p.sign, degrees: asDecimal(p), house: p.house });
      const result = {
        big_three: {
          sun: pick(d.planets.sun),
          moon: pick(d.planets.moon),
          rising: d.ascendant ? { sign: d.ascendant.sign, degrees: asDecimal(d.ascendant) } : null,
        },
        planets: {
          mercury: pick(d.planets.mercury),
          venus: pick(d.planets.venus),
          mars: pick(d.planets.mars),
          jupiter: pick(d.planets.jupiter),
          saturn: pick(d.planets.saturn),
        },
        houses: (d.houses || []).map(h => ({
          number: h.house,
          sign: h.sign,
          planets: Object.entries(d.planets).filter(([, p]) => p.house === h.house).map(([n]) => n),
        })),
        birthTimeUnknown: d.unknownTime,
      };
      onSelectConnection(conn, result);
    } catch {
      onSelectConnection(conn, null);
    }
    setChartLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-violet" />
          <h3 className="font-heading text-sm font-semibold text-violet">Your Connections</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-violet/30 text-violet hover:bg-violet/10"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus className="w-3.5 h-3.5" />
          {showForm ? 'Cancel' : 'Add Connection'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-5 space-y-3 border border-violet/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sarah"
                    className="bg-background/50 border-border/50 text-base"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Birth Date</Label>
                  <Input
                    type="date"
                    value={form.birth_date}
                    onChange={e => setForm({ ...form, birth_date: e.target.value })}
                    className="bg-background/50 border-border/50 text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Birth Time</Label>
                  {!form.unknownTime ? (
                    <Input
                      type="time"
                      value={form.birth_time}
                      onChange={e => setForm({ ...form, birth_time: e.target.value })}
                      className="bg-background/50 border-border/50 text-base"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-2">Birth time unknown</p>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={form.unknownTime}
                      onChange={e => setForm({ ...form, unknownTime: e.target.checked })}
                      className="w-4 h-4 rounded accent-violet"
                    />
                    <span className="text-xs text-muted-foreground">Unknown birth time</span>
                  </label>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Birth Location</Label>
                  <Input
                    value={form.birth_location}
                    onChange={e => setForm({ ...form, birth_location: e.target.value })}
                    list="connection-birth-location-options"
                    placeholder="City, State, Country"
                    className="bg-background/50 border-border/50 text-base"
                  />
                  <BirthLocationDatalist id="connection-birth-location-options" />
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name || !form.birth_date}
                className={`w-full gap-2 ${saved ? 'bg-teal hover:bg-teal/90' : 'bg-primary hover:bg-primary/90'}`}
              >
                {saved ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Connection'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {chartLoading ? (
        <p className="text-xs text-muted-foreground text-center py-4 animate-pulse">Calculating chart from ephemeris...</p>
      ) : loading ? (
        <p className="text-xs text-muted-foreground text-center py-4">Loading connections...</p>
      ) : connections.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4 italic">
          No connections yet. Add someone to explore your compatibility.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {connections.map(conn => (
            <div
              key={conn.id}
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
                selectedConnectionId === conn.id ? 'border-violet/50 glow-violet' : 'hover:border-violet/30'
              }`}
              onClick={() => handleSelect(conn)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{conn.name}</p>
                  <p className="text-xs text-muted-foreground">{conn.birth_date}</p>
                  {conn.birth_location && (
                    <p className="text-xs text-muted-foreground/60">{conn.birth_location}</p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(conn.id); }}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
