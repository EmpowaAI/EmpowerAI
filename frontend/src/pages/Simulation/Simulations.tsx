import { useState, useEffect, lazy, Suspense } from "react"
import { Link } from "react-router-dom"
import { Zap, Target, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "../../lib/utils"
import { twinAPI } from "../../lib/api"

const SimulationCharts = lazy(() => import("./SimulationCharts"))

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

const MAX_SELECTED_PATHS = 3

const pathMeta: Record<string, { duration: string; difficulty: "Low" | "Medium" | "High"; starterIncome: string; recommended?: boolean }> = {
  freelancing: { duration: "1-2 months", difficulty: "Medium", starterIncome: "R3K-R12K", recommended: true },
  learnership: { duration: "6-12 months", difficulty: "Low", starterIncome: "R2K-R6K" },
  short_course: { duration: "2-4 months", difficulty: "Low", starterIncome: "R4K-R10K" },
  entry_tech: { duration: "3-6 months", difficulty: "Medium", starterIncome: "R8K-R18K", recommended: true },
  internship: { duration: "3-12 months", difficulty: "Medium", starterIncome: "R4K-R9K" },
  graduate_program: { duration: "12-24 months", difficulty: "High", starterIncome: "R10K-R20K" },
}

const normalizePathId = (pathId: string): string => {
  return pathId.trim().toLowerCase().replace(/[-\s]+/g, "_")
}

export default function Simulations() {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [simulations, setSimulations] = useState<PathSimulation[]>([])
  const [incomeChartData, setIncomeChartData] = useState<ChartDataPoint[]>([])
  const [employabilityData, setEmployabilityData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [empowermentScore, setEmpowermentScore] = useState<number | null>(null)
  const [visibleChartPathIds, setVisibleChartPathIds] = useState<string[]>([])

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
    setSelectedPaths((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= MAX_SELECTED_PATHS) {
        setError(`You can compare up to ${MAX_SELECTED_PATHS} pathways at a time`)
        return prev
      }
      setError("")
      return [...prev, id]
    })
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
        setVisibleChartPathIds(simulationResults.map((sim) => sim.pathId))
        
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
    const normalizedPathId = normalizePathId(pathId)
    const mapping: Record<string, string> = {
      'freelancing': 'freelance',
      'learnership': 'learnership',
      'short_course': 'course',
      'entry_tech': 'tech',
      'internship': 'internship',
      'graduate_program': 'graduate'
    }
    return mapping[normalizedPathId] || normalizedPathId
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
    const normalizedPathId = normalizePathId(pathId)
    const mapping: Record<string, string> = {
      'freelancing': 'Technical',
      'learnership': 'Communication',
      'short_course': 'Problem Solving',
      'entry_tech': 'Technical',
      'internship': 'Teamwork',
      'graduate_program': 'Leadership'
    }
    return mapping[normalizedPathId] || 'Other'
  }

  /**
   * Get path configuration from pathId
   */
  const getPathConfig = (pathId: string) => {
    const normalizedPathId = normalizePathId(pathId)
    return pathsConfig.find(p => p.id === normalizedPathId) || { id: normalizedPathId, label: pathId, color: "#6366f1" }
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

  const getTwelveMonthIncome = (sim: PathSimulation): number => sim.projections.twelveMonth?.income || 0

  const getSimulationConfidence = (sim: PathSimulation): "High" | "Medium" | "Early Estimate" => {
    const points = [sim.projections.threeMonth, sim.projections.sixMonth, sim.projections.twelveMonth]
      .filter((p) => (p?.income || 0) > 0).length
    if (points >= 3) return "High"
    if (points === 2) return "Medium"
    return "Early Estimate"
  }

  const setTopThreeVisible = () => {
    const topThree = [...simulations]
      .sort((a, b) => getTwelveMonthIncome(b) - getTwelveMonthIncome(a))
      .slice(0, 3)
      .map((sim) => sim.pathId)
    setVisibleChartPathIds(topThree)
  }

  const topPath = simulations.length
    ? simulations.reduce((best, current) => (getTwelveMonthIncome(current) > getTwelveMonthIncome(best) ? current : best), simulations[0])
    : null
  const bestProjectedIncome = topPath ? getTwelveMonthIncome(topPath) : 0
  const avgEmployability = employabilityData.length
    ? Math.round(employabilityData.reduce((total, item) => total + (item.score || 0), 0) / employabilityData.length)
    : null

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 -mx-3 sm:mx-0 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-3 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">Career Path Simulations</h1>
          <p className="text-base sm:text-base text-muted-foreground mt-1 sm:mt-0">Compare career pathways and preview realistic income growth over 12 months</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-secondary/20 text-secondary rounded-lg text-sm sm:text-base min-h-[44px] touch-manipulation">
          <Zap className="h-5 w-5" />
          <span className="font-medium">
            Empowerment Score: {empowermentScore !== null ? `${empowermentScore.toFixed(1)}/100` : "--"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-3 sm:px-0">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Paths selected</p>
          <p className="text-lg font-semibold text-foreground">{selectedPaths.length}/{MAX_SELECTED_PATHS}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Top path</p>
          <p className="text-lg font-semibold text-foreground">{topPath ? (topPath.pathName || getPathConfig(topPath.pathId).label) : "--"}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Projected max income</p>
          <p className="text-lg font-semibold text-foreground">{bestProjectedIncome > 0 ? `R${bestProjectedIncome.toLocaleString()}/mo` : "--"}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Avg employability</p>
          <p className="text-lg font-semibold text-foreground">{avgEmployability !== null ? `${avgEmployability}%` : "--"}</p>
        </div>
      </div>

      {/* Path Selection */}
      <div className="bg-card border border-border rounded-none sm:rounded-xl p-5 sm:p-6 shadow-sm mx-3 sm:mx-0">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg sm:text-lg md:text-xl font-semibold text-foreground">Select Pathways to Compare</h2>
          <span className="text-xs sm:text-sm text-muted-foreground">{selectedPaths.length} selected</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          Compare up to {MAX_SELECTED_PATHS} pathways. Choose fewer for a clearer chart.
        </p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
          {pathsConfig.map((path) => (
            <button
              key={path.id}
              onClick={() => togglePath(path.id)}
              className={cn(
                "p-4 rounded-lg border text-left transition-colors min-h-[108px] touch-manipulation",
                selectedPaths.includes(path.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/50 hover:bg-muted/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: path.color }} />
                    <span className="text-foreground font-medium">{path.label}</span>
                    {pathMeta[path.id]?.recommended && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">Recommended</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Duration: {pathMeta[path.id]?.duration || "--"} | Difficulty: {pathMeta[path.id]?.difficulty || "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Typical start: {pathMeta[path.id]?.starterIncome || "--"}/mo</p>
                </div>
                {selectedPaths.includes(path.id) && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
              </div>
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
          className="hidden md:flex w-full sm:w-auto px-6 py-3 sm:py-2 bg-primary text-white rounded-lg text-base sm:text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2 min-h-[52px] sm:min-h-[44px] touch-manipulation"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Simulation...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run Simulation ({selectedPaths.length})
            </>
          )}
        </button>
        {selectedPaths.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">Select at least one pathway to enable simulation.</p>
        )}
      </div>

      {/* Charts - Only show if simulations have been run */}
      {simulations.length > 0 ? (
        <>
          <Suspense fallback={<div className="bg-card border border-border rounded-xl p-6 shadow-sm text-sm text-muted-foreground">Loading charts...</div>}>
            <SimulationCharts
              incomeChartData={incomeChartData}
              simulations={simulations}
              visibleChartPathIds={visibleChartPathIds}
              setVisibleChartPathIds={setVisibleChartPathIds}
              getPathConfig={getPathConfig}
              mapPathIdToChartKey={mapPathIdToChartKey}
              setTopThreeVisible={setTopThreeVisible}
              employabilityData={employabilityData}
            />
          </Suspense>

          {/* Path Cards - Show actual projections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((sim) => {
              const pathConfig = getPathConfig(sim.pathId)
              const baseline = Math.min(...simulations.map((item) => getTwelveMonthIncome(item)))
              const delta = getTwelveMonthIncome(sim) - baseline
              const confidence = getSimulationConfidence(sim)
              return (
                <div
                  key={sim.pathId}
                  className="bg-card border border-primary rounded-xl p-5 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pathConfig.color }} />
                      <span className="font-medium text-foreground">{sim.pathName || pathConfig.label}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{confidence}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{getProjectionDisplay(sim)}</p>
                  <p className="text-sm text-muted-foreground mb-2">12-month projection</p>
                  <p className={cn("text-xs mb-2", delta >= 0 ? "text-secondary" : "text-muted-foreground")}>
                    {delta >= 0 ? "+" : ""}R{delta.toLocaleString()} vs baseline pathway
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{sim.description}</p>
                </div>
              )
            })}
          </div>

        </>
      ) : (
        /* Empty State */
        !isLoading && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Simulation Results Yet</h3>
            <p className="text-muted-foreground mb-6">
              Select one or more pathways above, then run a simulation to get income, skills, and employability projections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={runSimulation}
                disabled={selectedPaths.length === 0 || isLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Run Simulation
              </button>
              <Link
                to="/dashboard/twin"
                className="w-full sm:w-auto px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Update Digital Twin
              </Link>
            </div>
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

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-3 z-30">
        <button
          onClick={runSimulation}
          disabled={selectedPaths.length === 0 || isLoading}
          className="w-full px-5 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run Simulation ({selectedPaths.length}/{MAX_SELECTED_PATHS})
            </>
          )}
        </button>
      </div>
    </div>
  )
}





