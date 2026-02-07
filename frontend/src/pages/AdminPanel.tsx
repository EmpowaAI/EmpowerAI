import { useEffect, useMemo, useState } from "react"
import { adminAPI } from "../lib/api"
import { cn } from "../lib/utils"

type AdminStats = {
  activeOpportunities?: number
  totalOpportunities?: number
  topCareers?: { career: string; count: number; lastSelectedAt?: string }[]
}

const ADMIN_KEY_STORAGE = "empowerai-admin-key"

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || "")
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [taxonomyJson, setTaxonomyJson] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false)
  const [savingTaxonomy, setSavingTaxonomy] = useState(false)
  const [refreshOptions, setRefreshOptions] = useState({
    backfill: false,
    fetch: true,
    async: true
  })

  const canCallAdmin = useMemo(() => adminKey.trim().length > 0, [adminKey])

  const saveKey = () => {
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim())
    setStatus("Admin key saved.")
    setError(null)
  }

  const loadStats = async () => {
    if (!canCallAdmin) {
      setError("Admin key is required.")
      return
    }
    setError(null)
    setStatus("Loading stats...")
    try {
      const response = await adminAPI.getStats(adminKey.trim())
      setStats(response.data)
      setStatus("Stats loaded.")
    } catch (err: any) {
      setError(err.message || "Failed to load stats.")
    }
  }

  const loadTaxonomy = async () => {
    if (!canCallAdmin) {
      setError("Admin key is required.")
      return
    }
    setLoadingTaxonomy(true)
    setError(null)
    try {
      const response = await adminAPI.getCareerTaxonomy(adminKey.trim())
      setTaxonomyJson(JSON.stringify(response.data?.taxonomy || {}, null, 2))
      setStatus("Taxonomy loaded.")
    } catch (err: any) {
      setError(err.message || "Failed to load taxonomy.")
    } finally {
      setLoadingTaxonomy(false)
    }
  }

  const saveTaxonomy = async () => {
    if (!canCallAdmin) {
      setError("Admin key is required.")
      return
    }
    setSavingTaxonomy(true)
    setError(null)
    try {
      const parsed = JSON.parse(taxonomyJson || "{}")
      await adminAPI.updateCareerTaxonomy(adminKey.trim(), parsed)
      setStatus("Taxonomy saved.")
    } catch (err: any) {
      setError(err.message || "Failed to save taxonomy.")
    } finally {
      setSavingTaxonomy(false)
    }
  }

  const triggerRefresh = async () => {
    if (!canCallAdmin) {
      setError("Admin key is required.")
      return
    }
    setRefreshing(true)
    setError(null)
    try {
      const response = await adminAPI.refreshOpportunities(adminKey.trim(), refreshOptions)
      setStatus(response.data?.message || "Refresh requested.")
    } catch (err: any) {
      setError(err.message || "Refresh failed.")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (adminKey) {
      loadStats().catch(() => {})
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Admin Control Room</h1>
        <p className="text-sm text-muted-foreground">
          Manage career taxonomy, refresh opportunities, and monitor top career selections.
        </p>
      </div>

      {(status || error) && (
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm border",
            error ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
          )}
        >
          {error || status}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Admin Access</h2>
          <p className="text-sm text-muted-foreground">Enter your admin API key to unlock management actions.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin API key"
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground"
          />
          <button
            onClick={saveKey}
            className="h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save Key
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadStats}
            className="rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Load Stats
          </button>
          <button
            onClick={loadTaxonomy}
            className="rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Load Taxonomy
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Refresh Opportunities</h2>
          <p className="text-sm text-muted-foreground">Run a safe refresh without blocking the UI.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={refreshOptions.backfill}
              onChange={(e) => setRefreshOptions((prev) => ({ ...prev, backfill: e.target.checked }))}
              className="h-4 w-4"
            />
            Backfill skills
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={refreshOptions.fetch}
              onChange={(e) => setRefreshOptions((prev) => ({ ...prev, fetch: e.target.checked }))}
              className="h-4 w-4"
            />
            Fetch new jobs
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={refreshOptions.async}
              onChange={(e) => setRefreshOptions((prev) => ({ ...prev, async: e.target.checked }))}
              className="h-4 w-4"
            />
            Async (recommended)
          </label>
        </div>
        <button
          onClick={triggerRefresh}
          disabled={refreshing}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium",
            refreshing ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {refreshing ? "Refreshing..." : "Run Refresh"}
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Career Taxonomy</h2>
          <p className="text-sm text-muted-foreground">
            Edit keywords and boosts per career. Keep JSON valid.
          </p>
        </div>
        <textarea
          value={taxonomyJson}
          onChange={(e) => setTaxonomyJson(e.target.value)}
          placeholder="Click 'Load Taxonomy' to begin editing"
          className="min-h-[260px] w-full rounded-xl border border-border bg-background p-4 text-xs text-foreground font-mono"
        />
        <div className="flex gap-2">
          <button
            onClick={saveTaxonomy}
            disabled={savingTaxonomy}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium",
              savingTaxonomy ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {savingTaxonomy ? "Saving..." : "Save Taxonomy"}
          </button>
          <button
            onClick={loadTaxonomy}
            disabled={loadingTaxonomy}
            className="rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            {loadingTaxonomy ? "Loading..." : "Reload"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Career Analytics</h2>
          <p className="text-sm text-muted-foreground">Most selected career goals by users.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(stats?.topCareers || []).length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No career analytics yet.
            </div>
          )}
          {(stats?.topCareers || []).map((career) => (
            <div key={career.career} className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{career.career}</p>
              <p className="text-xs text-muted-foreground">Selections: {career.count}</p>
              {career.lastSelectedAt && (
                <p className="text-xs text-muted-foreground">
                  Last selected: {new Date(career.lastSelectedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
