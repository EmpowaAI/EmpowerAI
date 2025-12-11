const EconomicTwin = require('../models/EconomicTwin');
const User = require('../models/User');
const aiServiceClient = require('../services/aiServiceClient');

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

    const response = await aiServiceClient.post('/twin/generate', userData);

    // Map AI service response to database model
    const incomeProjection = response.data.incomeProjection || response.data.incomeProjections;
    const growthModel = response.data.growthModel || {};
    
    const economicTwin = await EconomicTwin.create({
      userId,
      skillVector: response.data.skillVector || [],
      incomeProjections: incomeProjection || {
        threeMonth: 0,
        sixMonth: 0,
        twelveMonth: 0
      },
      empowermentScore: response.data.empowermentScore || 0,
      recommendedPaths: growthModel.recommendedPaths || []
    });

    res.status(201).json({
      status: 'success',
      data: {
        twin: economicTwin
      }
    });
  } catch (error) {
    console.error('Error creating twin:', error.response?.data || error.message);
    
    // Handle rate limit errors specifically
    if (error.response?.status === 429) {
      return res.status(429).json({
        status: 'error',
        message: 'AI service is currently rate limited. Please try again in a few moments.',
        retryAfter: 60 // Suggest retry after 60 seconds
      });
    }
    
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

    const simulationResponse = await aiServiceClient.post('/simulation/paths', {
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