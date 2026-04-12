// frontend/src/pages/CV-analysis/CVAnalyzer.tsx

import { useState, useCallback, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Upload, FileText, AlertCircle, Brain,
  CheckCircle, XCircle, Zap, RotateCcw, Wand2,
  Bot, BarChart3, ArrowRight
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useUser } from "../../contexts/user-context"
import RateLimitAlert from "../../components/ui/RateLimitAlert"
import CVUploadError from "../../components/CVUploadError"
import ScoreMeter from "../../components/ui/ScoreMeter"
import CVScanAnimation from "./CVScanAnimation"
import RevampedCVDisplay from "../../components/RevampedCVDisplay"
import PostCVAnalysisModal from "../../components/PostCVAnalysisModal"
import type { RevampedCV, RevampedCVResponse } from '../../services/aiService'
import { useToast } from "../../hooks/useToast"
import { analyzeCV, revampCV, type CVAnalysis } from "../../services/cvService"
import {
  clearStoredCvAnalysis,
  clearStoredCvFileName,
  getStoredCvAnalysis,
  getStoredCvFileName,
  setStoredCvAnalysis,
  setStoredCvFileName,
} from "../../lib/sensitiveStorage"
import { buildTwinFromCv } from "../../api/services/twinService"


export default function CVAnalyzerPage() {

  const { user, progress, updateProgress } = useUser()
  const navigate = useNavigate()

  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRevamping, setIsRevamping] = useState(false)
  const [revampedCV, setRevampedCV] = useState<RevampedCV | null>(null)
  const [originalScore, setOriginalScore] = useState<number | null>(null)
  const [newScore, setNewScore] = useState<number | null>(null)
  const [changesSummary, setChangesSummary] = useState<string[]>([])

  const [cvData, setCvData] = useState<CVAnalysis | null>(() => {
    return getStoredCvAnalysis<CVAnalysis>()
  })

  const [error, setError] = useState("")
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(60)

  const [fileName, setFileName] = useState<string | null>(() => {
    return getStoredCvFileName()
  })

  const [showPostAnalysisModal, setShowPostAnalysisModal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { showToast, ToastContainer } = useToast()


  // Persist CV analysis in session storage (avoid long-lived localStorage for PII)
  useEffect(() => {
    if (cvData) {
      setStoredCvAnalysis(cvData)
    }
  }, [cvData])

  // Persist filename in session storage
  useEffect(() => {
    setStoredCvFileName(fileName)
  }, [fileName])


  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setFileName(droppedFile.name)
      showToast(`File "${droppedFile.name}" uploaded`, "success")
    }
  }, [showToast])


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
      showToast(`File "${selectedFile.name}" selected`, "success")
    }
  }


  const handleAnalyze = async () => {
    if (!file && !cvText) {
      setError("Please upload a CV file or paste your CV text.")
      return
    }

    setError("")
    setIsAnalyzing(true)
    setRevampedCV(null)
    setOriginalScore(null)
    setNewScore(null)
    setChangesSummary([])

    try {
      const result = await analyzeCV(file, cvText)
      console.log("CV Analysis Result:", result)
      setCvData(result)

      try {
        const skills = Array.isArray(result?.extractedSkills) ? result.extractedSkills : []
        localStorage.setItem('cvSkills', JSON.stringify(skills))
        localStorage.setItem('cvScore', String(result?.score ?? 0))
      } catch {
        // ignore storage errors
      }

      // Mark CV step complete — unlocks twin builder and all protected routes
      updateProgress('cvCompleted', true)

      // Build the economic twin from the CV analysis
      try {
        await buildTwinFromCv()
        console.log("Twin built successfully from CV analysis")
      } catch (twinError) {
        console.warn("Failed to build twin, but CV analysis succeeded:", twinError)
        // Don't fail the whole process if twin building fails
      }

      showToast(`CV analyzed! Score: ${result.score}% — ${result.readinessLevel}`, "success")

      // Show post-analysis modal with next steps
      setShowPostAnalysisModal(true)

    } catch (err: any) {
      setError(err.message || "Failed to analyze CV.")
      showToast(err.message || "Analysis failed.", "error")

      if (err.status === 429) {
        setIsRateLimited(true)
        if (err.retryAfter) {
          setRetryAfter(err.retryAfter)
        }
      }
    } finally {
      setIsAnalyzing(false)
    }
  }


  const handleRevamp = async () => {
    if (!cvData) return
    setIsRevamping(true)
    setError("")

    try {
      console.log("🚀 Starting CV revamp with data:", {
        score: cvData.score,
        readinessLevel: cvData.readinessLevel,
        strengthsCount: cvData.strengths?.length || 0,
        weaknessesCount: cvData.weaknesses?.length || 0
      })

      const result = await revampCV(cvData)
      console.log("🔥 Revamp result received:", result)

      if (result && typeof result === 'object') {
        if ('revampedCV' in result) {
          const response = result as RevampedCVResponse
          setRevampedCV(response.revampedCV)
          setOriginalScore(response.originalScore)
          setNewScore(response.newScore)
          setChangesSummary(response.changesSummary || [])
          showToast(`CV revamped! New score: ${response.newScore}%`, "success")
        } else if ('professionalSummary' in result || 'name' in result) {
          setRevampedCV(result as RevampedCV)
          setOriginalScore(cvData.score)
          setNewScore(Math.min(cvData.score + 15, 96))
          setChangesSummary(generateChangesSummary(cvData))
          showToast("CV revamped successfully!", "success")
        } else {
          console.error("Unexpected response format:", result)
          throw new Error("Invalid response format from revamp service")
        }
      } else {
        throw new Error("Empty or invalid response from revamp service")
      }

    } catch (err: any) {
      console.error("❌ Revamp error:", err)
      if (err?.status === 429) {
        const seconds = typeof err.retryAfter === 'number' ? err.retryAfter : 60
        const msg = err.message || `Rate limited. Please try again in ${seconds} seconds.`
        setError(msg)
        showToast(msg, "error")
        return
      }
      showToast(err.message || "Failed to revamp CV.", "error")
    } finally {
      setIsRevamping(false)
    }
  }


  const generateChangesSummary = (data: CVAnalysis): string[] => {
    const weaknesses = data.weaknesses || []
    const missingKeywords = data.missingKeywords || []
    const changes: string[] = []

    for (const weakness of weaknesses.slice(0, 4)) {
      if (weakness.includes("Matric")) {
        changes.push("Added Matric/Grade 12 details for SA graduate programs")
      } else if (weakness.toLowerCase().includes("work experience")) {
        changes.push("Enhanced project descriptions to highlight practical experience")
      } else if (weakness.includes("Agile") || weakness.includes("Scrum")) {
        changes.push("Incorporated Agile/Scrum methodology keywords")
      } else if (weakness.includes("DevOps") || weakness.includes("containerization")) {
        changes.push("Added DevOps and containerization tools to skills")
      } else if (weakness.toLowerCase().includes("quantifiable")) {
        changes.push("Added metrics and numbers to achievements")
      } else {
        changes.push(`Addressed: ${weakness.substring(0, 50)}...`)
      }
    }

    if (missingKeywords.length > 0) {
      changes.push(`Added missing keywords: ${missingKeywords.slice(0, 3).join(', ')}`)
    }

    if (changes.length < 3) {
      const genericChanges = [
        "Enhanced professional summary with stronger action verbs",
        "Optimized skills section with better categorization for ATS",
        "Improved bullet points to start with strong action verbs",
        "Restructured experience section for better ATS parsing"
      ]
      changes.push(...genericChanges.slice(0, 3 - changes.length))
    }

    return changes.slice(0, 7)
  }


  const handleClear = () => {
    setCvData(null)
    setCvText("")
    setFile(null)
    setFileName(null)
    setRevampedCV(null)
    setOriginalScore(null)
    setNewScore(null)
    setChangesSummary([])
    clearStoredCvAnalysis()
    clearStoredCvFileName()
  }


  // Access data from the correct structure
  const sections = cvData?.sections || {
    about: '',
    skills: [],
    education: [],
    experience: [],
    achievements: []
  }

  const strengths = cvData?.strengths || []
  const weaknesses = cvData?.weaknesses || []
  const skills = sections.skills || []
  const education = sections.education || []
  const experience = sections.experience || []
  const achievements = sections.achievements || []
  const recommendations = cvData?.recommendations || []
  const missingKeywords = cvData?.missingKeywords || []
  const incomeIdeas = cvData?.incomeIdeas || []
  const linkCheck = cvData?.linkCheck || {
    linkedin: false,
    github: false,
    portfolio: false
  }


  // ========== RESULTS VIEW ==========
  if (cvData && !isAnalyzing) {
    return (
      <div className="min-h-screen bg-background">
        <ToastContainer />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div className="w-full md:w-auto order-2 md:order-1">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-1 rounded-xl bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/20"
              >
                <button
                  onClick={() => navigate('/dashboard/twin')}
                  className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg group"
                >
                  <Sparkles className="h-4 w-4" />
                  {progress.twinCompleted ? 'View Your Digital Twin' : 'Build Your Digital Twin'}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
                <Brain className="h-7 w-7 text-primary" />
                CV Analysis Results
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Readiness: <span className={cn("font-semibold",
                  cvData.readinessLevel === "EXCEPTIONAL" ? "text-green-500" :
                  cvData.readinessLevel === "HIGH POTENTIAL" ? "text-amber-500" :
                  cvData.readinessLevel === "INTERMEDIATE" ? "text-blue-500" :
                  cvData.readinessLevel === "DEVELOPING" ? "text-orange-500" :
                  "text-destructive"
                )}>{cvData.readinessLevel}</span>
              </p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1">
                  Logged in as: {user.email}
                </p>
              )}
            </div>
            <button
              onClick={handleClear} 
              className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-muted transition-all flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Analyze New CV
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Score & Summary */}
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl border border-border p-6 text-center"
              >
                <ScoreMeter score={cvData.score} label="CV Strength" size="lg" />
                <p className="text-xs text-muted-foreground mt-3">
                  {cvData.score}/100 • Based on skills, experience & market fit
                </p>
              </motion.div>

              {/* Links check */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Profile Audit
                </h4>
                <div className="space-y-2">
                  {[
                    { label: "LinkedIn", found: linkCheck.linkedin || false },
                    { label: "GitHub/Portfolio", found: linkCheck.github || linkCheck.portfolio || false },
                    { label: "Driver's Licence", found: false },
                  ].map((link, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      link.found ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
                    )}>
                      <span className="text-sm">{link.label}</span>
                      {link.found
                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                        : <XCircle className="h-4 w-4 text-amber-500" />
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {strengths.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-2">✔ Strengths</h4>
                  <ul className="space-y-1.5">
                    {strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {weaknesses.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">✗ Weaknesses</h4>
                  <ul className="space-y-1.5">
                    {weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <XCircle className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" /> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {!revampedCV && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-5"
                >
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" /> What's Next?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      to="/dashboard/twin"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {progress.twinCompleted ? 'View Your Digital Twin' : 'Build Your Digital Twin'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {progress.twinCompleted ? 'Review your latest AI career insights' : 'Create AI-powered career simulation'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform ml-auto" />
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">View Dashboard</p>
                        <p className="text-xs text-muted-foreground">Track progress & insights</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-purple-500 group-hover:translate-x-1 transition-transform ml-auto" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Revamp button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border border-border p-5 text-center"
              >
                <Wand2 className="h-7 w-7 text-primary mx-auto mb-2" />
                <h4 className="font-display font-bold mb-1">AI CV Revamp</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Get an ATS-optimized version you can edit before downloading as PDF
                </p>
                <button
                  onClick={handleRevamp}
                  disabled={isRevamping}
                  className={cn(
                    "w-full py-3 rounded-lg font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    isRevamping
                      ? "bg-muted text-muted-foreground cursor-wait"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isRevamping ? (
                    <><div className="animate-spin">
                      <Brain className="h-4 w-4" />
                    </div> Revamping...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Revamp to 95%+ ATS</>
                  )}
                </button>
              </motion.div>
            </div>

            {/* Column 2-3: Details */}
            <div className="lg:col-span-2 space-y-5">

              {/* Before/After Scores */}
              {originalScore && newScore && (
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Before</p>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-foreground">{originalScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                      <p className="text-xs text-muted-foreground mt-1">Original</p>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-neon-green/30 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-neon-green mb-2">After Revamp</p>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-neon-green">{newScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                      <p className="text-xs text-neon-green mt-1">Revamped</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Changes Summary */}
              {changesSummary.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 mb-5">
                  <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Changes Applied
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {changesSummary.map((change, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-neon-green flex-shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revamped CV */}
              <AnimatePresence>
                {revampedCV && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <RevampedCVDisplay cvData={revampedCV} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Summary */}
              {!revampedCV && sections.about && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> AI Summary
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sections.about}</p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && !revampedCV && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Skills Detected
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && !revampedCV && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">Education</h4>
                  <div className="space-y-1.5">
                    {education.map((edu: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-sm">{edu}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && !revampedCV && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">Experience</h4>
                  <div className="space-y-2">
                    {experience.map((exp: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-sm">{exp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {achievements.length > 0 && !revampedCV && (
                <div className="bg-green-500/5 rounded-xl border border-green-500/20 p-5">
                  <h4 className="text-xs font-display font-bold uppercase tracking-widest text-green-500 mb-3">Key Achievements</h4>
                  <ul className="space-y-1.5">
                    {achievements.map((ach: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-green-500 mt-0.5">✦</span> {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {!revampedCV && (recommendations.length > 0 || missingKeywords.length > 0 || incomeIdeas.length > 0) && (
                <div className="bg-primary rounded-xl p-6 text-primary-foreground">
                  <h4 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5" /> AI Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-5">
                    {recommendations.length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">Improvements</h5>
                        <ul className="space-y-2.5">
                          {recommendations.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm opacity-90">
                              <span className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                {i + 1}
                              </span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {missingKeywords.length > 0 && (
                      <div className="bg-primary-foreground/10 p-4 rounded-lg backdrop-blur-sm">
                        <h5 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">Missing Keywords</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {missingKeywords.map((kw: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-primary-foreground/20 border border-primary-foreground/30 text-xs">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {incomeIdeas.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-primary-foreground/20">
                      <h5 className="font-display font-bold mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Income Opportunities
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {incomeIdeas.map((idea: any, i: number) => (
                          <div key={i} className="bg-primary-foreground/10 p-3 rounded-lg">
                            <h6 className="font-semibold text-sm mb-1">{idea.title}</h6>
                            <div className="flex gap-2 text-[10px] mb-1.5">
                              <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full">{idea.difficulty}</span>
                              <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full">{idea.potential}</span>
                            </div>
                            <p className="text-xs opacity-80">{idea.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    )
  }


  // ========== UPLOAD VIEW ==========
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <ToastContainer />
      <div className="w-full max-w-2xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            AI CV Analyzer
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload your CV and get AI-powered analysis with an ATS-optimized revamp you can edit before downloading as PDF
          </p>
          {user && (
            <p className="text-xs text-muted-foreground mt-2">
              Logged in as: {user.email}
            </p>
          )}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <CVUploadError
              error={error}
              isRateLimited={isRateLimited}
              retryAfter={retryAfter}
              onRetry={handleAnalyze}
              onDismiss={() => setError("")}
            />
          )}

          {isRateLimited && (
            <RateLimitAlert
              retryAfter={retryAfter}
              onRetry={() => {
                setIsRateLimited(false)
                handleAnalyze()
              }}
            />
          )}
        </AnimatePresence>

        {/* Scan animation */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CVScanAnimation isActive={isAnalyzing} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload form */}
        {!isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            {/* File upload */}
            <div className="space-y-3">
              <label className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</span>
                Upload CV File
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5",
                  fileName && "border-green-500 bg-green-500/5"
                )}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleFileSelect} />

                {fileName ? (
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                      <FileText className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="font-semibold text-green-500 text-sm">{fileName}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setFileName(null) }}
                      className="text-xs text-muted-foreground hover:text-primary mt-1 underline"
                    >
                      Replace file
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-display font-semibold text-sm mb-1">Drop your CV here</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT • Max 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Text paste */}
            <div className="space-y-2 mt-5">
              <label className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">2</span>
                Paste CV Text
                <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-normal normal-case">Recommended for best results</span>
              </label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV text here for better analysis accuracy..."
                className="w-full h-36 p-4 rounded-lg bg-muted/30 border-2 outline-none transition-all text-sm focus:border-primary border-border resize-none placeholder:text-muted-foreground/50"
              />
              {cvText.length > 0 && cvText.length < 50 && (
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> More text improves accuracy
                </p>
              )}
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!fileName && !cvText}
              className={cn(
                "w-full mt-5 py-3.5 rounded-lg font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                (fileName || cvText)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Brain className="h-5 w-5" /> Analyze with AI
            </button>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> AI-Powered</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> ATS Optimized</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Editable PDF Output</span>
            </div>

          </motion.div>
        )}

      </div>

      {/* Post-Analysis Modal */}
      <PostCVAnalysisModal
        isOpen={showPostAnalysisModal}
        onClose={() => setShowPostAnalysisModal(false)}
        cvScore={cvData?.score ?? 0}
        readinessLevel={cvData?.readinessLevel ?? 'UNKNOWN'}
        twinCompleted={progress.twinCompleted}
        onRevampClick={handleRevamp}
      />

    </div>
  )
}
