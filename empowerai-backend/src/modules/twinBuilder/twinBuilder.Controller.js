/**
 * EconomicTwin Controller
 * Thin layer — only handles HTTP in/out. All logic lives in the service.
 */

const twinService = require('./twinBuilder.Service');

/**
 * POST /api/twin
 * Create or update the twin from onboarding form data.
 */
exports.createEconomicTwin = async (req, res, next) => {
  try {
    const { twin, meta } = await twinService.createOrUpdateFromForm(req.user.id, req.body);

    return res.status(200).json({
      status:  'success',
      message: 'Economic twin created successfully',
      data: {
        twin,
        ...(meta ? { meta } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
};



/**
 * POST /api/twin/build-from-cv
 * Triggered after CV analysis — links CvProfile data into the twin.
 * Call this from your CV analysis service after saving the CvProfile.
 */
exports.buildTwinFromCv = async (req, res, next) => {
  try {
    const twin = await twinService.buildFromCvProfile(req.user.id);

    return res.status(200).json({
      status:  'success',
      message: 'Twin built from CV profile',
      data: { twin },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/twin
 * Fetch the current user's twin.
 */
exports.getEconomicTwin = async (req, res, next) => {
  try {
    const twin = await twinService.getTwin(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: { twin },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chat/twin
 * Send a message to the economic twin. Stores full conversation on the twin model.
 */
exports.chatWithTwin = async (req, res, next) => {
  try {
  const { messages } = req.body;

if (!messages || messages.length === 0) {
  return res.status(400).json({
    status: 'error',
    message: 'No messages provided',
  });
}

const result = await twinService.chatWithTwin(req.user.id, messages);

    return res.status(200).json({
      status: 'success',
      data:   result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/twin/simulate
 * Run career path simulations. Stores results in simulationHistory on the twin.
 */
exports.runSimulation = async (req, res, next) => {
  try {
    const { pathIds } = req.body;
    const result = await twinService.runSimulation(req.user.id, pathIds);

    return res.status(200).json({
      status: 'success',
      data:   result,
    });
  } catch (error) {
    next(error);
  }
};
