// frontend/src/App.tsx
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/user-context';
import { ThemeProvider } from './lib/theme';
import ProtectedRoute from './routes/ProtectedRoute';
import NeuralLoading from './components/ui/NeuralLoading';
import { Toaster } from 'react-hot-toast';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/Auth/SignupPage'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const EmailVerified = lazy(() => import('./pages/Auth/EmailVerified'));

const Profile = lazy(() => import('./pages/User/Profile'));
const ConfirmEmail = lazy(() => import('./pages/User/ConfirmEmail'));
const ConfirmDelete = lazy(() => import('./pages/User/ConfirmDelete'));

const DashboardLayout = lazy(() => import('./components/layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const TwinBuilder = lazy(() => import('./pages/Twin-builder/TwinBuilder'));
const Simulations = lazy(() => import('./pages/Simulation/Simulations'));
const Opportunities = lazy(() => import('./pages/Oportunities/Opportunities'));
const CVAnalyzer = lazy(() => import('./pages/CV-analysis/CVAnalyzer'));
const InterviewCoach = lazy(() => import('./pages/Interview/InterviewCoach'));
const Applications = lazy(() => import('./pages/Oportunities/Applications'));
const Chat = lazy(() => import('./pages/AI/Chat'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <PreloadRoutes />
        <Toaster position="top-right" />
        <Suspense
          fallback={
            <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/30 blur-3xl animate-pulse" />
              </div>
              <div className="relative">
                <NeuralLoading size="lg" text="Loading your workspace..." />
              </div>
            </div>
          }
        >
          <RouteTransition>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify" element={<EmailVerified />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/confirm-delete" element={<ConfirmDelete />} />

              {/* Protected dashboard routes */}
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
                
                {/* Step 1: CV Analyzer - Always accessible */}
                <Route path="cv-analyzer" element={<CVAnalyzer />} />
                
                {/* Step 2: Digital Twin - Requires CV completed */}
                <Route 
                  path="twin" 
                  element={
                    <ProtectedRoute requiredStep="cv">
                      <TwinBuilder />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="twin-builder" 
                  element={
                    <ProtectedRoute requiredStep="cv">
                      <TwinBuilder />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Step 3: Interview Coach - Requires Twin completed */}
                <Route 
                  path="interview-coach" 
                  element={
                    <ProtectedRoute requiredStep="twin">
                      <InterviewCoach />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Step 4: Opportunities - Requires Twin completed */}
                <Route 
                  path="opportunities" 
                  element={
                    <ProtectedRoute requiredStep="twin">
                      <Opportunities />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Additional features - All require Twin completed */}
                <Route 
                  path="simulations" 
                  element={
                    <ProtectedRoute requiredStep="twin">
                      <Simulations />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="applications" 
                  element={
                    <ProtectedRoute requiredStep="twin">
                      <Applications />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="chat" 
                  element={
                    <ProtectedRoute requiredStep="twin">
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin route - Special handling */}
                <Route
                  path="admin"
                  element={
                    import.meta.env.VITE_ENABLE_ADMIN === 'true'
                      ? <AdminPanel />
                      : <Navigate to="/dashboard" replace />
                  }
                />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RouteTransition>
        </Suspense>
      </UserProvider>
    </ThemeProvider>
  );
}

function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="route-transition" key={location.pathname}>
      {children}
    </div>
  );
}

function PreloadRoutes() {
  const { user, progress } = useUser();
  const location = useLocation();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('empowerai:lastRoute', location.pathname);
      }
    } catch {
      // Ignore storage failures
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number } }).connection;
    const saveData = connection?.saveData === true;
    const effectiveType = connection?.effectiveType;
    const slowConnection = effectiveType === '2g' || effectiveType === 'slow-2g';
    const downlink = connection?.downlink;
    const slowDownlink = typeof downlink === 'number' && downlink < 1.5;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowMemory = typeof deviceMemory === 'number' && deviceMemory <= 2;

    if (saveData || slowConnection || slowDownlink || lowMemory) return;

    const requestIdle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const cancelIdle = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    const getLastRoute = () => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return sessionStorage.getItem('empowerai:lastRoute') || '';
        }
      } catch {
        return '';
      }
      return '';
    };

    const preload = () => {
      const lastRoute = getLastRoute();
      const loaders: Array<() => Promise<unknown>> = [];

      const byLastRoute = () => {
        if (lastRoute.includes('/dashboard/cv-analyzer')) return () => import('./pages/CV-analysis/CVAnalyzer');
        if (lastRoute.includes('/dashboard/twin')) return () => import('./pages/Twin-builder/TwinBuilder');
        if (lastRoute.includes('/dashboard/simulations')) return () => import('./pages/Simulation/Simulations');
        if (lastRoute.includes('/dashboard/opportunities')) return () => import('./pages/Oportunities/Opportunities');
        if (lastRoute.includes('/dashboard/interview-coach')) return () => import('./pages/Interview/InterviewCoach');
        if (lastRoute.includes('/dashboard/applications')) return () => import('./pages/Oportunities/Applications');
        if (lastRoute.includes('/dashboard/chat')) return () => import('./pages/AI/Chat');
        if (lastRoute.includes('/dashboard/profile')) return () => import('./pages/User/Profile');
        return null;
      };

      const lastRouteLoader = byLastRoute();
      if (lastRouteLoader) loaders.push(lastRouteLoader);

      loaders.push(() => import('./components/layouts/DashboardLayout'));
      loaders.push(() => import('./pages/Dashboard/Dashboard'));

      // Progressive preloading based on user progress
      if (!progress.cvCompleted) {
        loaders.push(() => import('./pages/CV-analysis/CVAnalyzer'));
      }

      if (!progress.twinCompleted) {
        loaders.push(() => import('./pages/Twin-builder/TwinBuilder'));
      }

      if (progress.cvCompleted && progress.twinCompleted) {
        loaders.push(() => import('./pages/Oportunities/Opportunities'));
        loaders.push(() => import('./pages/Simulation/Simulations'));
        loaders.push(() => import('./pages/Interview/InterviewCoach'));
        loaders.push(() => import('./pages/Oportunities/Applications'));
        loaders.push(() => import('./pages/AI/Chat'));
      }

      loaders.push(() => import('./pages/User/Profile'));

      for (const load of loaders) {
        void load();
      }
    };

    if (requestIdle) {
      const id = requestIdle(preload);
      return () => cancelIdle?.(id);
    }

    const timeoutId = window.setTimeout(preload, 1500);
    return () => window.clearTimeout(timeoutId);
  }, [user, progress.cvCompleted, progress.twinCompleted]);

  return null;
}

export default App;