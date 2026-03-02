import { useState, useRef, useEffect } from "react"
import { Mic, Play, Pause, Square, RefreshCw, CheckCircle, ChevronRight, Clock, Target, BarChart3, Download, Share2, Brain, TrendingUp, Award } from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../lib/user-context"

// Clean Components
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Avatar from "../components/ui/Avatar"
import Loading from "../components/ui/Loading"
import VoiceVisualizerClean from "../components/ui/VoiceVisualizerClean"

const interviewTypes = [
  { id: "tech", label: "Technical", desc: "IT and development roles", icon: "💻" },
  { id: "behavioral", label: "Behavioral", desc: "Soft skills and teamwork", icon: "🤝" },
  { id: "non-tech", label: "Non-Technical", desc: "General roles", icon: "📊" },
  { id: "executive", label: "Executive", desc: "Leadership positions", icon: "👔" },
  { id: "sales", label: "Sales", desc: "Sales and customer service", icon: "💰" }
]

interface Question {
  id: string
  text: string
  category: string
  difficulty: string
  timeLimit?: number
}

interface Feedback {
  score: number
  feedback: string
  strengths?: string[]
  improvements?: string[]
  confidence?: number
  clarity?: number
  relevance?: number
  pacing?: number
  emotion?: string
}

interface VoiceRecording {
  blob: Blob
  duration: number
  waveform: number[]
}

interface SessionMetrics {
  totalQuestions: number
  answeredQuestions: number
  averageScore: number
  totalTime: number
  confidenceLevel: number
  improvementAreas: string[]
}

