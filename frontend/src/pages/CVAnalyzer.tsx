// pages/CVAnalyzer.tsx - WITH CONVERSATIONAL AI LOADERS
import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, FileText, CheckCircle, Sparkles, Loader2, ArrowRight, BrainCircuit, Zap, Search } from "lucide-react"
import { cn } from "../lib/utils"
import { cvAPI } from "../lib/api"
import { useNavigate } from "react-router-dom"
import ProgressTracker from "../components/ProgressTracker"
import { useUser } from "../lib/user-context"
import RateLimitAlert from "../components/RateLimitAlert"
import ErrorAlert from "../components/ErrorAlert"
import Toast, { useToast } from "../components/Toast"

interface AnalysisResult {
  extractedSkills?: string[]
  missingSkills?: string[]
  suggestions?: string[]
  improvedVersion?: string
}

// Conversational loading messages that rotate
const ANALYSIS_STEPS = [
  { icon: Upload, message: "Receiving your CV...", duration: 2000 },
  { icon: Search, message: "Reading through your experience...", duration: 3000 },
  { icon: BrainCircuit, message: "Analyzing your skills with AI...", duration: 4000 },
  { icon: Sparkles, message: "Identifying your strengths...", duration: 3000 },
  { icon: Zap, message: "Generating personalized insights...", duration: 3000 },
  { icon: CheckCircle, message: "Almost done! Preparing your results...", duration: 2000 },
]

export default function CVAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [jobRequirements, setJobRequirements] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(60)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const { updateProgress } = useUser()
  const { toasts, success, removeToast } = useToast()

  // Conversational progress animation
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    // Cycle through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 3000) // Change message every 3 seconds

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 95) {
          return prev + 1
        }
        return prev
      })
    }, 200) // Increment progress every 200ms

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [isAnalyzing])

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
    setCurrentStep(0)
    setProgress(0)

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
      
      // Complete the progress
      setProgress(100)
      setCurrentStep(ANALYSIS_STEPS.length - 1)
      
      if (response.status === 'success' && response.data?.analysis) {
        setResult(response.data.analysis)
        
        updateProgress('cvCompleted', true)
        
        if (response.data.analysis.extractedSkills) {
          localStorage.setItem('cvSkills', JSON.stringify(response.data.analysis.extractedSkills))
        }
        
        success(`CV analyzed successfully! Found ${response.data.analysis.extractedSkills?.length || 0} skills.`)
        
        setTimeout(() => {
          navigate("/dashboard/twin")
        }, 2000)
      } else {
        throw new Error(response.message || 'Analysis failed')
      }
    } catch (err: any) {
      console.error('CV Analysis Error:', err)
      setProgress(0)
      setCurrentStep(0)
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <ProgressTracker currentStep={0} />
        
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                CV Analysis
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                Let our AI analyze your CV and extract your skills
              </p>
            </div>
          </div>
        </div>

        <Toast toasts={toasts} onRemove={removeToast} />
        
        {isRateLimited && <RateLimitAlert message={error} retryAfter={retryAfter} />}
        {error && !isRateLimited && <ErrorAlert message={error} onDismiss={() => setError("")} />}
        
        {/* Conversational Loading State */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl p-8 md:p-12 mb-6 md:mb-8 border border-indigo-200 dark:border-indigo-900">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              {/* Animated Icon */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  {React.createElement(ANALYSIS_STEPS[currentStep].icon, {
                    className: "h-10 w-10 md:h-12 md:w-12 text-white animate-pulse"
                  })}
                </div>
              </div>

              {/* Conversational Message */}
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {ANALYSIS_STEPS[currentStep].message}
                </h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                  Our AI is carefully reviewing your CV...
                </p>
              </div>

              {/* Progress Bar with Percentage */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 md:h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm md:text-base">AI is thinking</span>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center gap-2 pt-4">
                {ANALYSIS_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      idx === currentStep ? "w-8 bg-indigo-600" : "w-2 bg-slate-300 dark:bg-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Hidden during analysis */}
        {!isAnalyzing && !result && (
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* CV Text Input */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/50 space-y-6">
              <div>
                <label className="block text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Paste Your CV
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="w-full h-32 sm:h-40 md:h-48 px-4 md:px-5 py-3 md:py-4 text-sm md:text-base bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Paste your CV content here... (or upload a file below)"
                />
              </div>

              {/* Optional Job Requirements */}
              <div>
                <label className="block text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Job Requirements <span className="text-sm font-normal text-slate-500">(Optional)</span>
                </label>
                <textarea
                  value={jobRequirements}
                  onChange={(e) => setJobRequirements(e.target.value)}
                  className="w-full h-24 sm:h-28 md:h-32 px-4 md:px-5 py-3 md:py-4 text-sm md:text-base bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Paste job requirements to get specific gap analysis..."
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-6 md:space-y-8">
              <div
                className={cn(
                  "relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-8 md:p-12 border-2 border-dashed transition-all cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 touch-manipulation",
                  isDragging
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30"
                    : "border-slate-300 dark:border-slate-700"
                )}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="text-center space-y-4">
                  <div className="inline-flex p-4 md:p-5 rounded-2xl bg-indigo-100 dark:bg-indigo-950">
                    <Upload className="h-10 w-10 md:h-12 md:w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {file ? file.name : "Upload Your CV"}
                    </p>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 mt-2">
                      Supports PDF, DOC, DOCX
                    </p>
                  </div>
                  {file && (
                    <div className="flex items-center justify-center gap-2 text-sm md:text-base text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>File ready for analysis</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeCV}
                disabled={isAnalyzing || (!cvText.trim() && !file)}
                className={cn(
                  "w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-h-[56px] md:min-h-[64px] touch-manipulation",
                  isAnalyzing
                    ? "bg-indigo-400 cursor-wait"
                    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:scale-105 active:scale-100"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-white">Analyzing Your CV...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 text-white" />
                    <span className="text-white">Analyze CV & Continue</span>
                    <ArrowRight className="h-6 w-6 text-white" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results - Show after analysis */}
        {result && !isAnalyzing && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/50 space-y-6 md:space-y-8 animate-fade-in">
            <div className="flex items-center gap-3 p-4 md:p-5 bg-green-50 dark:bg-green-950/30 rounded-xl md:rounded-2xl border border-green-200 dark:border-green-900">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-base md:text-lg text-green-900 dark:text-green-100">
                  Analysis Complete!
                </p>
                <p className="text-sm md:text-base text-green-700 dark:text-green-300">
                  Your CV has been successfully analyzed. Redirecting to Digital Twin creation...
                </p>
              </div>
            </div>

            {result.extractedSkills && result.extractedSkills.length > 0 && (
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Extracted Skills ({result.extractedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {result.extractedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 md:px-4 py-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm md:text-base font-medium border border-indigo-200 dark:border-indigo-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-4">
                  AI Suggestions
                </h3>
                <ul className="space-y-3">
                  {result.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-3 text-sm md:text-base text-slate-700 dark:text-slate-300 p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
