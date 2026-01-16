const EconomicTwin = require('../models/EconomicTwin');
const axios = require('axios');

exports.runSimulation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { pathType, duration, additionalData } = req.body;

    // Simulate locally
    const simulationData = await simulateLocally(pathType, duration, req.user);

    // Save to database
    const twin = await EconomicTwin.findOneAndUpdate(
      { userId },
      {
        $push: {
          simulationHistory: {
            path: pathType,
            timestamp: new Date(),
            projection: simulationData,
            duration: duration
          }
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        simulation: simulationData,
        twinId: twin._id
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSimulationHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const twin = await EconomicTwin.findOne({ userId });
    
    if (!twin || !twin.simulationHistory) {
      return res.status(200).json({
        status: 'success',
        data: {
          simulations: []
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        simulations: twin.simulationHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

// Local simulation 
const simulateLocally = async (pathType, duration, user) => {
  // Mock data for different paths
  const simulations = {
    'freelancing': {
      incomeProjections: {
        threeMonth: 4200,
        sixMonth: 8500,
        twelveMonth: 15000
      },
      skillGrowth: ['Web Design', 'Client Communication', 'Time Management'],
      employabilityIndex: 75,
      requirements: ['Portfolio', 'Basic design skills', 'Internet access'],
      timeline: 'Immediate start'
    },
    'learnership': {
      incomeProjections: {
        threeMonth: 3500,
        sixMonth: 4000,
        twelveMonth: 6000
      },
      skillGrowth: ['Technical Skills', 'Industry Knowledge', 'Certification'],
      employabilityIndex: 85,
      requirements: ['Matric Certificate', 'SA Citizen', 'No criminal record'],
      timeline: '3-12 months program'
    },
    'tech-job': {
      incomeProjections: {
        threeMonth: 8000,
        sixMonth: 10000,
        twelveMonth: 15000
      },
      skillGrowth: ['Programming', 'Problem Solving', 'Team Collaboration'],
      employabilityIndex: 90,
      requirements: ['Technical skills', 'Interview preparation', 'CV ready'],
      timeline: '1-3 month job search'
    },
    'online-course': {
      incomeProjections: {
        threeMonth: 2000,
        sixMonth: 5000,
        twelveMonth: 10000
      },
      skillGrowth: ['Specialized Skills', 'Certification', 'Project Experience'],
      employabilityIndex: 70,
      requirements: ['Computer access', 'Time commitment', 'Basic literacy'],
      timeline: '3-6 month course + job search'
    }
  };

  return simulations[pathType] || simulations['freelancing'];
};