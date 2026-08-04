import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, LogOut, LayoutDashboard, Crown, Check, User, Save, Star, Bell } from 'lucide-react';
import NotificationSettings from '@/components/shared/NotificationSettings';
import { auth } from '@/api/auth';
import { Reading, UserProfile } from '@/api/entities';
import { stripe } from '@/api/functions/stripe';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import SectionHeader from '@/components/shared/SectionHeader';
import GlassCard from '@/components/shared/GlassCard';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BirthLocationDatalist, normalizeBirthLocation } from '@/lib/birthLocations';

export default function Account() {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const { profile, user, isPremium, saveOrUpdate } = useUserProfile();

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const res = await stripe.createPortalSession({
        return_url: window.location.origin + '/account',
        user_email: user?.email,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      // portal unavailable — nothing to do
    }
    setOpeningPortal(false);
  };

  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [birthCity, setBirthCity] = useState('');
  const [birthState, setBirthState] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Populate fields when profile loads
  useEffect(() => {
    if (profile) {
      setBirthDate(profile.birth_date || '');
      const savedTime = profile.birth_time || '';
      setBirthTime(savedTime === 'unknown' ? '' : savedTime);
      setUnknownBirthTime(savedTime === 'unknown');
      setDisplayName(profile.display_name || '');
      // Parse existing location into parts if present
      if (profile.birth_location) {
        const parts = profile.birth_location.split(',').map(s => s.trim());
        setBirthCity(parts[0] || '');
        setBirthState(parts[1] || '');
        setBirthCountry(parts[2] || '');
      }
    }
  }, [profile?.id]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const birth_location = birthCity.includes(',')
      ? normalizeBirthLocation(birthCity)
      : normalizeBirthLocation([birthCity, birthState, birthCountry].filter(Boolean).join(', '));
    await saveOrUpdate({ birth_date: birthDate, birth_time: unknownBirthTime ? 'unknown' : birthTime, birth_location, display_name: displayName });
    setSaving(false);
    setSaved(true);
    // If premium and has all birth data, redirect to the astrology chart
    if (isPremium && birthDate && (birthTime || unknownBirthTime) && birth_location) {
      setTimeout(() => navigate('/astrology'), 800);
    } else {
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const readings = await Reading.list('-created_date', 100);
    await Promise.all(readings.map(r => Reading.delete(r.id)));
    const profiles = await UserProfile.list();
    await Promise.all(profiles.map(p => UserProfile.delete(p.id)));
    setDeleting(false);
    setShowDeleteDialog(false);
    await auth.logout('/');
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeader
        icon={User}
        title="Account"
        subtitle="Manage your profile, birth chart data, and account settings"
        color="violet"
      />

      {/* Premium Status */}
      <GlassCard className="mb-5" glow={isPremium ? 'gold' : 'none'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className={`w-6 h-6 ${isPremium ? 'text-gold' : 'text-muted-foreground'}`} />
            <div>
              <h3 className="font-heading text-base font-semibold">{isPremium ? 'Premium Active' : 'Free Plan'}</h3>
              <p className="text-sm text-muted-foreground">{isPremium ? 'Full access to all features' : 'Limited access'}</p>
            </div>
          </div>
          {isPremium ? (
            profile?.stripe_customer_id ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleManageSubscription}
                disabled={openingPortal}
                className="text-sm border-gold/30 text-gold hover:bg-gold/10"
              >
                {openingPortal ? 'Opening...' : 'Manage Subscription'}
              </Button>
            ) : (
              <span className="text-sm text-gold font-medium">Active</span>
            )
          ) : (
            <Link to="/premium">
              <Button size="sm" className="text-sm gap-1.5 bg-gradient-to-r from-gold to-gold-dark text-background hover:opacity-90">
                <Crown className="w-4 h-4" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>

      {/* Birth Chart Profile */}
      <GlassCard className="mb-5 space-y-5">
        <div>
          <h3 className="font-heading text-base font-semibold mb-1">Birth Chart & Profile</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Used for your full birth chart analysis in Astrology and personal numerology readings.
          </p>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Display Name</Label>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="bg-background/50 border-border/50 text-base"
              />
            </div>
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
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Birth City</Label>
              <Input
                value={birthCity}
                onChange={e => setBirthCity(e.target.value)}
                list="account-birth-location-options"
                placeholder="e.g. Oklahoma City, Oklahoma, United States"
                className="bg-background/50 border-border/50 text-base"
              />
              <BirthLocationDatalist id="account-birth-location-options" />
              <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed">
                You can pick a full birthplace here, or fill city/state/country below.
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Birth State / Province</Label>
              <Input
                value={birthState}
                onChange={e => setBirthState(e.target.value)}
                placeholder="e.g. Illinois"
                className="bg-background/50 border-border/50 text-base"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Birth Country</Label>
              <Input
                value={birthCountry}
                onChange={e => setBirthCountry(e.target.value)}
                placeholder="e.g. USA"
                className="bg-background/50 border-border/50 text-base"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className={`w-full gap-2 text-base ${saved ? 'bg-teal hover:bg-teal/90' : 'bg-primary hover:bg-primary/90'} text-primary-foreground`}
            >
              {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : saved ? (isPremium ? 'Going to Chart...' : 'Saved!') : 'Save Profile'}
            </Button>
            {isPremium && profile?.birth_date && (
              <Link to="/astrology">
                <Button variant="outline" className="w-full gap-2 text-base border-gold/30 text-gold hover:bg-gold/10">
                  <Star className="w-5 h-5" />
                  View My Full Birth Chart
                </Button>
              </Link>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-5 space-y-4">
        <NotificationSettings />
      </GlassCard>

      <GlassCard className="mb-5 space-y-4">
        <div className="border-t border-border/30 pt-5">
          <h3 className="font-heading text-base font-semibold text-destructive mb-1.5">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated readings, journal entries, and profile data. This cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="gap-2 text-base select-none"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </Button>
        </div>
      </GlassCard>

      {/* Sign Out — prominent at the bottom */}
      <Button
        variant="outline"
        className="w-full gap-2 text-base border-border/50 text-muted-foreground hover:text-foreground hover:border-violet/40 select-none"
        onClick={() => auth.logout('/')}
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </Button>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              This will permanently delete all your readings, journal entries, and profile data.
              This action <strong className="text-foreground">cannot be undone</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="select-none">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="gap-2 select-none"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
