import { Navigate } from 'react-router-dom'
import { useUser } from '../lib/user-context'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useUser()
  
  // Check if user is authenticated
  const token = localStorage.getItem('empowerai-token')
  
  if (!user && !token) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}
