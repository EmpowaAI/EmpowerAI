import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './lib/user-context'
import { ThemeProvider } from './lib/theme'
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

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
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
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
