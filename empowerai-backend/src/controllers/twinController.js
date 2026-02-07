const EconomicTwin = require('../models/EconomicTwin');
const User = require('../models/User');
const aiServiceClient = require('../services/aiServiceClient');
const { recordCareerSelections } = require('../services/careerAnalyticsService');

exports.createEconomicTwin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check if twin already exists FIRST - before doing anything else
    const existingTwinCheck = await EconomicTwin.findOne({ userId });
    if (existingTwinCheck) {
      console.log('Twin already exists for userId:', userId, '- updating existing twin with new data');
      
      // Update existing twin with new data from request
      const { 
        skills, 
        experience, 
        interests, 
        education, 
        age, 
        province, 
        careerGoals,
        name 
      } = req.body;

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
      
      // Prepare user data for AI service update
      const userData = {
        name: name || user.name,
        age: age || user.age || 22,
        province: province || user.province || 'Gauteng',
        skills: skills || user.skills || [],
        education: education || user.education || 'Matric',
        interests: interests || careerGoals || user.interests || [],
        experience: experienceStr
      };

      // Update user model with new data
      const userUpdates = {};
      if (age) userUpdates.age = age;
      if (province) userUpdates.province = province;
      if (skills && skills.length > 0) userUpdates.skills = skills;
      if (education) userUpdates.education = education;
      if (interests && interests.length > 0) {
        userUpdates.interests = interests;
      } else if (careerGoals && careerGoals.length > 0) {
        userUpdates.interests = careerGoals;
      }
      
      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(userId, userUpdates, { new: true });
      }

      const careersToTrack = (interests && interests.length > 0) ? interests : careerGoals;
      recordCareerSelections(careersToTrack).catch(() => {});

      // Try to regenerate twin data with AI service (non-blocking)
      let updatedTwinData = {};
      try {
        const response = await aiServiceClient.post('/twin/generate', userData);
        const incomeProjection = response.data.incomeProjection || response.data.incomeProjections;
        const growthModel = response.data.growthModel || {};
        
        updatedTwinData = {
          skillVector: response.data.skillVector || existingTwinCheck.skillVector || [],
          incomeProjections: incomeProjection || existingTwinCheck.incomeProjections,
          empowermentScore: response.data.empowermentScore || existingTwinCheck.empowermentScore || 0,
          recommendedPaths: growthModel.recommendedPaths || existingTwinCheck.recommendedPaths || []
        };
      } catch (aiError) {
        console.log('AI service update failed, keeping existing twin data:', aiError.message);
        // Keep existing twin data if AI service fails
      }

      // Update existing twin - ALWAYS succeeds, never fails
      const updatedTwin = await EconomicTwin.findOneAndUpdate(
        { userId },
        { ...updatedTwinData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      // ALWAYS return success - twin exists, user can proceed
      return res.status(200).json({
        status: 'success',
        message: 'Twin updated successfully',
        data: {
          twin: updatedTwin || existingTwinCheck // Fallback to existing if update fails
        }
      });
    }
    
    // Accept all fields from frontend, including age, province, careerGoals
    const { 
      skills, 
      experience, 
      interests, 
      education, 
      age, 
      province, 
      careerGoals,
      name 
    } = req.body;

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
    
    // Use data from request body first, then fall back to user model, then defaults
    const userData = {
      name: name || user.name,
      age: age || user.age || 22, // Use req.body.age first, then user.age, then default
      province: province || user.province || 'Gauteng', // Use req.body.province first
      skills: skills || user.skills || [],
      education: education || user.education || 'Matric',
      interests: interests || careerGoals || user.interests || [], // Support careerGoals as interests
      experience: experienceStr
    };

    console.log('Creating twin with userData:', { ...userData, experience: '[hidden]' });
    
    let response = null;
    let aiServiceFailed = false;
    try {
      response = await aiServiceClient.post('/twin/generate', userData);
      console.log('AI service call successful');
    } catch (aiError) {
      aiServiceFailed = true;
      console.log('AI service call failed (will use defaults):', aiError.message);
      // Don't re-throw - use defaults instead to make twin creation more resilient
      // The AI service being down shouldn't prevent twin creation
    }

    // Update user with age, province, skills, education, interests if provided
    const userUpdates = {};
    if (age) userUpdates.age = age;
    if (province) userUpdates.province = province;
    if (skills && skills.length > 0) userUpdates.skills = skills;
    if (education) userUpdates.education = education;
    if (interests && interests.length > 0) {
      userUpdates.interests = interests;
    } else if (careerGoals && careerGoals.length > 0) {
      userUpdates.interests = careerGoals;
    }
    
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdates, { new: true });
    }

    const careersToTrack = (interests && interests.length > 0) ? interests : careerGoals;
    recordCareerSelections(careersToTrack).catch(() => {});

    // Map AI service response to database model (or use defaults if AI service failed)
    const incomeProjection = response?.data?.incomeProjection || response?.data?.incomeProjections;
    const growthModel = response?.data?.growthModel || {};
    
    const twinData = {
      userId,
      skillVector: response?.data?.skillVector || [],
      incomeProjections: incomeProjection || {
        threeMonth: 15000,
        sixMonth: 20000,
        twelveMonth: 30000
      },
      empowermentScore: response?.data?.empowermentScore || 50,
      recommendedPaths: growthModel.recommendedPaths || [
        { name: 'Software Development', score: 75 },
        { name: 'Digital Marketing', score: 65 },
        { name: 'Data Analysis', score: 60 }
      ]
    };
    
    if (aiServiceFailed) {
      console.log('Using default twin data due to AI service failure');
    }
    
    // Check if twin already exists first to avoid any race conditions
    let economicTwin = await EconomicTwin.findOne({ userId });
    
    if (economicTwin) {
      // Update existing twin
      console.log('Twin already exists, updating it for userId:', userId);
      Object.assign(economicTwin, twinData);
      economicTwin = await economicTwin.save();
    } else {
      // Create new twin using findOneAndUpdate with upsert for atomic operation
      console.log('Creating new twin for userId:', userId);
      try {
        economicTwin = await EconomicTwin.findOneAndUpdate(
          { userId },
          twinData,
          {
            new: true, // Return updated document
            upsert: true, // Create if doesn't exist
            runValidators: true, // Run schema validators
            setDefaultsOnInsert: true // Set default values on insert
          }
        );
      } catch (upsertError) {
        // If upsert fails due to duplicate (race condition), fetch existing twin
        if (upsertError.code === 11000 || upsertError.name === 'MongoServerError') {
          console.log('Upsert failed due to duplicate, fetching existing twin...');
          economicTwin = await EconomicTwin.findOne({ userId });
          if (economicTwin) {
            Object.assign(economicTwin, twinData);
            economicTwin = await economicTwin.save();
          } else {
            throw upsertError; // Re-throw if we can't find it
          }
        } else {
          throw upsertError; // Re-throw other errors
        }
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        twin: economicTwin
      }
    });
  } catch (error) {
    console.error('Error creating twin:', {
      message: error.message,
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response?.data,
      stack: error.stack
    });
    
    // Handle MongoDB duplicate key error (shouldn't happen with upsert, but handle it)
    if (error.name === 'MongoServerError' && error.code === 11000) {
      console.log('Duplicate key error detected, fetching existing twin...');
      // If duplicate key error occurs, fetch and return the existing twin
      try {
        const existingTwin = await EconomicTwin.findOne({ userId: req.user.id });
        if (existingTwin) {
          // Try to update it with new data if we have it
          const incomeProjection = response?.data?.incomeProjection || response?.data?.incomeProjections;
          const growthModel = response?.data?.growthModel || {};
          
          if (incomeProjection || growthModel.recommendedPaths) {
            Object.assign(existingTwin, {
              skillVector: response?.data?.skillVector || existingTwin.skillVector || [],
              incomeProjections: incomeProjection || existingTwin.incomeProjections,
              empowermentScore: response?.data?.empowermentScore || existingTwin.empowermentScore || 0,
              recommendedPaths: growthModel.recommendedPaths || existingTwin.recommendedPaths || []
            });
            await existingTwin.save();
          }
          
          return res.status(200).json({
            status: 'success',
            message: 'Twin already exists and was updated',
            data: {
              twin: existingTwin
            }
          });
        }
      } catch (lookupError) {
        console.error('Error looking up existing twin:', lookupError);
      }
      
      // If we can't find the twin, return success anyway (twin exists, just can't fetch it)
      return res.status(200).json({
        status: 'success',
        message: 'Twin already exists for this user',
        code: 'DUPLICATE_TWIN',
        data: {
          twin: null
        }
      });
    }
    
    // Handle error messages that indicate duplicate
    if (error.message?.includes('userId already exists') || error.message?.includes('already exists')) {
      console.log('Duplicate twin detected from error message, fetching existing twin...');
      try {
        const existingTwin = await EconomicTwin.findOne({ userId: req.user.id });
        if (existingTwin) {
          return res.status(200).json({
            status: 'success',
            message: 'Twin already exists',
            data: {
              twin: existingTwin
            }
          });
        }
      } catch (lookupError) {
        console.error('Error looking up existing twin:', lookupError);
      }
      
      // Return success even if we can't fetch it
      return res.status(200).json({
        status: 'success',
        message: 'Twin already exists for this user',
        code: 'DUPLICATE_TWIN',
        data: {
          twin: null
        }
      });
    }
    
    // Handle rate limit errors specifically
    if (error.response?.status === 429 || error.isRateLimit) {
      const retryAfter = error.retryAfter || error.response?.data?.retry_after || 60;
      return res.status(429).json({
        status: 'error',
        message: 'AI service is currently rate limited. Please try again in a few moments.',
        retryAfter
      });
    }
    
    // Handle AI service connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return res.status(503).json({
        status: 'error',
        message: 'AI service is temporarily unavailable. This might be due to the service waking up (Render free tier). Please wait a moment and try again.',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
    
    // Handle AI service errors with more detail
    if (error.response?.data) {
      const errorDetail = error.response.data.detail || error.response.data.message || error.response.data;
      const errorMessage = typeof errorDetail === 'string' ? errorDetail : 'Failed to create twin. Please try again.';
      return res.status(error.response.status || 500).json({
        status: 'error',
        message: errorMessage,
        code: 'AI_SERVICE_ERROR'
      });
    }
    
    // Handle any other unhandled errors - make them operational
    const { AppError } = require('../utils/errors');
    const operationalError = new AppError(
      error.message || 'Failed to create twin. Please try again.',
      error.statusCode || 500
    );
    operationalError.isOperational = true;
    
    // For development, include stack trace
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({
        status: 'error',
        message: operationalError.message,
        code: 'UNKNOWN_ERROR',
        details: error.stack
      });
    }
    
    // In production, return user-friendly message
    return res.status(500).json({
      status: 'error',
      message: operationalError.message,
      code: 'UNKNOWN_ERROR'
    });
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

