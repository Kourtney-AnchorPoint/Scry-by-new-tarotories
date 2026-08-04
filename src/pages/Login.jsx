import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Moon, Star } from 'lucide-react';
import { signIn, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StarField from '@/components/layout/StarField';
import { UserProfile } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { BirthLocationDatalist, normalizeBirthLocation } from '@/lib/birthLocations';

// SCRY has its own fully custom UI, not Cognito's hosted pages, so this is a
// real sign-in/sign-up form using Amplify's auth functions directly rather
// than a hosted-UI redirect. Sign-up collects birth data up front so
// Astrology/Numerology/Dashboard work immediately after account creation,
// no separate onboarding step required.
export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, checkUserAuth } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | signup | confirm
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const goHome = async () => {
    const redirect = sessionStorage.getItem('post_login_redirect');
    sessionStorage.removeItem('post_login_redirect');
    await checkUserAuth();
    navigate(redirect || '/');
  };

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      const redirect = sessionStorage.getItem('post_login_redirect');
      sessionStorage.removeItem('post_login_redirect');
      navigate(redirect || '/', { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn({ username: email.trim(), password });
      await goHome();
    } catch (err) {
      if (err.name === 'UserAlreadyAuthenticatedException' || /already.*sign/i.test(err.message || '')) {
        await goHome();
      } else {
        setError(err.message || 'Could not sign in. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({
        username: email.trim(),
        password,
        options: { userAttributes: { email: email.trim(), name: fullName.trim() } },
      });
      setMode('confirm');
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    }
    setLoading(false);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp({ username: email.trim(), confirmationCode: code.trim() });
      await signIn({ username: email.trim(), password });
      // Create the profile immediately — birth data collected at signup
      // means Astrology/Numerology/Dashboard work right away, no separate
      // onboarding step.
      try {
        await UserProfile.create({
          email: email.trim(),
          full_name: fullName.trim(),
          display_name: fullName.trim(),
          birth_date: birthDate || undefined,
          birth_time: birthTimeUnknown ? 'unknown' : (birthTime || undefined),
          birth_location: normalizeBirthLocation(birthLocation) || undefined,
        });
      } catch {
        // profile creation failing shouldn't block account access — the
        // Astrology page can prompt for missing birth data later
      }
      await goHome();
    } catch (err) {
      if (err.name === 'UserAlreadyAuthenticatedException' || /already.*sign/i.test(err.message || '')) {
        await goHome();
      } else {
        setError(err.message || 'Could not confirm your account. Please check the code and try again.');
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendSignUpCode({ username: email.trim() });
    } catch (err) {
      setError(err.message || 'Could not resend the code.');
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 py-10">
      <StarField />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-card rounded-3xl border border-violet/30 max-w-md w-full p-8"
      >
        <div className="flex justify-center gap-3 mb-5">
          <Star className="w-5 h-5 text-gold animate-twinkle" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet/20 glow-violet">
            <Moon className="w-7 h-7 text-violet" />
          </div>
          <Star className="w-5 h-5 text-teal animate-twinkle" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-center mb-2">
          <span className="shimmer-text">
            {mode === 'confirm' ? 'Check Your Email' : mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </span>
        </h1>
        {mode === 'signup' && (
          <p className="text-xs text-muted-foreground text-center mb-6">
            Your birth details power real astrology and numerology readings — no guessing.
          </p>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-border/50" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 border-border/50" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2 py-6">
              <Sparkles className="w-4 h-4" />
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <button type="button" onClick={() => setMode('signup')} className="w-full text-xs text-muted-foreground hover:text-foreground text-center">
              New here? Create a free account
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Name</Label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-background/50 border-border/50" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-border/50" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Password</Label>
              <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 border-border/50" />
              <p className="text-xs text-muted-foreground/60 mt-1">At least 8 characters</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Birth Date</Label>
              <Input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-background/50 border-border/50" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm text-muted-foreground block">Birth Time</Label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input type="checkbox" checked={birthTimeUnknown} onChange={(e) => setBirthTimeUnknown(e.target.checked)} />
                  I don't know it
                </label>
              </div>
              <Input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                disabled={birthTimeUnknown}
                className="bg-background/50 border-border/50 disabled:opacity-40"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Birth Location</Label>
              <Input
                list="signup-birth-location-options"
                placeholder="City, state/province, country"
                value={birthLocation}
                onChange={(e) => setBirthLocation(e.target.value)}
                className="bg-background/50 border-border/50"
              />
              <BirthLocationDatalist id="signup-birth-location-options" />
              <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                Example: Oklahoma City, Oklahoma, United States. ZIP/postal codes are optional and not universal worldwide.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2 py-6">
              <Sparkles className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create My Free Account'}
            </Button>
            <button type="button" onClick={() => setMode('signin')} className="w-full text-xs text-muted-foreground hover:text-foreground text-center">
              Already have an account? Sign in
            </button>
          </form>
        )}

        {mode === 'confirm' && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              We sent a verification code to <span className="text-foreground">{email}</span>
            </p>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Verification Code</Label>
              <Input required value={code} onChange={(e) => setCode(e.target.value)} className="bg-background/50 border-border/50 text-center tracking-widest text-lg" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2 py-6">
              <Sparkles className="w-4 h-4" />
              {loading ? 'Confirming...' : 'Confirm & Continue'}
            </Button>
            <button type="button" onClick={handleResend} className="w-full text-xs text-muted-foreground hover:text-foreground text-center">
              Resend code
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
