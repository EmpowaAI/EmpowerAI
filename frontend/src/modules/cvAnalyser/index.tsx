import { AnimatePresence, motion } from 'framer-motion';
import { Brain, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useCVAnalyzer } from './hooks/useCvAnalyser';
import CVUploadZone from './componets/CVUploadZone';
import CVAnalysisForm from './componets/CVAnalysisForm';
import CVAnalysisResult from './componets/CVAnalysisResults';
import CVRevampSection from './componets/CVRevampSection';

// Reuse existing components — no design pattern change
import CVUploadError from './componets/CVUploadError';
import CVScanAnimation from './componets/CVScanAnimation';
import RevampedCVDisplay from './componets/RevampedCVDisplay';
import PostCVAnalysisModal from './componets/PostCVAnalysisModal';

export default function CVAnalyzerPage() {
  const {
    state,
    setInputMode,
    setFile,
    setCVText,
    setFormValues,
    submitAnalysis,
    submitRevamp,
    dismissError,
    dismissPostModal,
    reset,
  } = useCVAnalyzer();

  const {
    step,
    inputMode,
    file,
    cvText,
    formValues,
    analysis,
    isFallback,
    revampedCV,
    error,
    isRateLimited,
    retryAfter,
    showPostModal,
    revampPending,
  } = state;

  // Ready when either input has content
  const uploadReady = !!file || cvText.trim().length >= 50;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Gradient Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl text-white" style={{ background: 'var(--gradient-hero)' }}>
        <div className="pointer-events-none absolute inset-0 ai-mesh opacity-15" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ai-grid opacity-10" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
        <div className="relative z-10 p-6 md:p-8 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm mb-3">
              <Sparkles className="h-3 w-3 text-secondary" />
              AI-Powered Analysis
            </div>
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              CV <span className="text-gradient-ai">Analyser</span>
            </h1>
            <p className="mt-2 text-white/70 text-sm md:text-base max-w-md">
              ATS scoring · Career insights · Instant improvement tips
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Brain className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Start Over button — shown after analysis */}
      {(step === 'result' || step === 'revamped' || step === 'revamping') && (
        <div className="flex justify-end">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border border-border"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start Over
          </button>
        </div>
      )}

      {/* Revamp re-upload banner — shown when user clicked Revamp on a cached profile */}
      {revampPending && (step === 'idle' || step === 'form') && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 px-4 py-3 text-sm flex items-start gap-3">
          <span className="text-lg">✨</span>
          <div>
            <p className="font-semibold text-foreground">Upload your CV to revamp it</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Your previous score is saved. Re-upload or paste your CV below — the revamp will start automatically once analysis is complete.
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <CVUploadError
            error={error}
            onRetry={submitAnalysis}
            onDismiss={dismissError}
            isRateLimited={isRateLimited}
            retryAfter={retryAfter}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── Step: idle / form ──────────────────────────────────────────────── */}
        {(step === 'idle' || step === 'form') && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6"
          >
            <CVUploadZone
              inputMode={inputMode}
              file={file}
              cvText={cvText}
              onModeChange={setInputMode}
              onFileSelect={setFile}
              onTextChange={setCVText}
            />

            {/* Analysis details — always show so user can fill while uploading */}
            <div className={cn(
              "border-t border-border pt-6 transition-opacity duration-300",
              uploadReady ? "opacity-100" : "opacity-50 pointer-events-none"
            )}>
              <CVAnalysisForm
                values={formValues}
                inputMode={inputMode}
                isReady={uploadReady}
                isScanning={false}
                onChange={setFormValues}
                onSubmit={submitAnalysis}
              />
            </div>
          </motion.div>
        )}

        {/* ── Step: scanning ─────────────────────────────────────────────────── */}
        {step === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <CVScanAnimation
              isActive
              onComplete={() => { /* hook drives state, animation is cosmetic */ }}
            />
          </motion.div>
        )}

        {/* ── Step: result ───────────────────────────────────────────────────── */}
        {step === 'result' && analysis && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <CVAnalysisResult
              analysis={analysis}
              isFallback={isFallback}
              onRevampClick={submitRevamp}
              onReanalyze={reset}
            />

            {/* Revamp section below results */}
            <CVRevampSection
              isRevamping={false}
              onRevamp={submitRevamp}
            />
          </motion.div>
        )}

        {/* ── Step: revamping ────────────────────────────────────────────────── */}
        {step === 'revamping' && (
          <motion.div
            key="revamping"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <CVScanAnimation
              isActive
              onComplete={() => {}}
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Rewriting your CV with AI optimisation...
            </p>
          </motion.div>
        )}

        {/* ── Step: revamped ─────────────────────────────────────────────────── */}
        {step === 'revamped' && revampedCV && (
          <motion.div
            key="revamped"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <RevampedCVDisplay cvData={revampedCV} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Post-analysis modal */}
      {analysis && (
        <PostCVAnalysisModal
          isOpen={showPostModal}
          onClose={dismissPostModal}
          cvScore={analysis.overallScore}
          readinessLevel={
            analysis.overallScore >= 85
              ? 'EXCEPTIONAL'
              : analysis.overallScore >= 70
              ? 'HIGH POTENTIAL'
              : analysis.overallScore >= 50
              ? 'INTERMEDIATE'
              : 'DEVELOPING'
          }
          twinCompleted={false}
          onRevampClick={submitRevamp}
        />
      )}

    </div>
  );
}
