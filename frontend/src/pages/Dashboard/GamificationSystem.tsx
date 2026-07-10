import { useState, useEffect } from 'react'
import { Trophy, Flame, Star, Zap, Target, Award, Medal, Crown, Gem, TrendingUp, Calendar, Users, MessageCircle, Loader2 } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useUser } from "../../contexts/user-context"
import { leaderboardAPI } from "../../lib/api"

// Import Neural Fusion components
import NeuralCard from "../../components/ui/NeuralCard"
import HolographicButton from "../../components/ui/HolographicButton"
import AIAvatar from "../../components/ui/AIAvatar"

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  xpReward: number
  unlockedAt?: Date
  category: 'milestone' | 'streak' | 'skill' | 'social'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Level {
  level: number
  name: string
  icon: any
  color: string
  minXP: number
  maxXP: number
  perks: string[]
}

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  score: number
  level: number
  activityCount: number
  province: string | null
  avatar: string | null
}

interface GamificationState {
  xp: number
  level: number
  streak: number
  achievements: Achievement[]
  weeklyRank: number
  monthlyRank: number
  allTimeRank: number
  lastActive: Date
}

const levels: Level[] = [
  { level: 1, name: "Bronze", icon: Medal, color: "text-amber-600", minXP: 0, maxXP: 100, perks: ["Basic CV Analysis"] },
  { level: 2, name: "Silver", icon: Award, color: "text-gray-400", minXP: 101, maxXP: 500, perks: ["Interview Practice", "AI Mentor"] },
  { level: 3, name: "Gold", icon: Trophy, color: "text-yellow-500", minXP: 501, maxXP: 1500, perks: ["Advanced CV Analysis", "Priority Matching"] },
  { level: 4, name: "Platinum", icon: Star, color: "text-blue-400", minXP: 1501, maxXP: 3500, perks: ["Voice Features", "Premium Support"] },
  { level: 5, name: "Diamond", icon: Gem, color: "text-purple-400", minXP: 3501, maxXP: Infinity, perks: ["All Features", "Exclusive Content"] }
]

const achievements: Achievement[] = [
  {
    id: "first-cv",
    title: "First Step",
    description: "Upload your first CV",
    icon: Target,
    xpReward: 50,
    category: "milestone",
    rarity: "common"
  },
  {
    id: "first-interview",
    title: "Interview Rookie",
    description: "Complete your first interview practice",
    icon: Zap,
    xpReward: 30,
    category: "milestone",
    rarity: "common"
  },
  {
    id: "interview-pro",
    title: "Interview Pro",
    description: "Complete 10 interview practices",
    icon: Award,
    xpReward: 100,
    category: "skill",
    rarity: "rare"
  },
  {
    id: "week-warrior",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: Flame,
    xpReward: 70,
    category: "streak",
    rarity: "rare"
  },
  {
    id: "month-master",
    title: "Month Master",
    description: "Maintain a 30-day streak",
    icon: Calendar,
    xpReward: 200,
    category: "streak",
    rarity: "epic"
  },
  {
    id: "diamond-elite",
    title: "Diamond Elite",
    description: "Reach Diamond level",
    icon: Crown,
    xpReward: 500,
    category: "milestone",
    rarity: "legendary"
  }
]

function avatarFallback(name: string): string {
  return (name || '?').trim().charAt(0).toUpperCase() || '?'
}

