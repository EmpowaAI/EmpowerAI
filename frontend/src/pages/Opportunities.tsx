import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Briefcase, GraduationCap, Building, Heart, Filter, ExternalLink } from "lucide-react"
import { cn } from "../lib/utils"

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

  // Note: LinkedIn API requires authentication and has limitations
  // This is a conceptual implementation
  useEffect(() => {
    const fetchLinkedInJobs = async () => {
      try {
        setLoading(true)
        // In a real implementation, you'd use:
        // 1. LinkedIn Jobs API (restricted access)
        // 2. RapidAPI LinkedIn alternatives
        // 3. Web scraping (with proper permissions)
        // 4. Partner with LinkedIn for official integration
        
        // For demo purposes, we'll simulate API call
        const mockOpportunities = await simulateLinkedInFetch()
        setOpportunities(mockOpportunities)
      } catch (error) {
        console.error("Error fetching opportunities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLinkedInJobs()
  }, [])

  const simulateLinkedInFetch = (): Promise<Opportunity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "linkedin-1",
            title: "Software Engineer",
            company: "Amazon Web Services",
            location: "Cape Town",
            type: "Full-time",
            category: "job",
            salary: "R45,000 - R65,000",
            match: 95,
            posted: "1 day ago",
            applyUrl: "https://www.linkedin.com/jobs/view/123456789",
            description: "Looking for experienced software engineer..."
          },
          {
            id: "linkedin-2",
            title: "Data Science Intern",
            company: "Standard Bank",
            location: "Johannesburg",
            type: "Internship",
            category: "internship",
            salary: "R15,000/month",
            match: 88,
            posted: "3 days ago",
            applyUrl: "https://www.linkedin.com/jobs/view/987654321",
            description: "Data science internship for graduates..."
          },
        ])
      }, 1000)
    })
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

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">Showing {filteredOpportunities.length} opportunities from LinkedIn</p>

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
