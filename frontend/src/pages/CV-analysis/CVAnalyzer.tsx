import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  Languages,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wand2,
} from "lucide-react";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import { analyzeCV } from "@/services/cvService";
import logo from "@/assets/images/empowerLogo.jpg";

type Phase = "idle" | "analyzing" | "complete" | "revamping" | "revamped";
type ResultView = "overview" | "match" | "coaching";

type AnalysisIssue = {
  lineIndex?: number;
  type: "formatting" | "weak-bullet" | "missing-section";
  title: string;
  suggestion: string;
};

type ScoreItem = {
  label: string;
  score: number;
  note: string;
};

type CvAnalysis = {
  score: number;
  breakdown: ScoreItem[];
  missingSections: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  issues: AnalysisIssue[];
  opportunityMatches?: {
    type: string;
    title: string;
    projection: string;
    nextStep: string;
  }[];
  revampedCv?: string;
};

const uploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024, "CV must be smaller than 10MB"),
  type: z.string().optional(),
});

const jobDescriptionSchema = z.string().trim().max(6000, "Job description must be shorter than 6,000 characters");

const STAGES = [
  {
    icon: FileText,
    label: "Parsing document",
    detail: "Extracting structure, sections, and metadata",
  },
  {
    icon: Languages,
    label: "Reading context",
    detail: "Understanding language, tone, and intent",
  },
  {
    icon: Brain,
    label: "Identifying skills",
    detail: "Cross-referencing 12,400+ skill signals",
  },
  {
    icon: Target,
    label: "Matching pathways",
    detail: "Aligning with 5 career trajectories",
  },
  {
    icon: Sparkles,
    label: "Composing insights",
    detail: "Crafting personalised recommendations",
  },
];

const STAGE_DURATION = 1600; // ms per stage

const ATS_IMPROVEMENTS = [
  "Single-column ATS structure with standard section headings",
  "Keyword-dense professional summary aligned to target roles",
  "Achievement bullets rewritten with action verbs and measurable impact",
  "Clean formatting with no tables, graphics, or parsing blockers",
];

const REVAMPED_SCORE = 94;

const IMPROVEMENT_AREAS = [
  {
    title: "Make every bullet outcome-led",
    detail: "Start with an action verb, describe the work, then add a result, metric, or business impact.",
    priority: "High impact",
  },
  {
    title: "Use ATS-safe formatting",
    detail: "Avoid tables, text boxes, icons, columns, headers, footers, and graphic skill bars.",
    priority: "Critical",
  },
  {
    title: "Strengthen keyword match",
    detail: "Mirror the language from target job descriptions across skills, summary, and experience sections.",
    priority: "High impact",
  },
];

const REVAMP_STEPS = ["Cleaning layout", "Rewriting bullets", "Adding keywords", "Building export"];

const REQUIRED_SECTIONS = ["summary", "skills", "experience", "education"];
const DEFAULT_KEYWORDS = [
  "communication",
  "leadership",
  "project",
  "data",
  "analysis",
  "stakeholder",
  "reporting",
  "process",
  "collaboration",
  "problem solving",
];

const SAMPLE_CV = `Professional Summary
Motivated professional with experience supporting teams, communicating with stakeholders, and completing projects.

Skills
Communication, project coordination, reporting, data analysis, stakeholder management

Experience
Project Assistant | Example Company | 2022 - Present
- Responsible for weekly reports and team updates.
- Helped with project planning and stakeholder communication.
- Worked on process documentation.

Education
Diploma in Business Management | Example College`;

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const extractKeywords = (text: string) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && !["their", "there", "with", "from", "this", "that", "will", "your", "have", "candidate", "experience"].includes(word));

  return Array.from(new Set(words)).slice(0, 18);
};

