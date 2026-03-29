// frontend/src/pages/Interview/InterviewCoach.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, MessageSquare, RefreshCw, Loader2, BarChart3,
  Clock, Sparkles, Zap, Volume2, Send, Trophy, ChevronRight,
  Award, AlertCircle, CheckCircle, VolumeX, Mic, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { interviewService } from '../../services/interviewService';
import { TipsPanel } from '../../components/interview/TipsPanel';
import GlassCard from '../../components/shared/GlassCard';
import { useToast } from '../../components/Toast';
 
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
  const { showToast, ToastComponent } = useToast();
  // Setup state
  const [selectedType, setSelectedType] = useState<InterviewType>('behavioral');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Session state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [feedbacks, setFeedbacks] = useState<Map<string, Feedback>>(new Map());
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [userInput, setUserInput] = useState('');

  // Voice
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const processedIndexRef = useRef<number>(-1);

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
    recognition.lang = 'en-ZA'; // Consistent with VoiceInterviewCoach for SA market
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          if (i > processedIndexRef.current) {
            final += t + ' ';
            processedIndexRef.current = i;
          }
        } else {
          interim += t;
        }
      }
      if (final) {
        setUserInput(prev => {
          const trimmedPrev = prev.trim();
          const newText = trimmedPrev === '' ? final : `${trimmedPrev} ${final}`;
          return newText.trim().replace(/\s+/g, ' ');
        });
      }
      setInterimTranscript(interim);
    };
    recognitionRef.current = recognition;
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else { 
      setInterimTranscript(''); 
      processedIndexRef.current = -1; // Reset index for new recording session
      try { recognitionRef.current?.start(); } catch {} 
    }
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

  const handleStart = async (retryCount = 0) => {
    try {
      setIsStarting(true);
      const storedCV = localStorage.getItem('cvAnalysisData');
      const cvData = storedCV ? JSON.parse(storedCV) : undefined;

      const session = await interviewService.startInterview(
        selectedType,
        selectedDifficulty,
        company || undefined,
        cvData,
        jobDescription || undefined
      );

      if (session && session.questions) {
        setQuestions(session.questions as any);
        setSessionId(session.sessionId);
        setCurrentIndex(0);
        setAnswers(new Map());
        setFeedbacks(new Map());
        setSessionStarted(true);
        setShowResults(false);
        setUserInput('');
      } else {
        showToast('Could not generate questions. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      showToast('Connection error. Is the AI service running?', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !userInput.trim()) return;
    
    window.speechSynthesis?.cancel(); // Stop AI speaking immediately on submit
    if (isListening) recognitionRef.current?.stop();

    try {
      setIsSubmitting(true);
      const storedCV = localStorage.getItem('cvAnalysisData');
      const cvData = storedCV ? JSON.parse(storedCV) : undefined;

      const feedback = await interviewService.submitAnswer(
        sessionId!,
        currentQuestion.id,
        userInput,
        cvData
      );

      if (feedback) {
        const normalizedFeedback = { ...feedback };
        if (normalizedFeedback.score <= 1) normalizedFeedback.score *= 100;

        setAnswers(prev => new Map(prev).set(currentQuestion.id, userInput));
        setFeedbacks(prev => new Map(prev).set(currentQuestion.id, normalizedFeedback));
        setUserInput('');
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else {
        showToast('Evaluation failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Failed to evaluate response:', err);
      showToast('AI service is currently busy. Try a shorter response.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
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
              <BarChart3 className="h-8 w-8 text-amber-500" />
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Interview Summary</span>
            </h1>
          </div>
          <button onClick={reset} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg">
            <RefreshCw className="h-4 w-4" /> Start New
          </button>
        </div>

        {/* Global Score */}
        <GlassCard className="text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy className="h-32 w-32 text-amber-500" /></div>
          <div className="relative z-10">
            <div className="text-7xl font-display font-bold text-amber-500 mb-2">{Math.round(averageScore)}%</div>
            <div className="text-lg font-bold uppercase tracking-widest text-foreground">Global Readiness Score</div>
            <div className="mt-4">
              <span className={cn("px-4 py-2 rounded-full text-xs font-bold", passed ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500')}>
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
                    <span className="text-xs font-bold text-amber-500 uppercase">Question {idx + 1}</span>
                    <span className={cn("text-lg font-bold font-display", f.score >= 70 ? 'text-green-500' : f.score >= 50 ? 'text-amber-500' : 'text-red-500')}>{f.score}%</span>
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
                      <h4 className="text-xs font-bold text-green-500 mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Strengths</h4>
                      <ul className="space-y-1">{f.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><span className="text-green-500 mt-0.5">•</span>{s}</li>)}</ul>
                    </div>
                  )}
                  {f.improvements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-amber-500 mb-2 flex items-center gap-2"><Zap className="h-4 w-4" /> How to Improve</h4>
                      <ul className="space-y-1">{f.improvements.map((s, i) => <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><span className="text-amber-500 mt-0.5">•</span>{s}</li>)}</ul>
                    </div>
                  )}
                  {f.suggestedAnswer && (
                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <h4 className="text-xs font-bold text-blue-500 mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> Model Answer</h4>
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
            <Brain className="h-8 w-8 text-orange-500" />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">AI Interview Coach</span>
          </h1>
          <p className="text-muted-foreground">Practise with AI-powered interview questions tailored for SA professionals</p>
        </motion.div>

        <GlassCard>
          <div className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3">Interview Focus</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { id: 'tech' as InterviewType, label: 'Technical', icon: '💻' },
                  { id: 'behavioral' as InterviewType, label: 'Behavioral', icon: '👤' },
                  { id: 'non-tech' as InterviewType, label: 'General', icon: '📋' }
                ]).map((t) => (
                  <button key={t.id} onClick={() => setSelectedType(t.id)}
                    className={cn("p-4 rounded-2xl border-2 transition-all text-center",
                      selectedType === t.id ? 'border-amber-500 bg-amber-500/10 ring-4 ring-amber-500/10' : 'border-border hover:border-amber-500/30')}>
                    <span className="text-2xl mb-1 block">{t.icon}</span>
                    <span className={cn("text-xs font-bold", selectedType === t.id ? 'text-amber-500' : 'text-muted-foreground')}>{t.label}</span>
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
                      selectedDifficulty === d ? 'border-amber-500 bg-amber-500 text-primary-foreground' : 'border-border text-muted-foreground hover:border-amber-500/30')}>
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
                className="w-full px-4 py-4 rounded-xl border-2 border-border focus:border-amber-500 focus:outline-none bg-muted/30 font-medium text-foreground" />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Job Description (Optional)
              </label>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to tailor questions..."
                rows={4}
                className="w-full px-4 py-4 rounded-xl border-2 border-border focus:border-amber-500 focus:outline-none bg-muted/30 font-medium text-foreground resize-none" />
            </div>

            <button onClick={() => handleStart(0)} disabled={isStarting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-primary-foreground py-5 rounded-2xl font-bold text-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-70">
              {isStarting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
              {isStarting ? 'Preparing AI...' : 'Start Simulation'}
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
      {/* Render Toast once at the top level to avoid conflicts */}
      <ToastComponent />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-display font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-orange-500" />
          <span className="text-foreground">AI Interview Coach</span>
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          {feedbacks.size > 0 && (
            <button onClick={() => setShowResults(true)}
              className="bg-amber-500 text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg hover:opacity-90">
              <BarChart3 className="h-4 w-4" /> Results
            </button>
          )}
        </div>
      </div>

      {/* Completion banner */}
      {sessionComplete && !showResults && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Trophy className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Interview Complete! 🎉</p>
            <p className="text-xs text-muted-foreground mt-1">Your average score is {Math.round(averageScore)}%.</p>
          </div>
          <button onClick={() => setShowResults(true)} className="bg-green-500 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90">
            View Results
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question area */}
        <div className="lg:col-span-8">
          {currentQuestion && (
            <GlassCard className="min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-primary-foreground font-bold">
                    {currentIndex + 1}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Question {currentIndex + 1} of {totalQuestions}</h2>
                    <p className="text-muted-foreground text-xs">{currentQuestion.type} • {currentQuestion.difficulty}</p>
                  </div>
                </div>
                <button onClick={() => speak(currentQuestion.text)} disabled={isSpeaking}
                  className={cn("p-3 rounded-full transition-all", isSpeaking ? 'bg-amber-500 text-primary-foreground animate-pulse' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-foreground text-center leading-tight">{currentQuestion.text}</h3>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your response here... (Use STAR method for best results)"
                    className="w-full bg-muted/30 border-2 border-border rounded-2xl p-4 md:p-6 h-32 md:h-40 focus:outline-none focus:border-amber-500 transition-all text-foreground font-medium resize-none text-sm"
                  />
                  {/* Overlay interim transcript separately so it doesn't mess with the cursor position */}
                  {isListening && interimTranscript && (
                    <div className="absolute top-4 md:top-6 left-4 md:left-6 right-16 pointer-events-none">
                      <span className="text-sm font-medium text-transparent select-none">{userInput}</span>
                      <span className="text-sm font-medium text-amber-500/60 ml-1 italic">{interimTranscript}</span>
                    </div>
                  )}
                  {recognitionSupported && (
                    <button type="button" onClick={toggleListening}
                      className={cn("absolute bottom-4 right-4 p-3 rounded-full transition-all",
                        isListening ? 'bg-red-500 text-primary-foreground animate-pulse' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
                      {isListening ? <Volume2 className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className={cn("text-xs font-medium", wordCount < 30 ? 'text-amber-500' : 'text-green-500')}>
                    {wordCount} words{wordCount < 30 && ' (aim for 50+)'}
                  </span>
                </div>

                <button onClick={handleSubmit} disabled={isSubmitting || !userInput.trim() || userInput.trim().length < 20}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
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
              <Clock className="h-5 w-5 text-amber-500" /> Session Progress
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase mb-2">
                  <span className="opacity-60">Completion</span>
                  <span className="text-amber-500">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-background/20 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div>
                <p className="text-xs opacity-60 mb-2">Questions</p>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)}
                      className={cn("h-2 rounded-full transition-all",
                        feedbacks.has(q.id) ? 'bg-green-500' : i === currentIndex ? 'bg-amber-500' : 'bg-background/20 hover:bg-background/30')} />
                  ))}
                </div>
              </div>

              {feedbacks.size > 0 && (
                <div className="pt-4 border-t border-background/20">
                  <p className="text-xs opacity-60 mb-2">Current Average</p>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-2xl font-bold font-display", averageScore >= 70 ? 'text-green-500' : averageScore >= 50 ? 'text-amber-500' : 'text-red-500')}>
                      {Math.round(averageScore)}%
                    </span>
                    <div className="flex-1 h-2 bg-background/20 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", averageScore >= 70 ? 'bg-green-500' : averageScore >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${averageScore}%` }} />
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
                        <span className="text-[10px] font-bold text-amber-500">Question {qi + 1}</span>
                        <span className={cn("text-[10px] font-bold", f.score >= 70 ? 'text-green-500' : f.score >= 50 ? 'text-amber-500' : 'text-red-500')}>{f.score}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{f.feedback}</p>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowResults(true)}
                className="w-full mt-4 text-center text-xs font-bold text-amber-500 hover:underline flex items-center justify-center gap-1">
                View full breakdown <ChevronRight className="h-3 w-3" />
              </button>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}