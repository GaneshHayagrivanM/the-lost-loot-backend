const express = require('express');
const gameController = require('../controllers/gameController');
const { validateTeamIdInBody } = require('../utils/validators');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /game/start:
 *   post:
 *     summary: Initialize or retrieve a game session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Existing game session retrieved
 *       201:
 *         description: New game session created
 */
router.post(
  '/start',
  validateTeamIdInBody(),
  handleValidationErrors,
  gameController.startGame
);

/**
 * @swagger
 * /game/end:
 *   post:
 *     summary: End the game for a team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Game ended successfully
 */
router.post(
  '/end',
  validateTeamIdInBody(),
  handleValidationErrors,
  gameController.endGame
);

module.exports = router;
