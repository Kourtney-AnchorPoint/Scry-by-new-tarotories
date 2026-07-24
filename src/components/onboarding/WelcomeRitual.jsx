import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserProfile } from '@/hooks/useUserProfile';
import { trackEvent } from '@/lib/analytics';

const SKIP_KEY = 'welcome_ritual_skipped';

export default function WelcomeRitual() {
  const { profile, user, isLoading, saveOrUpdate } = useUserProfile();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(SKIP_KEY) === '1');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const show = !isLoading && user && !profile && !dismissed;
  if (!show) return null;

  const handleSave = async () => {
    if (!name.trim() || !birthDate) return;
    setSaving(true);
    await saveOrUpdate({
      display_name: name.trim(),
      full_name: name.trim(),
      birth_date: birthDate,
      ...(birthTime ? { birth_time: birthTime } : {}),
      ...(birthLocation.trim() ? { birth_location: birthLocation.trim() } : {}),
    });
    trackEvent('onboarding_completed', { has_birth_time: !!birthTime, has_location: !!birthLocation.trim() });
    setSaving(false);
    setDismissed(true);
  };

  const handleSkip = () => {
    localStorage.setItem(SKIP_KEY, '1');
    trackEvent('onboarding_skipped');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-card rounded-3xl border border-violet/30 max-w-md w-full p-6 sm:p-8 my-8"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet/20 glow-violet mb-4">
              <Moon className="w-7 h-7 text-violet" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">
              <span className="shimmer-text">Welcome, Seeker</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Before we cast your chart, the stars need to know who's asking. Share your details to unlock your personal cosmic blueprint.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">What should we call you? *</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="bg-background/50 border-border/50 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Birth date *</Label>
              <Input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="bg-background/50 border-border/50 mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Birth time (optional)</Label>
                <Input
                  type="time"
                  value={birthTime}
                  onChange={e => setBirthTime(e.target.value)}
                  className="bg-background/50 border-border/50 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Birth city (optional)</Label>
                <Input
                  value={birthLocation}
                  onChange={e => setBirthLocation(e.target.value)}
                  placeholder="City, State"
                  className="bg-background/50 border-border/50 mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!name.trim() || !birthDate || saving}
              className="w-full bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2 py-6 rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              {saving ? 'Casting your chart...' : 'Begin My Journey'}
            </Button>
            <button
              onClick={handleSkip}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Skip for now — I'll add this later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}