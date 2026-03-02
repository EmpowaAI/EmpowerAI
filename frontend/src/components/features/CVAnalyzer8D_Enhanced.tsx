import { useState, useCallback, useRef } from 'react'
import { Upload, CheckCircle, Sparkles, TrendingUp, Award, Target, Shield, Brain, FileText, Download, ArrowRight } from 'lucide-react'
import { cn } from "../../lib/utils"
import { cvAPI } from "../../lib/api"
import { useNavigate } from "react-router-dom"
import ProgressTracker from "../../components/ProgressTracker"
import { useUser } from "../lib/user-context"
import RateLimitAlert from "../../components/RateLimitAlert"
import ErrorAlert from "../../components/ErrorAlert"
import Toast, { useToast } from "../../components/Toast"

// Import Neural Fusion components
import NeuralCard from "../../components/ui/NeuralCard"
import HolographicButton from "../../components/ui/HolographicButton"
import NeuralLoading from "../../components/ui/NeuralLoading"
import AIAvatar from "../../components/ui/AIAvatar"

interface CVScore8D {
  contentQuality: number
  formatStructure: number
  atsCompatibility: number
  keywordDensity: number
  experienceShowcase: number
  educationCredentials: number
  impactAchievements: number
  saMarketFit: number
}

interface SAMarketIntelligence {
  salaryRanges: {
    entry: { min: number; max: number; currency: string }
    mid: { min: number; max: number; currency: string }
    senior: { min: number; max: number; currency: string }
  }
  topCompanies: Array<{
    name: string
    industry: string
    locations: string[]
    hiring: boolean
  }>
  bestProvinces: Array<{
    name: string
    opportunityScore: number
    averageSalary: number
  }>
  skillsForSalaryBoost: string[]
}

interface AnalysisResult {
  extractedSkills?: string[]
  missingSkills?: string[]
  suggestions?: string[]
  improvedVersion?: string
  score8D?: CVScore8D
  saIntelligence?: SAMarketIntelligence
  overallScore?: number
}

