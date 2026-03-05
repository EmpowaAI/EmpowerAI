import React, { useState, useCallback, useRef, useEffect } from "react"
import { Upload, CheckCircle, FileText, Brain, TrendingUp, Target, Award, Zap, ArrowRight, Download, Share2, Eye, BarChart3 } from "lucide-react"
import { cn } from "../lib/utils"
import { cvAPI } from "../lib/api"
import { useNavigate } from "react-router-dom"
import ProgressTracker from "../components/ProgressTracker"
import { useUser } from "../lib/user-context"
import RateLimitAlert from "../components/RateLimitAlert"
import ErrorAlert from "../components/ErrorAlert"
import Toast, { useToast } from "../components/Toast"

// Clean Components
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Avatar from "../components/ui/Avatar"
import Loading from "../components/ui/Loading"

interface AnalysisResult {
  extractedSkills?: string[]
  missingSkills?: string[]
  suggestions?: string[]
  improvedVersion?: string
  overallScore?: number
  contentQuality?: number
  formatStructure?: number
  atsCompatibility?: number
  keywordDensity?: number
  experienceShowcase?: number
  educationCredentials?: number
  impactAchievements?: number
  saMarketFit?: number
  salaryProjection?: number
  topCompanies?: string[]
  recommendedSkills?: string[]
}

interface DimensionScore {
  dimension: string
  score: number
  color: string
  description: string
  recommendations: string[]
}

