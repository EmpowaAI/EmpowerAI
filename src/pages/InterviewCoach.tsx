"use client"

import { useState } from "react"
import { Mic, MessageSquare, Play, RefreshCw, CheckCircle, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"

const interviewTypes = [
  { id: "technical", label: "Technical", desc: "IT and development roles" },
  { id: "behavioral", label: "Behavioral", desc: "Soft skills and teamwork" },
  { id: "sa-specific", label: "SA-Specific", desc: "Local company scenarios" },
]

const questions = [
  "Tell me about yourself and why you're interested in this role.",
  "Describe a challenging situation you faced and how you handled it.",
  "What are your greatest strengths and weaknesses?",
  "Where do you see yourself in 5 years?",
  "Why should we hire you over other candidates?",
]

export default function InterviewCoach() {
  const [mode, setMode] = useState<"select" | "practice" | "feedback">("select")
  const [interviewType, setInterviewType] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<string[]>([])
  const [currentResponse, setCurrentResponse] = useState("")

  const startInterview = (type: string) => {
    setInterviewType(type)
    setMode("practice")
    setCurrentQuestion(0)
    setResponses([])
  }

  const submitResponse = () => {
    setResponses([...responses, currentResponse])
    setCurrentResponse("")
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setMode("feedback")
    }
  }

  const restart = () => {
    setMode("select")
    setInterviewType("")
    setCurrentQuestion(0)
    setResponses([])
    setCurrentResponse("")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Interview Coach</h1>
        <p className="text-muted-foreground">Practice interviews and build your confidence</p>
      </div>

      {mode === "select" && (
        /* Interview Type Selection */
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Select Interview Type</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => startInterview(type.id)}
                className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-colors group shadow-sm"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{type.label}</h3>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
                <div className="flex items-center gap-1 text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Interview Tips</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                Use the STAR method: Situation, Task, Action, Result
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                Keep responses concise (1-2 minutes per question)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                Practice speaking clearly and maintaining eye contact
              </li>
            </ul>
          </div>
        </div>
      )}

      {mode === "practice" && (
        /* Practice Mode */
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress - Updated progress bar colors */}
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  i < currentQuestion ? "bg-accent" : i === currentQuestion ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Question {currentQuestion + 1} of {questions.length}
          </p>

          {/* Question Card */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl font-medium text-foreground text-center mb-8">{questions[currentQuestion]}</p>
            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={restart}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitResponse}
              disabled={!currentResponse.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "Finish"} <Play className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {mode === "feedback" && (
        /* Feedback Mode - Updated gradient colors */
        <div className="space-y-6">
          {/* Score */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Score</p>
            <p className="text-5xl font-bold text-foreground mb-2">
              85<span className="text-2xl">/100</span>
            </p>
            <p className="text-secondary font-medium">Excellent Performance!</p>
          </div>

          {/* Detailed Feedback */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Strengths</h3>
              <ul className="space-y-2">
                {["Clear communication", "Good use of examples", "Confident delivery", "Well-structured answers"].map(
                  (item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-accent" /> {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Areas to Improve</h3>
              <ul className="space-y-2">
                {["Be more concise", "Add more specific metrics", "Practice STAR method"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <ChevronRight className="h-4 w-4 text-warning" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={restart}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