const analyseCv = (cvText: string, jobDescription: string): CvAnalysis => {
  const lower = cvText.toLowerCase();
  const lines = cvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const targetKeywords = jobDescription.trim() ? extractKeywords(jobDescription) : DEFAULT_KEYWORDS;
  const matchedKeywords = targetKeywords.filter((keyword) => lower.includes(keyword.toLowerCase()));
  const missingKeywords = targetKeywords.filter((keyword) => !lower.includes(keyword.toLowerCase())).slice(0, 12);
  const missingSections = REQUIRED_SECTIONS.filter((section) => !lower.includes(section));
  const riskyFormatting = lines.filter((line) => /[│|•●◆■▶✓★]/.test(line) || line.split(/\s{3,}/).length > 2).length;
  const bulletLines = lines.filter((line) => /^[-•*]/.test(line.trim()));
  const weakBullets = bulletLines.filter((line) => !/(increased|reduced|improved|delivered|created|managed|led|built|achieved|saved|%|\d+)/i.test(line));
  const keywordScore = targetKeywords.length ? (matchedKeywords.length / targetKeywords.length) * 100 : 82;
  const sectionScore = ((REQUIRED_SECTIONS.length - missingSections.length) / REQUIRED_SECTIONS.length) * 100;
  const formattingScore = clampScore(100 - riskyFormatting * 14);
  const impactScore = bulletLines.length ? ((bulletLines.length - weakBullets.length) / bulletLines.length) * 100 : 35;
  const score = clampScore(keywordScore * 0.3 + sectionScore * 0.25 + formattingScore * 0.25 + impactScore * 0.2);
  const issues: AnalysisIssue[] = [];

  lines.forEach((line, lineIndex) => {
    if (/[│|•●◆■▶✓★]/.test(line) || line.split(/\s{3,}/).length > 2) {
      issues.push({ lineIndex, type: "formatting", title: "Risky ATS formatting", suggestion: "Use plain text, standard hyphen bullets, and a single-column layout." });
    }
    if (/^[-•*]/.test(line.trim()) && !/(increased|reduced|improved|delivered|created|managed|led|built|achieved|saved|%|\d+)/i.test(line)) {
      issues.push({ lineIndex, type: "weak-bullet", title: "Weak bullet", suggestion: "Rewrite with an action verb, scope, and measurable result." });
    }
  });

  missingSections.forEach((section) => {
    issues.push({ type: "missing-section", title: `Missing ${section} section`, suggestion: `Add a clear ${section.toUpperCase()} heading so ATS systems can classify your content.` });
  });

  return {
    score,
    breakdown: [
      { label: "ATS parsing", score: formattingScore, note: riskyFormatting ? "Remove symbols, columns, tables, or decorative separators." : "Formatting is clean and easy to parse." },
      { label: "Keywords", score: clampScore(keywordScore), note: missingKeywords.length ? "Add missing terms from the target job description." : "Strong keyword coverage for the target role." },
      { label: "Impact", score: clampScore(impactScore), note: weakBullets.length ? "Some bullets read like duties instead of achievements." : "Bullets show clear value and outcomes." },
      { label: "Structure", score: clampScore(sectionScore), note: missingSections.length ? `Missing: ${missingSections.join(", ")}.` : "Core ATS sections are present." },
    ],
    missingSections,
    missingKeywords,
    matchedKeywords,
    issues,
  };
};

