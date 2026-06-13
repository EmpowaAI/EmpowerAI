const supabase = require('../../db/supabase');
const { encryptField, decryptField } = require('../../utils/encryption.util');

function _encryptTwinData(data) {
  const encrypted = { ...data };

  if (data.identity !== undefined) {
    encrypted.identity = {
      ...data.identity,
      currentRole: encryptField(data.identity.currentRole),
      targetRole:  encryptField(data.identity.targetRole),
    };
  }

  if (data.skills !== undefined) {
    encrypted.skills = {
      core:        encryptField(data.skills.core),
      missing:     encryptField(data.skills.missing),
      emerging:    encryptField(data.skills.emerging),
      monetizable: encryptField(data.skills.monetizable),
    };
  }

  if (data.market !== undefined) {
    encrypted.market = {
      trendingSkills:  encryptField(data.market.trendingSkills),
      decliningSkills: encryptField(data.market.decliningSkills),
      jobTitlesMapped: encryptField(data.market.jobTitlesMapped),
      competitorRoles: encryptField(data.market.competitorRoles),
    };
  }

  if (data.intelligence !== undefined) {
    encrypted.intelligence = {
      strengths:       encryptField(data.intelligence.strengths),
      weaknesses:      encryptField(data.intelligence.weaknesses),
      opportunities:   encryptField(data.intelligence.opportunities),
      threats:         encryptField(data.intelligence.threats),
      recommendations: encryptField(data.intelligence.recommendations),
    };
  }

  if (data.analysisLatest !== undefined) {
    encrypted.analysis = { ...(encrypted.analysis || {}), latest: encryptField(data.analysisLatest) };
    delete encrypted.analysisLatest;
  }

  return encrypted;
}

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    user: row.user_id,
    userId: row.user_id,
    cvProfile: row.cv_profile_id,
    analysis: row.analysis || { latest: '' },
    identity: row.identity || {},
    economy: row.economy || {},
    skills: row.skills || {},
    market: row.market || {},
    intelligence: row.intelligence || {},
    chatHistory: row.chat_history || [],
    simulationHistory: row.simulation_history || [],
    evolution: row.evolution || {},
    status: row.status,
    lastCalculatedAt: row.last_calculated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function _decryptTwin(twin) {
  if (!twin) return null;

  const plain = { ...twin };

  if (plain.identity) {
    plain.identity = {
      ...plain.identity,
      currentRole: decryptField(plain.identity.currentRole),
      targetRole:  decryptField(plain.identity.targetRole),
    };
  }

  if (plain.skills) {
    plain.skills = {
      core:        decryptField(plain.skills.core)        ?? [],
      missing:     decryptField(plain.skills.missing)     ?? [],
      emerging:    decryptField(plain.skills.emerging)    ?? [],
      monetizable: decryptField(plain.skills.monetizable) ?? [],
    };
  }

  if (plain.market) {
    plain.market = {
      trendingSkills:  decryptField(plain.market.trendingSkills)  ?? [],
      decliningSkills: decryptField(plain.market.decliningSkills) ?? [],
      jobTitlesMapped: decryptField(plain.market.jobTitlesMapped) ?? [],
      competitorRoles: decryptField(plain.market.competitorRoles) ?? [],
    };
  }

  if (plain.intelligence) {
    plain.intelligence = {
      strengths:       decryptField(plain.intelligence.strengths)       ?? [],
      weaknesses:      decryptField(plain.intelligence.weaknesses)      ?? [],
      opportunities:   decryptField(plain.intelligence.opportunities)   ?? [],
      threats:         decryptField(plain.intelligence.threats)         ?? [],
      recommendations: decryptField(plain.intelligence.recommendations) ?? [],
    };
  }

  if (plain.analysis?.latest && typeof plain.analysis.latest === 'string') {
    plain.analysis = { ...plain.analysis, latest: decryptField(plain.analysis.latest) };
  }

  if (Array.isArray(plain.chatHistory)) {
    plain.chatHistory = plain.chatHistory.map((msg) => ({
      ...msg,
      content: decryptField(msg.content) ?? '',
    }));
  }

  if (Array.isArray(plain.simulationHistory)) {
    plain.simulationHistory = plain.simulationHistory.map((entry) => ({
      ...entry,
      input:  decryptField(entry.input),
      output: decryptField(entry.output),
    }));
  }

  return plain;
}

