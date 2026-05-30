import { AnimatePresence, motion } from 'framer-motion';
import { Brain, RotateCcw } from 'lucide-react';

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
    isSubscribed,
    analysisRemaining,
    revampedCV,
    error,
    isRateLimited,
    retryAfter,
    showPostModal,
  } = state;

  // Determine readiness of the upload step
  const uploadReady =
    inputMode === 'file' ? !!file : cvText.trim().length >= 50;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">CV Analyser</h1>
            <p className="text-xs text-muted-foreground">
              AI-powered analysis · ATS scoring · Career insights
            </p>
          </div>
        </div>

        {(step === 'result' || step === 'revamped' || step === 'revamping') && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border border-border"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start Over
          </button>
        )}
      </div>

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
            className="rounded-2xl border border-border bg-card p-6 space-y-6"
          >
            <CVUploadZone
              inputMode={inputMode}
              file={file}
              cvText={cvText}
              onModeChange={setInputMode}
              onFileSelect={setFile}
              onTextChange={setCVText}
            />

            {/* Analysis form only shows when there's content to submit */}
            {(uploadReady || step === 'form') && (
              <div className="border-t border-border pt-5">
                <CVAnalysisForm
                  values={formValues}
                  inputMode={inputMode}
                  isReady={uploadReady}
                  isScanning={false}
                  onChange={setFormValues}
                  onSubmit={submitAnalysis}
                />
              </div>
            )}
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
              analysisRemaining={analysisRemaining}
              isSubscribed={isSubscribed}
              onRevampClick={submitRevamp}
              onReanalyze={reset}
            />

            {/* Revamp section below results */}
            <CVRevampSection
              isSubscribed={isSubscribed}
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
