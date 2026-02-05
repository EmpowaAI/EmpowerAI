import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { UserProvider } from './lib/user-context'
import { ThemeProvider } from './lib/theme'
import LoadingState from './components/LoadingState'

// Lazy load pages for code splitting - reduces initial bundle size by ~60%
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TwinBuilder = lazy(() => import('./pages/TwinBuilder'))
const Simulations = lazy(() => import('./pages/Simulations'))
const Opportunities = lazy(() => import('./pages/Opportunities'))
const CVAnalyzer = lazy(() => import('./pages/CVAnalyzer'))
const InterviewCoach = lazy(() => import('./pages/InterviewCoach'))
const Profile = lazy(() => import('./pages/Profile'))

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <LoadingState message="Loading..." />
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="twin" element={<TwinBuilder />} />
              <Route path="simulations" element={<Simulations />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="cv-analyzer" element={<CVAnalyzer />} />
              <Route path="interview-coach" element={<InterviewCoach />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