export default function InterviewCoachSpectacular() {
  const { user, updateProgress } = useUser()
  const [mode, setMode] = useState<"select" | "practice" | "feedback">("select")
  const [interviewType, setInterviewType] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<{ questionId: string; response: string; feedback?: Feedback; recording?: VoiceRecording }[]>([])
  const [currentResponse, setCurrentResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null)
  
  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        stopRecording()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const recording: VoiceRecording = {
          blob,
          duration: recordingTime,
          waveform: [] // Would be populated from analyser data
        }
        
        // Save recording to current response
        const newResponses = [...responses]
        if (newResponses[currentQuestion]) {
          newResponses[currentQuestion].recording = recording
        } else {
          newResponses[currentQuestion] = { questionId: questions[currentQuestion]?.id || '', response: '', recording }
        }
        setResponses(newResponses)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start audio level monitoring
      updateAudioLevel()
      
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError("Please allow microphone access to use voice recording")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setIsPaused(true)
      }
    }
  }

  const updateAudioLevel = () => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      setAudioLevel(average / 255)
      
      requestAnimationFrame(updateAudioLevel)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startInterview = async (type: string) => {
    setError("")
    setIsLoading(true)
    try {
      // Mock spectacular interview questions
      const mockQuestions: Question[] = [
        {
          id: "1",
          text: "Tell me about yourself and your experience relevant to this position.",
          category: "Introduction",
          difficulty: "Easy",
          timeLimit: 120
        },
        {
          id: "2", 
          text: "Describe a challenging project you've worked on and how you overcame obstacles.",
          category: "Problem Solving",
          difficulty: "Medium",
          timeLimit: 180
        },
        {
          id: "3",
          text: "Where do you see yourself in 5 years and how does this role fit into your career goals?",
          category: "Career Goals",
          difficulty: "Medium",
          timeLimit: 150
        }
      ]
      
      setSessionId("session_" + Date.now())
      setQuestions(mockQuestions)
      setInterviewType(type)
      setMode("practice")
      setCurrentQuestion(0)
      setResponses([])
      setCurrentResponse("")
      setSessionMetrics({
        totalQuestions: mockQuestions.length,
        answeredQuestions: 0,
        averageScore: 0,
        totalTime: 0,
        confidenceLevel: 0,
        improvementAreas: []
      })
      
    } catch (err: any) {
      setError(err.message || "Failed to start interview")
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!currentResponse.trim() && !responses[currentQuestion]?.recording) {
      setError("Please provide a response before continuing")
      return
    }
    
    setIsLoading(true)
    try {
      // Mock AI feedback
      const mockFeedback: Feedback = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        feedback: "Good response with clear examples. Consider adding more specific metrics.",
        strengths: ["Clear communication", "Relevant examples", "Structured answer"],
        improvements: ["Add quantifiable results", "Be more concise", "Include industry keywords"],
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100
        clarity: Math.floor(Math.random() * 20) + 80,
        relevance: Math.floor(Math.random() * 20) + 80,
        pacing: Math.floor(Math.random() * 20) + 80,
        emotion: "Confident"
      }
      
      const newResponses = [...responses]
      newResponses[currentQuestion] = {
        questionId: questions[currentQuestion]?.id || '',
        response: currentResponse,
        feedback: mockFeedback,
        recording: responses[currentQuestion]?.recording
      }
      setResponses(newResponses)
      
      // Update metrics
      const answeredCount = newResponses.filter(r => r.response || r.recording).length
      const avgScore = newResponses.reduce((sum, r) => sum + (r.feedback?.score || 0), 0) / answeredCount
      
      setSessionMetrics(prev => prev ? {
        ...prev,
        answeredQuestions: answeredCount,
        averageScore: avgScore,
        confidenceLevel: Math.floor(avgScore * 0.9) // Approximate confidence
      } : null)
      
      // Move to next question or show feedback
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setCurrentResponse("")
      } else {
        setMode("feedback")
        updateProgress({ interviewsCompleted: true, interviewScore: Math.floor(avgScore), totalInterviews: 1 })
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to submit answer")
    } finally {
      setIsLoading(false)
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

  if (isLoading && mode === "select") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="lg" text="Preparing interview session..." />
      </div>
    )
  }

  if (mode === "select") {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Avatar size="xl" variant="primary" />
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  AI Interview Coach Pro
                </h1>
                <p className="text-xl text-muted-foreground">
                  Practice with voice recording and real-time AI feedback
                </p>
              </div>
            </div>
          </div>

          {/* Interview Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewTypes.map((type) => (
              <Card key={type.id} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => startInterview(type.id)}>
                <div className="space-y-4">
                  <div className="text-4xl text-center">{type.icon}</div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{type.label}</h3>
                    <p className="text-muted-foreground">{type.desc}</p>
                  </div>
                  <Button className="w-full">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Practice
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Features */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Spectacular Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Mic, title: "Voice Recording", desc: "Record and playback your answers" },
                { icon: Brain, title: "AI Analysis", desc: "Real-time feedback and scoring" },
                { icon: TrendingUp, title: "Progress Tracking", desc: "Monitor improvement over time" },
                { icon: Award, title: "Achievement System", desc: "Unlock badges and rewards" },
                { icon: Clock, title: "Time Management", desc: "Practice with time limits" },
                { icon: Target, title: "Question Bank", desc: "1000+ interview questions" },
                { icon: BarChart3, title: "Detailed Analytics", desc: "Comprehensive performance metrics" },
                { icon: Download, title: "Export Reports", desc: "Download practice sessions" }
              ].map((feature, i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === "practice") {
    const question = questions[currentQuestion]
    const response = responses[currentQuestion]
    
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {interviewTypes.find(t => t.id === interviewType)?.label} Interview
                </h2>
                <p className="text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {Math.round((currentQuestion / questions.length) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              />
            </div>
          </Card>

          {/* Question */}
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar size="lg" variant="secondary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      {question?.category}
                    </span>
                    <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                      {question?.difficulty}
                    </span>
                    {question?.timeLimit && (
                      <span className="px-2 py-1 bg-warning/10 text-warning rounded text-xs font-medium">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTime(question.timeLimit)}
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-foreground leading-relaxed">
                    {question?.text}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Voice Recording Section */}
          <Card className="p-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Your Response</h3>
              
              {/* Voice Visualizer */}
              <div className="flex justify-center">
                <div className="w-64 h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                  <VoiceVisualizerClean isActive={isRecording} intensity={audioLevel} />
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <Button onClick={startRecording} size="lg" className="w-20 h-20 rounded-full">
                    <Mic className="h-8 w-8" />
                  </Button>
                ) : (
                  <>
                    <Button onClick={pauseRecording} variant="outline" size="lg" className="w-16 h-16 rounded-full">
                      {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                    </Button>
                    <Button onClick={stopRecording} variant="secondary" size="lg" className="w-16 h-16 rounded-full">
                      <Square className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>

              {/* Recording Status */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">
                  {isRecording ? (isPaused ? "Recording Paused" : "Recording...") : "Click to Start Recording"}
                </p>
                {isRecording && (
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(recordingTime)}
                  </p>
                )}
              </div>

              {/* Text Response */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Or type your response:
                </label>
                <textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Type your answer here or use voice recording..."
                  className="w-full h-32 p-4 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
                  Previous
                </Button>
                <Button onClick={submitAnswer} disabled={isLoading}>
                  {isLoading ? "Analyzing..." : currentQuestion < questions.length - 1 ? "Next Question" : "Complete Interview"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === "feedback") {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Interview Complete!</h2>
              <p className="text-xl text-muted-foreground">
                Here's your performance analysis
              </p>
            </div>
          </Card>

          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">
                  {sessionMetrics?.averageScore.toFixed(1) || 0}/100
                </p>
                <p className="text-muted-foreground">Overall Score</p>
              </div>
            </Card>
            <Card className="p-6 text-center">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-accent">
                  {sessionMetrics?.confidenceLevel || 0}%
                </p>
                <p className="text-muted-foreground">Confidence Level</p>
              </div>
            </Card>
            <Card className="p-6 text-center">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-secondary">
                  {sessionMetrics?.answeredQuestions || 0}/{sessionMetrics?.totalQuestions || 0}
                </p>
                <p className="text-muted-foreground">Questions Answered</p>
              </div>
            </Card>
          </div>

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Question Breakdown</h3>
              <div className="space-y-4">
                {responses.map((response, i) => (
                  <div key={i} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">Question {i + 1}</h4>
                      <span className={cn("font-bold", getScoreColor(response.feedback?.score || 0))}>
                        {response.feedback?.score || 0}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-2 font-medium">{response.feedback?.confidence || 0}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clarity:</span>
                        <span className="ml-2 font-medium">{response.feedback?.clarity || 0}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Relevance:</span>
                        <span className="ml-2 font-medium">{response.feedback?.relevance || 0}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pacing:</span>
                        <span className="ml-2 font-medium">{response.feedback?.pacing || 0}%</span>
                      </div>
                    </div>
                    {response.feedback?.feedback && (
                      <p className="text-sm text-muted-foreground mt-2">{response.feedback.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Performance Insights</h3>
              <div className="space-y-6">
                {responses[0]?.feedback?.strengths && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Strengths</h4>
                    <div className="space-y-2">
                      {responses[0].feedback.strengths.map((strength, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm text-foreground">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {responses[0]?.feedback?.improvements && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {responses[0].feedback.improvements.map((improvement, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-warning" />
                          <span className="text-sm text-foreground">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button onClick={() => setMode("select")} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Interview
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="secondary">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
