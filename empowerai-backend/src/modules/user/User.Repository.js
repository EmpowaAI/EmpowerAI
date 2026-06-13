const supabase = require('../../db/supabase');

const USER_SELECT = [
  'id', 'name', 'email', 'age', 'province', 'phone', 'education',
  'about', 'summary', 'skills', 'interests', 'avatar', 'role',
  'consent_data_processing', 'consent_profile_sharing', 'consent_ai_processing',
  'last_active_at', 'flagged_for_deletion', 'created_at', 'updated_at',
].join(', ');

async function findById(userId) {
  const { data, error } = await supabase
    .from('users')
    .select(USER_SELECT)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select(USER_SELECT)
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

async function existsByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

async function updateUser(userId, fields) {
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('id', userId)
    .select(USER_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function deleteUser(userId) {
  // Deleting from auth.users cascades to public.users via the FK
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}

module.exports = { findById, findByEmail, existsByEmail, updateUser, deleteUser };