// ─── Build Supabase row object from encrypted data ─────────────────────────
function _toRow(encryptedData) {
  const row = {};
  if (encryptedData.analysis     !== undefined) row.analysis      = encryptedData.analysis;
  if (encryptedData.identity     !== undefined) row.identity      = encryptedData.identity;
  if (encryptedData.economy      !== undefined) row.economy       = encryptedData.economy;
  if (encryptedData.skills       !== undefined) row.skills        = encryptedData.skills;
  if (encryptedData.market       !== undefined) row.market        = encryptedData.market;
  if (encryptedData.intelligence !== undefined) row.intelligence  = encryptedData.intelligence;
  if (encryptedData.status       !== undefined) row.status        = encryptedData.status;
  if (encryptedData.evolution    !== undefined) row.evolution     = encryptedData.evolution;
  if (encryptedData.lastCalculatedAt !== undefined) row.last_calculated_at = encryptedData.lastCalculatedAt;
  if (encryptedData.cvProfile    !== undefined) row.cv_profile_id = encryptedData.cvProfile;
  if (encryptedData.cvProfileId  !== undefined) row.cv_profile_id = encryptedData.cvProfileId;
  return row;
}

const findByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('economic_twins').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return _decryptTwin(fromRow(data));
};

const upsertTwin = async (userId, data) => {
  const encryptedData = _encryptTwinData(data);
  const { data: row, error } = await supabase
    .from('economic_twins')
    .upsert({ user_id: userId, ..._toRow(encryptedData) }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return _decryptTwin(fromRow(row));
};

const appendChatMessage = async (userId, message) => {
  const encryptedMessage = { ...message, content: encryptField(message.content) };

  const { data: current } = await supabase
    .from('economic_twins').select('chat_history').eq('user_id', userId).single();
  const history = [...(current?.chat_history || []), encryptedMessage].slice(-100);

  const { data: twin, error } = await supabase
    .from('economic_twins').update({ chat_history: history }).eq('user_id', userId).select().single();
  if (error) throw error;
  return _decryptTwin(fromRow(twin));
};

const appendSimulation = async (userId, simulationEntry) => {
  const encryptedEntry = {
    ...simulationEntry,
    input:  encryptField(simulationEntry.input),
    output: encryptField(simulationEntry.output),
  };

  const { data: current } = await supabase
    .from('economic_twins').select('simulation_history').eq('user_id', userId).single();
  const history = [...(current?.simulation_history || []), encryptedEntry].slice(-20);

  const { data: twin, error } = await supabase
    .from('economic_twins').update({ simulation_history: history }).eq('user_id', userId).select().single();
  if (error) throw error;
  return _decryptTwin(fromRow(twin));
};

const updateFields = async (userId, fields) => {
  const allowedFields = ['analysis', 'identity', 'economy', 'skills', 'market', 'intelligence', 'status', 'evolution', 'lastCalculatedAt'];
  const safeUpdate = {};
  for (const key of allowedFields) {
    if (fields[key] !== undefined) safeUpdate[key] = fields[key];
  }
  const encryptedUpdate = _encryptTwinData(safeUpdate);

  const { data: twin, error } = await supabase
    .from('economic_twins').update(_toRow(encryptedUpdate)).eq('user_id', userId).select().single();
  if (error) throw error;
  return _decryptTwin(fromRow(twin));
};

const deleteByUserId = async (userId) => {
  return supabase.from('economic_twins').delete().eq('user_id', userId);
};

module.exports = {
  findByUserId,
  upsertTwin,
  appendChatMessage,
  appendSimulation,
  updateFields,
  deleteByUserId,
};
