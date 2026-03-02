import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Brain, Lightbulb, Target, TrendingUp, Heart } from 'lucide-react'
import { cn } from "../../lib/utils"

// Import Neural Fusion components
import NeuralCard from "../../components/ui/NeuralCard"
import HolographicButton from "../../components/ui/HolographicButton"
import NeuralLoading from "../../components/ui/NeuralLoading"
import AIAvatar from "../../components/ui/AIAvatar"

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  category?: 'career' | 'job-search' | 'cv-help' | 'interview' | 'salary' | 'sa-specific' | 'emotional'
}

interface AIMentorContext {
  userProfile: {
    name: string
    skills: string[]
    experience: string
    goals: string
    location: string
  }
  conversationHistory: Message[]
  lastTopics: string[]
  sessionStart: Date
}

const quickQuestions = [
  { 
    icon: Target, 
    text: "What career path should I follow?", 
    category: "career" as const,
    response: "Based on your profile, I recommend exploring software development roles. Your skills in React and Node.js align well with the current market demand in South Africa."
  },
  { 
    icon: TrendingUp, 
    text: "Where should I apply for jobs?", 
    category: "job-search" as const,
    response: "Gauteng offers the most opportunities, but don't overlook remote positions with Cape Town companies. Focus on fintech and e-commerce sectors."
  },
  { 
    icon: Brain, 
    text: "Review my CV experience section", 
    category: "cv-help" as const,
    response: "I'd be happy to review your CV! Make sure to quantify your achievements with specific metrics and results."
  },
  { 
    icon: MessageCircle, 
    text: "Common interview questions?", 
    category: "interview" as const,
    response: "Technical interviews often cover problem-solving, system design, and behavioral questions using the STAR method."
  },
  { 
    icon: Lightbulb, 
    text: "How to negotiate salary?", 
    category: "salary" as const,
    response: "Research market rates for your role, highlight your value, and be prepared to discuss specific achievements that justify your request."
  },
  { 
    icon: Heart, 
    text: "Feeling discouraged", 
    category: "emotional" as const,
    response: "Job searching is challenging, but you're not alone. Every rejection is a step closer to the right opportunity. Let's work on your strategy together."
  }
]

const contextualSuggestions = [
  "Tell me about your experience",
  "What skills are you developing?",
  "How's your job search going?",
  "Need interview preparation?",
  "Want to improve your CV?",
  "Discuss salary expectations?"
]

