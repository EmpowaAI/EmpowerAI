import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './lib/user-context'
import { ThemeProvider } from './lib/theme'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import EmailVerified from './pages/Auth/EmailVerified'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import TwinBuilder from './pages/TwinBuilder'
import Simulations from './pages/Simulations'
import Opportunities from './pages/Opportunities'
import CVAnalyzer from './pages/CVAnalyzer'
import InterviewCoach from './pages/InterviewCoach'
import AboutPage from './pages/AboutPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="cv-analyzer" element={<CVAnalyzer />} />
            <Route path="twin" element={<TwinBuilder />} />
            <Route path="simulations" element={<Simulations />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="interview-coach" element={<InterviewCoach />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
