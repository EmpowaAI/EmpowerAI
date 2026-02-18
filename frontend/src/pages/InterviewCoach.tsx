// frontend/src/pages/InterviewCoach.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  MessageSquare, 
  ArrowLeft,
  RefreshCw,
  Loader2,
  BarChart3,
  Clock,
  Sparkles,
  Zap,
  Volume2,
  Send,
  Trophy,
  ChevronRight,
  Wifi,
  Award,
  Menu,
  X,
  AlertCircle,
  CheckCircle,
  VolumeX
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../lib/user-context';
import { useInterview } from '../hooks/useInterview';
import { TipsPanel } from '../components/interview/TipsPanel';

// Types
export enum InterviewType {
  TECH = 'tech',
  BEHAVIORAL = 'behavioral',
  NON_TECH = 'non-tech'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export default function InterviewCoach() {
  const { cvData: userCVData, refreshCVData } = useUser();
  const navigate = useNavigate();
  
  const {
    session: backendSession,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress: interviewProgress,
    answers,
    feedbacks,
    isLoading,
    error,
    sessionComplete,
    apiAvailable,
    startInterview: backendStartInterview,
    submitAnswer: backendSubmitAnswer,
    goToQuestion,
    resetInterview: backendResetInterview
  } = useInterview();

  // Local state
  const [selectedType, setSelectedType] = useState<InterviewType>(InterviewType.BEHAVIORAL);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [company, setCompany] = useState('');
  const [showCompanyInput, setShowCompanyInput] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  // Voice state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const completionAnnounced = useRef(false);

  // Convert CV data
  const cvData = userCVData ? {
    name: userCVData.sections?.about?.split(' ')[0] || 'Candidate',
    role: userCVData.sections?.skills?.slice(0, 2).join('/') || 'Professional',
    skills: userCVData.sections?.skills || [],
    experience: userCVData.sections?.experience || []
  } : null;

  // Calculate average score
  const averageScore = feedbacks.size > 0
    ? Array.from(feedbacks.values()).reduce((acc, f) => acc + f.score, 0) / feedbacks.size
    : 0;

  // Refresh CV data on mount
  useEffect(() => {
    refreshCVData();
  }, [refreshCVData]);

  // Scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex]);

  // Speak text function
  const speak = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Announce question
  useEffect(() => {
    if (currentQuestion && !showResults && audioEnabled) {
      const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
      if (isLastQuestion && sessionComplete) return;
      
      const questionText = `Question ${currentQuestionIndex + 1} of ${totalQuestions}. ${currentQuestion.text}`;
      speak(questionText);
    }
  }, [currentQuestion, currentQuestionIndex, showResults, audioEnabled, totalQuestions, sessionComplete]);

  // Announce completion
  useEffect(() => {
    if (sessionComplete && !showResults && !completionAnnounced.current && audioEnabled) {
      completionAnnounced.current = true;
      setShowCompletionMessage(true);
      
      const avgScore = Math.round(averageScore);
      speak(`Congratulations! You've completed the interview. Your average score is ${avgScore} percent. You can now view your results.`);
      
      setTimeout(() => {
        setShowCompletionMessage(false);
      }, 5000);
      
      setTimeout(() => {
        setAudioEnabled(false);
      }, 6000);
    }
  }, [sessionComplete, averageScore, showResults, audioEnabled]);

  const handleStartInterview = async () => {
    await backendStartInterview(
      selectedType,
      selectedDifficulty,
      showCompanyInput ? company : undefined
    );
    setUserInput('');
    setJustSubmitted(false);
    setAudioEnabled(true);
    completionAnnounced.current = false;
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userInput.trim()) return;
    
    setJustSubmitted(true);
    await backendSubmitAnswer(currentQuestion.id, userInput);
    setUserInput('');
    
    setTimeout(() => {
      setJustSubmitted(false);
    }, 1000);
  };

  const handleViewResults = () => {
    setShowResults(true);
    setShowCompletionMessage(false);
    setAudioEnabled(false);
  };

  const handleBackToQuestions = () => {
    setShowResults(false);
    setAudioEnabled(true);
  };

  const reset = () => {
    backendResetInterview();
    setShowResults(false);
    setUserInput('');
    setJustSubmitted(false);
    setShowCompletionMessage(false);
    setAudioEnabled(true);
    completionAnnounced.current = false;
  };

  // Check if CV exists
  const hasCV = !!userCVData;

