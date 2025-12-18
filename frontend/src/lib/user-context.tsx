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
  
  const [progress, setProgress] = useState({
    cvCompleted: localStorage.getItem('cvCompleted') === 'true',
    twinCompleted: localStorage.getItem('twinCompleted') === 'true',
    empowermentScore: localStorage.getItem('empowermentScore') 
      ? parseInt(localStorage.getItem('empowermentScore')!) 
      : null
  })

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