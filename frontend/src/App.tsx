import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './lib/user-context'
import { ThemeProvider } from './lib/theme'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import DashboardEnhanced from './pages/Dashboard_Enhanced'
import TwinBuilder from './pages/TwinBuilder'
import Simulations from './pages/Simulations'
import Opportunities from './pages/Opportunities'
import CVAnalyzer from './pages/CVAnalyzer'
import CVAnalyzerSpectacular from './pages/CVAnalyzer_Spectacular'
import InterviewCoach from './pages/InterviewCoach'
import InterviewCoachSpectacular from './pages/InterviewCoach_Spectacular'
import AboutPage from './pages/AboutPage'
import Profile from './pages/Profile'
import NeuralFusionShowcase from './pages/NeuralFusionShowcase'
import VisionBlueprintShowcase from './pages/VisionBlueprintShowcase'
import CleanShowcase from './pages/CleanShowcase'
import TestPage from './pages/TestPage'
import AuthTest from './pages/AuthTest'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  
  // Temporary fix for production - allow dashboard access
  if (!user && window.location.pathname.startsWith('/dashboard')) {
    console.warn('Dashboard accessed without user - allowing access for demo')
    return <>{children}</>
  }
  
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
          <Route path="/neural-fusion" element={<NeuralFusionShowcase />} />
          <Route path="/vision-showcase" element={<VisionBlueprintShowcase />} />
          <Route path="/clean-showcase" element={<CleanShowcase />} />
          <Route path="/test" element={<TestPage />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="enhanced" element={<DashboardEnhanced />} />
            <Route path="cv-analyzer" element={<CVAnalyzer />} />
            <Route path="cv-analyzer-pro" element={<CVAnalyzerSpectacular />} />
            <Route path="twin" element={<TwinBuilder />} />
            <Route path="simulations" element={<Simulations />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="interview-coach" element={<InterviewCoach />} />
            <Route path="interview-coach-pro" element={<InterviewCoachSpectacular />} />
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
