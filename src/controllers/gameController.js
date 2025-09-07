const gameLogicService = require('../services/gameLogicService');
const logger = require('../config/logging');

/**
 * @fileoverview Controller for handling game lifecycle events like starting and ending a game.
 */

/**
 * Handles the request to start or retrieve a game session for a team.
 *
 * @param {import('express').Request} req The Express request object.
 * @param {import('express').Response} res The Express response object.
 * @param {import('express').NextFunction} next The next middleware function.
 */
const startGame = async (req, res, next) => {
  const { teamId } = req.body;
  logger.info(`Received request to start/get game for team: ${teamId}`);

  try {
    const { teamState, isNew } = await gameLogicService.startGame(teamId);
    const statusCode = isNew ? 201 : 200;
    const message = isNew ? 'New game session created.' : 'Existing game session retrieved.';

    logger.info(`[${statusCode}] ${message} for team: ${teamId}`);
    res.status(statusCode).json(teamState);
  } catch (error) {
    logger.error(`Error in startGame for team "${teamId}":`, error);
    // Pass the error to the global error handler
    next(error);
  }
};

/**
 * Handles the request to end a game for a team.
 *
 * @param {import('express').Request} req The Express request object.
 * @param {import('express').Response} res The Express response object.
 * @param {import('express').NextFunction} next The next middleware function.
 */
const endGame = async (req, res, next) => {
  const { teamId } = req.body;
  logger.info(`Received request to end game for team: ${teamId}`);

  try {
    const finalState = await gameLogicService.endGame(teamId);
    logger.info(`Game successfully ended for team: ${teamId}`);
    res.status(200).json(finalState);
  } catch (error) {
    logger.error(`Error in endGame for team "${teamId}":`, error);
    // Pass the error to the global error handler
    next(error);
  }
};

module.exports = {
  startGame,
  endGame,
};
