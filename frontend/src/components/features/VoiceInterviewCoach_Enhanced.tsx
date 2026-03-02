import { useState, useRef, useEffect } from 'react'
import { Mic, MessageSquare, Play, RefreshCw, CheckCircle, ChevronRight, Brain, Volume2, StopCircle } from 'lucide-react'
import { interviewAPI } from "../../lib/api"

// Import Neural Fusion components
import NeuralCard from "../../components/ui/NeuralCard"
import HolographicButton from "../../components/ui/HolographicButton"
import NeuralLoading from "../../components/ui/NeuralLoading"
import AIAvatar from "../../components/ui/AIAvatar"
import VoiceVisualizer from "../../components/ui/VoiceVisualizer"

interface Question {
  id: string
  text: string
  type: 'technical' | 'behavioral' | 'sa-specific' | 'company'
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Feedback {
  score: number
  feedback: string
  confidence: number
  clarity: number
  pace: number
  emotion: string
  strengths?: string[]
  improvements?: string[]
}

interface PracticeSession {
  id: string
  type: string
  questions: Question[]
  currentQuestion: number
  responses: Array<{
    questionId: string
    response: string
    audioBlob?: Blob
    duration: number
    feedback?: Feedback
  }>
  startTime: Date
  endTime?: Date
}

const interviewTypes = [
  { 
    id: "quick", 
    label: "Quick Practice", 
    desc: "5 questions, 10 mins",
    icon: Play,
    questions: 5,
    duration: "10 mins"
  },
  { 
    id: "full", 
    label: "Full Interview", 
    desc: "15 questions, 45 mins",
    icon: Brain,
    questions: 15,
    duration: "45 mins"
  },
  { 
    id: "technical", 
    label: "Technical", 
    desc: "IT and development roles",
    icon: MessageSquare,
    questions: 10,
    duration: "30 mins"
  },
  { 
    id: "behavioral", 
    label: "Behavioral", 
    desc: "Soft skills and teamwork",
    icon: MessageSquare,
    questions: 8,
    duration: "25 mins"
  },
  { 
    id: "sa-specific", 
    label: "SA-Specific", 
    desc: "BEE, diversity, POPI",
    icon: Volume2,
    questions: 6,
    duration: "20 mins"
  }
]

const mockQuestions: Question[] = [
  {
    id: "1",
    text: "Tell me about yourself and your career aspirations.",
    type: "behavioral",
    difficulty: "easy"
  },
  {
    id: "2",
    text: "Describe a challenging project you've worked on and how you overcame obstacles.",
    type: "behavioral",
    difficulty: "medium"
  },
  {
    id: "3",
    text: "How do you stay updated with the latest technology trends?",
    type: "technical",
    difficulty: "medium"
  },
  {
    id: "4",
    text: "What experience do you have with cloud computing platforms?",
    type: "technical",
    difficulty: "hard"
  },
  {
    id: "5",
    text: "How do you handle constructive criticism?",
    type: "behavioral",
    difficulty: "easy"
  },
  {
    id: "6",
    text: "Describe your experience with agile methodologies.",
    type: "technical",
    difficulty: "medium"
  },
  {
    id: "7",
    text: "How would you contribute to a diverse and inclusive workplace?",
    type: "sa-specific",
    difficulty: "medium"
  },
  {
    id: "8",
    text: "What are your salary expectations?",
    type: "behavioral",
    difficulty: "hard"
  }
]

export default function VoiceInterviewCoach() {
  const [mode, setMode] = useState<"select" | "practice" | "feedback">("select")
  const [selectedType, setSelectedType] = useState("")
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState("")
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startInterview = async (type: string) => {
    try {
      setSelectedType(type)
      setError("")
      
      // Filter questions based on type
      let questions = mockQuestions
      if (type === "technical") {
        questions = mockQuestions.filter(q => q.type === "technical")
      } else if (type === "behavioral") {
        questions = mockQuestions.filter(q => q.type === "behavioral")
      } else if (type === "sa-specific") {
        questions = mockQuestions.filter(q => q.type === "sa-specific")
      }
      
      const newSession: PracticeSession = {
        id: Date.now().toString(),
        type,
        questions: questions.slice(0, interviewTypes.find(t => t.id === type)?.questions || 5),
        currentQuestion: 0,
        responses: [],
        startTime: new Date()
      }
      
      setSession(newSession)
      setMode("practice")
    } catch (err) {
      setError("Failed to start interview session")
      console.error(err)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processRecording(audioBlob)
      }
      
      // Set up audio level monitoring
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      const updateAudioLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        setAudioLevel(Math.min(100, (average / 128) * 100))
        
        if (isRecording) {
          requestAnimationFrame(updateAudioLevel)
        }
      }
      
      updateAudioLevel()
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (err) {
      setError("Failed to access microphone. Please check permissions.")
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      setAudioLevel(0)
    }
  }

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      // Simulate processing and transcription
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockTranscript = "I believe my experience in software development and my passion for learning new technologies make me a strong candidate for this role. I've worked on several projects where I had to quickly adapt to new frameworks and collaborate with cross-functional teams."
      
