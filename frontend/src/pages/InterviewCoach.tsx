
import { useState } from "react"
import { Mic, MessageSquare, Play, RefreshCw, CheckCircle, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { interviewAPI } from "../lib/api"

const interviewTypes = [
  { id: "tech", label: "Technical", desc: "IT and development roles" },
  { id: "behavioral", label: "Behavioral", desc: "Soft skills and teamwork" },
  { id: "non-tech", label: "Non-Technical", desc: "General roles" },
]

interface Question {
  id: string
  text: string
}

interface Feedback {
  score: number
  feedback: string
  strengths?: string[]
  improvements?: string[]
}

export default function InterviewCoach() {
  const [mode, setMode] = useState<"select" | "practice" | "feedback">("select")
  const [interviewType, setInterviewType] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<{ questionId: string; response: string; feedback?: Feedback }[]>([])
  const [currentResponse, setCurrentResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const startInterview = async (type: string) => {
    setError("")
    setIsLoading(true)
    try {
      const response = await interviewAPI.start(type, "medium")
      if (response.status === 'success' && response.data?.session) {
        setSessionId(response.data.session.sessionId)
        setQuestions(response.data.session.questions || [])
        setInterviewType(type)
        setMode("practice")
        setCurrentQuestion(0)
        setResponses([])
        setCurrentResponse("")
      }
    } catch (err: any) {
      setError(err.message || "Failed to start interview. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitResponse = async () => {
    if (!currentResponse.trim() || !questions[currentQuestion]) return

    setIsLoading(true)
    try {
      const questionId = questions[currentQuestion].id
      const response = await interviewAPI.answer(sessionId, questionId, currentResponse)
      
      if (response.status === 'success' && response.data?.feedback) {
        setResponses([...responses, {
          questionId,
          response: currentResponse,
          feedback: response.data.feedback
        }])
        setCurrentResponse("")
        
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
        } else {
          setMode("feedback")
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit answer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const restart = () => {
    setMode("select")
    setInterviewType("")
    setSessionId("")
    setQuestions([])
    setCurrentQuestion(0)
    setResponses([])
    setCurrentResponse("")
    setError("")
  }

  const normalizeScore = (score: number | undefined): number => {
    if (typeof score !== "number" || Number.isNaN(score)) return 0
    let s = score
    if (s > 1 && s <= 10) s = s / 10
    if (s > 10 && s <= 100) s = s / 100
    if (s < 0) s = 0
    if (s > 1) s = 1
    return s
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 -mx-3 sm:mx-0">
      {/* Header */}
      <div className="px-3 sm:px-0">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">Interview Coach</h1>
        <p className="text-base sm:text-base text-muted-foreground mt-1 sm:mt-0">Practice interviews and build your confidence</p>
      </div>

      {error && (
        <div className="mx-3 sm:mx-0 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {mode === "select" && (
        /* Interview Type Selection */
        <div className="space-y-5 sm:space-y-6 px-3 sm:px-0">
          <h2 className="text-lg sm:text-lg md:text-xl font-semibold text-foreground">Select Interview Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => startInterview(type.id)}
                disabled={isLoading}
                className="bg-card border border-border rounded-xl sm:rounded-xl p-5 sm:p-6 text-left hover:border-primary/50 transition-colors group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[140px] sm:min-h-[160px] touch-manipulation"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base sm:text-base text-foreground mb-2">{type.label}</h3>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
                <div className="flex items-center gap-1 text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Start <ChevronRight className="h-4 w-4" /></>}
                </div>
              </button>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-card border border-border rounded-xl sm:rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-base sm:text-base text-foreground mb-4">Interview Tips</h3>
            <ul className="space-y-3 text-sm sm:text-sm text-muted-foreground">
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
            <p className="text-xl font-medium text-foreground text-center mb-8">
              {questions[currentQuestion]?.text || "Loading question..."}
            </p>
            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-40 sm:h-32 md:h-40 px-4 py-3.5 sm:py-3 bg-background border border-border rounded-lg text-base sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {currentQuestion < questions.length - 1 ? "Next Question" : "Finish"} <Play className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {mode === "feedback" && (
        /* Feedback Mode */
        <div className="space-y-6">
          {/* Overall Score */}
          {responses.length > 0 && (() => {
            const normalizedScores = responses.map(r => normalizeScore(r.feedback?.score))
            const avgScore = normalizedScores.reduce((sum, s) => sum + s, 0) / Math.max(normalizedScores.length, 1)
            const score10 = (avgScore * 10).toFixed(1)
            return (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Overall Performance</p>
              <p className="text-5xl font-bold text-foreground mb-2">
                {score10}
                <span className="text-2xl">/10</span>
              </p>
            </div>
            )
          })()}

          {/* Question-by-Question Feedback */}
          <div className="space-y-4">
            {responses.map((response, index) => {
              const question = questions.find(q => q.id === response.questionId)
              const score10 = (normalizeScore(response.feedback?.score) * 10).toFixed(1)
              return (
                <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Question {index + 1}</h3>
                    {response.feedback && (
                      <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm font-medium">
                        Score: {score10}/10
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{question?.text || "Question"}</p>
                  <div className="bg-background border border-border rounded-lg p-4 mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                    <p className="text-foreground">{response.response}</p>
                  </div>
                  {response.feedback && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Feedback:</p>
                      <p className="text-muted-foreground">{response.feedback.feedback}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {/* Score */}
          {responses.length > 0 && (() => {
            const normalizedScores = responses.map(r => normalizeScore(r.feedback?.score))
            const avgScore = normalizedScores.reduce((sum, s) => sum + s, 0) / Math.max(normalizedScores.length, 1)
            const score100 = Math.round(avgScore * 100)
            const label = score100 >= 85 ? "Excellent Performance!" : score100 >= 70 ? "Good Performance" : score100 >= 55 ? "Fair Performance" : "Needs Improvement"
            return (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                <p className="text-5xl font-bold text-foreground mb-2">
                  {score100}<span className="text-2xl">/100</span>
                </p>
                <p className="text-secondary font-medium">{label}</p>
              </div>
            )
          })()}

          {/* Detailed Feedback */}
          <div className="grid md:grid-cols-2 gap-6">
            {(() => {
              const strengths = Array.from(
                new Set(
                  responses.flatMap(r => r.feedback?.strengths || [])
                )
              )
              const improvements = Array.from(
                new Set(
                  responses.flatMap(r => r.feedback?.improvements || [])
                )
              )
              const strengthsList = strengths.length > 0 ? strengths : ["Clear effort", "Good structure"]
              const improvementsList = improvements.length > 0 ? improvements : ["Add more specific examples", "Quantify outcomes"]
              return (
                <>
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4">Strengths</h3>
                    <ul className="space-y-2">
                      {strengthsList.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-accent" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4">Areas to Improve</h3>
                    <ul className="space-y-2">
                      {improvementsList.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <ChevronRight className="h-4 w-4 text-warning" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )
            })()}
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
