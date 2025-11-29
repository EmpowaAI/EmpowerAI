import { Routes, Route } from "react-router-dom"
import { UserProvider } from "./lib/user-context"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardLayout from "./pages/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import TwinBuilder from "./pages/TwinBuilder"
import Simulations from "./pages/Simulations"
import Opportunities from "./pages/Opportunities"
import CVAnalyzer from "./pages/CVAnalyzer"
import InterviewCoach from "./pages/InterviewCoach"

export default function App() {
  return (
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
          <Route path="interview" element={<InterviewCoach />} />
        </Route>
      </Routes>
    </UserProvider>
  )
}

