
// ── Upload modes ──────────────────────────────────────────────────────────
export type CVInputMode = 'file' | 'text';

// ── Readiness levels returned by the backend ──────────────────────────────
export type ReadinessLevel =
  | 'EXCEPTIONAL'
  | 'HIGH POTENTIAL'
  | 'INTERMEDIATE'
  | 'DEVELOPING'
  | 'NEEDS WORK';

// ── Score breakdown (mirrors analysis.scoreBreakdown in the Node response) ─
export interface ScoreBreakdown {
  formatting: number;
  contentQuality: number;
  readability: number;
  professionalism: number;
  grammar: number;
}

// ── Candidate info ─────────────────────────────────────────────────────────
export interface CandidateLinks {
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
}

export interface CandidateInfo {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  professionalSummary: string;
  links: CandidateLinks;
}

// ── Missing keywords shape ─────────────────────────────────────────────────
export interface MissingKeywords {
  critical: string[];
  recommended: string[];
  industry_specific: string[];
}

// ── Recruiter feedback ─────────────────────────────────────────────────────
export interface RecruiterFeedback {
  overall_verdict: string;
  [key: string]: unknown;
}

// ── Full analysis object (decrypted by Node before sending to frontend) ────
export interface CVAnalysis {
  targetRole: string;
  industry: string;
  analysisSource: 'ai' | 'fallback';

  // Scores
  atsScore: number;
  atsGrade: string;
  overallScore: number;
  jobMatchPercent: number | null;

  scoreBreakdown: ScoreBreakdown;
  candidateInfo: CandidateInfo;

  // Skills
  extractedSkills: string[];
  skillGaps: string[];
  topStrengths: string[];
  missingKeywords: MissingKeywords;
  matchingSkills: string[];

  // ATS issues
  parsingIssues: string[];
  formattingProblems: string[];
  missingSections: string[];

  // Grammar
  grammarQuality: string;
  grammarIssues: string[];

  // Feedback
  recruiterVerdict: string;
  recruiterFeedback: RecruiterFeedback | null;

  // Recommendations
  improvementsCritical: string[];
  improvementsHighPriority: string[];
  improvementsNiceToHave: string[];

  // Structured data
  education: unknown[];
  experience: unknown[];
  projects: unknown[];
  certifications: unknown[];

  // Subscription-gated (null for free users)
  salaryPrediction: unknown | null;
  careerRoadmap: unknown | null;
  provinceEarnings: unknown | null;
  marketBenchmarking: unknown | null;
  careerSimulation: unknown | null;
  interviewQuestions: unknown | null;
  linkedinSummary: string | null;
  coverLetter: string | null;
  careerRecommendations: unknown | null;
}

// ── Analyze endpoint responses ─────────────────────────────────────────────
export interface AnalyzeResponse {
  analysis: CVAnalysis;
  profileId: string;
  isSubscribed: boolean;
  analysisRemaining?: number;
  fallback?: boolean;
  message?: string;
}

// ── Revamped CV shape (returned inside revamp.revampedCv from Node) ────────
export interface RevampedCV {
  name: string;
  contactInfo: string;
  links: string;
  credentials: string;
  professionalSummary: string;
  technicalSkills: Record<string, string>;
  experience: Array<{
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    technologies: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    dates?: string;
    details?: string;
  }>;
  languages: string[];
  formattedText?: string;
}

// ── Revamp endpoint response ───────────────────────────────────────────────
export interface RevampResponse {
  revamp: {
    revampedAt: string | null;
    plainTextCv: string | null;
    revampSummary: string | null;
    revampedCv: RevampedCV | null;
  };
  profileId: string;
}

// ── Analyze form inputs ────────────────────────────────────────────────────
export interface AnalyzeFormValues {
  targetRole: string;
  industry: string;
  jobDescription?: string;
}

// ── Hook state ────────────────────────────────────────────────────────────
export type CVAnalyzerStep =
  | 'idle'
  | 'form'
  | 'scanning'
  | 'result'
  | 'revamping'
  | 'revamped';

export interface CVAnalyzerState {
  step: CVAnalyzerStep;
  inputMode: CVInputMode;
  file: File | null;
  cvText: string;
  formValues: AnalyzeFormValues;
  analysis: CVAnalysis | null;
  profileId: string | null;
  isSubscribed: boolean;
  analysisRemaining: number | null;
  isFallback: boolean;
  revampedCV: RevampedCV | null;
  error: string | null;
  isRateLimited: boolean;
  retryAfter: number | undefined;
  showPostModal: boolean;
}
