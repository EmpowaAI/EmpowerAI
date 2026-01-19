import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Briefcase, GraduationCap, Building, Heart, Filter, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { opportunitiesAPI } from "../lib/api"
import { useUser } from "../lib/user-context"

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
        const filters: { province?: string; type?: string; skills?: string } = {}
        // TODO: Add province to User interface, for now get from localStorage
        const userProvince = (user as any)?.province || localStorage.getItem('userProvince')
        if (userProvince) {
          filters.province = userProvince
        }
        
        // Get skills from CV analysis
        const cvSkills = localStorage.getItem('cvSkills')
        if (cvSkills) {
          try {
            const skills = JSON.parse(cvSkills)
            if (Array.isArray(skills) && skills.length > 0) {
              filters.skills = skills.slice(0, 5).join(',') // Limit to 5 skills
            }
          } catch (e) {
            console.error('Error parsing CV skills:', e)
          }
        }
        
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
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) || 
      opp.company.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || opp.category === category
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading opportunities from LinkedIn...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">LinkedIn Opportunities</h1>
        <p className="text-muted-foreground">Real jobs and internships from LinkedIn</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search LinkedIn opportunities..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Filter className="h-5 w-5" />
          Filters
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              category === cat.id
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
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
          `Showing ${filteredOpportunities.length} ${filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}`
        )}
      </p>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{opp.title}</h3>
                  <p className="text-muted-foreground">{opp.company}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {opp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {opp.posted}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-accent/20 text-accent text-sm rounded-full font-medium">
                  {opp.match}% match
                </span>
                <button
                  onClick={() => toggleSave(opp.id)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    saved.includes(opp.id)
                      ? "bg-destructive/20 text-destructive"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Heart className={cn("h-5 w-5", saved.includes(opp.id) && "fill-current")} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-muted text-sm text-muted-foreground rounded-lg">{opp.type}</span>
                {opp.salary && <span className="text-sm font-medium text-foreground">{opp.salary}</span>}
              </div>
              <button
                onClick={() => handleApply(opp)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Apply on LinkedIn
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No opportunities found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}
