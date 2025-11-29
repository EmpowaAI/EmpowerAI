import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Zap, Target, ArrowRight } from "lucide-react"
import { cn } from "../lib/utils"

const incomeData = [
  { month: "Jan", freelance: 1500, learnership: 2000, course: 0, tech: 0 },
  { month: "Feb", freelance: 2200, learnership: 2000, course: 0, tech: 0 },
  { month: "Mar", freelance: 3100, learnership: 2500, course: 1000, tech: 0 },
  { month: "Apr", freelance: 3800, learnership: 3000, course: 2500, tech: 0 },
  { month: "May", freelance: 4200, learnership: 3500, course: 4000, tech: 3500 },
  { month: "Jun", freelance: 4800, learnership: 4000, course: 5500, tech: 6000 },
  { month: "Jul", freelance: 5200, learnership: 4500, course: 6500, tech: 7500 },
  { month: "Aug", freelance: 5800, learnership: 5000, course: 7500, tech: 9000 },
  { month: "Sep", freelance: 6200, learnership: 5500, course: 8000, tech: 10500 },
  { month: "Oct", freelance: 6800, learnership: 6000, course: 9000, tech: 12000 },
  { month: "Nov", freelance: 7200, learnership: 6500, course: 9500, tech: 13000 },
  { month: "Dec", freelance: 8000, learnership: 7000, course: 10000, tech: 15000 },
]

const employabilityData = [
  { skill: "Technical", score: 75 },
  { skill: "Communication", score: 85 },
  { skill: "Problem Solving", score: 70 },
  { skill: "Teamwork", score: 80 },
  { skill: "Adaptability", score: 90 },
]

const paths = [
  { id: "freelance", label: "Freelancing", color: "#7C3AED", projection: "R8,000/mo", time: "By Dec" },
  { id: "learnership", label: "Learnership", color: "#84CC16", projection: "R7,000/mo", time: "By Dec" },
  { id: "course", label: "Short Course", color: "#F59E0B", projection: "R10,000/mo", time: "By Dec" },
  { id: "tech", label: "Entry Tech Job", color: "#06B6D4", projection: "R15,000/mo", time: "By Dec" },
]

export default function Simulations() {
  const [selectedPaths, setSelectedPaths] = useState(["freelance", "learnership"])

  const togglePath = (id: string) => {
    setSelectedPaths((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Income Simulations</h1>
          <p className="text-muted-foreground">Compare different career pathways and see your earning potential</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg">
          <Zap className="h-5 w-5" />
          <span className="font-medium">Empowerment Score: 78/100</span>
        </div>
      </div>

      {/* Path Selection */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Select Pathways to Compare</h2>
        <div className="flex flex-wrap gap-3">
          {paths.map((path) => (
            <button
              key={path.id}
              onClick={() => togglePath(path.id)}
              className={cn(
                "px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors",
                selectedPaths.includes(path.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: path.color }} />
              <span className="text-foreground">{path.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Income Projection Chart - Updated chart colors for light theme */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">12-Month Income Projection</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" tickFormatter={(value) => `R${value / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                labelStyle={{ color: "#334155" }}
                formatter={(value: number) => [`R${value.toLocaleString()}`, ""]}
              />
              {paths.map(
                (path) =>
                  selectedPaths.includes(path.id) && (
                    <Line
                      key={path.id}
                      type="monotone"
                      dataKey={path.id}
                      stroke={path.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ),
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Path Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paths.map((path) => (
          <div
            key={path.id}
            className={cn(
              "bg-card border rounded-xl p-5 transition-colors shadow-sm",
              selectedPaths.includes(path.id) ? "border-primary" : "border-border",
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: path.color }} />
              <span className="font-medium text-foreground">{path.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{path.projection}</p>
            <p className="text-sm text-muted-foreground">{path.time}</p>
          </div>
        ))}
      </div>

      {/* Employability Index - Updated chart for light theme */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-semibold text-foreground">Employability Index</h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employabilityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748B" />
              <YAxis type="category" dataKey="skill" stroke="#64748B" width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                formatter={(value: number) => [`${value}%`, "Score"]}
              />
              <Bar dataKey="score" fill="#06B6D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendation - Updated gradient */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">AI Recommendation</h3>
            <p className="text-muted-foreground mb-4">
              Based on your skills and goals, we recommend starting with{" "}
              <strong className="text-foreground">Freelancing</strong> while pursuing a{" "}
              <strong className="text-foreground">Short Course in Web Development</strong>. This combination offers the
              fastest path to R10,000/month within 8 months.
            </p>
            <button className="flex items-center gap-2 text-primary hover:underline">
              View detailed roadmap <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