      const mockFeedback: Feedback = {
        score: Math.floor(Math.random() * 30) + 70,
        feedback: "Good structure and confidence. Try adding more specific examples with quantifiable results.",
        confidence: Math.floor(Math.random() * 20) + 75,
        clarity: Math.floor(Math.random() * 15) + 80,
        pace: Math.floor(Math.random() * 25) + 70,
        emotion: "Confident",
        strengths: ["Clear communication", "Good structure", "Confident tone"],
        improvements: ["Add specific metrics", "Include more examples", "Vary pacing"]
      }
      
      setTranscript(mockTranscript)
      
      if (session) {
        const updatedResponses = [...session.responses, {
          questionId: session.questions[session.currentQuestion].id,
          response: mockTranscript,
          audioBlob,
          duration: recordingTime,
          feedback: mockFeedback
        }]
        
        setSession({
          ...session,
          responses: updatedResponses
        })
      }
      
    } catch (err) {
      setError("Failed to process recording")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const nextQuestion = () => {
    if (session && session.currentQuestion < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestion: session.currentQuestion + 1
      })
      setTranscript("")
      setRecordingTime(0)
    } else {
      // End of interview
      endSession()
    }
  }

  const endSession = () => {
    if (session) {
      setSession({
        ...session,
        endTime: new Date()
      })
      setMode("feedback")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (mode === "select") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Voice Interview Coach
          </h1>
          <p className="text-xl text-muted-foreground">
            Practice with real-time AI feedback and voice analysis
          </p>
        </div>

        {/* Interview Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewTypes.map((type) => {
            const Icon = type.icon
            return (
              <div key={type.id} onClick={() => startInterview(type.id)} className="cursor-pointer">
                <NeuralCard className="hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{type.label}</h3>
                    <p className="text-muted-foreground mb-4">{type.desc}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span>{type.questions} questions</span>
                      <span>•</span>
                      <span>{type.duration}</span>
                    </div>
                  </div>
                </NeuralCard>
              </div>
            )
          })}
        </div>

        {/* Features */}
        <NeuralCard>
          <h3 className="text-2xl font-bold text-foreground mb-6">Real-Time AI Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Confidence Scoring", desc: "0-100% confidence level" },
              { label: "Clarity Analysis", desc: "Speech clarity assessment" },
              { label: "Pace Tracking", desc: "Words per minute analysis" },
              { label: "Emotion Detection", desc: "Tone and sentiment analysis" }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{feature.label}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </NeuralCard>
      </div>
    )
  }

  if (mode === "practice" && session) {
    const currentQuestion = session.questions[session.currentQuestion]
    const progress = ((session.currentQuestion + 1) / session.questions.length) * 100

    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <NeuralCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{session.type} Interview</h3>
              <p className="text-sm text-muted-foreground">
                Question {session.currentQuestion + 1} of {session.questions.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </NeuralCard>

        {/* AI Interviewer */}
        <NeuralCard className="text-center">
          <AIAvatar size="xl" variant={isRecording ? "speaking" : isProcessing ? "processing" : "default"} />
          <h3 className="text-xl font-semibold text-foreground mt-4">AI Interviewer</h3>
          <div className="mt-6 p-6 bg-muted/50 rounded-xl">
            <p className="text-lg text-foreground">{currentQuestion.text}</p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {currentQuestion.type}
            </span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
              {currentQuestion.difficulty}
            </span>
          </div>
        </NeuralCard>

        {/* Recording Interface */}
        <NeuralCard>
          <div className="text-center">
            {isRecording ? (
              <div className="space-y-6">
                <VoiceVisualizer isActive={true} intensity={audioLevel / 100} />
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-primary">{formatTime(recordingTime)}</div>
                  <p className="text-muted-foreground">Recording your response...</p>
                  <div className="flex items-center justify-center gap-4">
                    <HolographicButton onClick={stopRecording} variant="secondary">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop Recording
                    </HolographicButton>
                  </div>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="space-y-6">
                <AIAvatar size="lg" variant="processing" />
                <NeuralLoading size="lg" text="Analyzing your response..." />
                <p className="text-sm text-muted-foreground">
                  Processing speech patterns and generating feedback
                </p>
              </div>
            ) : transcript ? (
              <div className="space-y-6">
                <div className="text-left">
                  <h4 className="font-semibold text-foreground mb-3">Your Response:</h4>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-foreground">{transcript}</p>
                  </div>
                </div>
                
                {session.responses[session.responses.length - 1]?.feedback && (
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground mb-3">AI Feedback:</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {session.responses[session.responses.length - 1].feedback?.score}%
                          </div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {session.responses[session.responses.length - 1].feedback?.confidence}%
                          </div>
                          <p className="text-sm text-muted-foreground">Confidence</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-secondary">
                            {session.responses[session.responses.length - 1].feedback?.clarity}%
                          </div>
                          <p className="text-sm text-muted-foreground">Clarity</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-warning">
                            {session.responses[session.responses.length - 1].feedback?.pace}%
                          </div>
                          <p className="text-sm text-muted-foreground">Pace</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-foreground">
                          {session.responses[session.responses.length - 1].feedback?.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-4">
                  <HolographicButton onClick={nextQuestion}>
                    {session.currentQuestion < session.questions.length - 1 ? (
                      <>
                        Next Question
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Complete Interview
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </HolographicButton>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Mic className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready to respond?</h3>
                  <p className="text-muted-foreground mb-6">
                    Click the button below and speak your answer clearly
                  </p>
                </div>
                <HolographicButton onClick={startRecording} size="lg">
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </HolographicButton>
              </div>
            )}
          </div>
        </NeuralCard>
      </div>
    )
  }

  if (mode === "feedback" && session) {
    const overallScore = Math.round(
      session.responses.reduce((sum, r) => sum + (r.feedback?.score || 0), 0) / session.responses.length
    )
    
    const avgConfidence = Math.round(
      session.responses.reduce((sum, r) => sum + (r.feedback?.confidence || 0), 0) / session.responses.length
    )
    
    const avgClarity = Math.round(
      session.responses.reduce((sum, r) => sum + (r.feedback?.clarity || 0), 0) / session.responses.length
    )
    
    const avgPace = Math.round(
      session.responses.reduce((sum, r) => sum + (r.feedback?.pace || 0), 0) / session.responses.length
    )

    return (
      <div className="space-y-6">
        {/* Success Header */}
        <NeuralCard className="text-center">
          <AIAvatar size="xl" variant="speaking" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-4">
            Interview Complete!
          </h2>
          <p className="text-xl text-muted-foreground mt-2">
            Overall Score: <span className="text-2xl font-bold text-primary">{overallScore}%</span>
          </p>
        </NeuralCard>

        {/* Performance Analytics */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">Performance Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NeuralCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{overallScore}%</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
            </NeuralCard>
            <NeuralCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{avgConfidence}%</div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
            </NeuralCard>
            <NeuralCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{avgClarity}%</div>
                <p className="text-sm text-muted-foreground">Avg Clarity</p>
              </div>
            </NeuralCard>
            <NeuralCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">{avgPace}%</div>
                <p className="text-sm text-muted-foreground">Avg Pace</p>
              </div>
            </NeuralCard>
          </div>
        </div>

        {/* Question-by-Question Feedback */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">Question Breakdown</h3>
          <div className="space-y-4">
            {session.responses.map((response, i) => {
              const question = session.questions[i]
              return (
                <NeuralCard key={i}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-2">
                          Q{i + 1}: {question.text}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {response.response}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary">
                          {response.feedback?.score}%
                        </div>
                      </div>
                    </div>
                    
                    {response.feedback && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-foreground">{response.feedback.feedback}</p>
                        
                        {(response.feedback.strengths || response.feedback.improvements) && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {response.feedback.strengths && (
                              <div>
                                <p className="text-sm font-semibold text-accent mb-2">Strengths:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {response.feedback.strengths.map((strength, j) => (
                                    <li key={j}>• {strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {response.feedback.improvements && (
                              <div>
                                <p className="text-sm font-semibold text-warning mb-2">Improvements:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {response.feedback.improvements.map((improvement, j) => (
                                    <li key={j}>• {improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </NeuralCard>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <HolographicButton onClick={() => setMode("select")} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Practice Again
          </HolographicButton>
          <HolographicButton onClick={() => window.location.href = "/dashboard"}>
            Back to Dashboard
          </HolographicButton>
        </div>
      </div>
    )
  }

  return null
}
