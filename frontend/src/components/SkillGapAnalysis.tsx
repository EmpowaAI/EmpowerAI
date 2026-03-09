import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Plus, ArrowRight, Code, TestTube, Shield, Briefcase, Award } from "lucide-react";
import { cn } from "../lib/utils";

interface SkillGapAnalysisProps {
  cvData?: any | null;
  cvText?: string;
}

interface SkillInsight {
  id: string;
  type: "missing" | "weak" | "opportunity" | "achievement";
  title: string;
  description: string;
  actionLabel: string;
  actionLink?: string;
  percentage?: number;
  beforeAfter?: {
    before: string;
    after: string;
  };
  category: "technical" | "experience" | "certification" | "tool" | "achievement";
}

export default function SkillGapAnalysis({ cvData, cvText = "" }: SkillGapAnalysisProps) {
  const [insights, setInsights] = useState<SkillInsight[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (!cvData && !cvText) {
      setInsights([]);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    const timer = setTimeout(() => {
      const generatedInsights = generateTechnicalInsights(cvData, cvText);
      setInsights(generatedInsights);
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [cvData, cvText]);

  const generateTechnicalInsights = (data?: any | null, text: string = ""): SkillInsight[] => {
    const insights: SkillInsight[] = [];
    const allSkills = data?.sections?.skills || [];
    const allExperience = data?.sections?.experience || [];
    const allAchievements = data?.sections?.achievements || [];
    const allText = (data?.sections?.about || "") + " " + text;
    const lowerSkills = allSkills.map((s: string) => s.toLowerCase());
    const lowerText = allText.toLowerCase();

    // Helper to check if skill exists
    const hasSkill = (keywords: string[]) => 
      keywords.some(k => lowerSkills.includes(k) || lowerText.includes(k));

    // Check for empty experience
    if (allExperience.length === 0) {
      insights.push({
        id: 'no-experience',
        type: "missing",
        category: "experience",
        title: "No Work Experience Listed",
        description: "Your CV doesn't show any work experience. For developer roles, include internships, freelance work, personal projects, or open source contributions to demonstrate practical skills.",
        actionLabel: "Add Projects Section",
        percentage: 100,
        beforeAfter: {
          before: "(No experience section)",
          after: "Freelance Developer | Self-Employed | 2024-Present\n• Built 3 responsive web applications using React and Node.js\n• Developed RESTful APIs for small business clients\n• Managed database design and implementation using MongoDB"
        }
      });
    }

    // Check for empty achievements
    if (allAchievements.length === 0) {
      insights.push({
        id: 'no-achievements',
        type: "weak",
        category: "achievement",
        title: "Missing Quantifiable Achievements",
        description: "Employers want to see measurable impact. Add specific numbers, percentages, and results to your experience descriptions.",
        actionLabel: "Add Achievements",
        beforeAfter: {
          before: "Worked on website development and fixed bugs",
          after: "• Reduced page load time by 40% through code optimization\n• Fixed 15+ critical bugs affecting 10,000+ daily users\n• Increased mobile user engagement by 25% with responsive design"
        }
      });
    }

    // Check for portfolio/GitHub link
    const hasPortfolio = data?.linkCheck?.github || data?.linkCheck?.portfolio || hasSkill(['github', 'portfolio', 'gitlab']);
    if (!hasPortfolio) {
      insights.push({
        id: 'portfolio-missing',
        type: "missing",
        category: "tool",
        title: "Portfolio/GitHub Missing",
        description: "As a developer, your code is your resume. A GitHub portfolio with projects is more important than a driver's license. Recruiters want to see your work.",
        actionLabel: "Create GitHub Portfolio",
        actionLink: "https://github.com",
        percentage: 95
      });
    }

    // 1. Cloud Platforms Check
    if (!hasSkill(['aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud', 'cloud'])) {
      insights.push({
        id: 'cloud-missing',
        type: "missing",
        category: "technical",
        title: "Cloud Platform Experience Missing",
        description: "90% of full-stack developer roles now require cloud platform experience. AWS leads the market with 65% share in South Africa.",
        actionLabel: "Explore AWS Free Tier",
        actionLink: "https://aws.amazon.com/free/",
        percentage: 90
      });
    }

    // 2. Testing Frameworks Check
    const hasTesting = hasSkill(['jest', 'mocha', 'cypress', 'pytest', 'testing']);
    if (!hasTesting) {
      insights.push({
        id: 'testing-missing',
        type: "weak",
        category: "technical",
        title: "Automated Testing Experience Needed",
        description: "78% of senior dev roles require testing framework knowledge. Companies expect developers to write tests for their code.",
        actionLabel: "Learn Jest",
        actionLink: "https://jestjs.io/docs/getting-started",
        percentage: 78
      });
    }

    // 3. Containerization Check
    if (!hasSkill(['docker', 'kubernetes', 'container'])) {
      insights.push({
        id: 'docker-missing',
        type: "missing",
        category: "tool",
        title: "Containerization Skills Gap",
        description: "Docker skills increase developer job prospects by 40% and are required for 60% of full-stack roles.",
        actionLabel: "Start Docker Tutorial",
        actionLink: "https://docs.docker.com/get-started/",
        percentage: 60
      });
    }

    // 4. CI/CD Experience
    if (!hasSkill(['ci/cd', 'github actions', 'jenkins', 'pipeline'])) {
      insights.push({
        id: 'cicd-missing',
        type: "opportunity",
        category: "technical",
        title: "CI/CD Pipeline Experience",
        description: "Automated deployment knowledge separates junior from mid-level developers. GitHub Actions is the easiest place to start.",
        actionLabel: "Explore GitHub Actions",
        actionLink: "https://docs.github.com/en/actions",
        percentage: 70
      });
    }

    // 5. TypeScript Usage
    if (hasSkill(['javascript']) && !hasSkill(['typescript'])) {
      insights.push({
        id: 'typescript-opportunity',
        type: "opportunity",
        category: "technical",
        title: "TypeScript Would Strengthen Your Profile",
        description: "85% of React and Node.js jobs now prefer TypeScript. It's essential for SA fintech and corporate roles.",
        actionLabel: "TypeScript in 5 mins",
        actionLink: "https://www.typescriptlang.org/docs/",
        percentage: 85
      });
    }

    // 6. Database Depth Check
    const hasSQL = hasSkill(['sql', 'mysql', 'postgresql']);
    const hasNoSQL = hasSkill(['mongodb', 'nosql', 'firebase']);
    
    if (!hasSQL && !hasNoSQL) {
      insights.push({
        id: 'database-missing',
        type: "missing",
        category: "technical",
        title: "Database Skills Missing",
        description: "Full-stack developers need database knowledge. Learn SQL (PostgreSQL/MySQL) for structured data.",
        actionLabel: "Start with SQL",
        actionLink: "https://www.w3schools.com/sql/",
        percentage: 95
      });
    }

    // 7. Security Best Practices
    if (!hasSkill(['authentication', 'jwt', 'oauth', 'security'])) {
      insights.push({
        id: 'security-missing',
        type: "weak",
        category: "technical",
        title: "Security Knowledge Gap",
        description: "Authentication and security practices are expected even in junior roles.",
        actionLabel: "Web Security Basics",
        actionLink: "https://owasp.org/www-project-top-ten/"
      });
    }

    // 8. API Design
    if (!hasSkill(['rest', 'api', 'graphql'])) {
      insights.push({
        id: 'api-missing',
        type: "missing",
        category: "technical",
        title: "API Design Experience",
        description: "Full-stack developers must design and consume APIs. REST is standard.",
        actionLabel: "REST API Tutorial",
        actionLink: "https://restfulapi.net/",
        percentage: 95
      });
    }

    // 9. Version Control Depth
    if (!hasSkill(['git'])) {
      insights.push({
        id: 'git-missing',
        type: "missing",
        category: "tool",
        title: "Version Control (Git) Missing",
        description: "Git is non-negotiable for modern development. Learn basic commands and GitHub.",
        actionLabel: "Learn Git",
        actionLink: "https://git-scm.com/doc",
        percentage: 100
      });
    }

    // 10. Check for action verbs and quantifiable achievements
    const hasActionVerbs = /(developed|built|created|designed|implemented|architected|led|managed|delivered|launched|engineered)/i.test(allText);
    const hasNumbers = /\d+%|\d+\+|\d+\s+(users|customers|projects|clients|requests|transactions|sales|revenue|performance|improvement|reduction)/i.test(allText);
    
    if (!hasActionVerbs || !hasNumbers) {
      insights.push({
        id: 'vague-descriptions',
        type: "weak",
        category: "experience",
        title: "Vague Experience Descriptions",
        description: "Add numbers and strong action verbs to stand out. Quantify your achievements.",
        actionLabel: "Resume Action Verbs"
      });
    }

    // 11. Frontend Framework Depth
    if (hasSkill(['react']) && !hasSkill(['hooks', 'redux', 'state management'])) {
      insights.push({
        id: 'react-depth',
        type: "weak",
        category: "technical",
        title: "Deepen React Knowledge",
        description: "Learn hooks, context API, and state management (Redux) for complex applications.",
        actionLabel: "React Hooks Guide",
        actionLink: "https://react.dev/learn"
      });
    }

    // 12. Backend Framework Depth
    const hasBackend = hasSkill(['node', 'express', 'django', 'spring', '.net']);
    if (hasBackend && !hasSkill(['middleware', 'authentication', 'validation'])) {
      insights.push({
        id: 'backend-depth',
        type: "weak",
        category: "technical",
        title: "Strengthen Backend Skills",
        description: "Learn middleware, authentication, error handling, and input validation.",
        actionLabel: "Backend Best Practices"
      });
    }

    // Remove driver's license insight entirely - not relevant for developers
    // Prioritize insights: missing > weak > opportunity, and ensure we don't show empty state when there ARE insights
    const sortedInsights = [
      ...insights.filter(i => i.type === "missing"),
      ...insights.filter(i => i.type === "weak"),
      ...insights.filter(i => i.type === "opportunity")
    ];
    
    // Return up to 6 insights (since we have multiple gaps to show)
    return sortedInsights.slice(0, 6);
  };

  const iconMap = {
    missing: AlertTriangle,
    weak: Sparkles,
    opportunity: TrendingUp,
    achievement: Award
  };

  const categoryIconMap = {
    technical: Code,
    experience: Briefcase,
    certification: Shield,
    tool: TestTube,
    achievement: Award
  };

  const borderMap = {
    missing: "border-neon-orange/30",
    weak: "border-secondary/30",
    opportunity: "border-neon-green/30",
    achievement: "border-neon-green/30"
  };

  if (isAnalyzing) {
    return (
      <div className="glass-panel-strong p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Code className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h4 className="text-sm font-display font-semibold mb-2">Analyzing Your Technical Profile</h4>
          <p className="text-xs text-muted-foreground mb-4">Identifying skill gaps and opportunities...</p>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Only show empty state if there are TRULY no insights AND we have data
  if (insights.length === 0 && cvData) {
    return (
      <div className="glass-panel-strong p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-6 w-6 text-neon-green" />
        </div>
        <h4 className="text-sm font-display font-semibold mb-1">Your Profile Looks Strong!</h4>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Your technical skills are well-rounded. Keep building projects and adding experience.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel-strong p-6 relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none opacity-30" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">AI-Generated Technical Insights</h3>
            <p className="text-xs text-muted-foreground">
              Personalized for your tech stack • {insights.length} opportunities found
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {insights.map((insight, i) => {
              const Icon = iconMap[insight.type];
              const CategoryIcon = categoryIconMap[insight.category];
              const isExpanded = expandedId === insight.id;

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={cn(
                    "rounded-xl border p-5 transition-all", 
                    borderMap[insight.type], 
                    "bg-card/40 hover:bg-card/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        className="h-9 w-9 rounded-lg bg-card/80 border border-border/50 flex items-center justify-center flex-shrink-0"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                      </motion.div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card border border-border flex items-center justify-center">
                        <CategoryIcon className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold">{insight.title}</h4>
                        {insight.percentage && (
                          <span className="text-xs font-mono text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            {insight.percentage}% relevance
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {insight.description}
                      </p>

                      {insight.beforeAfter && (
                        <div className="mb-3">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                            className="text-xs font-medium text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 mb-2"
                          >
                            {isExpanded ? "Hide" : "Show"} Before / After Example
                            <ArrowRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-hidden"
                              >
                                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1 block">
                                    Before
                                  </span>
                                  <p className="text-xs text-muted-foreground italic">
                                    {insight.beforeAfter.before}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-neon-green mb-1 block">
                                    After
                                  </span>
                                  <p className="text-xs text-foreground">
                                    {insight.beforeAfter.after}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <a
                        href={insight.actionLink || "#"}
                        target={insight.actionLink ? "_blank" : undefined}
                        rel={insight.actionLink ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                        onClick={(e) => !insight.actionLink && e.preventDefault()}
                      >
                        <Plus className="h-3 w-3" /> 
                        {insight.actionLabel}
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}