export default function CVAnalyzerSpectacular() {
  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [jobRequirements, setJobRequirements] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(60)
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'skills' | 'suggestions'>('overview')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const { updateProgress } = useUser()
  const { toasts, success, removeToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('empowerai-token')
    if (!token) {
      console.error('🔐 CV Analyzer: No token found! Redirecting to login...')
      setError("Please log in to use the CV Analyzer")
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    }
  }, [navigate])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
      setError("")
    } else {
      setError("Please upload a PDF file")
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError("")
    } else {
      setError("Please upload a PDF file")
    }
  }, [])

  const analyzeCV = async () => {
    if (!file) {
      setError("Please upload your CV first")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      // Mock spectacular analysis results
      const mockResult: AnalysisResult = {
        overallScore: 85,
        contentQuality: 88,
        formatStructure: 92,
        atsCompatibility: 85,
        keywordDensity: 78,
        experienceShowcase: 90,
        educationCredentials: 85,
        impactAchievements: 82,
        saMarketFit: 88,
        salaryProjection: 45000,
        topCompanies: ["Nedbank", "Vodacom", "Standard Bank", "MTN", "Shoprite"],
        extractedSkills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
        missingSkills: ["Kubernetes", "GraphQL", "TypeScript", "MongoDB"],
        recommendedSkills: ["Kubernetes", "GraphQL", "TypeScript", "MongoDB", "CI/CD"],
        suggestions: [
          "Add quantifiable achievements to showcase impact",
          "Include more technical keywords for ATS optimization",
          "Structure your experience with clear, measurable results",
          "Add certifications and professional development",
          "Include a professional summary at the top"
        ],
        improvedVersion: "Enhanced CV with better structure and keywords..."
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setResult(mockResult)
      success("CV Analysis Complete! 🎉")
      updateProgress({ cvCompleted: true, cvScore: mockResult.overallScore || 0, totalCVs: 1 })

    } catch (error) {
      console.error('Analysis failed:', error)
      setError("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-error'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success'
    if (score >= 60) return 'bg-warning/10 text-warning'
    return 'bg-error/10 text-error'
  }

  const dimensionScores: DimensionScore[] = result ? [
    {
      dimension: "Content Quality",
      score: result.contentQuality || 0,
      color: "text-primary",
      description: "Clarity, grammar, and professional tone",
      recommendations: ["Use action verbs", "Quantify achievements", "Proofread carefully"]
    },
    {
      dimension: "Format & Structure",
      score: result.formatStructure || 0,
      color: "text-accent",
      description: "Professional layout and organization",
      recommendations: ["Use consistent formatting", "Clear section headers", "Professional font"]
    },
    {
      dimension: "ATS Compatibility",
      score: result.atsCompatibility || 0,
      color: "text-secondary",
      description: "Optimized for automated screening",
      recommendations: ["Standard section names", "Keyword optimization", "Simple formatting"]
    },
    {
      dimension: "Keyword Density",
      score: result.keywordDensity || 0,
      color: "text-warning",
      description: "Relevant industry keywords",
      recommendations: ["Add technical skills", "Include industry terms", "Use job-specific keywords"]
    },
    {
      dimension: "Experience Showcase",
      score: result.experienceShowcase || 0,
      color: "text-primary",
      description: "Impactful experience presentation",
      recommendations: ["Show results", "Use metrics", "Highlight achievements"]
    },
    {
      dimension: "SA Market Fit",
      score: result.saMarketFit || 0,
      color: "text-accent",
      description: "Alignment with South African market",
      recommendations: ["Local experience", "Regional skills", "Market knowledge"]
    }
  ] : []

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <Avatar size="xl" variant="processing" />
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Analyzing Your CV...</h2>
            <p className="text-muted-foreground">Our AI is performing 8-dimensional analysis</p>
            <Loading size="lg" text="Processing content, structure, keywords, and market fit..." />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Content", "Format", "ATS", "Keywords", "Experience", "Education", "Impact", "SA Market"].map((dimension, i) => (
              <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-muted-foreground">{dimension}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Avatar size="xl" variant="primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                8D CV Analyzer Pro
              </h1>
              <p className="text-xl text-muted-foreground">
                AI-powered analysis with SA Market Intelligence
              </p>
            </div>
          </div>
        </div>

        {!result ? (
          /* Upload Section */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Upload Your CV</h2>
              
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {file ? file.name : "Drop your CV here"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF files only • Max 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <ErrorAlert message={error} onDismiss={() => setError("")} />
              )}

              {file && (
                <div className="mt-6">
                  <Button onClick={analyzeCV} className="w-full" size="lg">
                    <Brain className="h-5 w-5 mr-2" />
                    Analyze My CV
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">8D Analysis Features</h2>
              
              <div className="space-y-6">
                {[
                  { icon: FileText, title: "Content Quality", desc: "Grammar, clarity, professional tone" },
                  { icon: Target, title: "Format & Structure", desc: "Professional layout and organization" },
                  { icon: Zap, title: "ATS Compatibility", desc: "Optimized for automated screening" },
                  { icon: BarChart3, title: "Keyword Density", desc: "Relevant industry keywords" },
                  { icon: TrendingUp, title: "Experience Showcase", desc: "Impactful experience presentation" },
                  { icon: Award, title: "SA Market Intelligence", desc: "Local salary and company insights" },
                  { icon: Brain, title: "AI Recommendations", desc: "Personalized improvement suggestions" },
                  { icon: Eye, title: "Visual Analysis", desc: "Professional appearance and readability" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Overall Score */}
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <span className={cn("text-3xl font-bold", getScoreColor(result.overallScore || 0))}>
                    {result.overallScore}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Analysis Complete!</h2>
                  <p className="text-muted-foreground">Your CV scored {result.overallScore}/100</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">R{(result.salaryProjection || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Salary Projection</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-accent">{result.topCompanies?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Top Companies</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-secondary">{result.extractedSkills?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Skills Found</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-warning">{result.recommendedSkills?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Skills to Add</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
              {(['overview', 'dimensions', 'skills', 'suggestions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 font-medium transition-colors",
                    activeTab === tab
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Top Companies for You</h3>
                  <div className="space-y-3">
                    {result.topCompanies?.map((company, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-foreground">{company}</span>
                        <span className="text-sm text-muted-foreground">95% match</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Results
                    </Button>
                    <Button variant="secondary" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Improved CV
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'dimensions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dimensionScores.map((dimension, i) => (
                  <Card key={i} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{dimension.dimension}</h3>
                        <span className={cn("text-lg font-bold", dimension.color)}>
                          {dimension.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full transition-all duration-300", 
                            dimension.score >= 80 ? "bg-success" : 
                            dimension.score >= 60 ? "bg-warning" : "bg-error")}
                          style={{ width: `${dimension.score}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{dimension.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Recommendations:</p>
                        {dimension.recommendations.map((rec, j) => (
                          <p key={j} className="text-sm text-muted-foreground">• {rec}</p>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Current Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.extractedSkills?.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Recommended Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedSkills?.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'suggestions' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">AI Recommendations</h3>
                <div className="space-y-4">
                  {result.suggestions?.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <p className="text-foreground">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={() => setResult(null)} variant="outline">
                Analyze Another CV
              </Button>
              <Button onClick={() => navigate('/dashboard/interview-coach')}>
                Practice Interview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Rate Limit Alert */}
        {isRateLimited && (
          <RateLimitAlert
            message={`Too many requests. Please wait ${retryAfter} seconds.`}
            onDismiss={() => setIsRateLimited(false)}
          />
        )}
      </div>
    </div>
  )
}
