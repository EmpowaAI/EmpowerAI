const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const checkAIHealth = async () => {
  try {
    const res = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    });
    return res.data;
  } catch (err) {
    return { status: 'down', error: err.message };
  }
};

module.exports = {
  AI_SERVICE_URL,
  checkAIHealth
};