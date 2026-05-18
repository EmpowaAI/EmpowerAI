import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TrendingUp,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Briefcase,
  BookOpen,
  DollarSign,
  Loader2,
} from "lucide-react";
import { twinAPI } from "../lib/api";

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "secondary" | "outline" }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background text-foreground",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </div>
  );
};

type SectionKey = "skills" | "missing" | "recommendations" | "next";

interface TwinData {
  score: number;
  marketValue: string;
  incomePotential: string;
  strongestPath: string;
  confidence: string;
  summary: string;
  coreSkills: string[];
  skillsNeedingProof: string[];
  opportunities: Array<{
    type: string;
    title: string;
    projection: string;
    nextStep: string;
  }>;
  nextSteps: string[];
}

const DEMAND_TO_MARKET_VALUE: Record<string, string> = {
  CRITICAL: "In High Demand",
  HIGH: "Growing",
  MEDIUM: "Moderate",
  LOW: "Early Stage",
};

const DEMAND_TO_CONFIDENCE: Record<string, string> = {
  CRITICAL: "High confidence",
  HIGH: "High confidence",
  MEDIUM: "Medium confidence",
  LOW: "Building confidence",
};

function formatIncomeRange(range: { min?: number; max?: number; currency?: string } | undefined): string {
  if (!range?.min || !range?.max) return "R5,000 – R15,000 / month";
  return `R${range.min.toLocaleString("en-ZA")} – R${range.max.toLocaleString("en-ZA")} / month`;
}

function mapTwinToDisplay(raw: any): TwinData {
  const identity = raw.identity || {};
  const economy = raw.economy || {};
  const skills = raw.skills || {};
  const intelligence = raw.intelligence || {};

  const score = economy.employabilityScore ?? economy.marketValueScore ?? 50;
  const demandLevel: string = economy.demandLevel ?? "MEDIUM";
  const incomePotential = formatIncomeRange(economy.incomePotentialRange);

  const coreSkills: string[] = Array.isArray(skills.core) ? skills.core.slice(0, 8) : [];
  const missingSkills: string[] = Array.isArray(skills.missing) ? skills.missing.slice(0, 8) : [];
  const emergingSkills: string[] = Array.isArray(skills.emerging) ? skills.emerging : [];
  const monetizableSkills: string[] = Array.isArray(skills.monetizable) ? skills.monetizable : [];
  const recommendations: string[] = Array.isArray(intelligence.recommendations) ? intelligence.recommendations : [];

  const opportunities = [
    {
      type: "Jobs",
      title: identity.targetRole
        ? `${identity.targetRole} roles matching your profile`
        : "Entry-level roles matching your current profile",
      projection: incomePotential,
      nextStep: recommendations[0] ?? "Improve your CV bullets with outcomes and tools used.",
    },
    {
      type: "Study & Funding",
      title: "Learnerships, bursaries, and short skills programmes",
      projection: "Can unlock better income pathways",
      nextStep: emergingSkills.length > 0
        ? `Focus on: ${emergingSkills.slice(0, 2).join(", ")}`
        : "Choose one scarce skill connected to your profile.",
    },
    {
      type: "Side Income",
      title: "Monetizable skills from your profile",
      projection: "R2,000 – R10,000 / month early potential",
      nextStep: monetizableSkills.length > 0
        ? `Package your ${monetizableSkills[0]} skills into a service offering`
        : "Package one current skill into a simple offer.",
    },
  ];

  const nextSteps = recommendations.length > 0
    ? recommendations.slice(0, 4)
    : [
        "Run your CV through the CV Analyzer.",
        "Fix your top 3 weak CV bullets.",
        "Pick one realistic opportunity path.",
        "Take one action this week.",
      ];

  const summary =
    recommendations[0] ??
    (Array.isArray(intelligence.strengths) ? intelligence.strengths[0] : undefined) ??
    "Your twin is ready. Explore your opportunities and skills below.";

  return {
    score,
    marketValue: DEMAND_TO_MARKET_VALUE[demandLevel] ?? "Growing",
    incomePotential,
    strongestPath: identity.targetRole ?? "Entry-level work + skill bridge",
    confidence: DEMAND_TO_CONFIDENCE[demandLevel] ?? "Medium confidence",
    summary,
    coreSkills,
    skillsNeedingProof: missingSkills,
    opportunities,
    nextSteps,
  };
}

