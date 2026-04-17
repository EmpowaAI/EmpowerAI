const EconomicTwin = require('./twinBuilder.Model');
const {encryptField, decryptField,} = require('../../utils/encryption.util');


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
    encrypted['analysis.latest'] = encryptField(data.analysisLatest);
    delete encrypted.analysisLatest; 
  }

  return encrypted;
}


function _decryptTwin(twin) {
  if (!twin) return null;

  const plain = typeof twin.toObject === 'function' ? twin.toObject() : { ...twin };

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
    plain.analysis = {
      ...plain.analysis,
      latest: decryptField(plain.analysis.latest),
    };
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

const findByUserId = async (userId) => {
  const twin = await EconomicTwin.findOne({ user: userId }).populate('cvProfile');
  return _decryptTwin(twin);
};

const upsertTwin = async (userId, data) => {
  const encryptedData = _encryptTwinData(data);

  const twin = await EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        ...encryptedData,
        user: userId,
        updatedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return _decryptTwin(twin);
};


const appendChatMessage = async (userId, message) => {
  const encryptedMessage = {
    ...message,
    content: encryptField(message.content),
  };

  const twin = await EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        chatHistory: {
          $each: [encryptedMessage],
          $slice: -100, 
        },
      },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  );

  return _decryptTwin(twin);
};

const appendSimulation = async (userId, simulationEntry) => {
  const encryptedEntry = {
    ...simulationEntry,
    input:  encryptField(simulationEntry.input),
    output: encryptField(simulationEntry.output),
  };

  const twin = await EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        simulationHistory: {
          $each: [encryptedEntry],
          $slice: -20,
        },
      },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  );

  return _decryptTwin(twin);
};


const updateFields = async (userId, fields) => {
  const allowedFields = [
    'analysis',
    'identity',
    'economy',
    'skills',
    'market',
    'intelligence',
    'status',
    'evolution',
    'lastCalculatedAt',
  ];

  const safeUpdate = {};
  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      safeUpdate[key] = fields[key];
    }
  }

  const encryptedUpdate = _encryptTwinData(safeUpdate);

  const twin = await EconomicTwin.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        ...encryptedUpdate,
        updatedAt: new Date(),
      },
    },
    { new: true, runValidators: true }
  );

  return _decryptTwin(twin);
};

const deleteByUserId = async (userId) => {
  return EconomicTwin.findOneAndDelete({ user: userId });
};

module.exports = {
  findByUserId,
  upsertTwin,
  appendChatMessage,
  appendSimulation,
  updateFields,
  deleteByUserId,
};
