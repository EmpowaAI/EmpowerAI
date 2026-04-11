import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Play, Pause, RotateCcw, TrendingUp, Clock, Award, Loader2, AlertCircle } from 'lucide-react'
import { cn } from "../../lib/utils"
import NeuralCard from "../../components/ui/NeuralCard"
import HolographicButton from "../../components/ui/HolographicButton"
import NeuralLoading from "../../components/ui/NeuralLoading"
import AIAvatar from "../../components/ui/AIAvatar"
import VoiceVisualizer from "../../components/ui/VoiceVisualizer"
import { interviewService } from '../../services/interviewService'
import { useToast } from '../../components/Toast'
import { getStoredCvAnalysis } from '../../lib/sensitiveStorage'
import { useAudioLevel } from '../../hooks/useAudioLevel'

interface InterviewQuestion {
  id: number
  question: string
  type: 'behavioral' | 'technical' | 'situational'
  category: string
}

interface FeedbackData {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export default function VoiceInterviewCoach() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [transcript, setTranscript] = useState('')
  const [answers, setAnswers] = useState<string[]>([])
  const { showToast, ToastComponent } = useToast()
  
  // Use Web Speech API for real-time transcription
  const recognitionRef = useRef<any>(null)
  const transcriptRef = useRef('')
  const interimRef = useRef('')
  const { volume: micVolume, isLowVolume } = useAudioLevel(isRecording)

  // Load dynamic questions from backend on mount
  useEffect(() => {
    const startSession = async () => {
      try {
        setIsStarting(true);
        const cvData = getStoredCvAnalysis<any>() || undefined;

        const session = await interviewService.startInterview(
          'behavioral', 
          'medium', 
          undefined, 
          cvData
        );

        if (session && session.questions) {
          setQuestions(session.questions as any);
          setSessionId(session.sessionId);
          setSessionStarted(true);
        }
      } catch (error) {
        showToast("Failed to connect to AI Coach. Is the service running?", "error");
      } finally {
        setIsStarting(false);
      }
    };
    startSession();
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-ZA' // Tailored for SA accents

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) finalTranscript += transcriptPart
          else interimTranscript += transcriptPart
        }
        interimRef.current = interimTranscript
        if (finalTranscript) {
          transcriptRef.current = (transcriptRef.current + ' ' + finalTranscript).trim().replace(/\s+/g, ' ')
          setTranscript(transcriptRef.current)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
        showToast(`Voice error: ${event.error}`, 'error')
      }

