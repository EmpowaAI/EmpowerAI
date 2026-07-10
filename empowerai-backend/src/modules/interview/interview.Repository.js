const supabase = require('../../db/supabase');

const TABLE = 'interview_sessions';

const SESSION_SELECT =
  'id, user_id, type, difficulty, company, questions, answers, cv_data, status, started_at, completed_at';

async function create({ userId, type, difficulty, company, questions, cvData }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      type,
      difficulty,
      company: company || null,
      questions,
      cv_data: cvData || null,
    })
    .select(SESSION_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function findById(sessionId, userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SESSION_SELECT)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

async function appendAnswer(sessionId, userId, answerEntry) {
  // Read-modify-write on the jsonb array. Interview answers arrive one at
  // a time from a single client, so lost-update risk is negligible here.
  const session = await findById(sessionId, userId);
  if (!session) return null;

  const answers = Array.isArray(session.answers) ? session.answers : [];
  answers.push(answerEntry);

  const isComplete =
    Array.isArray(session.questions) && answers.length >= session.questions.length;

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      answers,
      ...(isComplete ? { status: 'completed', completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select(SESSION_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function listByUser(userId, limit = 10) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SESSION_SELECT)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

module.exports = { create, findById, appendAnswer, listByUser };