const CVAnalyzer = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0); // 0-100 for current stage
  const [revampedCv, setRevampedCv] = useState("");
  const [cvText, setCvText] = useState(SAMPLE_CV);
  const [jobDescription, setJobDescription] = useState("");
  const [inputError, setInputError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<CvAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [resultView, setResultView] = useState<ResultView>("overview");
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  const localAnalysis = useMemo(() => analyseCv(cvText, jobDescription), [cvText, jobDescription]);
  const analysis = aiAnalysis || localAnalysis;
  const issueByLine = useMemo(() => {
    const map = new Map<number, AnalysisIssue[]>();
    analysis.issues.forEach((issue) => {
      if (typeof issue.lineIndex !== "number") return;
      map.set(issue.lineIndex, [...(map.get(issue.lineIndex) || []), issue]);
    });
    return map;
  }, [analysis.issues]);
  const previewLines = useMemo(() => cvText.split(/\r?\n/).filter((line) => line.trim().length > 0), [cvText]);

  // Drive the multi-stage progress
  useEffect(() => {
    if (phase !== "analyzing") return;

    let stage = 0;
    let stageStart = performance.now();
    setStageIndex(0);
    setStageProgress(0);

    const tick = (now: number) => {
      const elapsed = now - stageStart;
      const t = Math.min(1, elapsed / STAGE_DURATION);
      // ease-in-out
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
          setPhase("complete");
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "complete") return;

    let cancelled = false;
    const runAiAnalysis = async () => {
      setAnalysisError("");
      try {
        // Create a File object from the CV text for the existing service
        const cvFile = new File([cvText], "cv.txt", { type: "text/plain" });
        const data = await analyzeCV(cvFile, jobDescription);
        
        if (cancelled) return;
        
        // Transform the existing CV analysis to match our expected format
        const transformedAnalysis: CvAnalysis = {
          score: data.score || 75,
          breakdown: [
            { label: "ATS parsing", score: data.score || 75, note: data.weaknesses?.join(', ') || "Good ATS compatibility" },
            { label: "Keywords", score: data.sections?.skills?.length ? 85 : 70, note: data.missingKeywords?.length ? "Add missing keywords" : "Good keyword coverage" },
            { label: "Impact", score: data.sections?.achievements?.length ? 80 : 65, note: data.recommendations?.join(', ') || "Add more measurable impacts" },
            { label: "Structure", score: data.sections?.about ? 85 : 70, note: data.sections?.about ? "Good structure" : "Add summary section" }
          ],
          missingSections: [],
          missingKeywords: data.missingKeywords || [],
          matchedKeywords: data.sections?.skills || [],
          issues: [],
          opportunityMatches: data.incomeIdeas?.map(idea => ({
            type: "Income",
            title: idea.title,
            projection: idea.potential,
            nextStep: idea.description
          })) || [
            { type: "Jobs", title: "Entry-level positions", projection: "R8k–R15k/month", nextStep: "Apply for entry-level roles" },
            { type: "Learning", title: "Skills development", projection: "Improve earning potential", nextStep: "Focus on technical skills" }
          ]
        };
        
        setAiAnalysis(transformedAnalysis);
      } catch (error) {
        if (cancelled) return;
        setAnalysisError("AI analysis could not finish right now, so we are showing the local CV scan.");
      }
    };

    runAiAnalysis();
    return () => {
      cancelled = true;
    };
  }, [phase, cvText, jobDescription]);

  const handleFile = useCallback(async (file: File) => {
    const parsed = uploadSchema.safeParse({ name: file.name, size: file.size, type: file.type });
    if (!parsed.success) {
      setInputError(parsed.error.issues[0]?.message || "Please upload a valid CV file.");
      return;
    }

    setInputError("");
    setFileName(file.name);
    try {
      const text = await file.text();
      setCvText(text.trim().length > 80 ? text.slice(0, 20000) : SAMPLE_CV);
    } catch {
      setCvText(SAMPLE_CV);
    }
    setPhase("analyzing");
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
    setRevampedCv("");
    setInputError("");
    setAiAnalysis(null);
    setAnalysisError("");
    setResultView("overview");
  };

  const handleJobDescriptionChange = (value: string) => {
    const parsed = jobDescriptionSchema.safeParse(value);
    if (!parsed.success) {
      setInputError(parsed.error.issues[0]?.message || "Job description is too long.");
      return;
    }
    setInputError("");
    setJobDescription(parsed.data);
  };

  const buildRevampedCv = () => {
    const baseName = fileName?.replace(/\.[^/.]+$/, "") || "Candidate";
    const content = analysis.revampedCv || `${baseName.toUpperCase()}\nCity, Country | phone@email.com | LinkedIn URL | Portfolio URL\n\nPROFESSIONAL SUMMARY\nOutcome-focused professional with experience evidenced in the uploaded CV. This version should be refined with exact achievements, tools, qualifications, and measurable outcomes from the candidate's real background.\n\nCORE SKILLS\n${analysis.matchedKeywords.length ? analysis.matchedKeywords.join(" | ") : "Communication | Problem Solving | Collaboration | Learning Agility"}\n\nOPPORTUNITY DIRECTION\n${(analysis.opportunityMatches || []).map((item) => `- ${item.type}: ${item.title} (${item.projection})`).join("\n") || "- Add jobs, bursaries, learnerships, ventures, and skill bridges that match the candidate profile."}\n\nPROFESSIONAL EXPERIENCE\nMost Recent Role | Company Name | Month Year - Present\n- Rewrite each real CV responsibility into an action-led achievement with proof, tools, and impact.\n\nEDUCATION\nQualification | Institution | Year\n`;

    setPhase("revamping");
    window.setTimeout(() => {
      setRevampedCv(content);
      setPhase("revamped");
    }, 1200);
  };

  const exportRevampedCv = async () => {
    const baseName = fileName?.replace(/\.[^/.]+$/, "") || "ats-cv";
    const sections = revampedCv.split("\n\n").filter(Boolean);
    const children = sections.flatMap((section, sectionIndex) => {
      const [heading, ...bodyLines] = section.split("\n");
      const isTitle = sectionIndex === 0;

      if (isTitle) {
        const [name, contact] = section.split("\n");
        return [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: name, bold: true, size: 34, color: "17345C" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [new TextRun({ text: contact || "City, Country | phone@email.com | LinkedIn URL", size: 20, color: "5B677A" })],
          }),
        ];
      }

      return [
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E86B2D", space: 1 } },
          spacing: { before: 160, after: 120 },
          children: [new TextRun({ text: heading, bold: true, size: 22, color: "17345C" })],
        }),
        ...bodyLines.map((line) =>
          new Paragraph({
            bullet: line.trim().startsWith("-") ? { level: 0 } : undefined,
            spacing: { after: 90 },
            children: [new TextRun({ text: line.replace(/^-\s*/, ""), size: 21, color: "1F2937" })],
          }),
        ),
      ];
    });

    const doc = new Document({
      styles: {
        default: { document: { run: { font: "Arial", size: 21, color: "1F2937" } } },
        paragraphStyles: [
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { font: "Arial", bold: true, size: 22, color: "17345C" },
            paragraph: { spacing: { before: 160, after: 120 }, outlineLevel: 1 },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 900, right: 900, bottom: 900, left: 900 },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName}-ats-revamp.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Overall progress across all stages
  const overall = Math.round(
    ((stageIndex + stageProgress / 100) / STAGES.length) * 100,
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="EmpowAI logo"
              className="h-9 w-9 rounded-md object-cover"
              width={36}
              height={36}
            />
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              EmpowAI
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {/* Ambient background orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-10 sm:py-16 lg:py-20">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-secondary" />
            Step 1 · CV skills and opportunity analysis
          </span>

          <h1 className="mt-5 max-w-4xl text-center font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            {phase === "revamped" ? (
              <>Your ATS CV is <em className="font-display italic text-secondary">ready.</em></>
            ) : phase === "revamping" ? (
              <>Rewriting for <em className="font-display italic text-secondary">ATS.</em></>
            ) : phase === "complete" ? (
              <>Your CV score is <em className="font-display italic text-secondary">{analysis.score}/100.</em></>
            ) : phase === "analyzing" ? (
              <>Reading between the <em className="font-display italic text-secondary">lines.</em></>
            ) : (
              <>Upload your CV. <em className="font-display italic text-secondary">We'll do the rest.</em></>
            )}
          </h1>

          <p className="mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            {phase === "revamped"
              ? "Export your clean, ATS-compliant CV file and keep improving it for each role."
              : phase === "revamping"
              ? "Converting your analysis into a recruiter-friendly, ATS-safe structure."
              : phase === "complete"
              ? "See the skills we found, what is limiting you, and which jobs, bursaries, learnerships, ventures, or skill bridges fit next."
              : phase === "analyzing"
              ? "Our AI is mapping your experience to opportunities across South Africa."
              : "Upload your CV first. The revamp is optional, then your digital twin uses the analysis to map opportunities."}
          </p>

          {/* ===== STATE: IDLE — Upload zone ===== */}
          {phase === "idle" && (
            <div className="mt-8 w-full max-w-2xl animate-fade-up sm:mt-12">
              <label
                htmlFor="cv-file"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card/50 p-8 text-center transition-all hover:border-secondary hover:bg-card sm:p-16"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-6 font-display text-xl font-semibold text-foreground">
                  Drop your CV here
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse · max 10MB
                </p>
                <input
                  ref={inputRef}
                  id="cv-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:gap-6">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                  POPIA compliant
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                  60-second results
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                  Always free
                </span>
              </div>
            </div>
          )}

          {/* ===== STATE: ANALYZING — Premium progress ===== */}
          {phase === "analyzing" && (
            <div className="mt-8 w-full max-w-2xl animate-fade-up sm:mt-12">
              {/* File chip */}
              {fileName && (
                <div className="mx-auto mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="truncate font-medium">{fileName}</span>
                </div>
              )}

              {/* Orbital ring with overall % */}
              <div className="relative mx-auto flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">
                {/* Outer rotating ring */}
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 200 200"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="4"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 92}`}
                    strokeDashoffset={`${2 * Math.PI * 92 * (1 - overall / 100)}`}
                    className="transition-[stroke-dashoffset] duration-300 ease-out"
                    style={{
                      filter: "drop-shadow(0 0 8px hsl(var(--secondary) / 0.4))",
                    }}
                  />
                </svg>

                {/* Pulsing inner glow */}
                <div className="absolute inset-6 rounded-full bg-secondary/5 blur-2xl animate-pulse" />

                {/* Center content */}
                <div className="relative flex flex-col items-center">
                  <span className="font-display text-4xl font-bold tabular-nums text-primary sm:text-5xl">
                    {overall}
                    <span className="text-2xl text-muted-foreground">%</span>
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
                    Analysing
                  </span>
                </div>
              </div>

              {/* Stage list */}
              <ol className="mt-8 space-y-1 sm:mt-10">
                {STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  const isDone = i < stageIndex;
                  const isActive = i === stageIndex;
                  const isPending = i > stageIndex;
                  return (
                    <li
                      key={stage.label}
                      className={`relative flex items-start gap-3 rounded-2xl px-3 py-3 transition-all duration-500 sm:gap-4 sm:px-4 ${
                        isActive
                          ? "bg-card shadow-sm"
                          : "bg-transparent"
                      } ${isPending ? "opacity-40" : "opacity-100"}`}
                    >
                      {/* Icon */}
                      <div
                        className={`relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                          isDone
                            ? "bg-secondary text-white"
                            : isActive
                            ? "bg-secondary/10 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Icon
                            className={`h-4 w-4 ${
                              isActive ? "animate-pulse" : ""
                            }`}
                          />
                        )}
                        {isActive && (
                          <span className="absolute inset-0 rounded-xl ring-2 ring-secondary/40 animate-ping" />
                        )}
                      </div>

                      {/* Label + detail */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p
                            className={`text-sm font-semibold ${
                              isActive || isDone
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {stage.label}
                          </p>
                          {isActive && (
                            <span className="text-xs font-medium tabular-nums text-secondary">
                              {stageProgress}%
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {stage.detail}
                        </p>

                        {/* Per-stage thin progress bar */}
                        {isActive && (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-secondary transition-[width] duration-200 ease-out"
                              style={{ width: `${stageProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Cancel */}
              <div className="mt-8 text-center">
                <button
                  onClick={reset}
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Cancel analysis
                </button>
              </div>
            </div>
          )}

          {/* ===== STATE: COMPLETE ===== */}
          {(phase === "complete" || phase === "revamping" || phase === "revamped") && (
            <div className="mt-8 w-full max-w-6xl animate-fade-up text-center sm:mt-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                {phase === "revamping" ? (
                  <Wand2 className="h-9 w-9 animate-pulse" />
                ) : phase === "revamped" ? (
                  <ShieldCheck className="h-9 w-9" />
                ) : (
                  <CheckCircle2 className="h-9 w-9" />
                )}
              </div>
              {phase === "complete" && (
                <>
                  <div className="mx-auto mt-8 grid max-w-3xl gap-3 rounded-3xl border border-border bg-card p-4 text-left shadow-sm sm:grid-cols-[auto_1fr] sm:p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                      <Gauge className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Your readiness score</p>
                      <p className="mt-1 font-display text-4xl font-bold text-primary">{analysis.score}<span className="text-xl text-muted-foreground">/100</span></p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-secondary transition-[width] duration-700" style={{ width: `${analysis.score}%` }} />
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Next best step: {analysis.score < 75 ? "revamp your CV before applications, then build your opportunity twin." : "build your opportunity twin and explore matched pathways."}
                      </p>
                    </div>
                  </div>

                  <div className="mx-auto mt-5 grid max-w-3xl gap-2 rounded-2xl bg-muted/40 p-1 sm:grid-cols-3">
                    {([
                      ["overview", "Overview"],
                      ["match", "Target match"],
                      ["coaching", "CV fixes"],
                    ] as const).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setResultView(id)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${resultView === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {resultView === "match" && <div className="mt-8 rounded-3xl border border-border bg-card p-4 text-left shadow-sm sm:p-6">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-secondary" />
                      <h2 className="font-display text-2xl font-semibold text-foreground">Target job match</h2>
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={(event) => handleJobDescriptionChange(event.target.value)}
                      className="mt-4 min-h-36 w-full resize-y rounded-2xl border border-input bg-background p-4 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="Paste the job description here to compare ATS keywords and missing terms..."
                      maxLength={6000}
                    />
                    {inputError && (
                      <p className="mt-2 flex items-center gap-2 text-xs font-medium text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {inputError}
                      </p>
                    )}
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Search className="h-4 w-4 text-secondary" />Matched terms</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(analysis.matchedKeywords.length ? analysis.matchedKeywords : ["Paste a job description"]).map((term) => (
                            <span key={term} className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{term}</span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Target className="h-4 w-4 text-secondary" />Missing terms</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(analysis.missingKeywords.length ? analysis.missingKeywords : ["No major gaps found"]).map((term) => (
                            <span key={term} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">{term}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>}

                  {analysisError && (
                    <p className="mt-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-left text-sm text-muted-foreground">
                      {analysisError}
                    </p>
                  )}

                  {resultView === "overview" && <div className="mt-5 grid gap-5 text-left lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-secondary" />
                        <h2 className="font-display text-2xl font-semibold text-foreground">Where to improve</h2>
                      </div>
                      <div className="mt-5 space-y-4">
                        {analysis.breakdown.map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-foreground">{item.label}</span>
                              <span className="font-semibold tabular-nums text-secondary">{item.score}/100</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-secondary" style={{ width: `${item.score}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>}

                  {resultView === "overview" && <div className="mt-5 grid gap-4 text-left md:grid-cols-3">
                    {IMPROVEMENT_AREAS.map((item) => (
                      <div key={item.title} className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
                        <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{item.priority}</span>
                        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    ))}
                  </div>}

                  {resultView === "overview" && (analysis.opportunityMatches?.length || 0) > 0 && (
                    <div className="mt-5 rounded-3xl border border-border bg-card p-4 text-left shadow-sm sm:p-6">
                      <h2 className="font-display text-2xl font-semibold text-foreground">Opportunity pathways from your skills</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This is not only job matching — it includes income routes, learning routes, and venture options.
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {analysis.opportunityMatches?.map((item) => (
                          <div key={`${item.type}-${item.title}`} className="rounded-2xl bg-muted/40 p-4">
                            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{item.type}</span>
                            <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                            <p className="mt-1 text-sm font-semibold text-primary">{item.projection}</p>
                            <p className="mt-2 text-sm text-muted-foreground">Next: {item.nextStep}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultView === "coaching" && <div className="mt-5 rounded-3xl border border-border bg-card p-4 text-left shadow-sm sm:p-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-secondary" />
                      <h2 className="font-display text-2xl font-semibold text-foreground">Inline CV coaching</h2>
                    </div>
                    <div className="mt-4 max-h-[28rem] space-y-3 overflow-auto rounded-2xl bg-muted/30 p-2 sm:p-3">
                      {previewLines.map((line, index) => {
                        const issues = issueByLine.get(index) || [];
                        return (
                          <div key={`${line}-${index}`} className={`rounded-2xl border p-3 ${issues.length ? "border-secondary/40 bg-secondary/10" : "border-border bg-background"}`}>
                            <p className="whitespace-pre-wrap text-sm text-foreground">{line}</p>
                            {issues.map((issue) => (
                              <div key={`${issue.title}-${issue.suggestion}`} className="mt-2 rounded-xl bg-background/80 p-3 text-xs">
                                <p className="font-semibold text-secondary">{issue.title}</p>
                                <p className="mt-1 text-muted-foreground">Fix it: {issue.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      {analysis.issues.filter((issue) => issue.type === "missing-section").map((issue) => (
                        <div key={issue.title} className="rounded-2xl border border-secondary/40 bg-secondary/10 p-3">
                          <p className="text-sm font-semibold text-secondary">{issue.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Fix it: {issue.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>}

                  <div className="mt-5 rounded-3xl border border-border bg-card p-4 text-left shadow-sm sm:p-6">
                    <h2 className="font-display text-2xl font-semibold text-foreground">Optional revamp before your twin</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Best flow: analyse the CV, optionally fix the CV for applications, then build the digital twin for broader career and income navigation.</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {ATS_IMPROVEMENTS.map((item) => (
                        <div key={item} className="flex items-start gap-2 rounded-2xl bg-muted/40 px-4 py-3 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {phase === "revamping" && (
                <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-border bg-card p-4 text-left shadow-sm sm:p-6">
                  <p className="text-base text-muted-foreground">
                    Rebuilding the full CV with ATS-safe headings, clean bullet hierarchy,
                    recruiter-readable keywords, and a complete export-ready template.
                  </p>
                  <div className="mt-6 space-y-3">
                    {REVAMP_STEPS.map((step, index) => (
                      <div key={step} className="flex items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 text-sm font-bold text-secondary">
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {phase === "revamped" && (
                <div className="mt-8 grid gap-5 text-left lg:grid-cols-[0.75fr_1.25fr]">
                  <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <p className="text-sm font-semibold text-muted-foreground">New ATS score</p>
                    <p className="mt-1 font-display text-4xl font-bold text-primary sm:text-5xl">{REVAMPED_SCORE}<span className="text-2xl text-muted-foreground">/100</span></p>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${REVAMPED_SCORE}%` }} />
                    </div>
                    <div className="mt-5 space-y-3">
                      {ATS_IMPROVEMENTS.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Complete ATS CV template</p>
                        <p className="text-xs text-muted-foreground">A polished Word template with ATS-safe headings, spacing, and recruiter-friendly structure.</p>
                      </div>
                      <FileText className="h-5 w-5 text-secondary" />
                    </div>
                    <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-4 text-xs leading-relaxed text-muted-foreground sm:p-5">
                      {revampedCv}
                    </pre>
                  </div>
                </div>
              )}
              <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                {phase === "complete" && (
                  <Button variant="cta" size="lg" onClick={buildRevampedCv} className="shimmer">
                    Revamp ATS CV
                    <Wand2 className="ml-1 h-4 w-4" />
                  </Button>
                )}
                {phase === "revamped" && (
                  <Button variant="cta" size="lg" onClick={exportRevampedCv} className="shimmer">
                    Export Word CV
                    <Download className="ml-1 h-4 w-4" />
                  </Button>
                )}
                {phase !== "revamping" && (
                  <Button variant="outline" size="lg" onClick={() => navigate("/digital-twin")}>
                    Build digital twin
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="lg" onClick={reset}>
                  Analyse another CV
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
};

export default CVAnalyzer;
