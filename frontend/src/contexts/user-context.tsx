// frontend/src/lib/user-context.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { syncProgressFromBackend } from '../utils/progressSync'

interface User {
  name: string
  email: string
  id: string
  twinCreated?: boolean
  empowermentScore?: number
  twinId?: string
  phone?: string
  location?: string
  occupation?: string
  education?: string
  province?: string
  skills?: string[]
  interests?: string[]
  bio?: string
  createdAt?: string
  cvAnalyzed?: boolean
}

export interface CVData {
  sections: {
    about: string
    skills: string[]
    education: string[]
    experience: string[]
    achievements: string[]
  }
  score: number
  readinessLevel: string
  summary: string
  linkCheck?: {
    linkedin: boolean
    github: boolean
    portfolio: boolean
  }
  recommendations?: string[]
  missingKeywords?: string[]
  incomeIdeas?: Array<{
    title: string
    difficulty: string
    potential: string
    description: string
  }>
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  progress: {
    cvCompleted: boolean
    twinCompleted: boolean
    empowermentScore: number | null
  }
  updateProgress: (key: keyof UserContextType['progress'], value: any) => void
  cvData: CVData | null
  refreshCVData: () => void
  clearCVData: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error)
    }
    return null
  })
  
  const [cvData, setCvData] = useState<CVData | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('comprehensiveCVAnalysis')
        return saved ? JSON.parse(saved) : null
      }
    } catch (error) {
      console.error('Error reading CV data from localStorage:', error)
    }
    return null
  })
  
  const getProgressFromStorage = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return {
          cvCompleted: localStorage.getItem('cvCompleted') === 'true',
          twinCompleted: localStorage.getItem('twinCompleted') === 'true',
          empowermentScore: localStorage.getItem('empowermentScore') 
            ? parseInt(localStorage.getItem('empowermentScore')!) 
            : null
        }
      }
    } catch (error) {
      console.error('Error reading progress from localStorage:', error)
    }
    return {
      cvCompleted: false,
      twinCompleted: false,
      empowermentScore: null
    }
  }

  const [progress, setProgress] = useState(getProgressFromStorage)

  useEffect(() => {
    const loadUserFromBackend = async () => {
      const token = localStorage.getItem('empowerai-token')
      const shouldValidate =
        !!token &&
        (!user ||
          String(user.id || '').startsWith('demo-') ||
          user.email === 'demo@example.com' ||
          user.name?.toLowerCase().includes('demo'))

      if (shouldValidate) {
        try {
          const { API_BASE_URL: apiBase } = await import('../lib/apiBase')

          const response = await fetch(
            `${apiBase}/auth/validate`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.data?.user) {
              setUser(data.data.user)
              console.log('User loaded from backend:', data.data.user.email)
            }
          } else if (response.status === 401) {
            localStorage.removeItem('empowerai-token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } catch (error) {
          console.warn('Failed to validate token:', error)
        }
      }
    }
    
    loadUserFromBackend()
  }, [])

  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('empowerai-token')
    if (!token) return

    const syncProgress = async () => {
      try {
        const syncedProgress = await syncProgressFromBackend()
        setProgress(syncedProgress)

        if (syncedProgress.cvCompleted && syncedProgress.twinCompleted) {
          localStorage.setItem('cvCompleted', 'true')
          localStorage.setItem('twinCompleted', 'true')
          if (syncedProgress.empowermentScore) {
            localStorage.setItem('empowermentScore', String(syncedProgress.empowermentScore))
          }
        }
      } catch (error) {
        console.log('Error syncing progress, using localStorage:', error)
      }
    }

    syncProgress()
  }, [user])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
        } else {
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error)
    }
  }, [user])

  const updateProgress = useCallback((key: keyof typeof progress, value: any) => {
    setProgress(prev => {
      const newProgress = { ...prev, [key]: value }
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, String(value))
        }
      } catch (error) {
        console.error('Error updating progress in localStorage:', error)
      }
      return newProgress
    })
  }, [])

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
    }
  }

  // Only refresh CV data when explicitly called, not on every render
  const refreshCVData = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('comprehensiveCVAnalysis')
        if (saved) {
          const parsed = JSON.parse(saved)
          setCvData(parsed)
          console.log('CV data refreshed:', parsed.sections?.skills?.length || 0, 'skills found')
        } else {
          setCvData(null)
        }
      }
    } catch (error) {
      console.error('Error refreshing CV data:', error)
      setCvData(null)
    }
  }, []) // No dependencies!

  const clearCVData = () => {
    setCvData(null)
    localStorage.removeItem('comprehensiveCVAnalysis')
    localStorage.removeItem('cvSkills')
    updateProgress('cvCompleted', false)
  }

  const logout = () => {
    setUser(null)
    setCvData(null)
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
    localStorage.removeItem('comprehensiveCVAnalysis')
    localStorage.removeItem('cvFileName')
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      updateUser, 
      logout, 
      progress, 
      updateProgress,
      cvData,
      refreshCVData,
      clearCVData,
    }}>
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
