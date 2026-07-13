'use strict';

const twinService  = require('./twinBuilder.Service');
const twinChatService = require('../twinChat/twinChat.Service');


// -----------------------------------------------------------------------------
// POST /api/twin
// Create or update the twin from onboarding form data.
// -----------------------------------------------------------------------------

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


// -----------------------------------------------------------------------------
// POST /api/twin/build-from-cv
// Triggered after CV analysis - links CvProfile data into the twin.
// -----------------------------------------------------------------------------

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


// -----------------------------------------------------------------------------
// GET /api/twin
// Fetch the current user's twin.
// -----------------------------------------------------------------------------

exports.getEconomicTwin = async (req, res, next) => {
  try {
    const twin = await twinService.getTwin(req.user.id);

    return res.status(200).json({
      status: 'success',
      data:   { twin },
    });
  } catch (error) {
    next(error);
  }
};



exports.initialiseTwinChat = async (req, res, next) => {
  try {
    const { twinData } = await twinChatService.initialiseChatSession(req.user.id);

    return res.status(200).json({
      status:  'success',
      message: 'Twin chat session initialised',
      data:    { twinData },
    });
  } catch (error) {
    next(error);
  }
};



exports.chatWithTwin = async (req, res, next) => {
  try {
    const { message, history, twinContext, isLastPrompt } = req.body;

    if (!message) {
      return res.status(400).json({
        status:  'error',
        message: 'message is required',
      });
    }

    if (!twinContext) {
      return res.status(400).json({
        status:  'error',
        message: 'twinContext is required - call /chat/init first',
      });
    }

    const { reply, twinData, twin } = await twinChatService.sendMessage(
      req.user.id,
      message,
      history || [],
      twinContext,
      isLastPrompt === true,
    );

    return res.status(200).json({
      status: 'success',
      data: {
        reply,
        twinData,                          
      },
    });
  } catch (error) {
    next(error);
  }
};



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
