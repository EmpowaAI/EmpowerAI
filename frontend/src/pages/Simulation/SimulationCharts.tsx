import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { TrendingUp, Target } from "lucide-react"
import { cn } from "../../lib/utils"

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
  [key: string]: string | number
}

interface SimulationChartsProps {
  incomeChartData: ChartDataPoint[]
  simulations: PathSimulation[]
  visibleChartPathIds: string[]
  setVisibleChartPathIds: React.Dispatch<React.SetStateAction<string[]>>
  getPathConfig: (pathId: string) => { id: string; label: string; color: string }
  mapPathIdToChartKey: (pathId: string) => string
  setTopThreeVisible: () => void
  employabilityData: Array<{ skill: string; score: number }>
}

export default function SimulationCharts({
  incomeChartData,
  simulations,
  visibleChartPathIds,
  setVisibleChartPathIds,
  getPathConfig,
  mapPathIdToChartKey,
  setTopThreeVisible,
  employabilityData,
}: SimulationChartsProps) {
  return (
    <>
      {/* Income Projection Chart */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">12-Month Income Projection</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisibleChartPathIds(simulations.map((sim) => sim.pathId))}
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted"
            >
              Show all
            </button>
            <button
              onClick={setTopThreeVisible}
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted"
            >
              Top 3
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {simulations.map((sim) => {
            const pathConfig = getPathConfig(sim.pathId)
            const active = visibleChartPathIds.includes(sim.pathId)
            return (
              <button
                key={`toggle-${sim.pathId}`}
                onClick={() =>
                  setVisibleChartPathIds((prev) =>
                    prev.includes(sim.pathId) ? prev.filter((id) => id !== sim.pathId) : [...prev, sim.pathId]
                  )
                }
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full border",
                  active ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                )}
              >
                {sim.pathName || pathConfig.label}
              </button>
            )
          })}
        </div>
        {incomeChartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="var(--color-foreground)" tick={{ fill: "var(--color-foreground)" }} />
                <YAxis
                  stroke="var(--color-foreground)"
                  tick={{ fill: "var(--color-foreground)" }}
                  tickFormatter={(value) => `R${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(value: number, _name: string, item: any) => [
                    `R${value.toLocaleString()} / month`,
                    item?.name || "Path",
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Legend wrapperStyle={{ color: "var(--color-foreground)" }} />
                {simulations.map((sim) => {
                  const pathConfig = getPathConfig(sim.pathId)
                  const chartKey = mapPathIdToChartKey(sim.pathId)
                  const isVisible = visibleChartPathIds.includes(sim.pathId)
                  if (!isVisible) return null
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
          <div className="h-80 flex items-center justify-center text-muted-foreground">No chart data available</div>
        )}
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
                <XAxis type="number" domain={[0, 100]} stroke="var(--color-foreground)" tick={{ fill: "var(--color-foreground)" }} />
                <YAxis
                  type="category"
                  dataKey="skill"
                  stroke="var(--color-foreground)"
                  tick={{ fill: "var(--color-foreground)" }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(value: number) => [`${value}%`, "Score"]}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Bar dataKey="score" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  )
}
