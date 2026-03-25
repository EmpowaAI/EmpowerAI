// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/user-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredStep?: 'cv' | 'twin' | 'interview' | 'any';
}

export default function ProtectedRoute({ children, requiredStep = 'any' }: ProtectedRouteProps) {
  const { user, progress } = useUser();
  const location = useLocation();
  
  // Check if user is authenticated
  const token = localStorage.getItem('empowerai-token');
  
  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Route guarding based on progress
  if (requiredStep !== 'any') {
    if (requiredStep === 'cv' && !progress.cvCompleted) {
      return <Navigate to="/dashboard/cv-analyzer" replace />;
    }
    
    if (requiredStep === 'twin' && !progress.twinCompleted) {
      return <Navigate to="/dashboard/twin" replace />;
    }

    if (requiredStep === 'interview' && !progress.twinCompleted) {
      return <Navigate to="/dashboard/twin" replace />;
    }
  }
  
  return <>{children}</>;
}