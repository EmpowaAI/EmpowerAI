import React from "react"
import { Navigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthReady, user } = useUser()

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ message: 'Please log in to access this page' }} />
  }

  return <>{children}</>
}