// Generate fallback simulation data when AI service is unavailable
function generateFallbackSimulation(pathIds, userData) {
  const pathData = {
    freelancing: {
      name: 'Freelancing',
      description: 'Start freelancing with your current skills',
      threeMonth: { income: 3500, skillGrowth: 15, employabilityIndex: 65, milestones: ['First client', 'Portfolio built', '5 projects completed'] },
      sixMonth: { income: 6800, skillGrowth: 28, employabilityIndex: 72, milestones: ['Regular clients', 'Specialized niche', '15+ projects'] },
      twelveMonth: { income: 12500, skillGrowth: 45, employabilityIndex: 80, milestones: ['Agency rates', 'International clients', 'Passive income'] }
    },
    learnership: {
      name: 'Learnership',
      description: 'Join a learnership program in your field',
      threeMonth: { income: 4200, skillGrowth: 20, employabilityIndex: 70, milestones: ['Program started', 'Industry mentor', 'Certification progress'] },
      sixMonth: { income: 5500, skillGrowth: 35, employabilityIndex: 78, milestones: ['Mid-program assessment', 'Real project experience', 'Industry connections'] },
      twelveMonth: { income: 8500, skillGrowth: 55, employabilityIndex: 85, milestones: ['Certification earned', 'Job placement', 'Professional network'] }
    },
    short_course: {
      name: 'Short Course',
      description: 'Complete a focused upskilling course',
      threeMonth: { income: 3000, skillGrowth: 25, employabilityIndex: 68, milestones: ['Course completed', 'New certification', 'Portfolio updated'] },
      sixMonth: { income: 7200, skillGrowth: 40, employabilityIndex: 75, milestones: ['Skills applied', 'Freelance projects', 'Industry recognition'] },
      twelveMonth: { income: 11000, skillGrowth: 50, employabilityIndex: 82, milestones: ['Advanced skills', 'Market competitive', 'Higher rates'] }
    },
    entry_tech: {
      name: 'Entry Tech Job',
      description: 'Secure an entry-level tech position',
      threeMonth: { income: 8500, skillGrowth: 18, employabilityIndex: 72, milestones: ['Job secured', 'Team integrated', 'First project'] },
      sixMonth: { income: 10200, skillGrowth: 32, employabilityIndex: 78, milestones: ['Performance review', 'Increased responsibility', 'Mentorship'] },
      twelveMonth: { income: 15000, skillGrowth: 48, employabilityIndex: 84, milestones: ['Promotion potential', 'Senior projects', 'Leadership opportunities'] }
    },
    internship: {
      name: 'Internship',
      description: 'Gain practical experience through internship',
      threeMonth: { income: 5000, skillGrowth: 22, employabilityIndex: 68, milestones: ['Internship started', 'Team contribution', 'Skills development'] },
      sixMonth: { income: 6500, skillGrowth: 38, employabilityIndex: 76, milestones: ['Key projects', 'Full-time consideration', 'Industry knowledge'] },
      twelveMonth: { income: 12000, skillGrowth: 52, employabilityIndex: 83, milestones: ['Job offer', 'Professional transition', 'Career foundation'] }
    },
    graduate_program: {
      name: 'Graduate Program',
      description: 'Join a structured graduate development program',
      threeMonth: { income: 9500, skillGrowth: 24, employabilityIndex: 75, milestones: ['Program onboarding', 'Rotations started', 'Training modules'] },
      sixMonth: { income: 11500, skillGrowth: 42, employabilityIndex: 80, milestones: ['Department rotation', 'Leadership training', 'Project ownership'] },
      twelveMonth: { income: 18000, skillGrowth: 58, employabilityIndex: 88, milestones: ['Program completion', 'Permanent placement', 'Fast-track career'] }
    }
  };

  return (pathIds || Object.keys(pathData)).map(pathId => ({
    pathId,
    pathName: pathData[pathId]?.name || pathId,
    description: pathData[pathId]?.description || 'Career pathway simulation',
    projections: pathData[pathId] || pathData.freelancing
  }));
}

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

    let simulationData;

    try {
      // Try AI service first with shorter timeout (5 seconds)
      const simulationResponse = await aiServiceClient.post('/simulation/paths', {
        user_data: userData,
        path_ids: pathIds || null
      }, {
        timeout: 5000 // 5 second timeout for faster fallback
      });
      simulationData = simulationResponse.data;
      console.log('AI service simulation successful');
    } catch (aiError) {
      // AI service failed - use fallback simulation
      console.log('AI service unavailable, using fallback simulation:', aiError.message);
      simulationData = generateFallbackSimulation(pathIds, userData);
    }

    if (existingTwin) {
      // Limit simulation history to last 20 entries to prevent unbounded growth
      const MAX_HISTORY = 20;
      
      // Get current history
      let history = existingTwin.simulationHistory || [];
      
      // Add new entry
      history.push({
        paths: pathIds || 'all',
        timestamp: new Date(),
        results: simulationData
      });
      
      // Keep only last MAX_HISTORY entries (most recent)
      if (history.length > MAX_HISTORY) {
        history = history.slice(-MAX_HISTORY);
      }
      
      // Update twin with limited history
      await EconomicTwin.findOneAndUpdate(
        { userId },
        { simulationHistory: history }
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        simulations: simulationData
      }
    });
  } catch (error) {
    console.error('Error running simulation:', error.response?.data || error.message);
    next(error);
  }
};
