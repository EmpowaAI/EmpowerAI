import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, MessageSquare, RefreshCw, Loader2, BarChart3,
  Clock, Sparkles, Zap, Volume2, Send, Trophy, ChevronRight,
  Award, AlertCircle, CheckCircle, VolumeX, Mic, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TipsPanel } from '@/components/interview/TipsPanel';
import GlassCard from '@/components/GlassCard';

type InterviewType = 'tech' | 'behavioral' | 'non-tech';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
}

interface Feedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer?: string;
}

// Mock questions bank
const questionBank: Record<InterviewType, Record<Difficulty, Question[]>> = {
  behavioral: {
    easy: [
      { id: 'b1', text: 'Tell me about yourself and why you are interested in this role.', type: 'behavioral', difficulty: 'easy' },
      { id: 'b2', text: 'Describe a time when you worked well as part of a team.', type: 'behavioral', difficulty: 'easy' },
      { id: 'b3', text: 'What is your greatest professional strength?', type: 'behavioral', difficulty: 'easy' },
      { id: 'b4', text: 'Where do you see yourself in five years?', type: 'behavioral', difficulty: 'easy' },
      { id: 'b5', text: 'Why should we hire you for this position?', type: 'behavioral', difficulty: 'easy' },
    ],
    medium: [
      { id: 'b6', text: 'Tell me about a time you had to deal with a difficult coworker. How did you handle it?', type: 'behavioral', difficulty: 'medium' },
      { id: 'b7', text: 'Describe a situation where you had to meet a tight deadline. What was the outcome?', type: 'behavioral', difficulty: 'medium' },
      { id: 'b8', text: 'Give an example of a time you took initiative on a project.', type: 'behavioral', difficulty: 'medium' },
      { id: 'b9', text: 'Tell me about a time you failed. What did you learn from it?', type: 'behavioral', difficulty: 'medium' },
      { id: 'b10', text: 'How do you handle constructive criticism from a manager?', type: 'behavioral', difficulty: 'medium' },
    ],
    hard: [
      { id: 'b11', text: 'Describe a time when you had to make a decision with incomplete information. What was the result?', type: 'behavioral', difficulty: 'hard' },
      { id: 'b12', text: 'Tell me about a time you had to influence stakeholders who disagreed with your approach.', type: 'behavioral', difficulty: 'hard' },
      { id: 'b13', text: 'Give an example of a complex project you led. How did you manage competing priorities?', type: 'behavioral', difficulty: 'hard' },
      { id: 'b14', text: 'Describe a situation where you had to adapt your leadership style. Why and how?', type: 'behavioral', difficulty: 'hard' },
      { id: 'b15', text: 'Tell me about a time you had to deliver bad news to a client or stakeholder.', type: 'behavioral', difficulty: 'hard' },
    ],
  },
  tech: {
    easy: [
      { id: 't1', text: 'What programming languages are you most comfortable with and why?', type: 'tech', difficulty: 'easy' },
      { id: 't2', text: 'Explain the difference between a stack and a queue.', type: 'tech', difficulty: 'easy' },
      { id: 't3', text: 'What is version control and why is it important?', type: 'tech', difficulty: 'easy' },
      { id: 't4', text: 'Describe your experience with databases. SQL vs NoSQL?', type: 'tech', difficulty: 'easy' },
      { id: 't5', text: 'What is RESTful API design? Give a brief overview.', type: 'tech', difficulty: 'easy' },
    ],
    medium: [
      { id: 't6', text: 'Explain the concept of microservices architecture and its trade-offs.', type: 'tech', difficulty: 'medium' },
      { id: 't7', text: 'How would you design a rate limiter for an API?', type: 'tech', difficulty: 'medium' },
      { id: 't8', text: 'Describe how you would optimize a slow database query.', type: 'tech', difficulty: 'medium' },
      { id: 't9', text: 'Explain the CAP theorem and its implications for distributed systems.', type: 'tech', difficulty: 'medium' },
      { id: 't10', text: 'How do you ensure code quality in a team environment?', type: 'tech', difficulty: 'medium' },
    ],
    hard: [
      { id: 't11', text: 'Design a real-time notification system that scales to millions of users.', type: 'tech', difficulty: 'hard' },
      { id: 't12', text: 'How would you design a distributed cache with consistency guarantees?', type: 'tech', difficulty: 'hard' },
      { id: 't13', text: 'Explain how you would architect a system for processing 1M events per second.', type: 'tech', difficulty: 'hard' },
      { id: 't14', text: 'Design a URL shortener that handles billions of URLs. Discuss trade-offs.', type: 'tech', difficulty: 'hard' },
      { id: 't15', text: 'How would you migrate a monolithic application to microservices without downtime?', type: 'tech', difficulty: 'hard' },
    ],
  },
  'non-tech': {
    easy: [
      { id: 'n1', text: 'What motivates you in your career?', type: 'general', difficulty: 'easy' },
      { id: 'n2', text: 'How do you stay organized and manage your time?', type: 'general', difficulty: 'easy' },
      { id: 'n3', text: 'Describe your ideal work environment.', type: 'general', difficulty: 'easy' },
      { id: 'n4', text: 'What do you know about our company?', type: 'general', difficulty: 'easy' },
      { id: 'n5', text: 'How do you handle stress and pressure at work?', type: 'general', difficulty: 'easy' },
    ],
    medium: [
      { id: 'n6', text: 'How do you prioritize when you have multiple urgent tasks?', type: 'general', difficulty: 'medium' },
      { id: 'n7', text: 'Describe your approach to problem-solving.', type: 'general', difficulty: 'medium' },
      { id: 'n8', text: 'How do you build relationships with new colleagues?', type: 'general', difficulty: 'medium' },
      { id: 'n9', text: 'What is your approach to continuous learning and development?', type: 'general', difficulty: 'medium' },
      { id: 'n10', text: 'How do you handle disagreements with your manager?', type: 'general', difficulty: 'medium' },
    ],
    hard: [
      { id: 'n11', text: 'How would you handle a situation where company values conflict with a client request?', type: 'general', difficulty: 'hard' },
      { id: 'n12', text: 'Describe how you would turn around an underperforming team.', type: 'general', difficulty: 'hard' },
      { id: 'n13', text: 'How do you make decisions when there is no clear right answer?', type: 'general', difficulty: 'hard' },
      { id: 'n14', text: 'Tell me about a time you had to champion an unpopular decision.', type: 'general', difficulty: 'hard' },
      { id: 'n15', text: 'How would you manage a project with a 50% budget cut mid-way?', type: 'general', difficulty: 'hard' },
    ],
  },
};

