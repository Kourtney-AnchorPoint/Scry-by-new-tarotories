import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';
import { trackVisit } from '@/lib/analytics';
import { detectPlayStore } from '@/lib/platform';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import { TabHistoryProvider } from '@/lib/TabHistoryContext';
import Dashboard from '@/pages/Dashboard';
import Tarot from '@/pages/Tarot';
import Astrology from '@/pages/Astrology';
import Oracle from '@/pages/Oracle';
import Numerology from '@/pages/Numerology';
import Pendulum from '@/pages/Pendulum';
import Journal from '@/pages/Journal';
import Premium from '@/pages/Premium';
import Account from '@/pages/Account';
import TarotHistory from '@/pages/TarotHistory';

import Downloads from '@/pages/Downloads';
import Altar from '@/pages/Altar';
import SharedReading from '@/pages/SharedReading';
import Insights from '@/pages/Insights';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Count every visitor — anonymous included — once per session
  useEffect(() => { detectPlayStore(); trackVisit(); }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-violet/30 border-t-violet rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm font-heading">Aligning the stars...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tarot" element={<Tarot />} />
        <Route path="/astrology" element={<Astrology />} />
        <Route path="/oracle" element={<Oracle />} />
        <Route path="/numerology" element={<Numerology />} />
        <Route path="/pendulum" element={<Pendulum />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/upgrade" element={<Navigate to="/premium" replace />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/account" element={<Account />} />
        <Route path="/tarot/history" element={<TarotHistory />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/altar" element={<Altar />} />
        <Route path="/shared/:id" element={<SharedReading />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <TabHistoryProvider>
            <AuthenticatedApp />
          </TabHistoryProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
