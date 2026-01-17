import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Sparkles, User, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "../lib/utils";
import { chatAPI } from "../lib/api";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: "Hi! I'm your Digital Economic Twin 🤖 I can help you explore career paths, analyze opportunities, and plan your financial future. What would you like to know?",
    sender: 'ai',
    timestamp: new Date(),
  },
  {
    id: '2',
    text: "You can ask me things like: 'What career paths match my skills?', 'How can I increase my earning potential?', or 'What skills should I learn next?'",
    sender: 'ai',
    timestamp: new Date(Date.now() + 1000),
  },
];

const QUICK_QUESTIONS = [
  "Best career for my skills?",
  "Show income projections",
  "Skills I should learn",
  "Job opportunities near me",
  "Interview tips",
  "Update my twin"
];

export default function DigitalTwinChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // Call the AI service chat endpoint
      const response = await chatAPI.sendMessage(currentInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply || "I'm sorry, I couldn't process your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.message || "I'm having trouble connecting to the AI service. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 group animate-in fade-in zoom-in-95"
      >
        <div className="relative">
          {/* Pulsing ring effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-full opacity-20 animate-pulse" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block">
            <div className="bg-foreground text-background px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm">
              Chat with your Digital Twin
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
          </div>

          {/* Main button */}
          <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
            <Bot className="h-7 w-7 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* Chatbot Container - Fixed size and positioned properly */}
      <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-full max-w-md h-[calc(100vh-6rem)] sm:h-[500px] max-h-[600px] flex flex-col shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Digital Economic Twin</h3>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                AI Assistant • Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Container - Scrollable area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.sender === 'user' 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-primary/20 text-primary'
              )}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className={cn(
                "max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 sm:p-3 shadow-sm",
                message.sender === 'user'
                  ? 'bg-accent text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-bl-none'
              )}>
                <p className={cn(
                  "text-sm",
                  message.sender === 'user' 
                    ? 'text-white' 
                    : 'text-slate-900 dark:text-slate-100'
                )}>{message.text}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-xs",
                  message.sender === 'user' 
                    ? 'text-white/80' 
                    : 'text-gray-500 dark:text-slate-400'
                )}>
                  <Clock className="h-3 w-3" />
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl rounded-bl-none p-3 max-w-[70%]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions - Fixed height */}
        <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {QUICK_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs bg-white dark:bg-slate-700 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-indigo-400 rounded-full border border-gray-300 dark:border-slate-600 transition-colors hover:border-primary/30 dark:hover:border-indigo-500 text-slate-900 dark:text-slate-100 active:scale-95"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask your digital twin anything..."
              className="flex-1 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95",
                isLoading || !inputText.trim()
                  ? "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500 dark:text-slate-400 hidden sm:block">
              Your AI-powered career guide
            </p>
            <div className="flex items-center gap-1 ml-auto">
              <button
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors active:scale-95"
                title="Helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors active:scale-95"
                title="Not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}