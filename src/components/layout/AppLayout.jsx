import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, Sun, BookOpen, Hash, LayoutDashboard, Menu, X, Crown, Star, ChevronLeft, UserCircle, LogOut, Zap, Flame, BarChart3, Gem, Home } from 'lucide-react';
import GuideOrb from '@/components/guide/GuideOrb';
import WelcomeRitual from '@/components/onboarding/WelcomeRitual';
import SignUpGate from '@/components/onboarding/SignUpGate';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import StarField from './StarField';
import BottomTabBar from './BottomTabBar';
import PageTransition from './PageTransition';
import PullToRefresh from './PullToRefresh';
import { useTabHistory, TAB_ROOTS } from '@/lib/TabHistoryContext';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import ContactButton from '@/components/shared/ContactButton';
import { useUserProfile } from '@/hooks/useUserProfile';
import { isPlayStoreApp } from '@/lib/platform';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tarot', label: 'Tarot', icon: Sparkles },
  { path: '/oracle', label: 'Oracle', icon: Star },
  { path: '/pendulum', label: 'Pendulum', icon: Gem },
  { path: '/astrology', label: 'Astrology', icon: Sun },
  { path: '/downloads', label: 'Channeled', icon: Zap },
  { path: '/numerology', label: 'Numerology', icon: Hash },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/altar', label: 'Altar', icon: Flame },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { goBack, canGoBack, pushToTab } = useTabHistory();
  const { isPremium, user } = useUserProfile();

  // Track every navigation into the tab history system
  useEffect(() => {
    pushToTab(location.pathname);
  }, [location.pathname, pushToTab]);

  const isTabRoot = TAB_ROOTS.includes(location.pathname);
  const showBack = location.pathname !== '/';
  const pageLabel = navItems.find(n => location.pathname.startsWith(n.path === '/' ? '/__never__' : n.path))?.label
    ?? navItems.find(n => n.path === location.pathname)?.label
    ?? 'Scry';

  const handleRefresh = () => new Promise(res => setTimeout(res, 800));

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />

      {/* Top Navigation */}
      <header
        className="sticky top-0 z-50 glass border-b border-border/50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Left: back button on mobile sub-pages or logo */}
            <div className="flex items-center gap-2">
              {showBack ? (
                <button
                  onClick={() => canGoBack() ? goBack() : window.history.back()}
                  className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-secondary/50 text-muted-foreground select-none"
                  aria-label="Go back"
                  title="Back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : null}

              <Link to="/" className="flex items-center gap-2 select-none">
                <img src="/scry-app-icon.png" alt="SCRY" className="w-9 h-9 rounded-xl object-cover border border-violet/30 shadow-[0_0_18px_rgba(212,21,154,.28)]" />
                <span className="hidden sm:flex items-baseline gap-2">
                  <span className="font-heading text-base sm:text-lg font-semibold tracking-wide shimmer-text">Scry</span>
                  <span className="text-[10px] text-muted-foreground tracking-widest uppercase">by New Tarotories</span>
                </span>
                {/* Mobile title */}
                <span className="font-heading text-sm font-semibold sm:hidden">
                  {isTabRoot
                    ? <span className="shimmer-text">Scry</span>
                    : <span className="text-foreground">{pageLabel}</span>
                  }
                </span>
              </Link>
              {location.pathname !== '/' && (
                <Link
                  to="/"
                  className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-secondary/50 text-muted-foreground select-none"
                  aria-label="Home"
                  title="Home"
                >
                  <Home className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 select-none ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Premium + Account + hamburger */}
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <Link
                  to="/insights"
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors select-none"
                  aria-label="Insights"
                  title="Insights"
                >
                  <BarChart3 className="w-4 h-4" />
                </Link>
              )}
              {!isPremium && !isPlayStoreApp() && (
                <Link
                  to="/premium"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold/20 to-violet/20 border border-gold/30 text-gold text-xs font-semibold hover:from-gold/30 hover:to-violet/30 transition-all select-none"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Premium
                </Link>
              )}
              <Link
                to="/account"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors select-none"
                aria-label="Account"
              >
                {user?.email && (
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
                )}
                <UserCircle className="w-5 h-5" />
              </Link>
              <button
                onClick={() => base44.auth.logout('/')}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors select-none"
                aria-label="Sign Out"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-secondary/50 text-muted-foreground select-none"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile hamburger menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/50 overflow-hidden"
            >
              <nav className="p-4 space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all select-none ${
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
                {!isPremium && !isPlayStoreApp() && (
                  <Link
                    to="/premium"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all select-none ${
                      location.pathname === '/premium'
                        ? 'bg-gold/20 text-gold'
                        : 'text-gold hover:bg-gold/10'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                    Premium
                  </Link>
                )}
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all select-none ${
                    location.pathname === '/account'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <UserCircle className="w-5 h-5" />
                  My Data
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/insights"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all select-none ${
                      location.pathname === '/insights'
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    Insights
                  </Link>
                )}
                <button
                  onClick={() => { setMobileOpen(false); base44.auth.logout('/'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all select-none"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
                <div className="border-t border-border/30 pt-2 mt-2 flex gap-4 px-4 py-2">
                  <Link to="/privacy" onClick={() => setMobileOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                  <Link to="/terms" onClick={() => setMobileOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Terms & Conditions</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Main Content */}
      <main
        className="relative z-10 min-w-0 overflow-x-clip"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 88px)' }}
      >
        <PullToRefresh onRefresh={handleRefresh}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </PullToRefresh>
      </main>

      {/* Fixed bottom tab bar (mobile only) */}
      <BottomTabBar />

      {/* Floating Contact Button */}
      <ContactButton />

      {/* Luna — floating cosmic guide */}
      <GuideOrb />

      {/* Step one: invite anonymous visitors to create an account */}
      <SignUpGate />

      {/* First-visit welcome ritual — captures new member info */}
      <WelcomeRitual />

      {/* Footer */}
      <footer className="relative z-10 hidden md:flex items-center justify-center gap-6 py-4 border-t border-border/30 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Scry — by New Tarotories</span>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
      </footer>
    </div>
  );
}