// Simple local scoring
function scoreAnswer(answer: string, question: Question): Feedback {
  const wordCount = answer.trim().split(/\s+/).length;
  let score = 40;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 50) { score += 15; strengths.push('Good level of detail in your response'); }
  else if (wordCount >= 30) { score += 8; }
  else { improvements.push('Try to provide more detail — aim for 50+ words'); }

  if (answer.toLowerCase().includes('example') || answer.toLowerCase().includes('instance') || answer.toLowerCase().includes('situation')) {
    score += 10; strengths.push('Used specific examples to illustrate your point');
  } else { improvements.push('Include specific examples from your experience'); }

  if (answer.toLowerCase().includes('result') || answer.toLowerCase().includes('outcome') || answer.toLowerCase().includes('achieved')) {
    score += 10; strengths.push('Mentioned concrete results or outcomes');
  } else { improvements.push('Quantify results and mention specific outcomes'); }

  if (answer.toLowerCase().includes('team') || answer.toLowerCase().includes('collaborate') || answer.toLowerCase().includes('together')) {
    score += 5; strengths.push('Demonstrated teamwork and collaboration');
  }

  if (answer.toLowerCase().includes('learn') || answer.toLowerCase().includes('grew') || answer.toLowerCase().includes('improve')) {
    score += 5; strengths.push('Showed growth mindset and self-awareness');
  } else { improvements.push('Show what you learned from the experience'); }

  if (wordCount >= 80) { score += 5; }

  score = Math.min(score, 95);
  if (strengths.length === 0) strengths.push('You attempted the question — keep practicing!');
  if (improvements.length === 0) improvements.push('Consider adding even more specific metrics');

  return {
    score,
    feedback: score >= 70
      ? 'Strong answer! You demonstrated good structure and relevant experience.'
      : score >= 50
      ? 'Decent answer, but could use more specific examples and detail.'
      : 'Your answer needs more depth. Use the STAR method for better structure.',
    strengths,
    improvements,
    suggestedAnswer: `A strong answer would use the STAR method: describe the Situation, explain the Task, detail your Actions, and quantify the Result. For "${question.text.slice(0, 60)}...", reference specific projects or experiences from your career.`
  };
}

