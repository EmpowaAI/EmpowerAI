import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true)
  const [hasToken, setHasToken] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has a valid token
    const token = localStorage.getItem('empowerai-token')
    
    if (!token) {
      console.error('🔐 NO TOKEN - Redirecting to login...')
      navigate('/login', { 
        replace: true,
        state: { message: 'Please log in to access this page' }
      })
      return
    }

    console.log('🔐 Token found! User is authenticated ✅')
    setHasToken(true)
    setIsChecking(false)
  }, [navigate])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!hasToken) {
    return null
  }

  return <>{children}</>
}
