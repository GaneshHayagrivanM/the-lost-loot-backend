const gameLogicService = require('../services/gameLogicService');
const logger = require('../config/logging');

/**
 * @fileoverview Controller for handling checkpoint-related actions.
 */

/**
 * Handles the request to mark a checkpoint as completed for a team.
 *
 * @param {import('express').Request} req The Express request object.
 * @param {import('express').Response} res The Express response object.
 * @param {import('express').NextFunction} next The next middleware function.
 */
const completeCheckpoint = async (req, res, next) => {
  const { teamId, checkpointId } = req.body;
  logger.info(`Received request to complete checkpoint ${checkpointId} for team: ${teamId}`);

  try {
    const updatedState = await gameLogicService.completeCheckpoint(teamId, checkpointId);
    logger.info(`Successfully completed checkpoint ${checkpointId} for team: ${teamId}`);
    res.status(200).json(updatedState);
  } catch (error) {
    logger.error(`Error completing checkpoint ${checkpointId} for team "${teamId}":`, error);
    // Pass the error to the global error handler
    next(error);
  }
};

module.exports = {
  completeCheckpoint,
};
