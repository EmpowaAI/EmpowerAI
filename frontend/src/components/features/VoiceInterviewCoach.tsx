import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Play, Pause, RotateCcw, TrendingUp, Clock, Award } from 'lucide-react'
import { cn } from "../../lib/utils"
import NeuralCard from "../ui/NeuralCard"
import HolographicButton from "../ui/HolographicButton"
import NeuralLoading from "../ui/NeuralLoading"
import AIAvatar from "../ui/AIAvatar"
import VoiceVisualizer from "../ui/VoiceVisualizer"

interface InterviewQuestion {
  id: number
  question: string
  type: 'behavioral' | 'technical' | 'situational'
  category: string
}

interface FeedbackData {
  confidence: number
  clarity: number
  pace: number
  emotion: string
  suggestions: string[]
}

const interviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    question: "Tell me about yourself and your experience",
    type: 'behavioral',
    category: 'Introduction'
  },
  {
    id: 2,
    question: "Describe a challenging project you've worked on",
    type: 'behavioral',
    category: 'Experience'
  },
  {
    id: 3,
    question: "How do you handle tight deadlines?",
    type: 'situational',
    category: 'Problem Solving'
  },
  {
    id: 4,
    question: "What's your experience with React and modern JavaScript?",
    type: 'technical',
    category: 'Technical Skills'
  },
  {
    id: 5,
    question: "Where do you see yourself in 5 years?",
    type: 'behavioral',
    category: 'Career Goals'
  }
]

export default function VoiceInterviewCoach() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [transcript, setTranscript] = useState('')
  const [answers, setAnswers] = useState<string[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        processAnswer(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setTranscript('')
      setFeedback(null)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const processAnswer = async (audioBlob: Blob) => {
    // Simulate AI processing
    setTimeout(() => {
      const mockTranscript = "I have over 3 years of experience in web development, particularly with React and Node.js. I've worked on several challenging projects where I had to deliver under tight deadlines, and I always make sure to communicate effectively with my team."
      
      setTranscript(mockTranscript)
      setAnswers([...answers, mockTranscript])
      
      setFeedback({
        confidence: 78,
        clarity: 85,
        pace: 72,
        emotion: 'Confident',
        suggestions: [
          "Great structure! Try adding specific metrics to quantify your achievements",
          "Consider mentioning a specific challenging project with measurable outcomes",
          "Your pace is good, but try to vary your tone for more engagement"
        ]
      })
      
      setIsProcessing(false)
    }, 2000)
  }

  const playQuestion = () => {
    setIsPlaying(true)
    // Simulate text-to-speech
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }

  const nextQuestion = () => {
    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTranscript('')
      setFeedback(null)
    }
  }

  const resetInterview = () => {
    setCurrentQuestion(0)
    setTranscript('')
    setFeedback(null)
    setAnswers([])
  }

  const question = interviewQuestions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
            <span>Question {currentQuestion + 1} of {interviewQuestions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / interviewQuestions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%` }}
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
                  <VoiceVisualizer isActive={true} intensity={0.8} />
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
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{feedback.confidence}%</div>
              <p className="text-sm text-muted-foreground">Confidence</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{feedback.clarity}%</div>
              <p className="text-sm text-muted-foreground">Clarity</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{feedback.pace}%</div>
              <p className="text-sm text-muted-foreground">Pace</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="font-semibold text-foreground mb-2">Emotion Detected</h5>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-300">
                {feedback.emotion}
              </span>
            </div>
            
            <div>
              <h5 className="font-semibold text-foreground mb-2">Suggestions for Improvement</h5>
              <ul className="space-y-2">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </NeuralCard>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        {currentQuestion > 0 && (
          <HolographicButton variant="secondary" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
            Previous Question
          </HolographicButton>
        )}
        
        {feedback && currentQuestion < interviewQuestions.length - 1 && (
          <HolographicButton onClick={nextQuestion}>
            Next Question
          </HolographicButton>
        )}
        
        {currentQuestion === interviewQuestions.length - 1 && feedback && (
          <HolographicButton variant="accent" onClick={resetInterview}>
            <RotateCcw className="h-4 w-4" />
            Start New Interview
          </HolographicButton>
        )}
      </div>
    </div>
  )
}