export default function GamificationSystem() {
  const { user } = useUser()
  const [state, setState] = useState<GamificationState>({
    xp: 1250,
    level: 3,
    streak: 7,
    achievements: achievements.slice(0, 3).map(a => ({ ...a, unlockedAt: new Date() })),
    weeklyRank: 6,
    monthlyRank: 8,
    allTimeRank: 15,
    lastActive: new Date()
  })
  
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview')
  const [leaderboardView, setLeaderboardView] = useState<'weekly' | 'monthly' | 'all-time'>('weekly')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null)
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState('')
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLeaderboardLoading(true)
    setLeaderboardError('')
    leaderboardAPI.get(leaderboardView)
      .then((res) => {
        if (cancelled) return
        setLeaderboard(res.data?.entries || [])
        setMyRank(res.data?.currentUser || null)
      })
      .catch((err) => {
        if (cancelled) return
        setLeaderboardError(err.message || 'Failed to load the leaderboard.')
      })
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false)
      })
    return () => { cancelled = true }
  }, [leaderboardView, leaderboardRefresh])

  const currentLevel = levels.find(l => l.level === state.level) || levels[0]
  const nextLevel = levels.find(l => l.level === state.level + 1)
  const xpProgress = currentLevel ? ((state.xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100 : 0
  const xpToNext = nextLevel ? nextLevel.minXP - state.xp : 0

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400/30'
      case 'rare': return 'border-blue-400/30'
      case 'epic': return 'border-purple-400/30'
      case 'legendary': return 'border-yellow-400/30'
      default: return 'border-gray-400/30'
    }
  }

  const addXP = (amount: number) => {
    setState(prev => {
      const newXP = prev.xp + amount
      const newLevel = levels.find(l => newXP >= l.minXP && newXP < l.maxXP)?.level || prev.level
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel
      }
    })
  }

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (achievement && !state.achievements.find(a => a.id === achievementId)) {
      setState(prev => ({
        ...prev,
        achievements: [...prev.achievements, { ...achievement, unlockedAt: new Date() }],
        xp: prev.xp + achievement.xpReward
      }))
    }
  }

  const yourRank = myRank

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Career Progress System {/* Changed to-accent to to-secondary */}
        </h1>
        <p className="text-xl text-muted-foreground">
          Level up, unlock achievements, and climb the leaderboard
        </p>
      </div>

      {/* Level Progress */}
      <NeuralCard>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <currentLevel.icon className={cn("h-10 w-10", currentLevel.color)} />
            </div>
            <p className="text-lg font-bold text-foreground mt-2">{currentLevel.name}</p>
            <p className="text-sm text-muted-foreground">Level {state.level}</p>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress to {nextLevel?.name || 'Max'}</span>
              <span className="text-sm font-medium text-primary">{xpToNext > 0 ? `${xpToNext} XP to go` : 'Max Level'}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" 
                style={{ width: `${Math.min(xpProgress, 100)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">{state.xp} XP</span>
              <span className="text-sm text-muted-foreground">{nextLevel?.maxXP || '∞'} XP</span>
            </div>
          </div>
        </div>
        
        {/* Level Perks */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-foreground mb-2">Current Perks:</p>
          <div className="flex flex-wrap gap-2">
            {currentLevel.perks.map((perk, i) => (
              <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
                {perk}
              </span>
            ))}
          </div>
        </div>
      </NeuralCard>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NeuralCard className="text-center">
          <div className="text-3xl font-bold text-primary">{state.xp}</div>
          <p className="text-sm text-muted-foreground">Total XP</p>
        </NeuralCard>
        <NeuralCard className="text-center">
          <div className="flex items-center justify-center gap-2"> {/* Changed text-orange-400 to text-secondary */}
            <Flame className="h-6 w-6 text-orange-400" />
            <div className="text-3xl font-bold text-orange-400">{state.streak}</div>
          </div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </NeuralCard>
        <NeuralCard className="text-center">
          <div className="text-3xl font-bold text-accent">{state.achievements.length}</div>
          <p className="text-sm text-muted-foreground">Achievements</p>
        </NeuralCard>
        <NeuralCard className="text-center">
          <div className="text-3xl font-bold text-secondary">{yourRank ? `#${yourRank.rank}` : '—'}</div>
          <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
        </NeuralCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['overview', 'achievements', 'leaderboard'] as const).map((tab) => (
          <HolographicButton
            key={tab}
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            className="rounded-b-none"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </HolographicButton>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Achievements */}
          <NeuralCard>
            <h3 className="text-xl font-bold text-foreground mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {state.achievements.slice(-3).reverse().map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      getRarityBorder(achievement.rarity),
                      "border-2"
                    )}>
                      <Icon className={cn("h-6 w-6", getRarityColor(achievement.rarity))} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">+{achievement.xpReward} XP</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.unlockedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </NeuralCard>

          {/* XP Actions */}
          <NeuralCard>
            <h3 className="text-xl font-bold text-foreground mb-4">Earn More XP</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { action: "Daily Login", xp: "+10 XP", icon: Calendar },
                { action: "Update Profile", xp: "+20 XP", icon: Users },
                { action: "Upload CV", xp: "+50 XP", icon: Target },
                { action: "Interview Practice", xp: "+30 XP", icon: Zap },
                { action: "AI Mentor Chat", xp: "+40 XP", icon: MessageCircle },
                { action: "Apply to Job", xp: "+60 XP", icon: TrendingUp }
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.action}</p>
                      <p className="text-sm text-primary font-bold">{item.xp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </NeuralCard>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              const isUnlocked = state.achievements.find(a => a.id === achievement.id)
              
              return (
                <NeuralCard key={achievement.id} className={cn(
                  "relative overflow-hidden",
                  !isUnlocked && "opacity-50"
                )}>
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3",
                      getRarityBorder(achievement.rarity),
                      "border-2"
                    )}>
                      <Icon className={cn("h-8 w-8", getRarityColor(achievement.rarity))} />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-bold text-primary">+{achievement.xpReward} XP</span>
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">
                        {achievement.category}
                      </span>
                    </div>
                    {isUnlocked && (
                      <div className="mt-3 text-xs text-green-400">
                        ✓ Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </NeuralCard>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Leaderboard Controls */}
          <div className="flex gap-2">
            {(['weekly', 'monthly', 'all-time'] as const).map((view) => (
              <HolographicButton
                key={view}
                onClick={() => setLeaderboardView(view)}
                variant={leaderboardView === view ? 'primary' : 'secondary'}
              >
                {view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}
              </HolographicButton>
            ))}
          </div>

          {/* Leaderboard */}
          <NeuralCard>
            {leaderboardLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading leaderboard…</span>
              </div>
            ) : leaderboardError ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-muted-foreground">{leaderboardError}</p>
                <HolographicButton onClick={() => setLeaderboardRefresh(n => n + 1)} variant="secondary">
                  Try again
                </HolographicButton>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No one is on the {leaderboardView.replace('-', ' ')} leaderboard yet.</p>
                <p className="text-sm mt-1">Analyse your CV or build your twin to claim the first spot.</p>
              </div>
            ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const isYou = entry.userId === user?.id
                const entryLevel = levels.find(l => l.level === entry.level)
                const LevelIcon = entryLevel?.icon || Medal

                return (
                  <div key={entry.userId} className={cn(
                    "flex items-center gap-4 p-4 rounded-lg transition-all",
                    isYou ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
                  )}>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold",
                        entry.rank <= 3 ? "text-yellow-400" : "text-muted-foreground"
                      )}>
                        #{entry.rank}
                      </div>
                      {entry.rank <= 3 && (
                        <Trophy className="h-4 w-4 text-yellow-400 mx-auto" />
                      )}
                    </div>

                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-lg font-bold border-2 border-border overflow-hidden">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                      ) : (
                        avatarFallback(entry.name)
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={cn(
                        "font-semibold text-foreground",
                        isYou && "text-primary"
                      )}>
                        {entry.name} {isYou && "(You)"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <LevelIcon className={cn("h-3 w-3", entryLevel?.color)} />
                          {entryLevel?.name}
                        </span>
                        {entry.province && <span>{entry.province}</span>}
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {entry.activityCount} actions
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{entry.score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                )
              })}
            </div>
            )}
          </NeuralCard>
        </div>
      )}
    </div>
  )
}
