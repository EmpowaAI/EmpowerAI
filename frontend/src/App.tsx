import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './lib/theme'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import EmailVerified from './pages/Auth/EmailVerified'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import TwinBuilder from './pages/Services/TwinBuilder'
import Simulations from './pages/Services/Simulations'
import Opportunities from './pages/Services/Opportunities'
import CVAnalyzer from './pages/Services/CVAnalyzer'
import InterviewCoach from './pages/Services/InterviewCoach'
import Profile from './pages/User/Profile'

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="twin" element={<TwinBuilder />} />
            <Route path="simulations" element={<Simulations />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="cv-analyzer" element={<CVAnalyzer />} />
            <Route path="interview-coach" element={<InterviewCoach />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
