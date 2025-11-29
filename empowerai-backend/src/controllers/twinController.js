const EconomicTwin = require('../models/EconomicTwin');
const User = require('../models/User');
const axios = require('axios');

exports.createEconomicTwin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skills, experience, interests, education } = req.body;

    // Get user data from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Convert experience to string if needed
    let experienceStr = null;
    if (experience) {
      if (typeof experience === 'object') {
        experienceStr = experience.description || JSON.stringify(experience);
      } else {
        experienceStr = experience;
      }
    }
    
    const userData = {
      name: user.name,
      age: user.age || 22, // Default age if not set
      province: user.province || 'Gauteng', // Default province if not set
      skills: skills || user.skills || [],
      education: education || user.education || 'Matric',
      interests: interests || user.interests || [],
      experience: experienceStr
    };

    const serviceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${serviceUrl}/api/twin/generate`, userData);

    const economicTwin = await EconomicTwin.create({
      userId,
      skillVector: response.data.skillVector,
      incomeProjections: response.data.incomeProjection,
      empowermentScore: response.data.empowermentScore,
      recommendedPaths: response.data.growthModel.recommendedPaths
    });

    res.status(201).json({
      status: 'success',
      data: {
        twin: economicTwin
      }
    });
  } catch (error) {
    console.error('Error creating twin:', error.response?.data || error.message);
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
    const { pathIds } = req.body; // pathIds is array like ['learnership', 'freelancing']

    // Get user data and existing twin
    const user = await User.findById(userId);
    const existingTwin = await EconomicTwin.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const userData = {
      name: user.name,
      age: user.age || 22,
      province: user.province || 'Gauteng',
      skills: user.skills || [],
      education: user.education || 'Matric',
      interests: user.interests || [],
      experience: null
    };

    if (existingTwin && existingTwin.skillVector) {
      userData.skillVector = existingTwin.skillVector;
    }

    const serviceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const simulationResponse = await axios.post(`${serviceUrl}/api/simulation/paths`, {
      user_data: userData,
      path_ids: pathIds || null
    });

    if (existingTwin) {
      await EconomicTwin.findOneAndUpdate(
        { userId },
        {
          $push: {
            simulationHistory: {
              paths: pathIds || 'all',
              timestamp: new Date(),
              results: simulationResponse.data
            }
          }
        }
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        simulations: simulationResponse.data
      }
    });
  } catch (error) {
    console.error('Error running simulation:', error.response?.data || error.message);
    next(error);
  }
};