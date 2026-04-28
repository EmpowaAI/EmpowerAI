// frontend/src/pages/CV-analysis/CVAnalyzerNew.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Languages,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUser } from "../../contexts/user-context";
import { analyzeCV, type CVAnalysis } from "../../services/cvService";
import {
  getStoredCvAnalysis,
  getStoredCvFileName,
  setStoredCvAnalysis,
  setStoredCvFileName,
} from "../../lib/sensitiveStorage";
import { buildTwinFromCv } from "../../api/services/twinService";

type Phase = "idle" | "analyzing" | "complete";

const STAGES = [
  { icon: FileText,  label: "Parsing document",   detail: "Extracting structure, sections, and metadata" },
  { icon: Languages, label: "Reading context",    detail: "Understanding language, tone, and intent" },
  { icon: Brain,     label: "Identifying skills", detail: "Cross-referencing 12,400+ skill signals" },
  { icon: Target,    label: "Matching pathways",  detail: "Aligning with 5 career trajectories" },
  { icon: Sparkles,  label: "Composing insights", detail: "Crafting personalised recommendations" },
];

const STAGE_DURATION = 1600; // ms per stage

export default function CVAnalyzerPage() {
  const { updateProgress, hasExistingCV, reanalyzeCV } = useUser();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(() => {
    return getStoredCvFileName();
  });
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [cvData, setCvData] = useState<CVAnalysis | null>(() => {
    return getStoredCvAnalysis<CVAnalysis>();
  });
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  // Cleanup file input on unmount
  useEffect(() => {
    return () => {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }, [])

  // Persist CV analysis in session storage
  useEffect(() => {
    if (cvData) {
      setStoredCvAnalysis(cvData);
    }
  }, [cvData]);

  // Persist filename in session storage
  useEffect(() => {
    if (fileName !== null) {
      setStoredCvFileName(fileName);
    }
  }, [fileName]);

  const performActualAnalysis = useCallback(async () => {
    if (!selectedFile) {
      setPhase("idle");
      return;
    }

    try {
      const result = await analyzeCV(selectedFile, "");
      setCvData(result);
      setPhase("complete");
      updateProgress('cvCompleted', true);

      // Try to build twin
      try {
        await buildTwinFromCv(result);
        updateProgress('twinCompleted', true);
      } catch (twinError) {
        console.warn("Failed to build twin, but CV analysis succeeded:", twinError);
      }

    } catch (err: any) {
      console.error("CV Analysis Error:", err);
      
      // Handle specific validation errors
      if (err.message && err.message.includes("Invalid document format")) {
        setError(err.message);
      } else if (err.message && err.message.includes("Could not extract text")) {
        setError("Unable to read the document. Please ensure it's not scanned or image-based. Try uploading a text-based PDF, DOCX, or TXT file.");
      } else if (err.message && err.message.includes("Unsupported file type")) {
        setError("Unsupported file format. Please upload a PDF, DOCX, or TXT file.");
      } else if (err.status === 429) {
        setError("Service is temporarily busy. Please wait a moment and try again.");
      } else if (err.status === 413) {
        setError("File is too large. Please upload a smaller CV file.");
      } else if (err.status === 400 || (err.message && (err.message.includes("400") || err.message.includes("valid CV")))) {
        setError(err.message || "This document could not be validated as a CV. Please ensure it contains readable text and clear sections for Experience and Education.");
      } else {
        setError(err.message || "Failed to analyze CV. Please try again or use a different file format.");
      }
      setPhase("idle");
    }
  }, [selectedFile, setCvData, updateProgress]);

  // Animation loop for analyzing phase
  useEffect(() => {
    if (phase !== "analyzing") return;
    let stage = 0;
    let stageStart = performance.now();
    setStageIndex(0);
    setStageProgress(0);

    const tick = (now: number) => {
      const elapsed = now - stageStart;
      const t = Math.min(1, elapsed / STAGE_DURATION);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setStageProgress(Math.round(eased * 100));
      if (t >= 1) {
        if (stage < STAGES.length - 1) {
          stage += 1;
          setStageIndex(stage);
          setStageProgress(0);
          stageStart = now;
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Animation complete, now do actual analysis
          performActualAnalysis();
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase, performActualAnalysis]);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setPhase("analyzing");
    setError("");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setPhase("idle");
    setFileName(null);
    setStageIndex(0);
    setStageProgress(0);
    setError("");
  };

  const overall = Math.round(((stageIndex + stageProgress / 100) / STAGES.length) * 100);

  return (
    <main className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-secondary" />
            CV Analyser · Mahala
          </span>

          <h1 className="mt-6 max-w-3xl text-center font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            {phase === "complete"  ? <>Your CV, <em className="font-display italic text-secondary">decoded.</em></>
            : phase === "analyzing"? <>Reading between the <em className="font-display italic text-secondary">lines.</em></>
            :                        <>Upload your CV. <em className="font-display italic text-secondary">We'll do the rest.</em></>}
          </h1>

          <p className="mt-4 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
            {phase === "complete"   ? "Five career pathways matched, ranked by fit and earning potential."
            : phase === "analyzing" ? "Our AI is mapping your experience to opportunities across South Africa."
            :                         "PDF, DOCX, or plain text. Your data stays private."}
          </p>

          {/* Existing CV Data Section */}
          {hasExistingCV() && phase === "idle" && (
            <div className="mt-8 w-full max-w-2xl">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm">Previous CV Analysis Found</h3>
                    <p className="text-xs text-muted-foreground">
                      You already have a CV analysis with score: {cvData?.score}/100
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => navigate('/dashboard/twin')}
                    className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
                  >
                    <Brain className="h-4 w-4 text-blue-500" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">View Digital Twin</p>
                      <p className="text-xs text-muted-foreground">Continue with existing analysis</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform ml-auto" />
                  </Button>
                  
                  <Button
                    onClick={() => {
                      reanalyzeCV();
                      reset();
                    }}
                    variant="outline"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all group"
                  >
                    <Upload className="h-4 w-4 text-orange-500" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">Re-analyze CV</p>
                      <p className="text-xs text-muted-foreground">Upload a new CV file</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-orange-500 group-hover:translate-x-1 transition-transform ml-auto" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {phase === "idle" && (
            <div className="mt-12 w-full max-w-2xl">
              <label
                htmlFor="cv-file"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center transition-all hover:border-secondary hover:bg-card sm:p-16"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-6 font-display text-xl font-semibold text-foreground">Drop your CV here</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse · max 10MB</p>
                <input
                  ref={inputRef} id="cv-file" type="file"
                  accept=".pdf,.doc,.docx,.txt" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </label>

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-secondary" />POPIA compliant</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-secondary" />60-second results</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-secondary" />Always free</span>
              </div>
            </div>
          )}

          {phase === "analyzing" && (
            <div className="mt-12 w-full max-w-2xl">
              {fileName && (
                <div className="mx-auto mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="truncate font-medium">{fileName}</span>
                </div>
              )}

              <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="92" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <circle
                    cx="100" cy="100" r="92" fill="none"
                    stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 92}`}
                    strokeDashoffset={`${2 * Math.PI * 92 * (1 - overall / 100)}`}
                    className="transition-[stroke-dashoffset] duration-300 ease-out"
                    style={{ filter: "drop-shadow(0 0 8px hsl(var(--secondary) / 0.4))" }}
                  />
                </svg>
                <div className="absolute inset-6 rounded-full bg-secondary/5 blur-2xl animate-pulse" />
                <div className="relative flex flex-col items-center">
                  <span className="font-display text-5xl font-bold tabular-nums text-primary">
                    {overall}<span className="text-2xl text-muted-foreground">%</span>
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Analysing</span>
                </div>
              </div>

              <ol className="mt-10 space-y-1">
                {STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  const isDone = i < stageIndex;
                  const isActive = i === stageIndex;
                  const isPending = i > stageIndex;
                  return (
                    <li
                      key={stage.label}
                      className={`relative flex items-start gap-4 rounded-2xl px-4 py-3 transition-all duration-500 ${isActive ? "bg-card shadow-sm" : "bg-transparent"} ${isPending ? "opacity-40" : "opacity-100"}`}
                    >
                      <div className={`relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${isDone ? "bg-secondary text-white" : isActive ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />}
                        {isActive && <span className="absolute inset-0 rounded-xl ring-2 ring-secondary/40 animate-ping" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-sm font-semibold ${isActive || isDone ? "text-foreground" : "text-muted-foreground"}`}>{stage.label}</p>
                          {isActive && <span className="text-xs font-medium tabular-nums text-secondary">{stageProgress}%</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                        {isActive && (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-secondary transition-[width] duration-200 ease-out" style={{ width: `${stageProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-8 text-center">
                <button onClick={reset} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Cancel analysis
                </button>
              </div>
            </div>
          )}

          {phase === "complete" && (
            <div className="mt-12 w-full max-w-xl text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <p className="mt-6 text-base text-muted-foreground">
                Analysis complete! Your CV scored <span className="font-semibold text-foreground">{cvData?.score}/100</span> with "{cvData?.readinessLevel}" readiness level.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button onClick={() => navigate('/dashboard/twin')} className="shimmer">
                  Build my digital twin<ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={reset}>Analyse another CV</Button>
              </div>
            </div>
          )}
        </section>
      </main>
  );
}
