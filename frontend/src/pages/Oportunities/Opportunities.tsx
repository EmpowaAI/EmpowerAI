import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Briefcase, GraduationCap, Building, Heart, Filter, ExternalLink, Loader2 } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
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
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [careerGoalFilters, setCareerGoalFilters] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
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

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, careerGoalFilters.join(',')])

  useEffect(() => {
    try {
      const twinDataRaw = localStorage.getItem('twinData')
      if (twinDataRaw) {
        const twinData = JSON.parse(twinDataRaw)
        const goals = twinData?.careerGoals || twinData?.interests || []
        if (Array.isArray(goals) && goals.length > 0) {
          setCareerGoalFilters(goals)
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, [])

  useEffect(() => {
    const twinFetch = async () => {
      try {
        if (careerGoalFilters.length === 0 && user) {
          const { twinAPI } = await import("../../lib/api")
          const twinResponse = await twinAPI.get()
          const twin = twinResponse?.data?.twin
          const goals = twin?.careerGoals || twin?.interests || []
          if (Array.isArray(goals) && goals.length > 0) {
            setCareerGoalFilters(goals)
            localStorage.setItem('twinData', JSON.stringify(twin))
          }
        }
      } catch (e) {
        // Ignore fetch errors
      }
    }

    twinFetch()
  }, [user, careerGoalFilters.length])

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
        
        // Get user's career goals from their Digital Twin (localStorage)
        const filters: { province?: string; type?: string; skills?: string; careerGoals?: string; q?: string; page?: number; limit?: number; sort?: string } = {}
        if (careerGoalFilters.length > 0) {
          filters.careerGoals = careerGoalFilters.join(',')
        }
        if (category && category !== "all") {
          filters.type = category
        }
        const cvSkills = localStorage.getItem('cvSkills')
        if (cvSkills) {
          try {
            const skills = JSON.parse(cvSkills)
            if (Array.isArray(skills) && skills.length > 0) {
              filters.skills = skills.slice(0, 5).join(',')
            }
          } catch {
            // ignore
          }
        }
        if (debouncedSearch) {
          filters.q = debouncedSearch
        }
        filters.page = page
        filters.limit = 24
        filters.sort = debouncedSearch || careerGoalFilters.length > 0 ? 'relevance' : 'createdAt'
        
        setFallbackNotice("")
        let response = await opportunitiesAPI.getAll(filters)
        
        if (response.status === 'success' && response.data?.opportunities) {
          const shouldFallback =
            response.data.opportunities.length === 0 &&
            careerGoalFilters.length > 0 &&
            !debouncedSearch &&
            category === "all"

          if (shouldFallback) {
            const fallbackFilters = { ...filters }
            delete fallbackFilters.careerGoals
            fallbackFilters.sort = 'createdAt'
            response = await opportunitiesAPI.getAll(fallbackFilters)
            setFallbackNotice("No exact matches for your goals yet. Showing all opportunities instead.")
          }

          // Transform backend data to match frontend Opportunity interface
          const transformedOpportunities = response.data.opportunities.map((opp: any) => ({
            id: opp._id || opp.id,
            title: opp.title,
            company: opp.company || 'Company Name',
            location: opp.location || opp.province?.join(', ') || 'Location TBD',
            type: opp.type || 'job',
            category: opp.type || 'job',
            salary: opp.salaryRange 
              ? `R${opp.salaryRange.min?.toLocaleString() || 0} - R${opp.salaryRange.max?.toLocaleString() || 0}`
              : undefined,
            match: calculateMatchScore(opp, user),
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
          if (response.meta) {
            setTotalPages(response.meta.totalPages || 1)
            setHasMore(Boolean(response.meta.hasMore))
            setTotalFiltered(
              typeof response.meta.totalFiltered === 'number' ? response.meta.totalFiltered : null
            )
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
  }, [user, careerGoalFilters, category, debouncedSearch, page, reloadTick])

  const calculateMatchScore = (opportunity: any, _user: any): number => {
    // Simple matching algorithm based on skills and province
    let score = 50 // Base score
    
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

  const toggleSave = (id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
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

  const careerGoals = [
    "Tech Career",
    "Freelancing",
    "Corporate Job",
    "Entrepreneurship",
    "Creative Industry",
    "Finance",
    "Healthcare",
    "Education",
  ]

  const toggleCareerGoal = (goal: string) => {
    setCareerGoalFilters((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
    setPage(1)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setCareerGoalFilters([])
    setPage(1)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Career Opportunities</h1>
          <p className="text-muted-foreground">Real jobs, learnerships, internships, and bursaries across South Africa</p>
        </div>
        <LoadingState message="Loading opportunities..." />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-5 md:space-y-6 -mx-3 sm:-mx-4 md:mx-0">
      {/* Header */}
      <div className="text-center sm:text-left px-3 sm:px-4 md:px-0">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">Career Opportunities</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-2">
          Real jobs, learnerships, internships, and bursaries across South Africa.
          <span className="ml-2 text-xs text-muted-foreground">Updated daily - Transparent matching</span>
        </p>
      </div>

      {/* Career Goals Prompt */}
      {careerGoalFilters.length === 0 && (
        <div className="mx-3 sm:mx-0 rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Get matched opportunities</p>
            <p className="text-xs text-muted-foreground">Select a career goal below or update your Digital Twin to personalize results.</p>
          </div>
          <Link
            to="/dashboard/twin"
            className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Update Digital Twin
          </Link>
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

      {/* Career Goals Filter */}
      <div className="flex flex-wrap gap-2.5 sm:gap-2 px-3 sm:px-0">
        {careerGoals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleCareerGoal(goal)}
            aria-pressed={careerGoalFilters.includes(goal)}
            className={cn(
              "flex items-center gap-2 sm:gap-2 px-4 sm:px-4 py-2.5 sm:py-2.5 text-sm sm:text-sm rounded-lg transition-colors min-h-[44px] sm:min-h-[40px] touch-manipulation",
              careerGoalFilters.includes(goal)
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{goal}</span>
          </button>
        ))}
        {careerGoalFilters.length > 0 && (
          <button
            onClick={() => setCareerGoalFilters([])}
            className="px-4 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground bg-card"
          >
            Clear goals
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground px-3 sm:px-0">
        Match scores consider your skills, location, and career goals. Adjust filters to refine results.
      </p>

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
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground",
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
            className="bg-card border border-border rounded-none sm:rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-colors shadow-sm"
          >
            {selectedOpportunity?.id === opp.id && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
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
                <span className="px-2 sm:px-3 py-1 bg-accent/20 text-accent text-xs sm:text-sm rounded-full font-medium whitespace-nowrap">
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
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
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
            description="Try adjusting your search, category, or career goals to see more results."
          />
          {(debouncedSearch || category !== "all" || careerGoalFilters.length > 0) && (
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


