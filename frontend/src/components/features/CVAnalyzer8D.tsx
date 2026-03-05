import { useState } from 'react'
import { Upload, FileText, Download, TrendingUp, Award, Target, Zap, Shield } from 'lucide-react'
import { cn } from "../../lib/utils"
import NeuralCard from "../ui/NeuralCard"
import HolographicButton from "../ui/HolographicButton"
import NeuralLoading from "../ui/NeuralLoading"

interface CVScore {
  contentQuality: number
  formatStructure: number
  atsCompatibility: number
  keywordDensity: number
  experienceShowcase: number
  educationCredentials: number
  impactAchievements: number
  saMarketFit: number
}

interface CVAnalysisResult {
  overallScore: number
  breakdown: CVScore
  recommendations: string[]
  salaryProjection: {
    entry: number
    mid: number
    senior: number
  }
  topCompanies: string[]
  skillsToAdd: string[]
}

export default function CVAnalyzer8D() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<CVAnalysisResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true)
    
    // Simulate 8D analysis
    setTimeout(() => {
      setResult({
        overallScore: 78,
        breakdown: {
          contentQuality: 82,
          formatStructure: 75,
          atsCompatibility: 88,
          keywordDensity: 70,
          experienceShowcase: 65,
          educationCredentials: 90,
          impactAchievements: 72,
          saMarketFit: 80
        },
        recommendations: [
          "Add quantifiable achievements with specific metrics",
          "Include more industry-specific keywords",
          "Enhance the experience section with project outcomes",
          "Add certifications and professional development",
          "Include South African market context"
        ],
        salaryProjection: {
          entry: 25000,
          mid: 45000,
          senior: 75000
        },
        topCompanies: [
          "Nedbank",
          "Standard Bank",
          "FNB",
          "Discovery",
          "Vodacom"
        ],
        skillsToAdd: [
          "React.js",
          "TypeScript",
          "Cloud Computing",
          "Agile Methodologies",
          "Data Analytics"
        ]
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  const ScoreCard = ({ title, score, icon: Icon, color }: { title: string; score: number; icon: any; color: string }) => (
    <NeuralCard className="hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", color)} />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <span className={cn(
          "text-2xl font-bold",
          score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400"
        )}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-1000",
            score >= 80 ? "bg-green-400" : score >= 60 ? "bg-yellow-400" : "bg-red-400"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </NeuralCard>
  )

  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <NeuralCard className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Analyzing Your CV</h3>
            <p className="text-muted-foreground mb-4">Running 8-dimensional analysis...</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <NeuralLoading text="Content Quality" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <NeuralLoading text="ATS Compatibility" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <NeuralLoading text="SA Market Analysis" />
            </div>
          </div>
        </NeuralCard>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Overall Score */}
        <NeuralCard className="text-center">
          <div className="mb-4">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              {result.overallScore}%
            </div>
            <p className="text-xl text-muted-foreground">Overall CV Score</p>
          </div>
          <div className="flex justify-center gap-4">
            <HolographicButton variant="accent" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Download Report
            </HolographicButton>
            <HolographicButton onClick={() => setResult(null)}>
              Analyze Another CV
            </HolographicButton>
          </div>
        </NeuralCard>

        {/* 8D Breakdown */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">8-Dimensional Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard title="Content Quality" score={result.breakdown.contentQuality} icon={Target} color="text-blue-400" />
            <ScoreCard title="Format Structure" score={result.breakdown.formatStructure} icon={FileText} color="text-cyan-400" />
            <ScoreCard title="ATS Compatibility" score={result.breakdown.atsCompatibility} icon={Shield} color="text-green-400" />
            <ScoreCard title="Keyword Density" score={result.breakdown.keywordDensity} icon={Zap} color="text-yellow-400" />
            <ScoreCard title="Experience Showcase" score={result.breakdown.experienceShowcase} icon={Award} color="text-purple-400" />
            <ScoreCard title="Education Credentials" score={result.breakdown.educationCredentials} icon={Target} color="text-pink-400" />
            <ScoreCard title="Impact Achievements" score={result.breakdown.impactAchievements} icon={TrendingUp} color="text-orange-400" />
            <ScoreCard title="SA Market Fit" score={result.breakdown.saMarketFit} icon={Shield} color="text-emerald-400" />
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeuralCard>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </NeuralCard>

          <NeuralCard>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Skills to Add
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.skillsToAdd.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </NeuralCard>
        </div>

        {/* SA Market Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeuralCard>
            <h3 className="text-xl font-bold text-foreground mb-4">Salary Projection (Monthly)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Entry Level</span>
                <span className="text-xl font-bold text-green-400">R{result.salaryProjection.entry.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mid Level</span>
                <span className="text-xl font-bold text-yellow-400">R{result.salaryProjection.mid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Senior Level</span>
                <span className="text-xl font-bold text-purple-400">R{result.salaryProjection.senior.toLocaleString()}</span>
              </div>
            </div>
          </NeuralCard>

          <NeuralCard>
            <h3 className="text-xl font-bold text-foreground mb-4">Top Companies Hiring</h3>
            <div className="grid grid-cols-2 gap-2">
              {result.topCompanies.map((company, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-center text-purple-300"
                >
                  {company}
                </div>
              ))}
            </div>
          </NeuralCard>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <NeuralCard className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">8D CV Analyzer</h2>
          <p className="text-lg text-muted-foreground mb-4">
            Upload your CV for comprehensive AI-powered analysis
          </p>
          <p className="text-sm text-muted-foreground">
            We analyze content, format, ATS compatibility, keywords, experience, education, impact, and SA market fit
          </p>
        </div>

        <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            id="cv-upload"
          />
          <label htmlFor="cv-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              Drop your CV here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOC, DOCX (Max 5MB)
            </p>
          </label>
        </div>
      </NeuralCard>
    </div>
  )
}