const DigitalTwin = () => {
  const [selectedPrompt, setSelectedPrompt] = useState("What should I do first?");
  const [openSections, setOpenSections] = useState<SectionKey[]>(["skills", "missing", "next"]);
  const [twinData, setTwinData] = useState<TwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTwin() {
      try {
        setLoading(true);
        setError(null);
        const response = await twinAPI.get();
        if (cancelled) return;

        const raw = response?.data?.twin ?? response?.twin ?? null;
        if (raw) {
          setTwinData(mapTwinToDisplay(raw));
        } else {
          setTwinData(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load your twin.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTwin();
    return () => { cancelled = true; };
  }, []);

  const toggleSection = (section: SectionKey) => {
    setOpenSections((current) =>
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section]
    );
  };

  const guidance = useMemo(() => {
    if (selectedPrompt.includes("missing")) {
      return {
        title: "Skills that need stronger proof",
        message: "You may already have some of these skills, but your profile needs clearer examples, projects, tools, or results to prove them.",
        steps: [
          "Add one measurable result to your CV.",
          "Mention the tools you used.",
          "Create one small project that proves the skill.",
        ],
      };
    }
    if (selectedPrompt.includes("jobs")) {
      return {
        title: "Jobs that fit your current profile",
        message: "Start with roles that match your current evidence, then use short skills training to move into better-paying paths.",
        steps: [
          "Apply for entry-level roles aligned to your current skills.",
          "Improve your CV bullets before applying.",
          "Track which roles keep appearing and learn the missing skill.",
        ],
      };
    }
    if (selectedPrompt.includes("monetize")) {
      return {
        title: "Ways to earn from what you already know",
        message: "Some skills can become small services before they become full careers.",
        steps: [
          "Pick one skill people already ask you for help with.",
          "Turn it into a small service offer.",
          "Test it with one real person or local business.",
        ],
      };
    }
    if (selectedPrompt.includes("income")) {
      return {
        title: "How to increase your income path",
        message: "Income grows when your profile shows proof, tools, outcomes, and a clearer direction.",
        steps: [
          "Choose one higher-value skill bridge.",
          "Build proof through a project or certificate.",
          "Update your CV with numbers and outcomes.",
        ],
      };
    }
    return {
      title: "Your next best move",
      message: "Start by improving the proof in your CV, then compare jobs, learning paths, and side-income options.",
      steps: [
        "Fix your CV evidence first.",
        "Choose one realistic opportunity path.",
        "Take one action this week.",
      ],
    };
  }, [selectedPrompt]);

  const quickPrompts = [
    "What skills am I missing?",
    "What jobs fit me now?",
    "What can I monetize?",
    "How do I increase my income?",
    "What should I do first?",
  ];

  const getScoreLabel = (score: number) => {
    if (score < 40) return "Early-stage profile";
    if (score < 60) return "Building foundation";
    if (score < 80) return "Growing potential";
    return "Opportunity-ready";
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return "text-orange-600";
    if (score < 60) return "text-yellow-600";
    if (score < 80) return "text-blue-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your Economic Twin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-destructive font-medium">Could not load your twin</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!twinData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">Your Economic Twin isn't built yet</h2>
              <p className="text-muted-foreground">
                Complete your CV analysis first. Your twin is generated automatically from your CV data and updated after each AI coaching session.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/cv-analyzer">
                <Button className="w-full sm:w-auto">
                  Analyse My CV
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/twin-builder">
                <Button variant="outline" className="w-full sm:w-auto">
                  Build via Chat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Your Economic Twin</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See where your current skills can take you, what proof you still need,
            and the next move that can open better opportunities.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Employability Score */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(twinData.score)} mb-2`}>
                    {twinData.score}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">Employability Score</div>
                  <div className="text-sm font-medium">{getScoreLabel(twinData.score)}</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${twinData.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {twinData.summary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Market Value */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Market Value</span>
                </div>
                <div className="text-2xl font-semibold text-green-600 mb-1">
                  {twinData.marketValue}
                </div>
                <p className="text-xs text-muted-foreground">
                  {twinData.confidence}
                </p>
              </CardContent>
            </Card>

            {/* Income Potential */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Income Potential</span>
                </div>
                <div className="text-xl font-semibold text-blue-600 mb-1">
                  {twinData.incomePotential}
                </div>
                <p className="text-xs text-muted-foreground">
                  This can improve as your CV shows clearer outcomes, tools, and projects.
                </p>
              </CardContent>
            </Card>

            {/* Best Current Path */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Best Current Path</span>
                </div>
                <div className="text-lg font-semibold text-purple-600 mb-1">
                  {twinData.strongestPath}
                </div>
                <p className="text-xs text-muted-foreground">
                  Start with roles that match your current evidence, then bridge into higher-value skills.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Twin Guidance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Twin Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Choose what you want help with. Your twin will keep it simple and practical.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                  {quickPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant={selectedPrompt === prompt ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPrompt(prompt)}
                      className="text-xs h-auto py-2 px-3 whitespace-normal"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{guidance.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{guidance.message}</p>
                  <div className="space-y-2">
                    {guidance.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Here CTA */}
            <Card className="border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Start Here</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your strongest next move is to improve your CV evidence before applying widely.
                    </p>
                    <Link to="/cv-analyzer">
                      <Button className="w-full sm:w-auto">
                        Open CV Analyzer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opportunity Mapping Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {twinData.opportunities.map((opportunity, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {opportunity.type === "Jobs" && <Briefcase className="h-4 w-4" />}
                      {opportunity.type === "Study & Funding" && <BookOpen className="h-4 w-4" />}
                      {opportunity.type === "Side Income" && <DollarSign className="h-4 w-4" />}
                      <span className="font-medium text-sm">{opportunity.type}</span>
                    </div>
                    <h4 className="font-semibold mb-2">{opportunity.title}</h4>
                    <div className="text-sm text-muted-foreground mb-3">
                      {opportunity.projection}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {opportunity.nextStep}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Expandable Insight Sections */}
            <div className="space-y-4">
              {/* Core Skills */}
              <Card>
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-semibold"
                    onClick={() => toggleSection("skills")}
                  >
                    Core Skills
                    {openSections.includes("skills") ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {openSections.includes("skills") && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        These are skills your profile already suggests. The goal is to show stronger proof.
                      </p>
                      {twinData.coreSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {twinData.coreSkills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Complete your CV analysis to see your core skills.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills Needing Proof */}
              <Card>
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-semibold"
                    onClick={() => toggleSection("missing")}
                  >
                    Skills Needing Proof
                    {openSections.includes("missing") ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {openSections.includes("missing") && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        These may become stronger opportunities if you add examples, results, or projects.
                      </p>
                      {twinData.skillsNeedingProof.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {twinData.skillsNeedingProof.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skill gaps detected — great profile coverage!</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-semibold"
                    onClick={() => toggleSection("next")}
                  >
                    Next Steps
                    {openSections.includes("next") ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {openSections.includes("next") && (
                    <div className="mt-4 space-y-2">
                      {twinData.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
