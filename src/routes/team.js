const express = require('express');
const teamController = require('../controllers/teamController');
const { validateTeamIdInParams } = require('../utils/validators');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /team/status/{teamId}:
 *   get:
 *     summary: Retrieve the current game state for a team
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team state retrieved successfully
 *       404:
 *         description: Team not found
 */
router.get(
  '/status/:teamId',
  validateTeamIdInParams(),
  handleValidationErrors,
  teamController.getTeamStatus
);

module.exports = router;
