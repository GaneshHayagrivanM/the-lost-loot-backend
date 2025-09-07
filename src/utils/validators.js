const { body, param } = require('express-validator');
const { TEAM_ID_REGEX } = require('./constants');

/**
 * Collection of validation chains for use in Express routes.
 * This centralizes validation logic and makes it reusable.
 */

// Validation chain for a teamId in the request body.
const validateTeamIdInBody = () =>
  body('teamId')
    .matches(TEAM_ID_REGEX)
    .withMessage('Team ID must be alphanumeric and 3-50 characters long.');

// Validation chain for a teamId in the URL parameters.
const validateTeamIdInParams = () =>
  param('teamId')
    .matches(TEAM_ID_REGEX)
    .withMessage('Team ID must be alphanumeric and 3-50 characters long.');

// Validation chain for a checkpointId in the request body.
const validateCheckpointId = () =>
  body('checkpointId')
    .isInt({ min: 1, max: 8 })
    .withMessage('Checkpoint ID must be an integer between 1 and 8.');

module.exports = {
  validateTeamIdInBody,
  validateTeamIdInParams,
  validateCheckpointId,
};
