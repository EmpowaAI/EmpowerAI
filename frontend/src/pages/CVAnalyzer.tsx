// pages/CVAnalyzer.tsx
import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, FileText, CheckCircle, Sparkles, Loader2, ArrowRight } from "lucide-react"
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.includes("document"))) {
      setFile(droppedFile)
      // Show immediate feedback that file was dropped
      success(`File "${droppedFile.name}" uploaded successfully! Click "Analyze CV & Continue" to proceed.`)
    }
  }, [success])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Show immediate feedback that file was selected
      success(`File "${selectedFile.name}" selected. Click "Analyze CV & Continue" to proceed.`)
    }
  }

  const analyzeCV = async () => {
    // Check if we have file or text
    if (!cvText.trim() && !file) {
      setError("Please paste your CV text above or upload a file before continuing.")
      return
    }

    setError("")
    setIsAnalyzing(true)

    try {
      let response;
      
      if (file) {
        // Analyze from uploaded file
        console.log('CV Analysis: Starting file analysis...', { filename: file.name, size: file.size });
        response = await cvAPI.analyzeFile(file, jobRequirements || undefined)
      } else {
        // Analyze from text
        console.log('CV Analysis: Starting text analysis...', { cvTextLength: cvText.length });
        response = await cvAPI.analyze(cvText, jobRequirements || undefined)
      }
      
      console.log('CV Analysis: Response received', { status: response.status, hasData: !!response.data });
      
      if (response.status === 'success' && response.data?.analysis) {
        setResult(response.data.analysis)
        
        // Mark CV as completed and save skills
        updateProgress('cvCompleted', true)
        
        // Save extracted skills if available
        if (response.data.analysis.extractedSkills) {
          localStorage.setItem('cvSkills', JSON.stringify(response.data.analysis.extractedSkills))
        }
        
        // Show success notification
        if (file) {
          success(`CV uploaded and analyzed successfully! Found ${response.data.analysis.extractedSkills?.length || 0} skills.`)
        } else {
          success(`CV analyzed successfully! Found ${response.data.analysis.extractedSkills?.length || 0} skills.`)
        }
        
        // Show success for a bit longer before redirecting
        setTimeout(() => {
          navigate("/dashboard/twin")
        }, 3000)
      } else {
        console.warn('CV Analysis: Unexpected response format', response);
        setError("Unexpected response format. Please try again.")
      }
    } catch (err: any) {
      console.error('CV Analysis: Error occurred', err);
      const errorMessage = err.message || err.response?.data?.message || "Failed to analyze CV. Please try again."
      
      // Check if it's a rate limit error
      const isRateLimit = err.response?.status === 429 || 
                         err.status === 429 ||
                         err.response?.data?.code === 'RATE_LIMIT' ||
                         errorMessage.toLowerCase().includes('rate limit')
      
      if (isRateLimit) {
        setIsRateLimited(true)
        // Extract retryAfter from multiple possible locations
        const retryAfter = err.retryAfter || 
                         err.response?.data?.retryAfter || 
                         err.response?.retryAfter || 
                         60
        setRetryAfter(retryAfter)
        setError("")
      } else {
        setIsRateLimited(false)
        setError(errorMessage)
      }
      setResult(null)
    } finally {
      setIsAnalyzing(false)
    }
  }


  return (
    <div className="space-y-8">
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      {/* Progress Tracker */}
      <ProgressTracker currentStep="cv" />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Step 1: CV Analyzer</h1>
        <p className="text-muted-foreground">Upload your CV to unlock personalized features</p>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* CV Text Input */}
          <div className="bg-card border border-border rounded-xl p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Paste your CV text here
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV content here..."
              className="w-full h-40 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Job Requirements (Optional) */}
          <div className="bg-card border border-border rounded-xl p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Job Requirements (Optional)
            </label>
            <textarea
              value={jobRequirements}
              onChange={(e) => setJobRequirements(e.target.value)}
              placeholder="Paste job requirements to get tailored feedback..."
              className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {isRateLimited && (
            <RateLimitAlert
              retryAfter={retryAfter}
              onRetry={() => {
                setIsRateLimited(false)
                analyzeCV()
              }}
            />
          )}
          {error && !isRateLimited && (
            <ErrorAlert message={error} onDismiss={() => setError("")} />
          )}

          {/* Upload Area (Alternative) */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-border bg-card",
              file && "border-accent bg-accent/5",
            )}
          >
            {file ? (
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-xl bg-accent/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB - Ready to analyze</p>
                </div>
                <button onClick={() => setFile(null)} className="text-sm text-primary hover:underline">
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Drop your CV here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX (max 5MB)</p>
                </div>
                {/* Hidden native file input + explicit trigger button for reliability */}
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
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Select File
                </button>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOCX, TXT (max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeCV}
            disabled={isAnalyzing || (!cvText.trim() && !file)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing your CV...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyze CV & Continue
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-accent/20 rounded-xl p-6">
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