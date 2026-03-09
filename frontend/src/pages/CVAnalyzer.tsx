// src/pages/CVAnalyzer.tsx
import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, Upload, FileText, AlertCircle, Brain, 
  CheckCircle, XCircle, Zap} from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../lib/user-context"
import RateLimitAlert from "../components/RateLimitAlert"
import ErrorAlert from "../components/ErrorAlert"
import GlassCard from "../components/GlassCard"
import ScoreMeter from "../components/ScoreMeter"
import CVScanAnimation from "../components/CVScanAnimation"
import SkillGapAnalysis from "../components/SkillGapAnalysis"
import type { TransformedCVAnalysis } from '../services/aiService'
import aiService from '../services/aiService'
import { useToast } from "../components/Toast"

export default function CVAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cvData, setCvData] = useState<TransformedCVAnalysis | null>(() => {
    try {
      const saved = localStorage.getItem('comprehensiveCVAnalysis')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      console.error('Failed to parse saved CV data:', e)
      return null
    }
  })
  const [error, setError] = useState("")
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(60)
  const [autoRetryCount, setAutoRetryCount] = useState(0)
  const [fileName, setFileName] = useState<string | null>(() => {
    return localStorage.getItem('cvFileName') || null
  })
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  const { updateProgress } = useUser()
  const { success, error: toastError } = useToast()

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Save to localStorage whenever cvData changes
  useEffect(() => {
    if (cvData) {
      localStorage.setItem('comprehensiveCVAnalysis', JSON.stringify(cvData))
    }
  }, [cvData])

  // Save fileName to localStorage
  useEffect(() => {
    if (fileName) {
      localStorage.setItem('cvFileName', fileName)
    } else {
      localStorage.removeItem('cvFileName')
    }
  }, [fileName])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "application/pdf" || 
        droppedFile.type.includes("document") || 
        droppedFile.type === "text/plain")) {
      setFile(droppedFile)
      setFileName(droppedFile.name)
      
      if (droppedFile.type === "application/pdf") {
        success("PDF uploaded. Note: DOCX files provide better text extraction accuracy!")
      } else if (droppedFile.type.includes("document")) {
        success("DOCX uploaded! This format provides the best accuracy.")
      } else {
        success(`File "${droppedFile.name}" uploaded successfully!`)
      }
    }
  }, [success])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
      
      if (selectedFile.type === "application/pdf") {
        success("PDF uploaded. For best results, use DOCX format which preserves structure better.")
      } else if (selectedFile.type.includes("document")) {
        success("DOCX uploaded! This format provides the best accuracy.")
      } else {
        success(`File "${selectedFile.name}" selected.`)
      }
    }
  }

  const validateInputs = (): boolean => {
    if (!fileName && !file) {
      setError("Please upload your CV file.")
      return false
    }
    return true
  }

  const analyzeCV = async () => {
    if (!validateInputs()) return

    setError("")
    setIsAnalyzing(true)
    setIsRateLimited(false)

    try {
      console.log('Starting CV analysis with AI Service...')
      console.log('File:', file?.name)
      console.log('CV Text length:', cvText.length)
      
      let result: TransformedCVAnalysis
      
      if (file) {
        result = await aiService.analyzeCVFile(file, [])
      } else {
        result = await aiService.analyzeCV(cvText, [])
      }
      
      console.log('CV analysis complete - REAL DATA:', result)
      
      setCvData(result)
      updateProgress('cvCompleted', true)
      
      success(`CV analyzed successfully! Market readiness score: ${result.score}% - ${result.readinessLevel}`)
    } catch (err: any) {
      console.error('CV Analysis Error:', err)
      
      if (err.status === 429) {
        setIsRateLimited(true)
        setRetryAfter(err.retryAfter || 60)
        setError('Rate limit reached. Please try again in a moment.')
        toastError('Rate limit reached. Please wait before trying again.')
      } else if (err.status === 503) {
        setError('AI service is temporarily unavailable. Please try again later.')
        toastError('Service temporarily unavailable.')
      } else {
        setError(err.message || 'Failed to analyze CV. Please try again.')
        toastError(err.message || 'Failed to analyze CV.')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyzeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    analyzeCV()
  }

  const handleRetry = () => {
    setAutoRetryCount(0)
    analyzeCV()
  }

  const handleClearMemory = () => {
    setCvData(null)
    setCvText('')
    setFile(null)
    setFileName(null)
    localStorage.removeItem('comprehensiveCVAnalysis')
    localStorage.removeItem('cvSkills')
    localStorage.removeItem('cvFileName')
  }

  useEffect(() => {
    if (!isRateLimited || isAnalyzing) return
    if (autoRetryCount >= 2) return

    const timer = setTimeout(() => {
      setAutoRetryCount((count) => count + 1)
      analyzeCV()
    }, retryAfter * 1000)

    return () => clearTimeout(timer)
  }, [isRateLimited, retryAfter, autoRetryCount, isAnalyzing])

  // If we have CV data, show the comprehensive analysis
  if (cvData && !isAnalyzing) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
                <Brain className="h-6 w-6 md:h-8 md:w-8 text-[var(--sa-gold)]" /> 
                <span className="bg-gradient-to-r from-[var(--sa-gold)] to-[var(--sa-terracotta)] bg-clip-text text-transparent">
                  CV Analysis Results
                </span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Readiness Level: <span className={cn(
                  "font-semibold",
                  cvData.readinessLevel === 'EXCEPTIONAL' ? 'text-[var(--sa-green)]' :
                  cvData.readinessLevel === 'HIGH POTENTIAL' ? 'text-[var(--sa-gold)]' :
                  cvData.readinessLevel === 'INTERMEDIATE' ? 'text-[var(--sa-terracotta)]' :
                  'text-muted-foreground'
                )}>{cvData.readinessLevel}</span>
              </p>
            </div>
            <button 
              onClick={handleClearMemory}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold hover:bg-primary/90 transition-all text-sm shadow-lg hover:shadow-xl"
            >
              Analyze New CV
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Score and Links */}
            <div className="space-y-6">
              <GlassCard glow="cyan" className="text-center">
                <ScoreMeter score={cvData.score} label="CV Strength" size="lg" />
                <p className="text-xs text-muted-foreground mt-3">
                  Based on skills, experience & SA market fit
                </p>
              </GlassCard>

              <GlassCard>
                <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <span>🔗</span> Profile & Document Audit
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'LinkedIn Profile', found: cvData.linkCheck.linkedin, warning: '85% of recruiters check this' },
                    { label: 'GitHub/Portfolio', found: cvData.linkCheck.github || cvData.linkCheck.portfolio, warning: 'Essential for dev roles' },
                    { label: 'Driver\'s Licence', found: 'driversLicence' in cvData.linkCheck ? cvData.linkCheck.driversLicence : false, warning: 'Required for 60% of SA roles' },
                  ].map((link, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                        link.found 
                          ? 'border-[var(--sa-green)]/30 bg-[var(--sa-green)]/5 hover:bg-[var(--sa-green)]/10' 
                          : 'border-[var(--sa-gold)]/30 bg-[var(--sa-gold)]/5 hover:bg-[var(--sa-gold)]/10'
                      )}
                    >
                      <div>
                        <span className="text-sm font-medium block">{link.label}</span>
                        {!link.found && link.warning && (
                          <span className="text-[10px] text-[var(--sa-gold)]">{link.warning}</span>
                        )}
                      </div>
                      {link.found ? (
                        <CheckCircle className="h-4 w-4 text-[var(--sa-green)]" />
                      ) : (
                        <XCircle className="h-4 w-4 text-[var(--sa-gold)]" />
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* About Section - Compact */}
              <GlassCard>
                <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Professional Summary
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-[var(--sa-gold)] pl-3">
                  {cvData.sections.about}
                </p>
              </GlassCard>
            </div>

            {/* Column 2 & 3: Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard>
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--sa-gold)]" /> Skills & Experience
                </h3>
                
                <div className="space-y-6">
                  {/* Skills Section */}
                  <div>
                    <h5 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Technical Skills
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {cvData.sections.skills.map((s, i) => (
                        <motion.span 
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--sa-gold)]/10 border border-[var(--sa-gold)]/20 text-xs font-semibold text-[var(--sa-gold)]"
                        >
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <h5 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Education
                    </h5>
                    <div className="space-y-2">
                      {cvData.sections.education.map((edu, i) => (
                        <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                          <p className="text-sm font-medium">{edu}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience Section */}
                  {cvData.sections.experience.length > 0 && (
                    <div>
                      <h5 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Experience
                      </h5>
                      <div className="space-y-3">
                        {cvData.sections.experience.map((exp, i) => (
                          <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                            <p className="text-sm font-medium">{exp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements Section */}
                  {cvData.sections.achievements.length > 0 && (
                    <div className="bg-[var(--sa-green)]/5 p-4 rounded-xl border border-[var(--sa-green)]/30">
                      <h5 className="text-xs font-display font-bold uppercase tracking-widest text-[var(--sa-green)] mb-3">
                        Key Achievements
                      </h5>
                      <ul className="space-y-2">
                        {cvData.sections.achievements.map((ach, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="text-[var(--sa-green)]">✦</span>
                            {ach}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Skill Gap Analysis */}
              <SkillGapAnalysis cvData={cvData} cvText={cvText} />

              {/* Recommendations Section */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--sa-gold)] to-[var(--sa-terracotta)] p-6 md:p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl" />
                
                <div className="relative">
                  <h4 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5" /> AI Recommendations
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Recommendations */}
                    <div>
                      <h5 className="text-xs font-display font-bold uppercase tracking-widest text-white/80 mb-3">
                        Suggested Improvements
                      </h5>
                      <ul className="space-y-3">
                        {cvData.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                            <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                              {i+1}
                            </span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Market Keywords */}
                    {cvData.missingKeywords.length > 0 && (
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <h5 className="text-xs font-display font-bold uppercase tracking-widest text-white/80 mb-3">
                          Missing Keywords
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {cvData.missingKeywords.map((kw, i) => (
                            <span 
                              key={i} 
                              className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-medium text-white"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Income Ideas */}
                  {cvData.incomeIdeas && cvData.incomeIdeas.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <h5 className="text-base font-display font-bold mb-4 flex items-center gap-2 text-white">
                        <Zap className="h-4 w-4" /> Income Opportunities
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {cvData.incomeIdeas.map((idea, i) => (
                          <div key={i} className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm">
                            <h6 className="font-display font-bold text-sm mb-2 text-white">{idea.title}</h6>
                            <div className="flex justify-between text-[10px] mb-2">
                              <span className="bg-white/20 px-2 py-0.5 rounded-full text-white">
                                {idea.difficulty}
                              </span>
                              <span className="bg-white/20 px-2 py-0.5 rounded-full text-white">
                                {idea.potential}
                              </span>
                            </div>
                            <p className="text-xs text-white/80">{idea.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Otherwise show the input form
    return (
      <div className="w-full max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-[var(--sa-gold)] to-[var(--sa-terracotta)] bg-clip-text text-transparent">
              AI CV Analysis
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Upload your CV and let AI evaluate your market readiness for the SA job market
          </p>
        </motion.div>

        {/* Alert Messages */}
        <AnimatePresence>
          {isRateLimited && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RateLimitAlert
                message={error}
                retryAfter={retryAfter}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
          {error && !isRateLimited && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ErrorAlert message={error} onDismiss={() => setError("")} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CV Scan Animation */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <CVScanAnimation isActive={isAnalyzing} onComplete={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {!isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard glow="cyan">
              {/* Upload Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--sa-gold)] text-white flex items-center justify-center text-[10px]">1</span>
                  Upload CV File
                  <span className="text-[8px] bg-[var(--sa-gold)]/20 text-[var(--sa-gold)] px-2 py-1 rounded-full">
                    DOCX recommended
                  </span>
                </h3>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all",
                    isDragging ? "border-[var(--sa-gold)] bg-[var(--sa-gold)]/5" : "border-border hover:border-[var(--sa-gold)]/50 hover:bg-[var(--sa-gold)]/5",
                    fileName && "border-[var(--sa-green)] bg-[var(--sa-green)]/5"
                  )}
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".pdf,.docx,.doc,.txt" 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />
                  
                  {fileName ? (
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-[var(--sa-green)]/10 flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6 text-[var(--sa-green)]" />
                      </div>
                      <p className="font-semibold text-[var(--sa-green)] flex items-center gap-2">
                        {fileName}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          setFileName(null)
                        }}
                        className="text-xs text-muted-foreground hover:text-[var(--sa-gold)] mt-2 underline"
                      >
                        Replace file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-full bg-[var(--sa-gold)]/10 flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-[var(--sa-gold)]" />
                      </div>
                      <p className="font-display font-semibold mb-1">Drop your CV here</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT • Max 10MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Text Section - Optional */}
              <div className="space-y-3 mt-6">
                <h3 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--sa-gold)] text-white flex items-center justify-center text-[10px]">2</span>
                  Paste CV Content
                  <span className="text-[8px] bg-[var(--sa-green)]/20 text-[var(--sa-green)] px-2 py-1 rounded-full">
                    Optional
                  </span>
                </h3>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Optionally paste your CV text here for better analysis accuracy..."
                  className="w-full h-32 md:h-40 p-4 rounded-xl bg-muted/30 border-2 outline-none transition-all text-sm focus:border-[var(--sa-gold)] border-border resize-none text-foreground placeholder-muted-foreground"
                  aria-label="CV text content"
                />
                {cvText.length > 0 && cvText.length < 50 && (
                  <p className="text-xs text-[var(--sa-gold)] mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Adding more text improves accuracy
                  </p>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyzeClick}
                disabled={!fileName}
                className={cn(
                  "w-full mt-6 py-4 rounded-xl font-display font-bold text-lg flex items-center justify-center gap-2 transition-all",
                  fileName
                    ? "bg-gradient-to-r from-[var(--sa-gold)] to-[var(--sa-terracotta)] text-white hover:opacity-90 shadow-lg hover:shadow-xl"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Brain className="h-5 w-5" /> Analyse with AI
              </button>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--sa-green)]" />
                  AI-Powered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--sa-gold)]" />
                  SA Market Focus
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--sa-terracotta)]" />
                  Actionable Insights
                </span>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    )
  }