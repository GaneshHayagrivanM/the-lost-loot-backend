const express = require('express');
const checkpointController = require('../controllers/checkpointController');
const {
  validateTeamIdInBody,
  validateCheckpointId,
} = require('../utils/validators');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /checkpoint/complete:
 *   post:
 *     summary: Mark a checkpoint as completed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *               checkpointId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Checkpoint completed successfully
 *       400:
 *         description: Invalid request or checkpoint not available
 */
router.post(
  '/complete',
  // Chain of middleware: first validate, then handle errors, then proceed to controller
  validateTeamIdInBody(),
  validateCheckpointId(),
  handleValidationErrors,
  checkpointController.completeCheckpoint
);

module.exports = router;
