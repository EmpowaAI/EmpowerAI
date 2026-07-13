import { twinAPI } from '../lib/api'
import { API_BASE_URL } from '../lib/apiBase'

export interface ProgressData {
  cvCompleted: boolean
  twinCompleted: boolean
  empowermentScore: number | null
}

const localProgress = (): ProgressData => ({
  cvCompleted: localStorage.getItem('cvCompleted') === 'true',
  twinCompleted: localStorage.getItem('twinCompleted') === 'true',
  empowermentScore: localStorage.getItem('empowermentScore')
    ? parseInt(localStorage.getItem('empowermentScore')!)
    : null,
})

export async function syncProgressFromBackend(): Promise<ProgressData> {
  const token = localStorage.getItem('empowerai-token')
  if (!token) return localProgress()

  const headers = { Authorization: `Bearer ${token}` }

  // Run both checks in parallel - twin existence implies CV exists too.
  const [twinResult, cvResult] = await Promise.allSettled([
    twinAPI.get(),
    fetch(`${API_BASE_URL}/cv/profile`, { headers }).then(r => r.json()),
  ])

  const twin =
    twinResult.status === 'fulfilled' &&
    twinResult.value?.status === 'success' &&
    twinResult.value?.data?.twin
      ? twinResult.value.data.twin
      : null

  const hasCvProfile =
    cvResult.status === 'fulfilled' &&
    cvResult.value?.data?.profile != null

  // Only fall back to localStorage when the API call itself failed (network error).
  // If the call succeeded but returned no profile, that is authoritative - don't
  // let stale localStorage override it.
  const cvApiCallFailed = cvResult.status === 'rejected'
  const twinApiCallFailed = twinResult.status === 'rejected'

  const cvCompleted = cvApiCallFailed
    ? !!(twin || hasCvProfile || localStorage.getItem('cvCompleted') === 'true')
    : !!(twin || hasCvProfile)

  const twinCompleted = twinApiCallFailed
    ? !!(twin || localStorage.getItem('twinCompleted') === 'true')
    : !!twin

  if (cvCompleted) localStorage.setItem('cvCompleted', 'true')
  if (twinCompleted) localStorage.setItem('twinCompleted', 'true')

  const twinScore = twin?.economy?.employabilityScore ?? twin?.empowermentScore ?? null;

  if (twin) {
    if (twinScore) {
      localStorage.setItem('empowermentScore', String(twinScore))
    }
    localStorage.setItem('twinData', JSON.stringify(twin))
    localStorage.setItem('twinCreated', 'true')
  }

  return {
    cvCompleted,
    twinCompleted,
    empowermentScore: twinScore
      ?? (localStorage.getItem('empowermentScore') ? parseInt(localStorage.getItem('empowermentScore')!) : null),
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
