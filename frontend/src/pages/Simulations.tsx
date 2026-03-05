import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { TrendingUp, Zap, Target, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { twinAPI } from "../lib/api"

interface SimulationResult {
  income: number
  skillGrowth: number
  employabilityIndex: number
  milestones: string[]
}

interface PathProjections {
  threeMonth?: SimulationResult | null
  sixMonth?: SimulationResult | null
  twelveMonth?: SimulationResult | null
}

interface PathSimulation {
  pathId: string
  pathName: string
  description: string
  projections: PathProjections
}

interface ChartDataPoint {
  month: string
  [key: string]: string | number // Dynamic path IDs as keys
}

// Default paths configuration
const pathsConfig = [
  { id: "freelancing", label: "Freelancing", color: "#7C3AED" },
  { id: "learnership", label: "Learnership", color: "#84CC16" },
  { id: "short_course", label: "Short Course", color: "#F59E0B" },
  { id: "entry_tech", label: "Entry Tech Job", color: "#06B6D4" },
  { id: "internship", label: "Internship", color: "#EC4899" },
  { id: "graduate_program", label: "Graduate Program", color: "#14B8A6" },
]

export default function Simulations() {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [simulations, setSimulations] = useState<PathSimulation[]>([])
  const [incomeChartData, setIncomeChartData] = useState<ChartDataPoint[]>([])
  const [employabilityData, setEmployabilityData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [empowermentScore, setEmpowermentScore] = useState<number | null>(null)

  useEffect(() => {
    // Fetch twin data to get empowerment score
    const fetchTwin = async () => {
      try {
        const response = await twinAPI.get()
        if (response.status === 'success' && response.data?.twin) {
          setEmpowermentScore(response.data.twin.empowermentScore)
        }
      } catch (error) {
        console.log("No twin found")
      }
    }
    fetchTwin()
  }, [])

  const togglePath = (id: string) => {
    setSelectedPaths((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const runSimulation = async () => {
    if (selectedPaths.length === 0) {
      setError("Please select at least one career path to simulate")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      const response = await twinAPI.simulate(selectedPaths)
      
      if (response.status === 'success' && response.data?.simulations) {
        const simulationResults: PathSimulation[] = response.data.simulations
        
        setSimulations(simulationResults)
        
        // Transform simulation results into chart data
        const chartData = transformSimulationsToChartData(simulationResults)
        setIncomeChartData(chartData)
        
        // Calculate employability data from simulations
        const employability = calculateEmployabilityData(simulationResults)
        setEmployabilityData(employability)
      } else {
        setError("Invalid response from simulation service. Please try again.")
      }
    } catch (error: any) {
      console.error("Simulation error:", error)
      setError(error.message || "Failed to run simulation. Please try again.")
      setSimulations([])
      setIncomeChartData([])
      setEmployabilityData([])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Transform simulation results into monthly chart data
   * Interpolates between 3, 6, and 12-month projections
   */
  const transformSimulationsToChartData = (simulations: PathSimulation[]): ChartDataPoint[] => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const chartData: ChartDataPoint[] = []
    
    // Initialize all months with zero values for selected paths
    for (let i = 0; i < 12; i++) {
      const dataPoint: ChartDataPoint = { month: monthNames[i] }
      
      simulations.forEach(sim => {
        // Map path names to chart-friendly keys
        const chartKey = mapPathIdToChartKey(sim.pathId)
        
        // Get projections
        const threeMonth = sim.projections.threeMonth?.income || 0
        const sixMonth = sim.projections.sixMonth?.income || 0
        const twelveMonth = sim.projections.twelveMonth?.income || 0
        
        // Interpolate monthly values
        let income = 0
        if (i < 3) {
          // Months 0-2: interpolate from 0 to 3-month
          income = (threeMonth / 3) * (i + 1)
        } else if (i < 6) {
          // Months 3-5: interpolate from 3-month to 6-month
          const progress = (i - 2) / 3 // 0 to 1 between month 3 and 6
          income = threeMonth + (sixMonth - threeMonth) * progress
        } else {
          // Months 6-11: interpolate from 6-month to 12-month
          const progress = (i - 5) / 6 // 0 to 1 between month 6 and 12
          income = sixMonth + (twelveMonth - sixMonth) * progress
        }
        
        dataPoint[chartKey] = Math.round(income)
      })
      
      chartData.push(dataPoint)
    }
    
    return chartData
  }

  /**
   * Map path IDs from backend to chart-friendly keys
   */
  const mapPathIdToChartKey = (pathId: string): string => {
    const mapping: Record<string, string> = {
      'freelancing': 'freelance',
      'learnership': 'learnership',
      'short_course': 'course',
      'entry_tech': 'tech',
      'internship': 'internship',
      'graduate_program': 'graduate'
    }
    return mapping[pathId] || pathId
  }

  /**
   * Calculate employability data from simulations
   */
  const calculateEmployabilityData = (simulations: PathSimulation[]): any[] => {
    // Aggregate employability indices from all simulations
    const skillMap: Record<string, number> = {}
    let totalSimulations = 0
    
    simulations.forEach(sim => {
      const avgEmployability = (
        (sim.projections.threeMonth?.employabilityIndex || 0) +
        (sim.projections.sixMonth?.employabilityIndex || 0) +
        (sim.projections.twelveMonth?.employabilityIndex || 0)
      ) / 3
      
      // Map path names to skill categories
      const skillCategory = mapPathToSkillCategory(sim.pathId)
      skillMap[skillCategory] = (skillMap[skillCategory] || 0) + avgEmployability
      totalSimulations++
    })
    
    // Convert to chart data format
    return Object.entries(skillMap).map(([skill, score]) => ({
      skill,
      score: Math.round(score / totalSimulations)
    })).sort((a, b) => b.score - a.score)
  }

  /**
   * Map path IDs to skill categories for employability chart
   */
  const mapPathToSkillCategory = (pathId: string): string => {
    const mapping: Record<string, string> = {
      'freelancing': 'Technical',
      'learnership': 'Communication',
      'short_course': 'Problem Solving',
      'entry_tech': 'Technical',
      'internship': 'Teamwork',
      'graduate_program': 'Leadership'
    }
    return mapping[pathId] || 'Other'
  }

  /**
   * Get path configuration from pathId
   */
  const getPathConfig = (pathId: string) => {
    return pathsConfig.find(p => p.id === pathId) || { id: pathId, label: pathId, color: "#6366f1" }
  }

  /**
   * Get projection display from simulation result
   */
  const getProjectionDisplay = (sim: PathSimulation): string => {
    const twelveMonth = sim.projections.twelveMonth?.income || 0
    if (twelveMonth > 0) {
      return `R${(twelveMonth / 1000).toFixed(1)}K/mo`
    }
    const sixMonth = sim.projections.sixMonth?.income || 0
    if (sixMonth > 0) {
      return `R${(sixMonth / 1000).toFixed(1)}K/mo`
    }
    const threeMonth = sim.projections.threeMonth?.income || 0
    if (threeMonth > 0) {
      return `R${(threeMonth / 1000).toFixed(1)}K/mo`
    }
    return "TBD"
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 -mx-3 sm:mx-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-3 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">Income Simulations</h1>
          <p className="text-base sm:text-base text-muted-foreground mt-1 sm:mt-0">Compare different career pathways and see your earning potential</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-secondary/20 text-secondary rounded-lg text-sm sm:text-base min-h-[44px] touch-manipulation">
          <Zap className="h-5 w-5" />
          <span className="font-medium">
            Score: {empowermentScore ? `${empowermentScore.toFixed(1)}/100` : "—"}
          </span>
        </div>
      </div>

      {/* Path Selection */}
      <div className="bg-card border border-border rounded-none sm:rounded-xl p-5 sm:p-6 shadow-sm mx-3 sm:mx-0">
        <h2 className="text-lg sm:text-lg md:text-xl font-semibold text-foreground mb-4">Select Pathways to Compare</h2>
        <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-4">
          {pathsConfig.map((path) => (
            <button
              key={path.id}
              onClick={() => togglePath(path.id)}
              className={cn(
                "px-4 py-2.5 sm:py-2 rounded-lg border flex items-center gap-2 transition-colors min-h-[44px] touch-manipulation text-sm sm:text-base",
                selectedPaths.includes(path.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: path.color }} />
              <span className="text-foreground">{path.label}</span>
            </button>
          ))}
        </div>
        
        {error && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <button
          onClick={runSimulation}
          disabled={selectedPaths.length === 0 || isLoading}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-primary text-white rounded-lg text-base sm:text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px] sm:min-h-[44px] touch-manipulation"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Simulation...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run Simulation
            </>
          )}
        </button>
      </div>

      {/* Charts - Only show if simulations have been run */}
      {simulations.length > 0 ? (
        <>
          {/* Income Projection Chart */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">12-Month Income Projection</h2>
            </div>
            {incomeChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="var(--color-foreground)"
                      tick={{ fill: 'var(--color-foreground)' }}
                    />
                    <YAxis 
                      stroke="var(--color-foreground)"
                      tick={{ fill: 'var(--color-foreground)' }}
                      tickFormatter={(value) => `R${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value: number) => [`R${value.toLocaleString()}`, ""]}
                      labelStyle={{ color: 'var(--color-foreground)' }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--color-foreground)' }} />
                    {simulations.map((sim) => {
                      const pathConfig = getPathConfig(sim.pathId)
                      const chartKey = mapPathIdToChartKey(sim.pathId)
                      return (
                        <Line
                          key={sim.pathId}
                          type="monotone"
                          dataKey={chartKey}
                          name={sim.pathName || pathConfig.label}
                          stroke={pathConfig.color}
                          strokeWidth={2}
                          dot={{ fill: pathConfig.color, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No chart data available
              </div>
            )}
          </div>

          {/* Path Cards - Show actual projections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((sim) => {
              const pathConfig = getPathConfig(sim.pathId)
              return (
                <div
                  key={sim.pathId}
                  className="bg-card border border-primary rounded-xl p-5 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pathConfig.color }} />
                    <span className="font-medium text-foreground">{sim.pathName || pathConfig.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{getProjectionDisplay(sim)}</p>
                  <p className="text-sm text-muted-foreground mb-2">12-month projection</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{sim.description}</p>
                </div>
              )
            })}
          </div>

          {/* Employability Index */}
          {employabilityData.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-5 w-5 text-secondary" />
                <h2 className="text-lg font-semibold text-foreground">Employability Index</h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employabilityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      stroke="var(--color-foreground)"
                      tick={{ fill: 'var(--color-foreground)' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="skill" 
                      stroke="var(--color-foreground)"
                      tick={{ fill: 'var(--color-foreground)' }}
                      width={100} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value: number) => [`${value}%`, "Score"]}
                      labelStyle={{ color: 'var(--color-foreground)' }}
                    />
                    <Bar dataKey="score" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        !isLoading && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Simulation Results Yet</h3>
            <p className="text-muted-foreground mb-6">
              Select one or more career paths above and click "Run Simulation" to see income projections.
            </p>
          </div>
        )
      )}

      {/* AI Recommendation - Show based on simulation results */}
      {simulations.length > 0 && (() => {
        // Find the best path (highest 12-month income)
        const bestPath = simulations.reduce((best, current) => {
          const bestIncome = best.projections.twelveMonth?.income || 0
          const currentIncome = current.projections.twelveMonth?.income || 0
          return currentIncome > bestIncome ? current : best
        }, simulations[0])
        
        const pathConfig = getPathConfig(bestPath.pathId)
        const projection = bestPath.projections.twelveMonth?.income || 0
        
        return (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI Recommendation</h3>
                <p className="text-muted-foreground mb-4">
                  Based on your skills and profile, we recommend the{" "}
                  <strong className="text-foreground">{bestPath.pathName || pathConfig.label}</strong> path.
                  {projection > 0 && (
                    <>
                      {" "}This path offers the potential to earn{" "}
                      <strong className="text-foreground">R{projection.toLocaleString()}/month</strong> within 12 months.
                    </>
                  )}
                </p>
                {bestPath.description && (
                  <p className="text-sm text-muted-foreground mb-4">{bestPath.description}</p>
                )}
                <button className="flex items-center gap-2 text-primary hover:underline">
                  View detailed roadmap <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}




