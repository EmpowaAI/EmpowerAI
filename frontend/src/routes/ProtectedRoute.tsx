// src/routes/ProtectedRoute.tsx
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/user-context';
import FeatureLocked from '../components/FeatureLocked';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredStep?: 'cv' | 'twin' | 'interview' | 'any';
}

const featureMap: Record<string, { name: string; description: string }> = {
  '/dashboard/twin': {
    name: 'Digital Twin Builder',
    description: 'Build and manage your AI-powered economic twin',
  },
  '/dashboard/interview-coach': {
    name: 'Interview Coach',
    description: 'Practice interviews with AI coaching',
  },
  '/dashboard/opportunities': {
    name: 'Opportunities',
    description: 'Find AI-matched job opportunities',
  },
  '/dashboard/simulations': {
    name: 'Simulations',
    description: 'Explore career pathways and income projections',
  },
  '/dashboard/chat': {
    name: '24/7 AI Mentorship',
    description: 'Chat with your AI career mentor anytime',
  },
  '/dashboard/applications': {
    name: 'My Applications',
    description: 'Track your job applications',
  },
};

export default function ProtectedRoute({ children, requiredStep = 'any' }: ProtectedRouteProps) {
  const { user, progress, isAuthReady } = useUser();
  const location = useLocation();
  
  // Check if user is authenticated
  const token = localStorage.getItem('empowerai-token');

  // Wait for auth validation before deciding whether to redirect.
  if (!isAuthReady) {
    return null;
  }

  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user && token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine what prerequisite is needed
  let neededStep: 'cv' | 'twin' | null = null;

  if (requiredStep === 'cv' && !progress.cvCompleted) {
    neededStep = 'cv';
  } else if (requiredStep === 'twin' && !progress.twinCompleted) {
    neededStep = 'twin';
  } else if (requiredStep === 'interview' && !progress.twinCompleted) {
    neededStep = 'twin';
  }

  // If there's a prerequisite missing, show the modal
  if (neededStep) {
    const featureInfo = featureMap[location.pathname] || {
      name: 'This Feature',
      description: 'This feature requires additional setup',
    };

    return (
      <>
        <FeatureLocked
          featureName={featureInfo.name}
          featureDescription={featureInfo.description}
          requiredStep={neededStep}
          onClose={() => {
            // Go back when user closes modal
            window.history.back();
          }}
        />
        {/* Keep the children in case they're heavy components that need to unmount */}
        <div style={{ display: 'none' }}>{children}</div>
      </>
    );
  }
  
  return <>{children}</>;
}