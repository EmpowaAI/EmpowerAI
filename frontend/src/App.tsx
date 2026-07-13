﻿// frontend/src/App.tsx

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/user-context';
import { ThemeProvider } from './lib/theme';
import ProtectedRoute from './routes/ProtectedRoute';
import NeuralLoading from './components/ui/NeuralLoading';
import Logo from './components/ui/Logo';
import AppPreloader from './components/AppPreloader';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// ── Page imports ───────────────────────────────────────────────────────────
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const ComingSoon     = lazy(() => import('./pages/ComingSoon'));
const Demo           = lazy(() => import('./pages/Demo'));
const SignupPage     = lazy(() => import('./pages/Auth/SignupPage'));
const LoginPage      = lazy(() => import('./pages/Auth/LoginPage'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/Auth/ResetPassword'));
const EmailVerified  = lazy(() => import('./pages/Auth/EmailVerified'));
const Profile        = lazy(() => import('./pages/User/Profile'));
const ConfirmEmail   = lazy(() => import('./pages/User/ConfirmEmail'));
const ConfirmDelete  = lazy(() => import('./pages/User/ConfirmDelete'));

// ── Layout & dashboard ─────────────────────────────────────────────────────
const DashboardLayout = lazy(() => import('./components/layouts/DashboardLayout'));
const Dashboard       = lazy(() => import('./pages/Dashboard/Dashboard'));
const TwinBuilder     = lazy(() => import('./pages/Twin-builder/TwinBuilder'));
const DigitalTwin     = lazy(() => import('./pages/DigitalTwin'));
const Simulations     = lazy(() => import('./pages/Simulation/Simulations'));
const Opportunities   = lazy(() => import('./pages/Oportunities/Opportunities'));
const InterviewCoach  = lazy(() => import('./pages/Interview/InterviewCoach'));
const Applications    = lazy(() => import('./pages/Oportunities/Applications'));
const Chat            = lazy(() => import('./pages/AI/Chat'));
const AdminPanel      = lazy(() => import('./pages/AdminPanel'));

// ── CV Analyzer: NEW module replaces old page ──────────────────────────────
// Old: lazy(() => import('./pages/CV-analysis/CVAnalyzer'))
const CVAnalyzer = lazy(() => import('./modules/cvAnalyser'));

const COMING_SOON = import.meta.env.VITE_COMING_SOON === 'true';

// ── Suspense fallback ──────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-3/4 w-3/4 -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-3/4 w-3/4 translate-y-1/4 -translate-x-1/4 rounded-full bg-secondary/5 blur-3xl animate-pulse" />
      </div>
      <div className="relative flex flex-col items-center gap-8">
        <Logo size="lg" />
        <NeuralLoading size="lg" text="Loading your workspace..." />
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppPreloader />
        <PreloadRoutes />
        <Toaster position="top-right" />
        <Suspense fallback={<PageLoader />}>
          <ErrorBoundary>
            <RouteTransition>
              <AppRoutes />
            </RouteTransition>
          </ErrorBoundary>
        </Suspense>
      </UserProvider>
    </ThemeProvider>
  );
}

