import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './lib/user-context'
import { ThemeProvider } from './lib/theme'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import TwinBuilder from './pages/TwinBuilder'
import Simulations from './pages/Simulations'
import Opportunities from './pages/Opportunities'
import CVAnalyzer from './pages/CVAnalyzer'
import InterviewCoach from './pages/InterviewCoach'
import Applications from './pages/Applications'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import AdminPanel from './pages/AdminPanel'
import { Navigate } from 'react-router-dom'

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="twin" element={<TwinBuilder />} />
            <Route path="simulations" element={<Simulations />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="cv-analyzer" element={<CVAnalyzer />} />
            <Route path="interview-coach" element={<InterviewCoach />} />
            <Route path="applications" element={<Applications />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="admin"
              element={
                import.meta.env.VITE_ENABLE_ADMIN === 'true'
                  ? <AdminPanel />
                  : <Navigate to="/dashboard" replace />
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