      recognitionRef.current = recognition
    }
  }, [])

  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        showToast("Speech recognition not supported in this browser.", "error")
        return
      }

      setTranscript('')
      transcriptRef.current = ''
      setFeedback(null)
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      // Small delay to allow the last onresult event to fire
      setTimeout(() => processAnswer(), 200)
    }
  }

  const processAnswer = async () => {
    const finalResponse = transcriptRef.current.trim() || interimRef.current.trim() || transcript.trim()
    if (!finalResponse.trim()) return
    
    setIsProcessing(true)
    try {
      const cvData = getStoredCvAnalysis<any>() || undefined;

      const feedbackData = await interviewService.submitAnswer(
        sessionId!,
        questions[currentQuestionIdx].id.toString(),
        finalResponse,
        cvData
      );

      if (feedbackData) {
        const normalizedFeedback = { ...feedbackData };
        if (normalizedFeedback.score <= 1) normalizedFeedback.score *= 100;
        
        // Ensure UI shows what was actually analyzed
        setTranscript(finalResponse);
        setFeedback(normalizedFeedback)
        setAnswers(prev => [...prev, finalResponse])
      } else {
        showToast("Failed to analyze response. Try again.", "error")
      }
    } catch (error) {
      showToast("AI Service timeout. Retrying in background...", "warning")
    } finally {
      setIsProcessing(false)
    }
  }

  const playQuestion = () => {
    if (!('speechSynthesis' in window) || !questions[currentQuestionIdx]) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIdx].question);
    utterance.lang = 'en-ZA';
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1)
      setTranscript('')
      transcriptRef.current = ''
      interimRef.current = ''
      setFeedback(null)
    }
  }

  const resetInterview = () => {
    setCurrentQuestionIdx(0)
    setTranscript('')
    transcriptRef.current = ''
    interimRef.current = ''
    setFeedback(null)
    setAnswers([])
  }

  if (isStarting) {
    return <div className="min-h-[60vh] flex items-center justify-center"><NeuralLoading size="lg" text="AI is tailoring your interview..." /></div>
  }

  const question = questions[currentQuestionIdx]
  if (!question) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <ToastComponent />
      {/* Header */}
      <NeuralCard className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <AIAvatar size="lg" variant={isRecording ? 'speaking' : isProcessing ? 'processing' : 'default'} />
          <div>
            <h2 className="text-3xl font-bold text-foreground">Voice Interview Coach</h2>
            <p className="text-muted-foreground">Practice with real-time AI feedback</p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
            <span>{questions.length > 0 ? Math.round(((currentQuestionIdx + 1) / questions.length) * 100) : 0}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${questions.length > 0 ? ((currentQuestionIdx + 1) / questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </NeuralCard>

      {/* Question */}
      <NeuralCard>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                {question.category}
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                {question.type}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {question.question}
            </h3>
          </div>
          <HolographicButton variant="secondary" size="sm" onClick={playQuestion} disabled={isPlaying}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Playing...' : 'Play Question'}
          </HolographicButton>
        </div>

        {/* Voice Interface */}
        <div className="text-center py-8">
          {isProcessing ? (
            <div className="space-y-4">
              <NeuralLoading size="lg" text="AI is analyzing your answer..." />
              <p className="text-sm text-muted-foreground">Processing speech patterns and content...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <HolographicButton
                  variant={isRecording ? 'accent' : 'primary'}
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="min-w-[200px]"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-6 w-6" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-6 w-6" />
                      Start Answering
                    </>
                  )}
                </HolographicButton>
              </div>
              
              {isRecording && (
                <div className="space-y-4">
                  <VoiceVisualizer isActive={true} volume={micVolume} />
                  <AnimatePresence>
                    {isLowVolume && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-amber-400 flex items-center justify-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Speak a bit louder, the AI is having trouble hearing you
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Recording... Speak clearly and naturally
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </NeuralCard>

      {/* Transcript */}
      {transcript && (
        <NeuralCard>
          <h4 className="text-lg font-semibold text-foreground mb-3">Your Answer</h4>
          <p className="text-muted-foreground italic">"{transcript}"</p>
        </NeuralCard>
      )}

      {/* AI Feedback */}
      {feedback && (
        <NeuralCard>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            AI Feedback
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-3 text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className={cn(
                "text-5xl font-bold mb-1",
                feedback.score >= 70 ? "text-green-400" : feedback.score >= 50 ? "text-amber-400" : "text-red-400"
              )}>
                {Math.round(feedback.score)}%
              </div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Overall Score</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="font-semibold text-foreground mb-2">AI Summary</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">{feedback.feedback}</p>
            </div>
            
            <div>
              <h5 className="font-semibold text-foreground mb-2">Strengths</h5>
              <ul className="space-y-2">
                {feedback.strengths.filter(s => s).map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-2">Improvements</h5>
              <ul className="space-y-2">
                {feedback.improvements.filter(s => s).map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </NeuralCard>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        {currentQuestionIdx > 0 && (
          <HolographicButton variant="secondary" onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}>
            Previous Question
          </HolographicButton>
        )}
        
        {feedback && currentQuestionIdx < questions.length - 1 && (
          <HolographicButton onClick={nextQuestion}>
            Next Question
          </HolographicButton>
        )}
        
        {currentQuestionIdx === questions.length - 1 && feedback && (
          <HolographicButton variant="accent" onClick={resetInterview}>
            <RotateCcw className="h-4 w-4" />
            Start New Interview
          </HolographicButton>
        )}
      </div>
    </div>
  )
}