  if (!hasCV) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/cv-analyzer')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to CV Analyzer
          </button>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl md:text-3xl font-black text-amber-800 dark:text-amber-300 mb-4">
              CV Required
            </h1>
            <p className="text-amber-700 dark:text-amber-400 mb-8 max-w-md mx-auto">
              Please analyze your CV first for personalized interview questions and feedback.
            </p>
            <button
              onClick={() => navigate('/cv-analyzer')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
            >
              Analyze Your CV
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show results view
  if (showResults && backendSession && feedbacks.size > 0) {
    const passed = averageScore >= 70;
    
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={handleBackToQuestions}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Questions
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              Interview Summary
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {backendSession.type} • {backendSession.difficulty} difficulty
            </p>
          </div>
          <button 
            onClick={reset}
            className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="h-4 w-4" /> Start New
          </button>
        </div>

        {/* Global Score Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-100 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="h-32 w-32 text-blue-600" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-7xl md:text-8xl font-black text-blue-600 dark:text-blue-400 mb-4">
              {Math.round(averageScore)}%
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-widest text-center">
              Global Readiness Score
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className={cn(
                "px-4 py-2 rounded-full text-xs font-bold",
                passed 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              )}>
                {passed ? '✓ Passed' : '⚠ Needs Practice'}
              </span>
              {apiAvailable && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-bold">
                  <Zap className="h-3 w-3 inline mr-1" />
                  Azure AI Powered
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="space-y-6">
          {backendSession.questions.map((q, idx) => {
            const f = feedbacks.get(q.id);
            const a = answers.get(q.id);
            if (!f || !a) return null;
            
            return (
              <div key={q.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Question Header */}
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 md:p-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase">Question {idx + 1}</span>
                    <span className={cn(
                      "text-lg font-black",
                      f.score >= 70 ? 'text-emerald-600' :
                      f.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    )}>
                      {f.score}%
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-medium text-slate-800 dark:text-white">{q.text}</p>
                </div>

                {/* Your Answer */}
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Your Answer:</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-3 md:p-4 rounded-xl">
                    {a}
                  </p>
                </div>

                {/* Feedback Grid */}
                <div className="p-4 md:p-6 space-y-4">
                  {/* Key Strengths */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-1">
                      {f.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvement Areas */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      How to Improve
                    </h4>
                    <ul className="space-y-1">
                      {f.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Model Answer */}
                  {f.suggestedAnswer && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Model Answer
                      </h4>
                      <p className="text-xs md:text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
                        {f.suggestedAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Main interview view
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Interview Coach
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700"
              aria-label={audioEnabled ? "Mute voice" : "Unmute voice"}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-lg">
          {backendSession && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Progress</p>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${interviewProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              {feedbacks.size > 0 && (
                <button
                  onClick={() => {
                    setShowResults(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                  View Results
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16 md:pt-0 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center py-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-500" />
              AI Interview Coach
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Powered by Azure OpenAI • Personalized based on your CV
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              title={audioEnabled ? "Mute" : "Unmute"}
            >
              {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            {backendSession && feedbacks.size > 0 && (
              <button
                onClick={handleViewResults}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Results
              </button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* CV Status */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs text-green-700 dark:text-green-300">
              <span className="font-bold">CV:</span> {cvData?.skills.length || 0} skills
            </p>
          </div>

          {/* API Status - Only show when connected */}
          {apiAvailable && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <Wifi className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-300">AI Service Connected</p>
            </div>
          )}

          {/* Voice Status */}
          <div className={cn(
            "rounded-xl px-4 py-2 flex items-center gap-2 border",
            audioEnabled 
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          )}>
            {audioEnabled ? (
              <>
                <Volume2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <p className="text-xs text-purple-700 dark:text-purple-300">Voice On</p>
              </>
            ) : (
              <>
                <VolumeX className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Voice Off</p>
              </>
            )}
          </div>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute" />
                <div className="w-2 h-2 bg-blue-500 rounded-full relative" />
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Speaking...</p>
            </div>
          )}
        </div>

        {/* Completion Message */}
        {showCompletionMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Interview Complete! 🎉</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Your average score is {Math.round(averageScore)}%. Click "View Results" to see detailed feedback.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        {!backendSession ? (
          /* Setup Screen */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Set up your Session</h1>
              <p className="text-slate-500 dark:text-slate-400">Configure your practice environment for maximum impact.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="space-y-8">
                {/* Interview Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Interview Focus</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: InterviewType.TECH, label: 'Technical', icon: '💻' },
                      { id: InterviewType.BEHAVIORAL, label: 'Behavioral', icon: '👤' },
                      { id: InterviewType.NON_TECH, label: 'General', icon: '📋' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all text-center",
                          selectedType === t.id 
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/20' 
                            : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                        )}
                      >
                        <span className="text-2xl mb-1 block">{t.icon}</span>
                        <span className={cn(
                          "text-xs font-bold",
                          selectedType === t.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
                        )}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Experience Level</label>
                  <div className="flex gap-2">
                    {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold capitalize border-2 transition-all",
                          selectedDifficulty === d 
                            ? 'border-blue-600 bg-blue-600 text-white' 
                            : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company (Optional) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Target Company
                    </label>
                    <button
                      onClick={() => setShowCompanyInput(!showCompanyInput)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {showCompanyInput ? 'Remove' : 'Add company'}
                    </button>
                  </div>
                  {showCompanyInput && (
                    <input 
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google, Microsoft, Startup X"
                      className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-slate-50 dark:bg-slate-700 font-medium dark:text-white"
                    />
                  )}
                </div>

                {/* Azure AI Status - Only show when connected */}
                {apiAvailable && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        <span className="font-bold">Azure OpenAI Active:</span> You'll receive AI-powered feedback
                      </p>
                    </div>
                  </div>
                )}

                {/* Start Button */}
                <button
                  onClick={handleStartInterview}
                  disabled={isLoading}
                  className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-50"
                >
                  {isLoading ? (
                    <><Loader2 className="h-6 w-6 animate-spin" /> Preparing AI...</>
                  ) : (
                    <><Sparkles className="h-6 w-6" /> Start Simulation</>
                  )}
                </button>
              </div>
            </div>

            {/* Tips Panel */}
            <div className="mt-8">
              <TipsPanel interviewType={selectedType} />
            </div>
          </div>
        ) : (
          /* Active Interview */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 py-8">
            {/* Left Column - Question */}
            <div className="lg:col-span-8 space-y-6">
              {currentQuestion && (
                <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-700 min-h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-6 md:mb-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {currentQuestionIndex + 1}
                      </div>
                      <div>
                        <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest">
                          Question {currentQuestionIndex + 1} of {totalQuestions}
                        </h2>
                        <p className="text-slate-400 dark:text-slate-500 text-xs">
                          {currentQuestion.type} • {currentQuestion.difficulty}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => speak(currentQuestion.text)}
                      disabled={isSpeaking}
                      className={cn(
                        "p-3 rounded-full transition-all",
                        isSpeaking 
                          ? 'bg-blue-600 text-white animate-pulse' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      )}
                      aria-label="Read question aloud"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center mb-6 md:mb-10">
                    <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white text-center leading-tight">
                      {currentQuestion.text}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <textarea 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your response here... (Use STAR method for best results)"
                        className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl md:rounded-3xl p-4 md:p-6 h-32 md:h-40 focus:outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-white font-medium resize-none text-sm md:text-base"
                      />
                    </div>

                    {/* Word Count Indicator */}
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "text-xs font-medium",
                        userInput.split(/\s+/).length < 30 ? 'text-amber-600' : 'text-emerald-600'
                      )}>
                        {userInput.split(/\s+/).length} words
                        {userInput.split(/\s+/).length < 30 && ' (aim for 100+)'}
                      </span>
                      {justSubmitted && (
                        <span className="text-xs text-blue-600 animate-pulse">
                          ✓ Answer submitted
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={handleSubmitAnswer}
                      disabled={isLoading || !userInput.trim()}
                      className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-base md:text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <><Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> Analyzing with Azure AI...</>
                      ) : (
                        <><Send className="h-5 w-5 md:h-6 md:w-6" /> Submit & Continue</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Progress & Tips */}
            <div className="lg:col-span-4 space-y-6">
              {/* Progress Card */}
              <div className="bg-slate-900 dark:bg-slate-800 text-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-800 dark:border-slate-700">
                <h4 className="font-bold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" /> Session Progress
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase mb-2">
                      <span className="text-slate-400">Completion</span>
                      <span className="text-blue-400">{Math.round(interviewProgress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${interviewProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Question Navigator */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Questions</p>
                    <div className="grid grid-cols-5 gap-2">
                      {backendSession.questions.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goToQuestion(i)}
                          className={cn(
                            "h-2 rounded-full transition-all",
                            i < currentQuestionIndex ? 'bg-emerald-500' : 
                            i === currentQuestionIndex ? 'bg-blue-500' : 
                            'bg-slate-800 dark:bg-slate-700 hover:bg-slate-700'
                          )}
                          aria-label={`Go to question ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Score */}
                  {feedbacks.size > 0 && (
                    <div className="pt-4 border-t border-slate-800 dark:border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">Current Average</p>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-2xl font-black",
                          averageScore >= 70 ? 'text-emerald-400' :
                          averageScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                        )}>
                          {Math.round(averageScore)}%
                        </span>
                        <div className="flex-1 h-2 bg-slate-800 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              averageScore >= 70 ? 'bg-emerald-500' :
                              averageScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            )}
                            style={{ width: `${averageScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Panel */}
              <TipsPanel interviewType={backendSession.type} />

              {/* Recent Feedback Preview */}
              {feedbacks.size > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Latest Azure AI Feedback
                  </h4>
                  <div className="space-y-3">
                    {Array.from(feedbacks.entries()).slice(-2).map(([id, f]) => {
                      const questionIndex = backendSession.questions.findIndex(q => q.id === id);
                      return (
                        <div key={id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-blue-600">Question {questionIndex + 1}</span>
                            <span className={cn(
                              "text-[10px] font-bold",
                              f.score >= 70 ? 'text-emerald-600' :
                              f.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                            )}>
                              {f.score}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                            {f.feedback}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleViewResults}
                    className="w-full mt-4 text-center text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1"
                  >
                    View full breakdown <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}