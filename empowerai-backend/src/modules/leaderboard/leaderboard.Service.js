const supabase = require('../../db/supabase');

const PERIODS = { weekly: 7, monthly: 30, 'all-time': null };

// Score bands → display level (Bronze → Diamond)
function levelForScore(score) {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

function periodStart(period) {
  const days = PERIODS[period];
  if (!days) return null;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Real leaderboard built from live Supabase data:
 * - score:    economic_twins.economy->employabilityScore, falling back to
 *             cv_profiles.analysis->atsScore
 * - activity: usage events within the period (usages.count)
 * - period:   weekly/monthly restrict to users active in that window
 */
async function getLeaderboard({ period = 'all-time', limit = 50, currentUserId = null }) {
  if (!(period in PERIODS)) period = 'all-time';
  const since = periodStart(period);

  // 1. Users (optionally restricted to the active window)
  // Only users who consented to profile sharing appear on a leaderboard
  // visible to other members (POPIA — consent defaults to false).
  let userQuery = supabase
    .from('users')
    .select('id, name, avatar, province, last_active_at')
    .eq('role', 'user')
    .eq('consent_profile_sharing', true);
  if (since) userQuery = userQuery.gte('last_active_at', since);

  const { data: users, error: usersError } = await userQuery;
  if (usersError) throw usersError;
  if (!users || users.length === 0) {
    return { period, entries: [], currentUser: null, totalParticipants: 0 };
  }

  const userIds = users.map((u) => u.id);

  // 2. Twin scores
  const { data: twins, error: twinsError } = await supabase
    .from('economic_twins')
    .select('user_id, economy')
    .in('user_id', userIds);
  if (twinsError) throw twinsError;

  const twinScore = new Map(
    (twins || []).map((t) => [t.user_id, Number(t.economy?.employabilityScore)])
  );

  // 3. CV score fallback
  const { data: cvs, error: cvsError } = await supabase
    .from('cv_profiles')
    .select('user_id, analysis')
    .in('user_id', userIds);
  if (cvsError) throw cvsError;

  const cvScore = new Map(
    (cvs || []).map((c) => [c.user_id, Number(c.analysis?.atsScore)])
  );

  // 4. Activity counts within the period
  let usageQuery = supabase.from('usages').select('user_id, count').in('user_id', userIds);
  if (since) usageQuery = usageQuery.gte('last_used_at', since);
  const { data: usages, error: usagesError } = await usageQuery;
  if (usagesError) throw usagesError;

  const activity = new Map();
  for (const u of usages || []) {
    activity.set(u.user_id, (activity.get(u.user_id) || 0) + (u.count || 0));
  }

  // 5. Assemble — only users with a real score participate
  const entries = users
    .map((u) => {
      const fromTwin = twinScore.get(u.id);
      const fromCv = cvScore.get(u.id);
      const score = Number.isFinite(fromTwin) ? fromTwin : Number.isFinite(fromCv) ? fromCv : null;
      if (score === null) return null;
      return {
        userId: u.id,
        name: u.name,
        avatar: u.avatar || null,
        province: u.province || null,
        score: Math.round(score),
        level: levelForScore(score),
        activityCount: activity.get(u.id) || 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.activityCount - a.activityCount)
    .map((entry, i) => ({ rank: i + 1, ...entry }));

  const currentUser = currentUserId
    ? entries.find((e) => e.userId === currentUserId) || null
    : null;

  return {
    period,
    entries: entries.slice(0, limit),
    currentUser,
    totalParticipants: entries.length,
  };
}

module.exports = { getLeaderboard };