// ── Routes (extracted so App stays clean) ─────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={COMING_SOON ? <ComingSoon /> : <LandingPage />} />
      <Route path="/preview" element={<LandingPage />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/cv-analyzer" element={<CVAnalyzer />} />
      <Route path="/digital-twin" element={<DigitalTwin />} />
      <Route path="/twin-preview" element={<TwinBuilder />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify" element={<EmailVerified />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/confirm-delete" element={<ConfirmDelete />} />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />

        {/* Step 1: CV Analyzer - always accessible */}
        <Route path="cv-analyzer" element={<CVAnalyzer />} />

        {/* Step 2: Digital Twin - requires CV */}
        <Route path="twin" element={<ProtectedRoute requiredStep="cv"><TwinBuilder /></ProtectedRoute>} />
        <Route path="twin-builder" element={<ProtectedRoute requiredStep="cv"><TwinBuilder /></ProtectedRoute>} />

        {/* Step 3: Interview Coach - requires Twin */}
        <Route path="interview-coach" element={<ProtectedRoute requiredStep="twin"><InterviewCoach /></ProtectedRoute>} />

        {/* Step 4: Opportunities - requires Twin */}
        <Route path="opportunities" element={<ProtectedRoute requiredStep="twin"><Opportunities /></ProtectedRoute>} />

        {/* Additional features - require Twin */}
        <Route path="simulations" element={<ProtectedRoute requiredStep="twin"><Simulations /></ProtectedRoute>} />
        <Route path="applications" element={<ProtectedRoute requiredStep="twin"><Applications /></ProtectedRoute>} />
        <Route path="chat" element={<ProtectedRoute requiredStep="twin"><Chat /></ProtectedRoute>} />

        {/* Admin */}
        <Route
          path="admin"
          element={
            import.meta.env.VITE_ENABLE_ADMIN === 'true'
              ? <AdminPanel />
              : <Navigate to="/dashboard" replace />
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── Route transition wrapper ───────────────────────────────────────────────
function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="route-transition" key={location.pathname}>
      {children}
    </div>
  );
}

// ── Idle preloader ─────────────────────────────────────────────────────────
function PreloadRoutes() {
  const { user, progress } = useUser();
  const location = useLocation();

  // Persist last route for preload hints
  useEffect(() => {
    try {
      sessionStorage.setItem('empowerai:lastRoute', location.pathname);
    } catch { /* ignore */ }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string; downlink?: number };
    }).connection;

    const saveData       = connection?.saveData === true;
    const slowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
    const slowDownlink   = typeof connection?.downlink === 'number' && connection.downlink < 1.5;
    const lowMemory      = typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number'
                           && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 2;

    if (saveData || slowConnection || slowDownlink || lowMemory) return;

    const requestIdle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const cancelIdle  = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    const getLastRoute = () => {
      try { return sessionStorage.getItem('empowerai:lastRoute') || ''; } catch { return ''; }
    };

    const preload = () => {
      const last = getLastRoute();
      const loaders: Array<() => Promise<unknown>> = [];

      // ── Preload by last visited route ──────────────────────────────────
      const routeMap: Record<string, () => Promise<unknown>> = {
        '/dashboard/cv-analyzer':    () => import('./modules/cvAnalyser'), // ← updated
        '/dashboard/twin':           () => import('./pages/Twin-builder/TwinBuilder'),
        '/dashboard/simulations':    () => import('./pages/Simulation/Simulations'),
        '/dashboard/opportunities':  () => import('./pages/Oportunities/Opportunities'),
        '/dashboard/interview-coach':() => import('./pages/Interview/InterviewCoach'),
        '/dashboard/applications':   () => import('./pages/Oportunities/Applications'),
        '/dashboard/chat':           () => import('./pages/AI/Chat'),
        '/dashboard/profile':        () => import('./pages/User/Profile'),
      };

      const lastLoader = Object.entries(routeMap).find(([path]) => last.includes(path))?.[1];
      if (lastLoader) loaders.push(lastLoader);

      // Always preload layout + dashboard
      loaders.push(() => import('./components/layouts/DashboardLayout'));
      loaders.push(() => import('./pages/Dashboard/Dashboard'));

      // Progressive by user progress
      if (!progress.cvCompleted) loaders.push(() => import('./modules/cvAnalyser')); // ← updated
      if (!progress.twinCompleted) loaders.push(() => import('./pages/Twin-builder/TwinBuilder'));

      if (progress.cvCompleted && progress.twinCompleted) {
        loaders.push(() => import('./pages/Oportunities/Opportunities'));
        loaders.push(() => import('./pages/Simulation/Simulations'));
        loaders.push(() => import('./pages/Interview/InterviewCoach'));
        loaders.push(() => import('./pages/Oportunities/Applications'));
        loaders.push(() => import('./pages/AI/Chat'));
      }

      loaders.push(() => import('./pages/User/Profile'));
      loaders.forEach((load) => void load());
    };

    if (requestIdle) {
      const id = requestIdle(preload);
      return () => cancelIdle?.(id);
    }

    const t = window.setTimeout(preload, 1500);
    return () => window.clearTimeout(t);
  }, [user, progress.cvCompleted, progress.twinCompleted]);

  return null;
}

export default App;
