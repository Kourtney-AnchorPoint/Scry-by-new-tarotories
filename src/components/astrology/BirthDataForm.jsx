import React, { useState, useEffect } from 'react';
import { Check, Save, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function BirthDataForm({ compact = false }) {
  const { profile, isPremium, saveOrUpdate } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [birthCity, setBirthCity] = useState('');
  const [birthZip, setBirthZip] = useState('');

  useEffect(() => {
    if (profile) {
      setBirthDate(profile.birth_date || '');
      const savedTime = profile.birth_time || '';
      setBirthTime(savedTime === 'unknown' ? '' : savedTime);
      setUnknownBirthTime(savedTime === 'unknown');
      setBirthCity(profile.birth_location || '');
      setBirthZip(profile.birth_zip || '');
    }
  }, [profile?.id]);

  const handleSave = async () => {
    setSaving(true);
    await saveOrUpdate({
      birth_date: birthDate,
      birth_time: unknownBirthTime ? 'unknown' : birthTime,
      birth_location: birthCity,
      birth_zip: birthZip,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const hasBirthData = birthDate && (birthTime || unknownBirthTime) && (birthCity || birthZip);

  return (
    <div className={`space-y-4 ${compact ? '' : 'space-y-5'}`}>
      <div>
        <Label className="text-sm text-muted-foreground mb-1.5 block">Birth Date</Label>
        <Input
          type="date"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
          className="bg-background/50 border-border/50 text-base"
        />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-1.5 block">Birth Time <span className="text-muted-foreground/60">(for rising sign)</span></Label>
        {!unknownBirthTime && (
          <Input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className="bg-background/50 border-border/50 text-base mb-2"
          />
        )}
        <label className="flex items-center gap-2.5 cursor-pointer mt-1">
            <input
            type="checkbox"
            checked={unknownBirthTime}
            onChange={e => {
              setUnknownBirthTime(e.target.checked);
              if (e.target.checked) setBirthTime('');
            }}
            className="w-4 h-4 rounded accent-violet"
          />
          <span className="text-sm text-muted-foreground">I don't know my birth time</span>
        </label>
        {unknownBirthTime && (
          <p className="text-sm text-violet/70 mt-2 leading-relaxed">
            No worries — your chart will focus on your Sun, Moon, and planetary placements. Rising sign will be omitted.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm text-muted-foreground mb-1.5 block">City</Label>
          <Input
            value={birthCity}
            onChange={e => setBirthCity(e.target.value)}
            placeholder="e.g. Chicago"
            className="bg-background/50 border-border/50 text-base"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1.5 block">Zip Code</Label>
          <Input
            value={birthZip}
            onChange={e => setBirthZip(e.target.value)}
            placeholder="e.g. 60601"
            className="bg-background/50 border-border/50 text-base"
          />
        </div>
      </div>
      <Button
        onClick={handleSave}
        disabled={saving}
        className={`w-full gap-2 text-base ${saved ? 'bg-teal hover:bg-teal/90' : 'bg-primary hover:bg-primary/90'} text-primary-foreground`}
      >
        {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Birth Data'}
      </Button>
      {hasBirthData && (
        <Link to="/astrology">
          <Button variant="outline" className="w-full gap-2 text-base border-gold/30 text-gold hover:bg-gold/10">
            <Star className="w-5 h-5" />
            View My Full Birth Chart
          </Button>
        </Link>
      )}
    </div>
  );
}