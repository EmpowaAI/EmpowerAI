import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Briefcase, GraduationCap, Building, Heart, Filter, ExternalLink, Loader2 } from "lucide-react"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import toast from 'react-hot-toast'
import { cn } from "../../lib/utils"
import { opportunitiesAPI, applicationsAPI } from "../../lib/api"
import { useUser } from "../../contexts/user-context"
import LoadingState from "../../components/shared/LoadingState"
import EmptyState from "../../components/EmptyState"
import ErrorAlert from "../../components/shared/ErrorAlert"
import LoadingButton from "../../components/LoadingButton"

interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  type: string
  category: string
  salary?: string
  match: number
  matchReason?: string
  source?: string
  updatedAt?: string
  posted: string
  applyUrl: string
  description: string
}

export default function Opportunities() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('q') || "")
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('q') || "")
  const [category, setCategory] = useState(() => searchParams.get('category') || "all")
  const [saved, setSaved] = useState<string[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [page, setPage] = useState(() => Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1))
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalFiltered, setTotalFiltered] = useState<number | null>(null)
  const [reloadTick, setReloadTick] = useState(0)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [fallbackNotice, setFallbackNotice] = useState("")
  const { user } = useUser()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timeout)
  }, [search])

  // Load persisted bookmarks once on mount
  useEffect(() => {
    applicationsAPI.getSaved()
      .then((res) => setSaved(res.data?.savedIds || []))
      .catch(() => { /* bookmarks are non-blocking — keep empty on failure */ })
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category])

  // Keep filters and page in the URL so back/forward and refresh work
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (category !== 'all') params.set('category', category)
    if (page > 1) params.set('page', String(page))
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, category, page, setSearchParams])

  useEffect(() => {
    const fetchSelectedByHash = async () => {
      const hashId = location.hash?.replace('#', '').trim()
      if (!hashId) {
        setSelectedOpportunity(null)
        return
      }
      try {
        const response = await opportunitiesAPI.getById(hashId)
        if (response.status === 'success' && response.data?.opportunity) {
          const opp = response.data.opportunity
          const mapped: Opportunity = {
            id: opp._id || opp.id,
            title: opp.title,
            company: opp.company || 'Company Name',
            location: opp.location || opp.province?.join(', ') || 'Location TBD',
            type: opp.type || 'job',
            category: opp.type || 'job',
            salary: opp.salaryRange 
              ? `R${opp.salaryRange.min?.toLocaleString() || 0} - R${opp.salaryRange.max?.toLocaleString() || 0}`
              : undefined,
            match: typeof opp.matchScore === 'number' ? opp.matchScore : calculateMatchScore(opp, user),
            matchReason: opp.matchReason,
            source: opp.source,
            updatedAt: opp.updatedAt,
            posted: opp.deadline 
              ? `Closes ${new Date(opp.deadline).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}`
              : opp.createdAt 
              ? `Posted ${new Date(opp.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}`
              : 'Recently',
            applyUrl: opp.applicationUrl || '#',
            description: opp.description || 'No description available'
          }
          setSelectedOpportunity(mapped)
        } else {
          setSelectedOpportunity(null)
          setError("Opportunity not found.")
        }
      } catch (e: any) {
        setSelectedOpportunity(null)
        setError(e.message || "Opportunity not found.")
      }
    }

    fetchSelectedByHash()
  }, [location.hash, user])

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true)
        setError("")
        
        const filters: { province?: string; type?: string; skills?: string; q?: string; career?: string; page?: number; limit?: number; sort?: string; minScore?: number } = {}
        if (category && category !== "all") {
          filters.type = category
        }
        if (debouncedSearch) {
          filters.q = debouncedSearch
        }
        filters.page = page
        filters.limit = 24
        filters.sort = debouncedSearch ? 'relevance' : 'createdAt'

        // Send user skills explicitly so matching works even if server-side CV hydration
        // hasn't run yet or fails. Read from cvSkills first, fall back to twinData.
        const resolvedSkills = (() => {
          try {
            const stored = localStorage.getItem('cvSkills')
            if (stored) {
              const parsed = JSON.parse(stored)
              if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[]
            }
          } catch { /* ignore */ }
          try {
            const twin = JSON.parse(localStorage.getItem('twinData') || '{}')
            const core = twin?.skills?.core ?? twin?.skills
            if (Array.isArray(core) && core.length > 0) return core as string[]
          } catch { /* ignore */ }
          return []
        })()

        if (resolvedSkills.length > 0) {
          filters.skills = resolvedSkills.slice(0, 15).join(',')
        }

        // Send the user's actual target role so the server fetches curated
        // listings for it (e.g. "AI Engineer") instead of falling back to the
        // broad industry. The server treats career as a scoring hint + live
        // fetch term, not a hard filter, so it never returns 0.
        const resolvedCareer = (() => {
          try {
            const twin = JSON.parse(localStorage.getItem('twinData') || '{}')
            const role = twin?.identity?.targetRole || twin?.identity?.currentRole
            if (typeof role === 'string' && role.trim()) return role.trim()
          } catch { /* ignore */ }
          try {
            const cv = JSON.parse(localStorage.getItem('cvAnalysisData') || '{}')
            const role = cv?.targetRole || cv?.analysis?.target_role
            if (typeof role === 'string' && role.trim()) return role.trim()
          } catch { /* ignore */ }
          return ''
        })()
        if (resolvedCareer && !debouncedSearch) {
          filters.career = resolvedCareer
        }

        setFallbackNotice("")
        let response: any = await opportunitiesAPI.getAll(filters)

        const getResponseOpportunities = (r: any) =>
          r?.data?.opportunities ?? r?.data?.data?.opportunities ?? []
        const getResponseMeta = (r: any) => r?.meta ?? r?.data?.meta ?? null

        if (response?.status === 'success') {
          let rawOpportunities = getResponseOpportunities(response)

          if (!Array.isArray(rawOpportunities)) {
            rawOpportunities = []
          }

          // Fallback: smart matching returned 0 → retry with minScore=1.
          // minScore=1 overrides the server's default threshold (45) so that any opportunity
          // with a non-zero match score (even just "type=job" = 5 pts) is returned.
          // This works on both old and new Render deployments without touching MongoDB filters.
          const shouldFallback =
            rawOpportunities.length === 0 &&
            !debouncedSearch &&
            category === "all"

          if (shouldFallback) {
            const fallbackFilters = { ...filters, minScore: 0, sort: 'createdAt' as const }
            delete fallbackFilters.skills
            response = await opportunitiesAPI.getAll(fallbackFilters)
            setFallbackNotice("Showing all available opportunities. Upload your CV for personalised matches.")
            rawOpportunities = getResponseOpportunities(response)
            if (!Array.isArray(rawOpportunities)) rawOpportunities = []
          }

          // Transform backend data to match frontend Opportunity interface
          const transformedOpportunities = rawOpportunities.map((opp: any) => ({
            id: opp._id || opp.id,
            title: opp.title,
            company: opp.company || 'Company Name',
            location: opp.location || opp.province?.join(', ') || 'Location TBD',
            type: opp.type || 'job',
            category: opp.type || 'job',
            salary: opp.salaryRange 
              ? `R${opp.salaryRange.min?.toLocaleString() || 0} - R${opp.salaryRange.max?.toLocaleString() || 0}`
              : undefined,
            match: typeof opp.matchScore === 'number' ? opp.matchScore : calculateMatchScore(opp, user),
            matchReason: opp.matchReason,
            source: opp.source,
            updatedAt: opp.updatedAt,
            posted: opp.deadline 
              ? `Closes ${new Date(opp.deadline).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}`
              : opp.createdAt 
              ? `Posted ${new Date(opp.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}`
              : 'Recently',
            applyUrl: opp.applicationUrl || '#',
            description: opp.description || 'No description available'
          }))
          
          setOpportunities(transformedOpportunities)
          const meta = getResponseMeta(response)
          if (meta) {
            setTotalPages(meta.totalPages || 1)
            setHasMore(Boolean(meta.hasMore))
            setTotalFiltered(typeof meta.totalFiltered === 'number' ? meta.totalFiltered : null)
          } else {
            setTotalPages(1)
            setHasMore(false)
            setTotalFiltered(null)
          }
        } else {
          // Fallback to empty array if no opportunities
          setOpportunities([])
          setTotalPages(1)
          setHasMore(false)
          setTotalFiltered(null)
        }
      } catch (error: any) {
        console.error("Error fetching opportunities:", error)
        setError(error.message || "Failed to load opportunities. Please try again later.")
        // Keep empty array on error, don't show mock data
        setOpportunities([])
        setTotalPages(1)
        setHasMore(false)
        setTotalFiltered(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [user, category, debouncedSearch, page, reloadTick])

  const calculateMatchScore = (opportunity: any, _user: any): number => {
    // Simple matching algorithm based on skills and province
    let score = 0
    
    const cvSkills = localStorage.getItem('cvSkills')
    if (cvSkills && opportunity.skills) {
      try {
        const userSkills = JSON.parse(cvSkills)
        const oppSkills = Array.isArray(opportunity.skills) ? opportunity.skills : []
        const matchingSkills = userSkills.filter((skill: string) => 
          oppSkills.some((oppSkill: string) => 
            oppSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(oppSkill.toLowerCase())
          )
        )
        score += (matchingSkills.length / Math.max(oppSkills.length, 1)) * 50
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    return Math.min(Math.round(score), 100)
  }

  const filteredOpportunities = opportunities
  const listWithSelected = selectedOpportunity
    ? [selectedOpportunity, ...filteredOpportunities.filter(o => o.id !== selectedOpportunity.id)]
    : filteredOpportunities

  const toggleSave = async (id: string) => {
    const wasSaved = saved.includes(id)
    // Optimistic update; revert if the API call fails
    setSaved((prev) => (wasSaved ? prev.filter((i) => i !== id) : [...prev, id]))
    try {
      if (wasSaved) {
        await applicationsAPI.unsave(id)
      } else {
        await applicationsAPI.save(id)
      }
    } catch {
      setSaved((prev) => (wasSaved ? [...prev, id] : prev.filter((i) => i !== id)))
      toast.error(wasSaved ? 'Could not remove bookmark. Please try again.' : 'Could not save bookmark. Please try again.')
    }
  }

  const handleApply = async (opportunity: Opportunity) => {
    // Validate application URL
    if (!opportunity.applyUrl || opportunity.applyUrl === '#') {
      toast.error('Application link not available for this opportunity.')
      return
    }

    try {
      setApplyingId(opportunity.id)
      
      // Track application in database first
      await trackApplication(opportunity.id)
      
      // Ensure URL has protocol
      const url = opportunity.applyUrl.startsWith('http') 
        ? opportunity.applyUrl 
        : `https://${opportunity.applyUrl}`
      
      // Open application URL
      window.open(url, '_blank', 'noopener,noreferrer')
      
      toast.success(`Opening application for ${opportunity.company}`)
    } catch (error) {
      toast.error('Failed to track application')
    } finally {
      setApplyingId(null)
    }
  }

  const trackApplication = async (opportunityId: string) => {
    try {
      await applicationsAPI.track(opportunityId)
    } catch (error) {
      console.error('Failed to track application:', error)
    }
  }

  const categories = [
    { id: "all", label: "All", icon: Briefcase },
    { id: "job", label: "Jobs", icon: Building },
    { id: "learnership", label: "Learnerships", icon: GraduationCap },
    { id: "internship", label: "Internships", icon: Clock },
    { id: "bursary", label: "Bursaries", icon: GraduationCap },
    { id: "course", label: "Courses", icon: GraduationCap },
  ]

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setPage(1)
  }

  const OpportunitiesHero = () => (
    <div className="relative overflow-hidden rounded-2xl text-white" style={{ background: 'var(--gradient-hero)' }}>
      <div className="pointer-events-none absolute inset-0 ai-mesh opacity-15" aria-hidden />
      <div className="pointer-events-none absolute inset-0 ai-grid opacity-10" aria-hidden />
      <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-secondary" />
            South Africa
          </div>
          {totalFiltered !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-white shadow">
              {totalFiltered.toLocaleString()} live
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
          Career <span className="text-gradient-ai">Opportunities</span>
        </h1>
        <p className="mt-2 text-white/75 text-sm md:text-base max-w-md">
          Real jobs, learnerships, internships, and bursaries — updated daily.
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <OpportunitiesHero />
        <LoadingState message="Loading opportunities..." />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-5 md:space-y-6 -mx-3 sm:-mx-4 md:mx-0">
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-0">
        <OpportunitiesHero />
      </div>

      {/* Profile match context */}
      {user ? (
        <div className="mx-3 sm:mx-0 rounded-xl border border-secondary/30 bg-secondary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Matched to your profile</p>
            <p className="text-xs text-muted-foreground">Results are personalised using your CV skills and experience.</p>
          </div>
          <Link
            to="/dashboard/cv-analyzer"
            className="shrink-0 inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card transition-colors"
          >
            Update CV
          </Link>
        </div>
      ) : (
        <div className="mx-3 sm:mx-0 rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Get matched opportunities</p>
            <p className="text-xs text-muted-foreground">Upload your CV or update your Digital Twin to personalise results.</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/cv-analyzer"
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card transition-colors"
            >
              Upload CV
            </Link>
            <Link
              to="/dashboard/twin"
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors font-semibold"
            >
              Update Twin
            </Link>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 md:gap-4 px-3 sm:px-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full pl-12 sm:pl-12 pr-4 sm:pr-4 py-3 sm:py-3 text-base sm:text-base bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[52px] touch-manipulation"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 sm:px-4 py-3 sm:py-3 bg-card border border-border rounded-lg text-base sm:text-base text-muted-foreground hover:text-foreground transition-colors min-h-[52px] touch-manipulation">
          <Filter className="h-5 w-5 sm:h-5 sm:w-5" />
          <span className="sm:inline">Filters</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2.5 sm:gap-2 px-3 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategory(cat.id)
              setPage(1)
            }}
            aria-pressed={category === cat.id}
            className={cn(
              "flex items-center gap-2 sm:gap-2 px-4 sm:px-4 py-2.5 sm:py-2.5 text-sm sm:text-sm rounded-lg transition-colors min-h-[44px] sm:min-h-[40px] touch-manipulation",
              category === cat.id
                ? "bg-secondary text-secondary-foreground border border-secondary/30 shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-secondary/30",
            )}
          >
            <cat.icon className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <ErrorAlert 
            message={error} 
            onDismiss={() => setError("")}
            className="flex-1"
          />
          <button
            onClick={() => setReloadTick((t) => t + 1)}
            className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card"
          >
            Retry
          </button>
        </div>
      )}

      {fallbackNotice && !error && (
        <div className="px-4 py-3 rounded-lg border border-border bg-card text-xs text-muted-foreground">
          {fallbackNotice}
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading opportunities...
          </span>
        ) : (
          `${totalFiltered !== null ? `${totalFiltered}` : listWithSelected.length} ${
            (totalFiltered !== null ? totalFiltered : listWithSelected.length) === 1 ? 'opportunity' : 'opportunities'
          }`
        )}
      </p>

      {/* Opportunities List */}
      <div className="space-y-4 px-3 sm:px-0">
        {listWithSelected.map((opp) => (
          <div
            key={opp.id}
            className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-colors shadow-sm"
          >
            {selectedOpportunity?.id === opp.id && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Selected opportunity
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">{opp.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{opp.company}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="truncate">{opp.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" /> {opp.posted}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                  {(opp.source || opp.updatedAt) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {opp.source && (
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          Source: {opp.source}
                        </span>
                      )}
                      {opp.updatedAt && (
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          Updated {new Date(opp.updatedAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                  {opp.matchReason && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Why this match: <span className="text-foreground">{opp.matchReason}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span className="px-2 sm:px-3 py-1 bg-secondary/10 text-secondary text-xs sm:text-sm rounded-full font-medium whitespace-nowrap">
                  {opp.match}% match
                </span>
                <button
                  onClick={() => toggleSave(opp.id)}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0",
                    saved.includes(opp.id)
                      ? "bg-destructive/20 text-destructive"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", saved.includes(opp.id) && "fill-current")} />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="px-2 sm:px-3 py-1 bg-muted text-xs sm:text-sm text-muted-foreground rounded-lg">{opp.type}</span>
                {opp.salary && <span className="text-xs sm:text-sm font-medium text-foreground">{opp.salary}</span>}
              </div>
              <LoadingButton
                onClick={() => handleApply(opp)}
                isLoading={applyingId === opp.id}
                loadingText="Opening..."
                icon={<ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors w-full sm:w-auto font-semibold"
              >
                Apply Now
              </LoadingButton>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 sm:px-0">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {listWithSelected.length === 0 && !loading && !error && (
        <div className="space-y-3">
          <EmptyState
            icon={Briefcase}
            title="No opportunities found"
            description="Try adjusting your search or category filter to see more results."
          />
          {(debouncedSearch || category !== "all") && (
            <div className="flex justify-center">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


