import React, { createContext, useContext, useState, useEffect } from 'react'
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
  bio?: string
  createdAt?: string
  cvAnalyzed?: boolean
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
  
  // Initialize progress from localStorage
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

  // Sync progress from backend on mount and when user changes - PERMANENT FIX for locked pages
  useEffect(() => {
    const syncProgress = async () => {
      if (user) {
        try {
          const syncedProgress = await syncProgressFromBackend()
          setProgress(syncedProgress)
          
          // If twin exists, ensure all pages are unlocked
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
    }
    
    syncProgress()
  }, [user])

  // Sync progress from localStorage when it changes
  useEffect(() => {
    try {
      const handleStorageChange = () => {
        setProgress(getProgressFromStorage())
      }
      
      // Listen for storage events (from other tabs)
      if (typeof window !== 'undefined') {
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
      }
    } catch (error) {
      console.error('Error setting up progress sync:', error)
    }
  }, [])

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

  const updateProgress = (key: keyof typeof progress, value: any) => {
    const newProgress = { ...progress, [key]: value }
    setProgress(newProgress)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, String(value))
      }
    } catch (error) {
      console.error('Error updating progress in localStorage:', error)
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
    }
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
    <UserContext.Provider value={{ user, setUser, updateUser, logout, progress, updateProgress }}>
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