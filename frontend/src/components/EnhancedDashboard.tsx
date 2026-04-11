// frontend/src/components/Dashboard/EnhancedDashboard.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen, 
  MapPin, 
  DollarSign,
  ChevronRight,
  Sparkles,
  Brain,
  RefreshCcw,
  Loader2} from 'lucide-react';
import { twinAPI } from '../lib/api';
import type { EnrichedProfile } from '../types/profile.types';
import { cn } from '../lib/utils';
import { getStoredCvAnalysis } from '../lib/sensitiveStorage';

export const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EnrichedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      
      const response = await twinAPI.get();
      
      if (response?.status === 'success' && (response.data?.twin || response.twin)) {
        const twin = response.data?.twin || response.twin;
        setProfile(twin);
        localStorage.setItem('enrichedProfile', JSON.stringify(twin));
        return;
      }

      // Fallback to localStorage if offline or no twin found
      const stored = localStorage.getItem('enrichedProfile');
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        const cvData = getStoredCvAnalysis<any>();
        if (cvData) {
          setError('Create your Digital Twin to see personalized insights');
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      const stored = localStorage.getItem('enrichedProfile');
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your career insights...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Welcome to Your Career Navigator</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Start by analyzing your CV or creating your digital twin to get personalized career insights"}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cv-analyzer')}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Award className="h-5 w-5" />
              Analyze Your CV
            </button>
            <button
              onClick={() => navigate('/twin-builder')}
              className="w-full py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Create Digital Twin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              Welcome back, {profile?.name || 'User'}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Your personalized career insights and opportunities
            </p>
          </motion.div>
          
          <button 
            onClick={() => loadProfile(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Sync Data
          </button>
        </div>

        {/* Score Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Empowerment Score</h3>
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold">{profile?.empowermentScore}</div>
            <div className="text-xs text-muted-foreground mt-1">out of 100</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">CV Strength</h3>
              <Award className="h-5 w-5 text-cv-success" />
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold">{profile?.cvData?.score || 0}%</div>
            <div className="text-xs text-muted-foreground mt-1">{profile.cvData?.readinessLevel || 'Not analyzed'}</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Skills Identified</h3>
              <Target className="h-5 w-5 text-cv-gold" />
            </div>
            <div className="text-3xl sm:text-3xl font-display font-bold">{profile?.skills?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">across your profile</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Market Opportunities</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl sm:text-3xl font-display font-bold">{profile?.marketInsights?.topOpportunities?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">matching your profile</div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Market Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Top Opportunities */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Opportunities for You
              </h2>
              <div className="space-y-4">
                {profile.marketInsights?.topOpportunities?.map((opp, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{opp.title}</h3>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        opp.matchScore >= 80 ? "bg-cv-success/20 text-cv-success" :
                        opp.matchScore >= 60 ? "bg-cv-gold/20 text-cv-gold" :
                        "bg-cv-warning/20 text-cv-warning"
                      )}>
                        {opp.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{opp.reason}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        R{opp.salary.min.toLocaleString()} - R{opp.salary.max.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {opp.locations.join(', ')}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full",
                        opp.demandLevel === 'High' ? "bg-cv-success/10 text-cv-success" :
                        opp.demandLevel === 'Medium' ? "bg-cv-gold/10 text-cv-gold" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {opp.demandLevel} Demand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Demand Skills */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skills in High Demand
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.marketInsights?.inDemandSkills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            {profile?.skillGaps && profile.skillGaps.length > 0 && ( // Optional chaining
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Skills to Develop
                </h2>
                <div className="space-y-4">
                  {profile.skillGaps.map((gap, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{gap.skill}</h3>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          gap.importance === 'critical' ? "bg-destructive/20 text-destructive" :
                          gap.importance === 'recommended' ? "bg-cv-gold/20 text-cv-gold" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {gap.importance}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {gap.resources.map((resource, idx) => (
                          <div key={idx} className="text-sm flex items-center justify-between">
                            <span>{resource.title}</span>
                            <span className="text-xs text-muted-foreground">{resource.provider} • {resource.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column - Action Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Action Plan */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
              <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Action Plan
              </h2>
              
              {/* Immediate Actions */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Next 30 Days</h3>
                <div className="space-y-3">
                  {profile.actionPlan?.immediate?.map((item, index) => (
                    <div key={index} className="p-3 bg-card rounded-lg border border-border">
                      <div className="flex items-start gap-2">
                        <span className={cn(
                          "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                          item.priority === 'high' ? "bg-destructive" :
                          item.priority === 'medium' ? "bg-cv-gold" : "bg-muted"
                        )} />
                        <div>
                          <p className="text-sm font-medium">{item.task}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                          <p className="text-xs text-primary mt-1">{item.timeframe}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Short Term Goals */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">3-6 Months</h3>
                <div className="space-y-3">
                  {profile.actionPlan?.shortTerm?.map((goal, index) => (
                    <div key={index} className="p-3 bg-card rounded-lg border border-border">
                      <p className="text-sm font-medium">{goal.task}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">Target: {goal.targetDate}</span>
                        <span className="text-primary">{goal.expectedOutcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long Term Goals */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Long Term</h3>
                {profile?.actionPlan?.longTerm?.map((goal, index) => ( // Optional chaining
                  <div key={index} className="p-3 bg-card rounded-lg border border-border">
                    <p className="text-sm font-medium mb-2">{goal.goal}</p>
                    <div className="space-y-1">
                      {goal.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <ChevronRight className="h-3 w-3 text-primary" />
                          <span className="text-muted-foreground">{milestone}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-primary mt-2">Timeline: {goal.projectedTimeline}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Paths */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-display font-bold mb-4">Recommended Paths</h2>
              <div className="space-y-3">
                {profile.recommendedPaths?.map((path, index) => (
                  <button
                    key={index}
                    className="w-full p-4 bg-muted/30 rounded-lg border border-border/50 text-left hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{path.title}</h3>
                      <span className="text-sm font-medium text-primary">{path.matchPercentage}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{path.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary">R{path.potentialIncome.toLocaleString()}/year</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
