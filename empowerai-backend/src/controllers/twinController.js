const EconomicTwin = require('../models/EconomicTwin');
const axios = require('axios');

exports.createEconomicTwin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skills, experience, interests, education } = req.body;

    // Call Python AI service to generate twin
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/generate-twin`, {
      userId,
      skills,
      experience,
      interests,
      education
    });

    // Save twin to database
    const economicTwin = await EconomicTwin.create({
      userId,
      skillVector: aiResponse.data.skillVector,
      incomeProjections: aiResponse.data.incomeProjections,
      empowermentScore: aiResponse.data.empowermentScore,
      recommendedPaths: aiResponse.data.recommendedPaths
    });

    res.status(201).json({
      status: 'success',
      data: {
        twin: economicTwin
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getEconomicTwin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const twin = await EconomicTwin.findOne({ userId })
      .populate('userId', 'name email province');

    if (!twin) {
      return res.status(404).json({
        status: 'error',
        message: 'Economic twin not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        twin
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.runSimulation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { pathType, duration } = req.body;

    // Call Python simulation engine
    const simulationResponse = await axios.post(`${process.env.AI_SERVICE_URL}/simulate`, {
      userId,
      pathType,
      duration
    });

    // Save simulation to history
    await EconomicTwin.findOneAndUpdate(
      { userId },
      {
        $push: {
          simulationHistory: {
            path: pathType,
            timestamp: new Date(),
            projection: simulationResponse.data
          }
        }
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        simulation: simulationResponse.data
      }
    });
  } catch (error) {
    next(error);
  }
};