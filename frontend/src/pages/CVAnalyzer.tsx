// src/pages/CVAnalyzer.tsx
import { useState, useCallback, useRef, useEffect } from "react"
import { Sparkles, AlertCircle, CheckCircle, XCircle, Info, Moon, Sun, Menu, X } from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../lib/user-context"
import RateLimitAlert from "../components/RateLimitAlert"
import ErrorAlert from "../components/ErrorAlert"
import aiService from '../services/aiService'
import { useToast } from "../components/Toast"


interface IncomeIdea {
  title: string
  difficulty: string
  potential: string
  description: string
}

interface CVAnalysis {
  score: number
  readinessLevel: string
  summary: string
  sections: {
    about: string
    skills: string[]
    education: string[]
    experience: string[]
    achievements: string[]
  }
  linkCheck: {
    linkedin: boolean
    github: boolean
    portfolio: boolean
  }
  recommendations: string[]
  missingKeywords: string[]
  incomeIdeas: IncomeIdea[]
}

export default function CVAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cvData, setCvData] = useState<CVAnalysis | null>(() => {
    const saved = localStorage.getItem('comprehensiveCVAnalysis')
    return saved ? JSON.parse(saved) : null
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
  const [showTips, setShowTips] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  const { updateProgress } = useUser()
  const { success } = useToast()

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
      localStorage.setItem('cvSkills', JSON.stringify(cvData.sections.skills))
    }
  }, [cvData])

  // Save fileName to localStorage
  useEffect(() => {
    if (fileName) {
      localStorage.setItem('cvFileName', fileName)
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
      
      // Show format recommendation
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
      
      // Show format recommendation
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
    if (!cvText.trim() || cvText.length < 50) {
      setError("Please paste your CV text for analysis.")
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
      
      let result
      if (file) {
        result = await aiService.analyzeCVFile(file)
      } else {
        result = await aiService.analyzeCV(cvText)
      }
      
      console.log('CV analysis complete:', result)
      setCvData(result)
      updateProgress('cvCompleted', true)
      
      success(`CV analyzed successfully! Market readiness score: ${result.score}% - ${result.readinessLevel}`)
    } catch (err: any) {
      console.error('CV Analysis Error:', err)
      
      if (err.status === 429) {
        setIsRateLimited(true)
        setRetryAfter(err.retryAfter || 60)
        setError('Rate limit reached. Please try again in a moment.')
      } else if (err.status === 503) {
        setError('AI service is temporarily unavailable. Please try again later.')
      } else {
        setError(err.message || 'Failed to analyze CV. Please try again.')
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
      <div className={cn(
        "min-h-screen w-full transition-colors duration-300",
        darkMode ? "dark bg-slate-900" : "bg-slate-50"
      )}>
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-slate-800 dark:text-white">CV Analysis</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700"
              >
                {darkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-lg">
              <button
                onClick={handleClearMemory}
                className="w-full bg-slate-900 dark:bg-blue-600 text-white px-4 py-3 rounded-xl font-black text-sm"
              >
                Analyze New CV
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="pt-16 md:pt-0 px-4 sm:px-6 max-w-7xl mx-auto">
          {/* Desktop Header */}
          <header className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight flex items-center">
                <span className="mr-3">📊</span> CV Analysis Results
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                Readiness Level: <span className={cn(
                  "font-black uppercase tracking-widest",
                  cvData.readinessLevel === 'EXCEPTIONAL' ? 'text-emerald-600 dark:text-emerald-400' :
                  cvData.readinessLevel === 'HIGH POTENTIAL' ? 'text-blue-600 dark:text-blue-400' :
                  cvData.readinessLevel === 'INTERMEDIATE' ? 'text-amber-600 dark:text-amber-400' :
                  'text-slate-600 dark:text-slate-400'
                )}>{cvData.readinessLevel}</span>
              </p>
            </div>
            <button 
              onClick={handleClearMemory}
              className="bg-slate-900 dark:bg-blue-600 text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl"
            >
              Analyze New CV
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 py-4 md:py-8">
            {/* Column 1: Score and Links */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-blue-500/5 rounded-full -mr-8 md:-mr-12 -mt-8 md:-mt-12" />
                <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[8px] md:text-[10px] tracking-widest mb-2">Market Readiness</p>
                <div className="text-5xl md:text-7xl font-black text-blue-600 dark:text-blue-400 mb-2">{cvData.score}%</div>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400">Based on skills, experience & profile completeness</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h4 className="font-black text-slate-800 dark:text-white text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-6 flex items-center">
                  <span className="mr-2">🔗</span> Profile Links Audit
                </h4>
                <div className="space-y-3 md:space-y-4">
                  {[
                    { label: 'LinkedIn Profile', found: cvData.linkCheck.linkedin, warning: '85% of recruiters check this' },
                    { label: 'GitHub Profile', found: cvData.linkCheck.github, warning: 'Essential for developer roles' },
                    { label: 'Portfolio Website', found: cvData.linkCheck.portfolio, warning: 'Showcases your work visually' },
                  ].map((link, index) => (
                    <div key={index} className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border gap-2",
                      link.found 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' 
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                    )}>
                      <div className="flex-1">
                        <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 block">{link.label}</span>
                        {!link.found && (
                          <span className="text-[8px] text-amber-600 dark:text-amber-400 font-medium block mt-1">{link.warning}</span>
                        )}
                      </div>
                      <span className={cn(
                        "text-[8px] md:text-[10px] font-black px-2 py-1 rounded-full uppercase inline-flex items-center justify-center gap-1 w-fit",
                        link.found 
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40' 
                          : 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40'
                      )}>
                        {link.found ? (
                          <>✓ VERIFIED</>
                        ) : (
                          <>⚠ MISSING</>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2 & 3: Profile Details */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-6 md:mb-8 flex items-center">
                  <span className="mr-3">👤</span> Professional Profile
                </h3>
                
                <div className="space-y-6 md:space-y-10">
                  {/* About Section */}
                  <section className="bg-slate-50 dark:bg-slate-700/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-600">
                    <h5 className="text-[8px] md:text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 md:mb-3">Professional Summary</h5>
                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      {cvData.sections.about}
                    </p>
                  </section>

                  {/* Skills Section */}
                  <section>
                    <h5 className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 md:mb-4">Technical Skills</h5>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {cvData.sections.skills.map((s, i) => (
                        <span key={i} className="bg-slate-900 dark:bg-slate-700 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-tight">
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Education Section */}
                  <section>
                    <h5 className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 md:mb-4">Education</h5>
                    <div className="space-y-2 md:space-y-3">
                      {cvData.sections.education.map((edu, i) => (
                        <div key={i} className="p-3 md:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-600">
                          <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white">{edu}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Experience Section */}
                  {cvData.sections.experience.length > 0 && (
                    <section>
                      <h5 className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 md:mb-4">Experience</h5>
                      <div className="space-y-3 md:space-y-4">
                        {cvData.sections.experience.map((exp, i) => (
                          <div key={i} className="p-4 md:p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-600">
                            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">{exp}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Achievements Section */}
                  {cvData.sections.achievements.length > 0 && (
                    <section className="bg-emerald-50 dark:bg-emerald-900/20 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-100 dark:border-emerald-800">
                      <h5 className="text-[8px] md:text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-3 md:mb-4">Key Achievements</h5>
                      <ul className="space-y-2 md:space-y-3">
                        {cvData.sections.achievements.map((ach, i) => (
                          <li key={i} className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-lg md:rounded-xl border border-emerald-100 dark:border-emerald-800 text-[10px] md:text-xs text-emerald-800 dark:text-emerald-300 font-medium shadow-sm flex items-start">
                            <span className="mr-2 md:mr-3 text-emerald-500 dark:text-emerald-400">✦</span>
                            {ach}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-6 md:p-10 rounded-3xl md:rounded-[40px] text-white shadow-2xl relative">
                <div className="absolute top-4 right-4 md:top-8 md:right-8 text-2xl md:text-4xl opacity-20">💡</div>
                <h4 className="text-xl md:text-2xl font-black mb-4 md:mb-6">Recommendations & Insights</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {/* Recommendations */}
                  <div>
                    <h5 className="text-[10px] md:text-xs font-black text-blue-200 uppercase mb-3 md:mb-4 tracking-widest">Suggested Improvements</h5>
                    <ul className="space-y-2 md:space-y-3">
                      {cvData.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start space-x-2 md:space-x-3 text-xs md:text-sm text-blue-50 leading-relaxed">
                          <span className="bg-white text-blue-600 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 font-black text-[8px] md:text-[10px] mt-0.5">!</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Market Keywords */}
                  {cvData.missingKeywords.length > 0 && (
                    <div className="bg-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10">
                      <h5 className="text-[10px] md:text-xs font-black text-blue-200 uppercase mb-3 md:mb-4 tracking-widest">Market Keywords to Add</h5>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {cvData.missingKeywords.map((kw, i) => (
                          <span key={i} className="text-[8px] md:text-[10px] font-bold text-white bg-blue-500/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Income Ideas */}
                {cvData.incomeIdeas && cvData.incomeIdeas.length > 0 && (
                  <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
                    <h5 className="text-base md:text-lg font-black mb-3 md:mb-4 flex items-center">
                      <span className="mr-2">💰</span> Income Opportunities
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {cvData.incomeIdeas.map((idea, i) => (
                        <div key={i} className="bg-white/10 p-4 md:p-5 rounded-lg md:rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                          <h6 className="font-black text-sm md:text-base mb-1 md:mb-2">{idea.title}</h6>
                          <div className="flex justify-between text-[8px] md:text-[10px] mb-2 md:mb-3">
                            <span className="bg-white/20 px-2 py-0.5 rounded-full">{idea.difficulty}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded-full">{idea.potential}</span>
                          </div>
                          <p className="text-[10px] md:text-[11px] text-blue-100 leading-relaxed">{idea.description}</p>
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
    )
  }

  // Otherwise show the input form
  return (
    <div className={cn(
      "min-h-screen w-full transition-colors duration-300",
      darkMode ? "dark bg-slate-900" : "bg-slate-50"
    )}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-slate-800 dark:text-white">CV Analysis</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700"
            >
              {darkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-lg">
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowTips(!showTips)
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm"
              >
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pt-16 md:pt-0 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Toast Notifications */}
        
        
        {/* Desktop Dark Mode Toggle */}
        <div className="hidden md:block fixed top-4 right-4 z-50">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
          >
            {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>
        </div>
        
        <header className="text-center space-y-2 md:space-y-4 py-6 md:py-12">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight">CV Analysis</h1>
          <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-4">
            Upload your CV and paste the text for comprehensive analysis
          </p>
        </header>

        {/* Tips Banner */}
        {showTips && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl md:rounded-3xl p-4 md:p-6 relative mb-6 md:mb-8">
            <button
              onClick={() => setShowTips(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <XCircle className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <div className="flex items-start gap-3 md:gap-4">
              <Info className="h-5 w-5 md:h-6 md:w-6 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black text-blue-800 dark:text-blue-300 text-sm md:text-base mb-2">📌 For Best Results:</h3>
                <ul className="text-xs md:text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li><span className="font-bold">Use DOCX format</span> - Provides the best text extraction accuracy</li>
                  <li><span className="font-bold">PDF works</span> but may have formatting issues with complex layouts</li>
                  <li><span className="font-bold">Always paste your CV text</span> in addition to uploading the file</li>
                  <li>Ensure your CV has clear section headers (Education, Experience, Skills, etc.)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {isRateLimited && (
          <RateLimitAlert
            message={error}
            retryAfter={retryAfter}
            onRetry={handleRetry}
          />
        )}
        {error && !isRateLimited && <ErrorAlert message={error} onDismiss={() => setError("")} />}

        {/* Simple Loading Overlay */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl md:rounded-[50px] p-6 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 text-center">
            <div className="max-w-md mx-auto space-y-4 md:space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center shadow-2xl mx-auto">
                  <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-white animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">
                  Analyzing Your CV...
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  Extracting skills, experience, and providing personalized feedback
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>

              <div className="space-y-2">
                <div className="h-1.5 md:h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-900 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
                <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">This may take 30-60 seconds...</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!isAnalyzing && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl md:rounded-[50px] p-6 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 space-y-6 md:space-y-10">
            {/* Upload Section */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center flex-wrap gap-2">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] md:text-[10px] mr-2">1</span>
                Upload CV File
                <span className="text-[8px] md:text-[8px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                  DOCX recommended
                </span>
              </h3>
              <div 
                className={cn(
                  "relative border-2 border-dashed rounded-2xl md:rounded-3xl p-6 md:p-8 text-center transition-all cursor-pointer",
                  fileName ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700',
                  isDragging && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                )}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                {fileName ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                    <p className="font-black text-emerald-700 dark:text-emerald-400 text-xs md:text-sm break-all">{fileName}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setFileName(null)
                        localStorage.removeItem('cvFileName')
                      }} 
                      className="text-emerald-900 dark:text-emerald-300 text-[10px] md:text-xs font-bold underline hover:no-underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Click or drag to upload
                    </p>
                    <p className="text-[8px] md:text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                      PDF, DOCX, TXT • DOCX provides best accuracy
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Text Section */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center flex-wrap gap-2">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] md:text-[10px] mr-2">2</span>
                Paste CV Content
                <span className="text-[8px] md:text-[8px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                  Required
                </span>
              </h3>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Copy and paste your CV text here..."
                className="w-full h-48 md:h-80 p-4 md:p-8 rounded-2xl md:rounded-[40px] bg-slate-50 dark:bg-slate-700 border-2 outline-none transition-all text-xs md:text-sm leading-relaxed focus:border-blue-500 border-slate-100 dark:border-slate-600 resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
              {cvText.length > 0 && cvText.length < 50 && (
                <p className="text-[10px] md:text-xs text-amber-500 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Add more text for accuracy ({cvText.length}/50)
                </p>
              )}
            </div>

            {/* Analyze Button */}
            <div className="flex flex-col items-center space-y-4 md:space-y-6 pt-4">
              <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing || !fileName || cvText.length < 50}
                className={cn(
                  "w-full py-4 md:py-6 rounded-2xl md:rounded-[30px] font-black text-lg md:text-2xl transition-all shadow-xl active:scale-95",
                  isAnalyzing 
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                    : (cvText.length >= 50 && fileName) 
                      ? 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-black dark:hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/50' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 cursor-not-allowed'
                )}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </span>
                ) : 'Analyze CV'}
              </button>
              
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[8px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
                <span className="flex items-center">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-500 rounded-full mr-1 md:mr-2" /> 
                  AI-Powered
                </span>
                <span className="flex items-center">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mr-1 md:mr-2" /> 
                  Comprehensive
                </span>
                <span className="flex items-center">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-500 rounded-full mr-1 md:mr-2" /> 
                  Actionable
                </span>
              </div>

              {/* Accuracy Note */}
              <div className="text-center text-[8px] md:text-[10px] text-slate-400 dark:text-slate-500 max-w-md px-4">
                <span className="font-bold">Note:</span> For best results, use DOCX + paste text. PDFs may have limitations.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}