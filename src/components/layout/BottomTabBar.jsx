import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Sun, LayoutDashboard, Star, Gem } from 'lucide-react';

import { useTabHistory, TAB_ROOTS } from '@/lib/TabHistoryContext';

const tabItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/tarot', label: 'Tarot', icon: Sparkles },
  { path: '/oracle', label: 'Oracle', icon: Star },
  { path: '/pendulum', label: 'Pendulum', icon: Gem },
  { path: '/astrology', label: 'Stars', icon: Sun },
];

function getTabRoot(pathname) {
  return TAB_ROOTS.find(r => r === pathname || (r !== '/' && pathname.startsWith(r))) ?? '/';
}

export default function BottomTabBar() {
  const location = useLocation();
  const { switchTab } = useTabHistory();
  const activeRoot = getTabRoot(location.pathname);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabItems.map(item => {
        const Icon = item.icon;
        const isActive = activeRoot === item.path;
        return (
          <button
            key={item.path}
            onClick={() => switchTab(item.path)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative select-none"
            style={{ minHeight: '56px' }}
            aria-label={item.label}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
            )}
            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
