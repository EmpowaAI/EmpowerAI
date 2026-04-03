/**
 * Progress Sync Utility
 * Ensures user progress is always synced correctly across the app
 * This is a PERMANENT solution to prevent pages from being locked incorrectly
 */

import { twinAPI } from '../lib/api'

export interface ProgressData {
  cvCompleted: boolean
  twinCompleted: boolean
  empowermentScore: number | null
}

/**
 * Sync progress from backend - checks if user has completed steps
 * This runs on app load and ensures pages are unlocked if they should be
 */
export async function syncProgressFromBackend(): Promise<ProgressData> {
  const defaultProgress: ProgressData = {
    cvCompleted: false,
    twinCompleted: false,
    empowermentScore: null
  }

  try {
    const token = localStorage.getItem('empowerai-token')
    if (!token) {
      // Not authenticated: do not call protected endpoints
      return {
        cvCompleted: localStorage.getItem('cvCompleted') === 'true',
        twinCompleted: localStorage.getItem('twinCompleted') === 'true',
        empowermentScore: localStorage.getItem('empowermentScore')
          ? parseInt(localStorage.getItem('empowermentScore')!)
          : null
      }
    }

    // Check if twin exists - if it does, user has completed both CV and Twin
    const twinResponse = await twinAPI.get()
    
    if (twinResponse?.status === 'success' && twinResponse.data?.twin) {
      const twin = twinResponse.data.twin
      
      // If twin exists, both CV and Twin are completed
      const progress: ProgressData = {
        cvCompleted: true,
        twinCompleted: true,
        empowermentScore: twin.empowermentScore || null
      }
      
      // Update localStorage immediately
      localStorage.setItem('cvCompleted', 'true')
      localStorage.setItem('twinCompleted', 'true')
      if (progress.empowermentScore) {
        localStorage.setItem('empowermentScore', String(progress.empowermentScore))
      }
      localStorage.setItem('twinData', JSON.stringify(twin))
      localStorage.setItem('twinCreated', 'true')
      
      return progress
    }
  } catch (error) {
    console.log('No twin found or error syncing progress:', error)
    // If error, check localStorage as fallback
  }

  // Fallback to localStorage
  return {
    cvCompleted: localStorage.getItem('cvCompleted') === 'true',
    twinCompleted: localStorage.getItem('twinCompleted') === 'true',
    empowermentScore: localStorage.getItem('empowermentScore') 
      ? parseInt(localStorage.getItem('empowermentScore')!) 
      : null
  }
}

/**
 * Unlock all pages - use when twin exists
 * This ensures pages are ALWAYS unlocked when they should be
 */
export function unlockAllPages(empowermentScore?: number) {
  localStorage.setItem('cvCompleted', 'true')
  localStorage.setItem('twinCompleted', 'true')
  if (empowermentScore !== undefined) {
    localStorage.setItem('empowermentScore', String(empowermentScore))
  }
  
  // Trigger storage event so other components update
  window.dispatchEvent(new Event('storage'))
}
