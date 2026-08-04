import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';
import { trackVisit } from '@/lib/analytics';
import { detectPlayStore } from '@/lib/platform';

import AppLayout from '@/components/layout/AppLayout';
import { TabHistoryProvider } from '@/lib/TabHistoryContext';
import Login from '@/pages/Login';
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
import { auth } from '@/api/auth';

const RequireAuth = ({ isAuthenticated }) => {
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      auth.redirectToLogin(location.pathname + location.search);
    }
  }, [isAuthenticated, location.pathname, location.search]);

  if (!isAuthenticated) return null;
  return <Outlet />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  // Count every visitor — anonymous included — once per session
  useEffect(() => {
    detectPlayStore();
    if (isAuthenticated) trackVisit();
  }, [isAuthenticated]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-violet/30 border-t-violet rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm font-heading">Aligning the stars...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
        <Route path="/shared/:id" element={<SharedReading />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tarot" element={<Tarot />} />
          <Route path="/astrology" element={<Astrology />} />
          <Route path="/oracle" element={<Oracle />} />
          <Route path="/numerology" element={<Numerology />} />
          <Route path="/pendulum" element={<Pendulum />} />
          <Route path="/upgrade" element={<Navigate to="/premium" replace />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/channeled" element={<Downloads />} />
          <Route path="/downloads" element={<Navigate to="/channeled" replace />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/account" element={<Account />} />
          <Route path="/tarot/history" element={<TarotHistory />} />
          <Route path="/altar" element={<Altar />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Route>
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
