// frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './contexts/user-context'
import { ThemeProvider } from './lib/theme'
import ProtectedRoute from './routes/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import EmailVerified from './pages/Auth/EmailVerified'

import Profile from './pages/User/Profile'
import ConfirmEmail from './pages/User/ConfirmEmail'
import ConfirmDelete from './pages/User/ConfirmDelete'

import DashboardLayout from './components/layouts/DashboardLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import TwinBuilder from './pages/Twin-builder/TwinBuilder'
import Simulations from './pages/Simulation/Simulations'
import Opportunities from './pages/Oportunities/Opportunities'
import CVAnalyzer from './pages/CV-analysis/CVAnalyzer'
import InterviewCoach from './pages/Interview/InterviewCoach'
import Applications from './pages/Oportunities/Applications'

import Chat from './pages/AI/Chat'
import AdminPanel from './pages/AdminPanel'

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
          <Route path="/verify" element={<EmailVerified />} />
          <Route path="confirm-email" element={<ConfirmEmail />} />
          <Route path="confirm-delete" element={<ConfirmDelete />} />

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

            <Route path="cv-analyzer" element={<CVAnalyzer />} />
            <Route path="twin" element={<TwinBuilder />} />
            <Route path="twin-builder" element={<TwinBuilder />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="simulations" element={<Simulations />} />
            <Route path="interview-coach" element={<InterviewCoach />} />
            <Route path="applications" element={<Applications />} />
            <Route path="chat" element={<Chat />} />
            
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
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
