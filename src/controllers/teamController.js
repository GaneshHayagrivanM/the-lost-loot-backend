const gameLogicService = require('../services/gameLogicService');
const logger = require('../config/logging');

/**
 * @fileoverview Controller for handling requests related to team status.
 */

/**
 * Handles the request to retrieve the current game status for a team.
 *
 * @param {import('express').Request} req The Express request object.
 * @param {import('express').Response} res The Express response object.
 * @param {import('express').NextFunction} next The next middleware function.
 */
const getTeamStatus = async (req, res, next) => {
  const { teamId } = req.params;
  logger.info(`Received request for status of team: ${teamId}`);

  try {
    const teamState = await gameLogicService.getTeamStatus(teamId);

    if (!teamState) {
      logger.warn(`Team not found for status request: ${teamId}`);
      // This creates a custom error object that our errorHandler can use.
      const error = new Error('No active game session found for this team.');
      error.statusCode = 404;
      error.title = 'Team Not Found';
      return next(error);
    }

    logger.info(`Successfully retrieved status for team: ${teamId}`);
    res.status(200).json(teamState);
  } catch (error) {
    logger.error(`Error in getTeamStatus for team "${teamId}":`, error);
    // Pass any other errors to the global error handler
    next(error);
  }
};

module.exports = {
  getTeamStatus,
};
