import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  name: string
  email: string
  id: string
  twinCreated?: boolean
  empowermentScore?: number
  twinId?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  progress: {
    cvCompleted: boolean
    twinCompleted: boolean
    empowermentScore: number | null
  }
  updateProgress: (key: keyof UserContextType['progress'], value: any) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  
  // Initialize progress from localStorage
  const getProgressFromStorage = () => ({
    cvCompleted: localStorage.getItem('cvCompleted') === 'true',
    twinCompleted: localStorage.getItem('twinCompleted') === 'true',
    empowermentScore: localStorage.getItem('empowermentScore') 
      ? parseInt(localStorage.getItem('empowermentScore')!) 
      : null
  })

  const [progress, setProgress] = useState(getProgressFromStorage)

  // Sync progress from localStorage when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(getProgressFromStorage())
    }
    
    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange)
    
    // Also check localStorage periodically (for same-tab updates)
    const interval = setInterval(() => {
      const newProgress = getProgressFromStorage()
      setProgress(prev => {
        if (prev.cvCompleted !== newProgress.cvCompleted || 
            prev.twinCompleted !== newProgress.twinCompleted ||
            prev.empowermentScore !== newProgress.empowermentScore) {
          return newProgress
        }
        return prev
      })
    }, 500) // Check every 500ms
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const updateProgress = (key: keyof typeof progress, value: any) => {
    const newProgress = { ...progress, [key]: value }
    setProgress(newProgress)
    localStorage.setItem(key, String(value))
  }

  const logout = () => {
    setUser(null)
    setProgress({
      cvCompleted: false,
      twinCompleted: false,
      empowermentScore: null
    })
    localStorage.removeItem('user')
    localStorage.removeItem('cvCompleted')
    localStorage.removeItem('twinCompleted')
    localStorage.removeItem('empowermentScore')
    localStorage.removeItem('empowerai-token')
    localStorage.removeItem('twinData')
    localStorage.removeItem('twinCreated')
    localStorage.removeItem('twinFormData')
    localStorage.removeItem('cvSkills')
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, progress, updateProgress }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}