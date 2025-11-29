import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { cvAPI } from "../lib/api"

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.includes("document"))) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const analyzeCV = async () => {
    if (!cvText.trim()) {
      setError("Please enter CV text or upload a file")
      return
    }

    setError("")
    setIsAnalyzing(true)

    try {
      const response = await cvAPI.analyze(cvText, jobRequirements || undefined)
      if (response.status === 'success' && response.data?.analysis) {
        setResult(response.data.analysis)
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze CV. Please try again.")
      setResult(null)
    } finally {
      setIsAnalyzing(false)
    }
        "Include your LinkedIn profile URL",
      ],
      keywords: ["Communication", "Problem-solving", "Microsoft Office", "Customer Service", "Data Analysis"],
    })
    setIsAnalyzing(false)
  }

  const resetAnalysis = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">CV Analyzer</h1>
        <p className="text-muted-foreground">Upload your CV and get AI-powered feedback</p>
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

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
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
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
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
                <label className="inline-block">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                  <span className="px-4 py-2 bg-primary text-white rounded-lg font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                    Select File
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeCV}
            disabled={isAnalyzing || !cvText.trim()}
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
                Analyze CV
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
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

          {/* Missing Skills */}
          {result.missingSkills && result.missingSkills.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-warning/20 text-warning rounded-lg text-sm">
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
                Suggestions
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improved Version */}
          {result.improvedVersion && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Improved CV Version</h3>
              <div className="bg-background border border-border rounded-lg p-4">
                <p className="text-muted-foreground whitespace-pre-wrap">{result.improvedVersion}</p>
              </div>
            </div>
          )}

          {/* Suggestions */}
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

          {/* Keywords */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Recommended Keywords to Add</h3>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((keyword, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={resetAnalysis}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Analyze Another CV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

