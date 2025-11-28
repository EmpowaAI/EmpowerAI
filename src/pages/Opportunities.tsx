"use client"

import { useState } from "react"
import { Search, MapPin, Clock, Briefcase, GraduationCap, Building, Heart, Filter } from "lucide-react"
import { cn } from "../lib/utils"

const opportunities = [
  {
    id: 1,
    title: "Junior Web Developer",
    company: "TechCo SA",
    location: "Johannesburg",
    type: "Full-time",
    category: "job",
    salary: "R15,000 - R22,000",
    match: 92,
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Digital Marketing Learnership",
    company: "MediaHouse",
    location: "Cape Town",
    type: "Learnership",
    category: "learnership",
    salary: "R6,500/month",
    match: 88,
    posted: "1 week ago",
  },
  {
    id: 3,
    title: "IT Support Internship",
    company: "FinServe",
    location: "Pretoria",
    type: "Internship",
    category: "internship",
    salary: "R8,000/month",
    match: 85,
    posted: "3 days ago",
  },
  {
    id: 4,
    title: "Software Development Bursary",
    company: "Allan Gray",
    location: "Remote",
    type: "Bursary",
    category: "bursary",
    salary: "Full tuition + R5,000",
    match: 78,
    posted: "5 days ago",
  },
  {
    id: 5,
    title: "Data Entry Clerk",
    company: "DataPro",
    location: "Durban",
    type: "Full-time",
    category: "job",
    salary: "R10,000 - R14,000",
    match: 82,
    posted: "1 day ago",
  },
  {
    id: 6,
    title: "UX Design Course",
    company: "DesignLab",
    location: "Online",
    type: "Course",
    category: "course",
    salary: "R2,500 (subsidized)",
    match: 90,
    posted: "2 weeks ago",
  },
]

const categories = [
  { id: "all", label: "All", icon: Briefcase },
  { id: "job", label: "Jobs", icon: Building },
  { id: "learnership", label: "Learnerships", icon: GraduationCap },
  { id: "internship", label: "Internships", icon: Clock },
  { id: "bursary", label: "Bursaries", icon: GraduationCap },
  { id: "course", label: "Courses", icon: GraduationCap },
]

export default function Opportunities() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [saved, setSaved] = useState<number[]>([])

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) || opp.company.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || opp.category === category
    return matchesSearch && matchesCategory
  })

  const toggleSave = (id: number) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Opportunities Hub</h1>
        <p className="text-muted-foreground">Discover SA-specific jobs, learnerships, and more</p>
      </div>

      {/* Search and Filter - Updated for light theme */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities..."
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
      <p className="text-sm text-muted-foreground">Showing {filteredOpportunities.length} opportunities</p>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
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
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="px-3 py-1 bg-muted text-sm text-muted-foreground rounded-lg">{opp.type}</span>
              <span className="text-sm font-medium text-foreground">{opp.salary}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
