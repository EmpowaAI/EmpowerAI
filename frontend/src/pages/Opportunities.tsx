import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Briefcase, GraduationCap, Building, Heart, Filter, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { opportunitiesAPI } from "../lib/api"
import { useUser } from "../lib/user-context"
import LoadingState from "../components/LoadingState"
import EmptyState from "../components/EmptyState"
import ErrorAlert from "../components/ErrorAlert"

interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  type: string
  category: string
  salary?: string
  match: number
  posted: string
  applyUrl: string
  description: string
}

export default function Opportunities() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [saved, setSaved] = useState<string[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useUser()

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true)
        setError("")
        
        // Get user's province and skills for filtering
        // NOTE: We don't apply filters by default to show all opportunities
        // Users can filter using the UI filters
        const filters: { province?: string; type?: string; skills?: string } = {}
        
        // Only apply province filter if explicitly set (not from user profile to avoid empty results)
        // Users can use the filter UI to filter by province
        
        // Don't auto-apply skills filter - let users see all opportunities first
        // Skills filter can be applied via the search/filter UI
        
        const response = await opportunitiesAPI.getAll(filters)
        
        if (response.status === 'success' && response.data?.opportunities) {
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
            posted: opp.createdAt 
              ? new Date(opp.createdAt).toLocaleDateString()
              : 'Recently',
            applyUrl: opp.applicationUrl || '#',
            description: opp.description || 'No description available'
          }))
          
          setOpportunities(transformedOpportunities)
        } else {
          // Fallback to empty array if no opportunities
          setOpportunities([])
        }
      } catch (error: any) {
        console.error("Error fetching opportunities:", error)
        setError(error.message || "Failed to load opportunities. Please try again later.")
        // Keep empty array on error, don't show mock data
        setOpportunities([])
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [user])

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

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = !search || 
      opp.title.toLowerCase().includes(search.toLowerCase()) || 
      opp.company.toLowerCase().includes(search.toLowerCase()) ||
      (opp.description && opp.description.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = category === "all" || opp.category === category || opp.type === category
    return matchesSearch && matchesCategory
  })

  const toggleSave = (id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleApply = (opportunity: Opportunity) => {
    // Open LinkedIn application page in new tab
    window.open(opportunity.applyUrl, '_blank', 'noopener,noreferrer')
    
    // Optional: Track application in your database
    trackApplication(opportunity.id)
  }

  const trackApplication = async (opportunityId: string) => {
    try {
      // Send to your backend to track applications
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId })
      })
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
    <div className="space-y-5 sm:space-y-5 md:space-y-6 -mx-3 sm:mx-0">
      {/* Header */}
      <div className="text-center sm:text-left px-3 sm:px-0">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">Career Opportunities</h1>
        <p className="text-base sm:text-base text-muted-foreground mt-2 sm:mt-2">Real jobs, learnerships, internships, and bursaries across South Africa</p>
      </div>

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
            onClick={() => setCategory(cat.id)}
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
        <ErrorAlert 
          message={error} 
          onDismiss={() => setError("")}
        />
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading opportunities...
          </span>
        ) : (
          `Showing ${filteredOpportunities.length} ${filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}`
        )}
      </p>

      {/* Opportunities List */}
      <div className="space-y-4 px-3 sm:px-0">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-card border border-border rounded-none sm:rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-colors shadow-sm"
          >
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
              <button
                onClick={() => handleApply(opp)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Apply Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && !loading && !error && (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="Try adjusting your search filters or check back later for new opportunities."
        />
      )}
    </div>
  )
}
