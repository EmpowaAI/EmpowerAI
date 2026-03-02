// pages/CVAnalyzer.tsx - Fixed loaders
import { useState, useCallback, useRef } from "react"
import { Upload, CheckCircle, Sparkles, Loader2, ArrowRight } from "lucide-react"
import { cn } from "../lib/utils"
import { cvAPI } from "../lib/api"
import { useNavigate } from "react-router-dom"
import ProgressTracker from "../components/ProgressTracker"
import { useUser } from "../lib/user-context"
import RateLimitAlert from "../components/RateLimitAlert"
import ErrorAlert from "../components/ErrorAlert"
import Toast, { useToast } from "../components/Toast"
// Neural Fusion Components
import NeuralCard from "../components/ui/NeuralCard"
import AIAvatar from "../components/ui/AIAvatar"
import NeuralLoading from "../components/ui/NeuralLoading"

interface AnalysisResult {
  extractedSkills?: string[]
  missingSkills?: string[]
  suggestions?: string[]
  improvedVersion?: string
}

export default function CVAnalyzer() {
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

  // Check authentication on mount
  React.useEffect(() => {
    const token = localStorage.getItem('empowerai-token')
    if (!token) {
      console.error('🔐 CV Analyzer: No token found! Redirecting to login...')
      setError("Please log in to use the CV Analyzer")
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } else {
      console.log('🔐 CV Analyzer: Token found ✅')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.includes("document"))) {
      setFile(droppedFile)
      success(`File "${droppedFile.name}" uploaded successfully! Click "Analyze CV & Continue" to proceed.`)
    }
  }, [success])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      success(`File "${selectedFile.name}" selected. Click "Analyze CV & Continue" to proceed.`)
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
        console.log('CV Analysis: Starting file analysis...', { filename: file.name, size: file.size });
        response = await cvAPI.analyzeFile(file, jobRequirements || undefined)
      } else {
        console.log('CV Analysis: Starting text analysis...', { cvTextLength: cvText.length });
        response = await cvAPI.analyze(cvText, jobRequirements || undefined)
      }
      
      console.log('CV Analysis: Response received', { status: response.status, hasData: !!response.data });
      
      if (response.status === 'success' && response.data?.analysis) {
        setResult(response.data.analysis)
        
        updateProgress('cvCompleted', true)
        
        if (response.data.analysis.extractedSkills) {
          localStorage.setItem('cvSkills', JSON.stringify(response.data.analysis.extractedSkills))
        }
        
        success(`CV analyzed successfully! Found ${response.data.analysis.extractedSkills?.length || 0} skills.`)
        
        setTimeout(() => {
          navigate("/dashboard/twin")
        }, 2500)
      } else {
        throw new Error(response.message || 'Analysis failed')
      }
    } catch (err: any) {
      console.error('CV Analysis Error:', err)
      
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

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 -mx-3 sm:mx-0">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
      
      {/* Progress Tracker */}
      <ProgressTracker currentStep="cv" />
      
      {/* Header */}
      <div className="text-center sm:text-left px-3 sm:px-0">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">Step 1: CV Analyzer</h1>
        <p className="text-base sm:text-base text-muted-foreground mt-2 sm:mt-2">Upload your CV to unlock personalized features</p>
      </div>

      {/* Alert Messages */}
      {isRateLimited && <RateLimitAlert message={error} retryAfter={retryAfter} />}
      {error && !isRateLimited && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {!result ? (
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-4 md:space-y-6 px-3 sm:px-0">
          {/* Neural Fusion Loading State */}
          {isAnalyzing && (
            <NeuralCard className="text-center p-8 md:p-12 animate-fade-in">
              <div className="max-w-md mx-auto space-y-6">
                <AIAvatar size="xl" variant="processing" className="mx-auto" />
                <NeuralLoading size="lg" text="Analyzing your CV..." />
                <p className="text-sm text-muted-foreground">
                  Our AI is carefully reviewing your CV and extracting skills
                </p>
                <p className="text-xs text-muted-foreground">
                  This usually takes 10-30 seconds...
                </p>
              </div>
            </NeuralCard>
          )}

          {/* Form - Only hidden when analyzing */}
          {!isAnalyzing && (
            <>
            {/* CV Text Input */}
            <div className="bg-card border border-border rounded-xl sm:rounded-xl p-4 sm:p-4 md:p-6">
              <label className="block text-sm sm:text-sm font-medium text-foreground mb-2 sm:mb-2">
                Paste your CV text here
              </label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV content here..."
                className="w-full h-32 sm:h-32 md:h-40 px-4 sm:px-4 py-3 sm:py-3 bg-background border border-border rounded-lg text-base sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Job Requirements (Optional) */}
            <div className="bg-card border border-border rounded-xl sm:rounded-xl p-4 sm:p-4 md:p-6">
              <label className="block text-sm sm:text-sm font-medium text-foreground mb-2 sm:mb-2">
                Job Requirements (Optional)
              </label>
              <textarea
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                placeholder="Paste job requirements to get tailored feedback..."
                className="w-full h-24 sm:h-24 md:h-32 px-4 sm:px-4 py-3 sm:py-3 bg-background border border-border rounded-lg text-base sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              className={cn(
                "border-2 border-dashed rounded-xl p-5 sm:p-6 md:p-8 lg:p-12 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-border bg-card",
                file && "border-accent bg-accent/5",
              )}
            >
              {file ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-accent/20 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base text-foreground flex items-center justify-center gap-2 break-all">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-none">{file.name}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB - Ready to analyze</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-xs sm:text-sm text-primary hover:underline">
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base text-foreground">Drop your CV here or click to browse</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Supports PDF, DOC, DOCX (max 5MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-white rounded-lg text-sm sm:text-base font-medium hover:bg-primary/90 transition-colors"
                  >
                    Select File
                  </button>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeCV}
              disabled={isAnalyzing || (!cvText.trim() && !file)}
              className="w-full flex items-center justify-center gap-2 py-4 sm:py-3.5 md:py-4 bg-primary text-white rounded-lg text-base sm:text-base font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[52px] sm:min-h-[48px] touch-manipulation"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>Analyzing your CV...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Analyze CV & Continue</span>
                </>
              )}
            </button>
          </>
          )}
        </div>
      ) : (

        <div className="space-y-6 px-3 sm:px-0">
          {/* Success Message */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-accent/20 rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold text-foreground">CV Analysis Complete!</h3>
                <p className="text-muted-foreground">
                  We found {result.extractedSkills?.length || 0} skills in your CV. 
                  Redirecting to Twin Builder...
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Skills */}
          {result.extractedSkills && result.extractedSkills.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Skills Found
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.extractedSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Suggestions
              </h3>
              <ul className="space-y-3">
                {result.suggestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/dashboard/twin")}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Continue to Twin Builder
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
