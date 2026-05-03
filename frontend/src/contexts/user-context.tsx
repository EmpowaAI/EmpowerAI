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
  profileImage?: string
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
    driversLicence?: boolean
  }
  recommendations?: string[]
  missingKeywords?: string[]
  incomeIdeas?: Array<{
    title: string
    difficulty: string
    potential: string
    description: string
  }>
  strengths?: string[]
  weaknesses?: string[]
  industry?: string
  name?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  citizenship?: string
  driversLicence?: string
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
  isAuthReady: boolean
  reanalyzeCV: () => void
  createNewTwin: () => void
  hasExistingCV: () => boolean
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
  const [isAuthReady, setIsAuthReady] = useState(false)
  const skipNextSync = useRef(false)

  // Load profile image from localStorage on mount and whenever user changes
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profile_image')
    if (savedProfileImage && user && !user.profileImage) {
      setUser(prev => prev ? { ...prev, profileImage: savedProfileImage } : prev)
    }
  }, [user])

  // Validate token on mount only
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
              const backendUser = data.data.user
              const savedProfileImage = localStorage.getItem('profile_image')
              setUser({
                ...backendUser,
                profileImage: backendUser.avatar || backendUser.profileImage || savedProfileImage || undefined
              })
              console.log('User loaded from backend:', backendUser.email)
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

      setIsAuthReady(true)
    }

    loadUserFromBackend()
  }, [])

  // Sync progress from backend
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('empowerai-token')
    if (!token) return

    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }

    const syncProgress = async () => {
      try {
        const syncedProgress = await syncProgressFromBackend()

        setProgress(prev => ({
          cvCompleted: prev.cvCompleted || syncedProgress.cvCompleted,
          twinCompleted: prev.twinCompleted || syncedProgress.twinCompleted,
          empowermentScore: syncedProgress.empowermentScore ?? prev.empowermentScore,
        }))

        if (syncedProgress.cvCompleted) localStorage.setItem('cvCompleted', 'true')
        if (syncedProgress.twinCompleted) localStorage.setItem('twinCompleted', 'true')
        if (syncedProgress.empowermentScore) localStorage.setItem('empowermentScore', String(syncedProgress.empowermentScore))
      } catch (error) {
        console.log('Error syncing progress, using localStorage:', error)
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

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      
      if (updates.profileImage !== undefined) {
        localStorage.setItem('profile_image', updates.profileImage)
      }
    }
  }, [user])

  const refreshCVData = useCallback(() => {
    const stored = getStoredCvAnalysis<CVData>()
    setCvData(stored)
  }, [])

  const clearCVData = () => {
    setCvData(null)
    clearStoredCvAnalysis()
    localStorage.removeItem('cvSkills')
    updateProgress('cvCompleted', false)
  }

  const reanalyzeCV = () => {
    clearStoredCvAnalysis()
    clearStoredCvFileName()
    setCvData(null)
  }

  const createNewTwin = () => {
    localStorage.removeItem('twinData')
    localStorage.removeItem('twinCompleted')
    updateProgress('twinCompleted', false)
  }

  const hasExistingCV = () => {
    return !!cvData && !!cvData.sections && (
      cvData.sections.skills.length > 0 || 
      cvData.sections.experience.length > 0 ||
      cvData.sections.education.length > 0
    )
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
    // ✅ IMPORTANT: DO NOT clear profile_image on logout - keeps image between sessions
    // localStorage.removeItem('profile_image'); // COMMENTED OUT - keeps image
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
      isAuthReady,
      reanalyzeCV,
      createNewTwin,
      hasExistingCV,
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