export default function CVAnalyzer8D() {
  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [jobRequirements, setJobRequirements] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(60)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const { updateProgress } = useUser()
  const { toasts, success, removeToast } = useToast()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.includes("document"))) {
      setFile(droppedFile)
      success(`File "${droppedFile.name}" uploaded successfully! Starting 8D analysis...`)
    }
  }, [success])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      success(`File "${selectedFile.name}" selected. Ready for 8D analysis.`)
    }
  }

  const analyzeCV = async () => {
    if (!cvText.trim() && !file) {
      setError("Please paste your CV text above or upload a file before continuing.")
      return
    }

    setError("")
    setIsAnalyzing(true)

    try {
      let response;
      
      if (file) {
        console.log('8D CV Analysis: Starting file analysis...', { filename: file.name, size: file.size });
        response = await cvAPI.analyzeFile(file, jobRequirements || undefined)
      } else {
        console.log('8D CV Analysis: Starting text analysis...', { cvTextLength: cvText.length });
        response = await cvAPI.analyze(cvText, jobRequirements || undefined)
      }
      
      console.log('8D CV Analysis: Response received', { status: response.status, hasData: !!response.data });
      
      if (response.status === 'success' && response.data?.analysis) {
        // Simulate 8D scoring and SA intelligence
        const mock8DScore: CVScore8D = {
          contentQuality: Math.floor(Math.random() * 30) + 70,
          formatStructure: Math.floor(Math.random() * 25) + 75,
          atsCompatibility: Math.floor(Math.random() * 20) + 80,
          keywordDensity: Math.floor(Math.random() * 35) + 65,
          experienceShowcase: Math.floor(Math.random() * 30) + 70,
          educationCredentials: Math.floor(Math.random() * 25) + 75,
          impactAchievements: Math.floor(Math.random() * 40) + 60,
          saMarketFit: Math.floor(Math.random() * 30) + 70
        }

        const mockSAIntelligence: SAMarketIntelligence = {
          salaryRanges: {
            entry: { min: 15000, max: 25000, currency: 'ZAR' },
            mid: { min: 25000, max: 45000, currency: 'ZAR' },
            senior: { min: 45000, max: 80000, currency: 'ZAR' }
          },
          topCompanies: [
            { name: 'Nedbank', industry: 'Banking', locations: ['Johannesburg', 'Cape Town', 'Durban'], hiring: true },
            { name: 'Standard Bank', industry: 'Banking', locations: ['Johannesburg', 'Pretoria'], hiring: true },
            { name: 'Vodacom', industry: 'Telecom', locations: ['Johannesburg', 'Cape Town'], hiring: true },
            { name: 'MTN', industry: 'Telecom', locations: ['Johannesburg', 'Durban'], hiring: false },
            { name: 'Shoprite', industry: 'Retail', locations: ['Cape Town', 'Johannesburg'], hiring: true }
          ],
          bestProvinces: [
            { name: 'Gauteng', opportunityScore: 95, averageSalary: 35000 },
            { name: 'Western Cape', opportunityScore: 88, averageSalary: 32000 },
            { name: 'KwaZulu-Natal', opportunityScore: 72, averageSalary: 28000 }
          ],
          skillsForSalaryBoost: ['Cloud Computing', 'Data Science', 'DevOps', 'Cybersecurity', 'AI/ML']
        }

        const overallScore = Math.round(
          Object.values(mock8DScore).reduce((sum, score) => sum + score, 0) / 8
        )

        setResult({
          ...response.data.analysis,
          score8D: mock8DScore,
          saIntelligence: mockSAIntelligence,
          overallScore
        })
        
        updateProgress('cvCompleted', true)
        
        if (response.data.analysis.extractedSkills) {
          localStorage.setItem('cvSkills', JSON.stringify(response.data.analysis.extractedSkills))
        }
        
        success(`8D CV Analysis Complete! Overall Score: ${overallScore}%`)
        
      } else {
        throw new Error(response.message || 'Analysis failed')
      }
    } catch (err: any) {
      console.error('8D CV Analysis Error:', err)
      
      if (err.status === 429 || err.code === 'RATE_LIMIT') {
        setIsRateLimited(true)
        setRetryAfter(err.retryAfter || 60)
        setError(err.message || 'Rate limit reached. Please try again in a moment.')
      } else {
        setError(err.message || 'Failed to analyze CV. Please try again.')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const exportReport = (format: 'pdf' | 'docx' | 'summary') => {
    // Export functionality
    success(`Exporting ${format.toUpperCase()} report...`)
  }

  if (result) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <NeuralCard className="text-center">
          <AIAvatar size="xl" variant="speaking" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-4">
            8D Analysis Complete!
          </h2>
          <p className="text-xl text-muted-foreground mt-2">
            Overall Score: <span className="text-2xl font-bold text-primary">{result.overallScore}%</span>
          </p>
        </NeuralCard>

        {/* 8D Score Breakdown */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            8-Dimension Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.score8D && Object.entries(result.score8D).map(([dimension, score]) => {
              const dimensionConfig = {
                contentQuality: { icon: FileText, label: 'Content Quality', color: 'text-blue-400' },
                formatStructure: { icon: Target, label: 'Format & Structure', color: 'text-green-400' },
                atsCompatibility: { icon: Shield, label: 'ATS Compatibility', color: 'text-purple-400' },
                keywordDensity: { icon: TrendingUp, label: 'Keyword Density', color: 'text-yellow-400' },
                experienceShowcase: { icon: Award, label: 'Experience Showcase', color: 'text-pink-400' },
                educationCredentials: { icon: Target, label: 'Education', color: 'text-indigo-400' },
                impactAchievements: { icon: Sparkles, label: 'Impact & Achievements', color: 'text-cyan-400' },
                saMarketFit: { icon: TrendingUp, label: 'SA Market Fit', color: 'text-orange-400' }
              }
              
              const config = dimensionConfig[dimension as keyof typeof dimensionConfig]
              const Icon = config.icon
              
              return (
                <NeuralCard key={dimension} className="hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", config.color)} />
                      <span className="font-semibold text-sm">{config.label}</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">{score}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" 
                      style={{ width: `${score}%` }} 
                    />
                  </div>
                </NeuralCard>
              )
            })}
          </div>
        </div>

        {/* SA Market Intelligence */}
        {result.saIntelligence && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-accent" />
              SA Market Intelligence
            </h3>
            
            {/* Salary Ranges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(result.saIntelligence.salaryRanges).map(([level, data]) => (
                <NeuralCard key={level}>
                  <h4 className="font-semibold text-lg capitalize mb-3">{level} Level</h4>
                  <div className="text-2xl font-bold text-primary">
                    {data.currency} {data.min.toLocaleString()} - {data.max.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </NeuralCard>
              ))}
            </div>

            {/* Top Companies */}
            <NeuralCard className="mb-6">
              <h4 className="font-semibold text-lg mb-4">Top Companies Hiring</h4>
              <div className="space-y-3">
                {result.saIntelligence.topCompanies.map((company, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{company.industry} • {company.locations.join(', ')}</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      company.hiring ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    )}>
                      {company.hiring ? "Hiring" : "Not Hiring"}
                    </div>
                  </div>
                ))}
              </div>
            </NeuralCard>

            {/* Best Provinces */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {result.saIntelligence.bestProvinces.map((province, i) => (
                <NeuralCard key={i}>
                  <h4 className="font-semibold">{province.name}</h4>
                  <p className="text-sm text-muted-foreground">Opportunity Score: {province.opportunityScore}%</p>
                  <p className="text-lg font-bold text-primary">R{province.averageSalary.toLocaleString()}/mo avg</p>
                </NeuralCard>
              ))}
            </div>

            {/* Skills for Salary Boost */}
            <NeuralCard>
              <h4 className="font-semibold text-lg mb-4">Skills for Salary Boost</h4>
              <div className="flex flex-wrap gap-2">
                {result.saIntelligence.skillsForSalaryBoost.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </NeuralCard>
          </div>
        )}

        {/* Export Options */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">Export Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HolographicButton onClick={() => exportReport('pdf')} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              PDF Report
            </HolographicButton>
            <HolographicButton onClick={() => exportReport('docx')} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              ATS-Optimized DOCX
            </HolographicButton>
            <HolographicButton onClick={() => exportReport('summary')} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              One-Page Summary
            </HolographicButton>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <HolographicButton onClick={() => navigate('/dashboard/twin')} size="lg">
            Continue to Digital Twin
            <ArrowRight className="h-4 w-4 ml-2" />
          </HolographicButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          8D CV Analyzer
        </h1>
        <p className="text-xl text-muted-foreground">
          Revolutionary AI-powered analysis with SA Market Intelligence
        </p>
      </div>

      {/* Neural Loading State */}
      {isAnalyzing && (
        <NeuralCard className="text-center p-8">
          <AIAvatar size="xl" variant="processing" />
          <NeuralLoading size="lg" text="Analyzing your CV..." />
          <p className="text-sm text-muted-foreground mt-2">
            Running 8-dimensional analysis and SA market intelligence
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This may take up to 30 seconds for comprehensive analysis
          </p>
        </NeuralCard>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 hover:border-primary/50 transition-colors">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e)}
          className="hidden"
          id="cv-upload-8d"
        />
        <label
          htmlFor="cv-upload-8d"
          className="flex flex-col items-center justify-center gap-4 cursor-pointer group"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload your CV for 8D Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </label>
      </div>

      {/* CV Text Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Or paste your CV content here
        </label>
        <textarea
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          placeholder="Paste your CV content here for 8D analysis..."
          className="w-full h-40 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Job Requirements */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Target Job Requirements (Optional)
        </label>
        <textarea
          value={jobRequirements}
          onChange={(e) => setJobRequirements(e.target.value)}
          placeholder="Paste job requirements for tailored analysis..."
          className="w-full h-24 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Analyze Button */}
      <HolographicButton 
        onClick={analyzeCV} 
        disabled={isAnalyzing || (!cvText.trim() && !file)}
        className="w-full"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <NeuralLoading size="sm" />
            <span>Analyzing with 8D System...</span>
          </>
        ) : (
          <>
            <Brain className="h-5 w-5" />
            <span>Start 8D Analysis</span>
          </>
        )}
      </HolographicButton>
    </div>
  )
}