export default function AIMentor247() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI career mentor, available 24/7 to help you navigate your professional journey. I can assist with career planning, job searches, CV reviews, interview preparation, salary negotiations, and provide emotional support. What would you like to discuss today?",
      timestamp: new Date(),
      category: 'career'
    }
  ])
  
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [context, setContext] = useState<AIMentorContext>({
    userProfile: {
      name: "User",
      skills: ["React", "Node.js", "TypeScript"],
      experience: "2 years",
      goals: "Senior Developer",
      location: "Johannesburg"
    },
    conversationHistory: [],
    lastTopics: [],
    sessionStart: new Date()
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const lowerMessage = userMessage.toLowerCase()
    
    // Context-aware responses
    if (lowerMessage.includes("salary") || lowerMessage.includes("negotiate")) {
      return "For salary negotiation in South Africa, research shows that candidates who negotiate earn 7-13% more on average. Start by researching market rates on Pnet and Careers24. Highlight specific achievements and be prepared to discuss how you'll add value. A good opening is 'Based on my research and the value I bring, I'm targeting a salary in the range of X-Y.'"
    }
    
    if (lowerMessage.includes("cv") || lowerMessage.includes("resume")) {
      return "For your CV, focus on quantifiable achievements. Instead of 'Improved performance', say 'Increased user engagement by 35% through UX optimizations'. Include keywords from job descriptions, keep it to 2 pages max, and ensure it's ATS-friendly. Would you like me to review a specific section?"
    }
    
    if (lowerMessage.includes("interview")) {
      return "Interview success comes from preparation. Research the company, prepare STAR method examples, and have thoughtful questions for them. Practice common questions: 'Tell me about yourself', 'Why this company?', 'Describe a challenge you overcame'. Remember, interviews are two-way conversations - you're evaluating them too!"
    }
    
    if (lowerMessage.includes("job") || lowerMessage.includes("apply")) {
      return "The SA job market is competitive but opportunities exist. Focus on growing sectors: fintech, e-commerce, renewable energy, and healthtech. Tailor each application, network on LinkedIn, and consider both corporate and startup environments. What specific roles are you targeting?"
    }
    
    if (lowerMessage.includes("discouraged") || lowerMessage.includes("rejected")) {
      return "I understand how discouraging rejections feel. Remember that even top developers face multiple rejections. Each 'no' is feedback, not failure. Use this time to upskill, refine your approach, and remember that the right opportunity is looking for someone exactly like you. You've got this!"
    }
    
    if (lowerMessage.includes("skills") || lowerMessage.includes("learn")) {
      return "Based on SA market trends, focus on cloud computing (AWS/Azure), data science, cybersecurity, and AI/ML. Soft skills like communication and problem-solving are equally valuable. Consider certifications from Google, Microsoft, or local bootcamps. What's your current skill set?"
    }
    
    // Default contextual response
    return `I understand you're asking about ${userMessage}. Let me help you with that. Based on your profile and goals, I suggest focusing on practical steps you can take immediately. Could you provide more details about your specific situation so I can give you more personalized advice?`
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Generate AI response
    const aiResponse = await generateAIResponse(content)
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date(),
      category: 'career'
    }

    setMessages(prev => [...prev, aiMessage])
    setIsTyping(false)

    // Update context
    setContext(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, userMessage, aiMessage],
      lastTopics: [content, ...prev.lastTopics.slice(0, 4)]
    }))
  }

  const handleQuickQuestion = (question: typeof quickQuestions[0]) => {
    sendMessage(question.text)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'career': return Target
      case 'job-search': return TrendingUp
      case 'cv-help': return Brain
      case 'interview': return MessageCircle
      case 'salary': return Lightbulb
      case 'emotional': return Heart
      default: return Bot
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'career': return 'text-blue-400'
      case 'job-search': return 'text-green-400'
      case 'cv-help': return 'text-purple-400'
      case 'interview': return 'text-yellow-400'
      case 'salary': return 'text-pink-400'
      case 'emotional': return 'text-red-400'
      default: return 'text-primary'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <NeuralCard className="mb-4">
        <div className="flex items-center gap-4">
          <AIAvatar size="lg" variant="speaking" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">AI Career Mentor</h2>
            <p className="text-sm text-muted-foreground">
              24/7 Personalized Guidance • Context-Aware • Always Available
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Session Time</div>
            <div className="text-lg font-bold text-primary">
              {Math.floor((Date.now() - context.sessionStart.getTime()) / 60000)}m
            </div>
          </div>
        </div>
      </NeuralCard>

      {/* Quick Questions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {quickQuestions.map((question, i) => {
          const Icon = question.icon
          return (
            <HolographicButton
              key={i}
              onClick={() => handleQuickQuestion(question)}
              variant="secondary"
              className="text-sm p-3 h-auto"
            >
              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{question.text}</span>
            </HolographicButton>
          )
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => {
          const Icon = message.type === 'ai' ? Bot : User
          const CategoryIcon = getCategoryIcon(message.category)
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.type === 'ai' && (
                <AIAvatar size="md" variant="speaking" />
              )}
              
              <div className={cn(
                "max-w-[70%] space-y-2",
                message.type === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block p-4 rounded-xl",
                  message.type === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                
                {message.category && message.type === 'ai' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CategoryIcon className={cn("h-3 w-3", getCategoryColor(message.category))} />
                    <span>{message.category}</span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          )
        })}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <AIAvatar size="md" variant="thinking" />
            <NeuralCard className="p-4">
              <div className="flex items-center gap-2">
                <NeuralLoading size="sm" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </NeuralCard>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Suggestions */}
      {!isTyping && messages.length > 1 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {contextualSuggestions.slice(0, 3).map((suggestion, i) => (
              <HolographicButton
                key={i}
                onClick={() => setInputValue(suggestion)}
                variant="secondary"
                className="text-xs p-2 h-auto"
              >
                {suggestion}
              </HolographicButton>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <NeuralCard>
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your career..."
            className="flex-1 resize-none bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[50px] max-h-[120px]"
            rows={1}
          />
          <HolographicButton
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="lg"
          >
            <Send className="h-4 w-4" />
          </HolographicButton>
        </div>
        
        {/* Session Stats */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Messages: {messages.length}</span>
          <span>Topics discussed: {context.lastTopics.length}</span>
          <span>AI responses: {messages.filter(m => m.type === 'ai').length}</span>
        </div>
      </NeuralCard>
    </div>
  )
}
