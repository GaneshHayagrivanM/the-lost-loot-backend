/**
 * @fileoverview This file contains all the core game constants and configuration values.
 * Centralizing these values makes the game easier to manage and tune.
 */

// Defines the progression path of the game.
// The key is the completed checkpointId, and the value is an array of checkpointIds that are unlocked.
const CHECKPOINT_UNLOCK_RULES = {
  1: [2, 3],
  2: [4],
  3: [4],
  4: [5, 6],
  5: [7],
  6: [7],
  7: [8], // Completing checkpoint 7 unlocks the final checkpoint.
};

// Defines which checkpoints award a key upon completion.
const KEY_CHECKPOINTS = [1, 4, 7];

// The ID of the final checkpoint in the game.
const FINAL_CHECKPOINT_ID = 8;

// Defines the requirements for a team to be able to end the game.
const FINAL_CHECKPOINT_REQUIREMENTS = {
  // This refers to the number of *other* checkpoints that must be completed.
  requiredCheckpoints: 7,
  requiredKeys: 3,
};

// Regex for validating the teamId format.
// Must be 3-50 characters, alphanumeric with hyphens allowed.
const TEAM_ID_REGEX = /^[a-zA-Z0-9-]{3,50}$/;

module.exports = {
  CHECKPOINT_UNLOCK_RULES,
  KEY_CHECKPOINTS,
  FINAL_CHECKPOINT_ID,
  FINAL_CHECKPOINT_REQUIREMENTS,
  TEAM_ID_REGEX,
};
