// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './lib/user-context'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import CVAnalyzer from './pages/CVAnalyzer'
import TwinBuilder from './pages/TwinBuilder'
import Simulations from './pages/Simulations'
import Opportunities from './pages/Opportunities'
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
    <UserProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
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
          <Route path="interview" element={<InterviewCoach />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  )
}

export default App