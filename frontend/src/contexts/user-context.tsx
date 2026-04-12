// frontend/src/lib/user-context.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { syncProgressFromBackend } from '../utils/progressSync'
import { clearStoredCvAnalysis, clearStoredCvFileName, getStoredCvAnalysis } from '../lib/sensitiveStorage'


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
    return getStoredCvAnalysis<CVData>()
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

  // FIX: Track whether we're in the middle of a fresh CV analysis flow.
  // When true, skip backend sync so it can't overwrite freshly-set local progress.
  const skipNextSync = useRef(false)

  // Validate token on mount only (not on every user change)
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
          const response = await fetch(`${apiBase}/auth/validate`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.data?.user) {
              setUser(data.data.user)
              console.log('User loaded from backend:', data.data.user.email)
            }
          } else if (response.status === 401) {
            // Only clear session on explicit 401 (invalid/expired token)
            localStorage.removeItem('empowerai-token')
            localStorage.removeItem('user')
            setUser(null)
          }
          // FIX: Any other status (404, 500, etc.) — do NOT clear the session.
          // A non-401 failure means the validate endpoint had a problem,
          // not that the user is unauthenticated.
        } catch (error) {
          console.warn('Failed to validate token:', error)
          // Network error — do NOT clear session
        }
      }
    }

    loadUserFromBackend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // FIX: Sync progress from backend when user is set, but:
  // 1. Skip if skipNextSync is flagged (fresh CV analysis in progress)
  // 2. Never let backend sync DOWNGRADE local progress (cvCompleted: true → false)
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('empowerai-token')
    if (!token) return

    // If we just ran updateProgress (e.g. after CV analysis), skip this sync
    // to avoid the backend overwriting our fresh local state before the twin exists.
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }

    const syncProgress = async () => {
      try {
        const syncedProgress = await syncProgressFromBackend()

        setProgress(prev => {
          // FIX: Never downgrade progress that's already true locally.
          // If local says cvCompleted=true but backend says false (twin not built yet),
          // keep local value. Backend wins only if it returns true.
          return {
            cvCompleted: prev.cvCompleted || syncedProgress.cvCompleted,
            twinCompleted: prev.twinCompleted || syncedProgress.twinCompleted,
            empowermentScore: syncedProgress.empowermentScore ?? prev.empowermentScore,
          }
        })

        if (syncedProgress.cvCompleted) {
          localStorage.setItem('cvCompleted', 'true')
        }
        if (syncedProgress.twinCompleted) {
          localStorage.setItem('twinCompleted', 'true')
        }
        if (syncedProgress.empowermentScore) {
          localStorage.setItem('empowermentScore', String(syncedProgress.empowermentScore))
        }
      } catch (error) {
        console.log('Error syncing progress, using localStorage:', error)
        // On error, keep whatever is already in state — do NOT reset
      }
    }

    syncProgress()
  }, [user])


  // Persist user to localStorage
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
    // FIX: Flag the next sync to be skipped so the backend doesn't immediately
    // overwrite the progress we're about to set (e.g. cvCompleted: true right
    // after analysis, before the twin exists).
    skipNextSync.current = true

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


  const refreshCVData = useCallback(() => {
    const stored = getStoredCvAnalysis<CVData>()
    setCvData(stored)
  }, []) // No dependencies!

  const clearCVData = () => {
    setCvData(null)
    clearStoredCvAnalysis()
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
    clearStoredCvAnalysis()
    clearStoredCvFileName()
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
