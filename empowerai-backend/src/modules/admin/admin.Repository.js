const supabase = require('../../db/supabase');

// ─── USER QUERIES ────────────────────────────────────────────────────────────

exports.findAllUsers = async ({ page, limit, search, role }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase.from('users').select('id, name, email, role, province, skills, avatar, created_at, updated_at', { count: 'exact' });
  if (role) q = q.eq('role', role);
  if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, count } = await q.order('created_at', { ascending: false }).range(from, to);
  return { users: data || [], total: count || 0 };
};

exports.findUserById = async (id) => {
  const { data } = await supabase
    .from('users').select('id, name, email, role, province, skills, avatar, created_at, updated_at')
    .eq('id', id).single();
  return data;
};

exports.updateUser = async (id, updates) => {
  const allowed = ['name', 'email', 'role', 'province', 'skills', 'avatar', 'about', 'summary'];
  const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
  const { data } = await supabase
    .from('users').update(safe).eq('id', id)
    .select('id, name, email, role, province, skills, avatar, created_at, updated_at').single();
  return data;
};

exports.deleteUser = async (id) => {
  const { data: user } = await supabase
    .from('users').select('id, name, email').eq('id', id).single();
  if (!user) return null;
  await supabase.auth.admin.deleteUser(id);
  return user;
};

exports.toggleUserStatus = async (id, isActive) => {
  // Supabase Auth manages active state via banned_until or user management
  // For now, update a flagged_for_deletion field as a proxy for deactivation
  const { data } = await supabase
    .from('users').update({ flagged_for_deletion: !isActive }).eq('id', id)
    .select('id, name, email, role, flagged_for_deletion').single();
  return data;
};

exports.getUserGrowthStats = async () => {
  const { data } = await supabase
    .from('users').select('created_at').order('created_at', { ascending: true });
  if (!data) return [];
  // Group by year-month in JS
  const grouped = {};
  for (const { created_at } of data) {
    const d = new Date(created_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    grouped[key] = (grouped[key] || 0) + 1;
  }
  return Object.entries(grouped).slice(-12).map(([key, count]) => {
    const [year, month] = key.split('-');
    return { _id: { year: +year, month: +month }, count };
  });
};

exports.getUserRoleBreakdown = async () => {
  const { data } = await supabase.from('users').select('role');
  if (!data) return [];
  const grouped = {};
  for (const { role } of data) grouped[role] = (grouped[role] || 0) + 1;
  return Object.entries(grouped).map(([role, count]) => ({ _id: role, count }));
};

// ─── OPPORTUNITY QUERIES ─────────────────────────────────────────────────────

exports.findAllOpportunities = async ({ page, limit, search, type, isActive }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase.from('opportunities').select('*', { count: 'exact' });
  if (type) q = q.eq('type', type);
  if (typeof isActive === 'boolean') q = q.eq('is_active', isActive);
  if (search) q = q.or(`title.ilike.%${search}%,company.ilike.%${search}%`);

  const { data, count } = await q.order('created_at', { ascending: false }).range(from, to);
  return { opportunities: data || [], total: count || 0 };
};

exports.findOpportunityById = async (id) => {
  const { data } = await supabase.from('opportunities').select('*').eq('id', id).single();
  return data;
};

exports.updateOpportunity = async (id, updates) => {
  const allowed = ['title', 'type', 'company', 'location', 'province', 'description', 'requirements', 'skills', 'salary_range', 'deadline', 'application_url', 'is_active'];
  const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
  const { data } = await supabase.from('opportunities').update(safe).eq('id', id).select().single();
  return data;
};

exports.deleteOpportunity = async (id) => {
  await supabase.from('opportunities').delete().eq('id', id);
};

exports.getOpportunityTypeBreakdown = async () => {
  const { data } = await supabase.from('opportunities').select('type, is_active');
  if (!data) return [];
  const grouped = {};
  for (const { type, is_active } of data) {
    if (!grouped[type]) grouped[type] = { _id: type, count: 0, active: 0 };
    grouped[type].count += 1;
    if (is_active) grouped[type].active += 1;
  }
  return Object.values(grouped);
};

// ─── AI USAGE QUERIES ────────────────────────────────────────────────────────
// Derived from the usages table (product-level counts per user per month)

exports.findAiUsageLogs = async ({ page, limit }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count } = await supabase
    .from('usages').select('*, user:users(name, email)', { count: 'exact' })
    .order('last_used_at', { ascending: false }).range(from, to);
  return { logs: data || [], total: count || 0 };
};

exports.getAiUsageSummary = async () => {
  const { data } = await supabase.from('usages').select('product, count, user_id, last_used_at');
  if (!data) return { byFeature: [], byDay: [], topUsers: [] };

  const byFeature = {};
  for (const { product, count } of data) {
    if (!byFeature[product]) byFeature[product] = { _id: product, totalCalls: 0 };
    byFeature[product].totalCalls += count;
  }

  return { byFeature: Object.values(byFeature), byDay: [], topUsers: [] };
};

// Audit logs not yet implemented in Supabase schema
exports.findAuditLogs = async () => ({ logs: [], total: 0 });
exports.createAuditLog = async () => null;

// ─── DASHBOARD AGGREGATE ─────────────────────────────────────────────────────

exports.getDashboardCounts = async () => {
  const [
    { count: totalUsers },
    { count: totalOpportunities },
    { count: activeOpportunities },
    { count: totalAiCalls },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('usages').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: totalUsers || 0,
    activeUsers: totalUsers || 0,
    totalOpportunities: totalOpportunities || 0,
    activeOpportunities: activeOpportunities || 0,
    totalAiCalls: totalAiCalls || 0,
    recentRefreshRun: null,
  };
};