// Speech recognition types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (event: Event) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export default function InterviewCoach() {
  // Setup state
  const [selectedType, setSelectedType] = useState<InterviewType>('behavioral');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Session state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [feedbacks, setFeedbacks] = useState<Map<string, Feedback>>(new Map());
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userInput, setUserInput] = useState('');

  // Voice
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + (feedbacks.has(currentQuestion?.id) ? 1 : 0)) / totalQuestions) * 100 : 0;
  const averageScore = feedbacks.size > 0 ? Array.from(feedbacks.values()).reduce((a, f) => a + f.score, 0) / feedbacks.size : 0;
  const sessionComplete = feedbacks.size === totalQuestions && totalQuestions > 0;

  // Speech recognition setup
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setRecognitionSupported(false); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + ' '; else interim += t;
      }
      setUserInput(prev => prev + final);
      setInterimTranscript(interim);
    };
    recognitionRef.current = recognition;
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setInterimTranscript(''); try { recognitionRef.current?.start(); } catch {} }
  };

  const speak = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (currentQuestion && sessionStarted && !showResults && audioEnabled) {
      speak(`Question ${currentIndex + 1} of ${totalQuestions}. ${currentQuestion.text}`);
    }
  }, [currentIndex, sessionStarted]);

  const handleStart = () => {
    const bank = questionBank[selectedType][selectedDifficulty];
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers(new Map());
    setFeedbacks(new Map());
    setSessionStarted(true);
    setShowResults(false);
    setUserInput('');
  };

  const handleSubmit = () => {
    if (!currentQuestion || !userInput.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const feedback = scoreAnswer(userInput, currentQuestion);
      setAnswers(prev => new Map(prev).set(currentQuestion.id, userInput));
      setFeedbacks(prev => new Map(prev).set(currentQuestion.id, feedback));
      setUserInput('');
      setIsSubmitting(false);
      if (currentIndex < totalQuestions - 1) setCurrentIndex(prev => prev + 1);
    }, 1500);
  };

  const reset = () => {
    setSessionStarted(false);
    setShowResults(false);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers(new Map());
    setFeedbacks(new Map());
    setUserInput('');
    setAudioEnabled(true);
    window.speechSynthesis?.cancel();
  };

  const wordCount = userInput.trim() ? userInput.trim().split(/\s+/).length : 0;

  // Results view
  if (showResults && feedbacks.size > 0) {
    const passed = averageScore >= 70;
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={() => setShowResults(false)} className="text-muted-foreground hover:text-foreground text-sm mb-2 flex items-center gap-1 transition-colors">
              ← Back to Questions
            </button>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-sa-gold" />
              <span className="bg-gradient-to-r from-sa-gold to-sa-terracotta bg-clip-text text-transparent">Interview Summary</span>
            </h1>
          </div>
          <button onClick={reset} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg">
            <RefreshCw className="h-4 w-4" /> Start New
          </button>
        </div>

        {/* Global Score */}
        <GlassCard glow="gold" className="text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy className="h-32 w-32 text-sa-gold" /></div>
          <div className="relative z-10">
            <div className="text-7xl font-display font-bold text-sa-gold mb-2">{Math.round(averageScore)}%</div>
            <div className="text-lg font-bold uppercase tracking-widest text-foreground">Global Readiness Score</div>
            <div className="mt-4">
              <span className={cn("px-4 py-2 rounded-full text-xs font-bold", passed ? 'bg-sa-green/10 text-sa-green' : 'bg-sa-gold/10 text-sa-gold')}>
                {passed ? '✓ Passed' : '⚠ Needs Practice'}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Individual feedback */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const f = feedbacks.get(q.id);
            const a = answers.get(q.id);
            if (!f || !a) return null;
            return (
              <GlassCard key={q.id}>
                <div className="border-b border-border pb-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-sa-gold uppercase">Question {idx + 1}</span>
                    <span className={cn("text-lg font-bold font-display", f.score >= 70 ? 'text-sa-green' : f.score >= 50 ? 'text-sa-gold' : 'text-sa-red')}>{f.score}%</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{q.text}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Your Answer:</p>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">{a}</p>
                </div>
                <div className="space-y-4">
                  {f.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-sa-green mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Strengths</h4>
                      <ul className="space-y-1">{f.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><span className="text-sa-green mt-0.5">•</span>{s}</li>)}</ul>
                    </div>
                  )}
                  {f.improvements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-sa-gold mb-2 flex items-center gap-2"><Zap className="h-4 w-4" /> How to Improve</h4>
                      <ul className="space-y-1">{f.improvements.map((s, i) => <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><span className="text-sa-gold mt-0.5">•</span>{s}</li>)}</ul>
                    </div>
                  )}
                  {f.suggestedAnswer && (
                    <div className="bg-sa-blue/10 rounded-xl p-4 border border-sa-blue/20">
                      <h4 className="text-xs font-bold text-sa-blue mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> Model Answer</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.suggestedAnswer}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    );
  }

  // Setup screen
  if (!sessionStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-sa-terracotta" />
            <span className="bg-gradient-to-r from-sa-terracotta to-sa-red bg-clip-text text-transparent">AI Interview Coach</span>
          </h1>
          <p className="text-muted-foreground">Practise with AI-powered interview questions tailored for SA professionals</p>
        </motion.div>

        <GlassCard glow="gold">
          <div className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3">Interview Focus</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'tech' as InterviewType, label: 'Technical', icon: '💻' },
                  { id: 'behavioral' as InterviewType, label: 'Behavioral', icon: '👤' },
                  { id: 'non-tech' as InterviewType, label: 'General', icon: '📋' }
                ]).map((t) => (
                  <button key={t.id} onClick={() => setSelectedType(t.id)}
                    className={cn("p-4 rounded-2xl border-2 transition-all text-center",
                      selectedType === t.id ? 'border-sa-gold bg-sa-gold/10 ring-4 ring-sa-gold/10' : 'border-border hover:border-sa-gold/30')}>
                    <span className="text-2xl mb-1 block">{t.icon}</span>
                    <span className={cn("text-xs font-bold", selectedType === t.id ? 'text-sa-gold' : 'text-muted-foreground')}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3">Experience Level</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button key={d} onClick={() => setSelectedDifficulty(d)}
                    className={cn("flex-1 py-3 rounded-xl font-bold capitalize border-2 transition-all",
                      selectedDifficulty === d ? 'border-sa-gold bg-sa-gold text-primary-foreground' : 'border-border text-muted-foreground hover:border-sa-gold/30')}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3">Company (Optional)</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Vodacom, Discovery"
                className="w-full px-4 py-4 rounded-xl border-2 border-border focus:border-sa-gold focus:outline-none bg-muted/30 font-medium text-foreground" />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Job Description (Optional)
              </label>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to tailor questions..."
                rows={4}
                className="w-full px-4 py-4 rounded-xl border-2 border-border focus:border-sa-gold focus:outline-none bg-muted/30 font-medium text-foreground resize-none" />
            </div>

            <button onClick={handleStart}
              className="w-full bg-gradient-to-r from-sa-gold to-sa-terracotta text-primary-foreground py-5 rounded-2xl font-bold text-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl">
              <Sparkles className="h-6 w-6" /> Start Simulation
            </button>
          </div>
        </GlassCard>

        <TipsPanel interviewType={selectedType} />
      </div>
    );
  }

  // Active interview
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-display font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-sa-terracotta" />
          <span className="text-foreground">AI Interview Coach</span>
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          {feedbacks.size > 0 && (
            <button onClick={() => setShowResults(true)}
              className="bg-sa-gold text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg hover:opacity-90">
              <BarChart3 className="h-4 w-4" /> Results
            </button>
          )}
        </div>
      </div>

      {/* Completion banner */}
      {sessionComplete && !showResults && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-sa-green/10 border border-sa-green/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Trophy className="h-5 w-5 text-sa-green flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Interview Complete! 🎉</p>
            <p className="text-xs text-muted-foreground mt-1">Your average score is {Math.round(averageScore)}%.</p>
          </div>
          <button onClick={() => setShowResults(true)} className="bg-sa-green text-success-foreground px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90">
            View Results
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question area */}
        <div className="lg:col-span-8">
          {currentQuestion && (
            <GlassCard glow="gold" className="min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-sa-gold rounded-xl flex items-center justify-center text-primary-foreground font-bold">
                    {currentIndex + 1}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-sa-gold uppercase tracking-widest">Question {currentIndex + 1} of {totalQuestions}</h2>
                    <p className="text-muted-foreground text-xs">{currentQuestion.type} • {currentQuestion.difficulty}</p>
                  </div>
                </div>
                <button onClick={() => speak(currentQuestion.text)} disabled={isSpeaking}
                  className={cn("p-3 rounded-full transition-all", isSpeaking ? 'bg-sa-gold text-primary-foreground animate-pulse' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-foreground text-center leading-tight">{currentQuestion.text}</h3>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={userInput + (isListening ? ' ' + interimTranscript : '')}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your response here... (Use STAR method for best results)"
                    className="w-full bg-muted/30 border-2 border-border rounded-2xl p-4 md:p-6 h-32 md:h-40 focus:outline-none focus:border-sa-gold transition-all text-foreground font-medium resize-none text-sm"
                  />
                  {recognitionSupported && (
                    <button type="button" onClick={toggleListening}
                      className={cn("absolute bottom-4 right-4 p-3 rounded-full transition-all",
                        isListening ? 'bg-sa-red text-destructive-foreground animate-pulse' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
                      {isListening ? <Volume2 className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className={cn("text-xs font-medium", wordCount < 30 ? 'text-sa-gold' : 'text-sa-green')}>
                    {wordCount} words{wordCount < 30 && ' (aim for 50+)'}
                  </span>
                </div>

                <button onClick={handleSubmit} disabled={isSubmitting || !userInput.trim() || userInput.trim().length < 20}
                  className="w-full bg-gradient-to-r from-sa-gold to-sa-terracotta text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Analysing...</> : <><Send className="h-5 w-5" /> Submit & Continue</>}
                </button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Progress */}
          <GlassCard className="bg-foreground text-background">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-sa-gold" /> Session Progress
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase mb-2">
                  <span className="opacity-60">Completion</span>
                  <span className="text-sa-gold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-background/20 rounded-full overflow-hidden">
                  <div className="h-full bg-sa-gold transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div>
                <p className="text-xs opacity-60 mb-2">Questions</p>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)}
                      className={cn("h-2 rounded-full transition-all",
                        feedbacks.has(q.id) ? 'bg-sa-green' : i === currentIndex ? 'bg-sa-gold' : 'bg-background/20 hover:bg-background/30')} />
                  ))}
                </div>
              </div>

              {feedbacks.size > 0 && (
                <div className="pt-4 border-t border-background/20">
                  <p className="text-xs opacity-60 mb-2">Current Average</p>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-2xl font-bold font-display", averageScore >= 70 ? 'text-sa-green' : averageScore >= 50 ? 'text-sa-gold' : 'text-sa-red')}>
                      {Math.round(averageScore)}%
                    </span>
                    <div className="flex-1 h-2 bg-background/20 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", averageScore >= 70 ? 'bg-sa-green' : averageScore >= 50 ? 'bg-sa-gold' : 'bg-sa-red')} style={{ width: `${averageScore}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <TipsPanel interviewType={selectedType} />

          {/* Recent feedback */}
          {feedbacks.size > 0 && (
            <GlassCard>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" /> Latest Feedback
              </h4>
              <div className="space-y-3">
                {Array.from(feedbacks.entries()).slice(-2).map(([id, f]) => {
                  const qi = questions.findIndex(q => q.id === id);
                  return (
                    <div key={id} className="bg-muted/50 p-3 rounded-xl">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-sa-gold">Question {qi + 1}</span>
                        <span className={cn("text-[10px] font-bold", f.score >= 70 ? 'text-sa-green' : f.score >= 50 ? 'text-sa-gold' : 'text-sa-red')}>{f.score}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{f.feedback}</p>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowResults(true)}
                className="w-full mt-4 text-center text-xs font-bold text-sa-gold hover:underline flex items-center justify-center gap-1">
                View full breakdown <ChevronRight className="h-3 w-3" />
              </button>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
