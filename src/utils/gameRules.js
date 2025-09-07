const {
  CHECKPOINT_UNLOCK_RULES,
  KEY_CHECKPOINTS,
  FINAL_CHECKPOINT_REQUIREMENTS,
} = require('./constants');

/**
 * @fileoverview This file centralizes the core game progression logic.
 * It determines how players advance through the checkpoints based on the rules.
 */

/**
 * Calculates the new set of unlocked checkpoints after one is completed.
 *
 * @param {number} completedCheckpointId The checkpoint that was just finished.
 * @param {number[]} currentlyUnlocked An array of the team's currently unlocked checkpoints.
 * @param {number[]} alreadyCompleted An array of the team's completed checkpoints.
 * @returns {number[]} A new array of unique, unlocked checkpoint IDs.
 */
const calculateUnlockedCheckpoints = (
  completedCheckpointId,
  currentlyUnlocked,
  alreadyCompleted
) => {
  const newlyUnlocked = CHECKPOINT_UNLOCK_RULES[completedCheckpointId] || [];
  const allUnlocked = new Set([...currentlyUnlocked, ...newlyUnlocked]);

  // Ensure completed checkpoints are not listed as unlocked
  alreadyCompleted.forEach(id => allUnlocked.delete(id));
  allUnlocked.delete(completedCheckpointId);

  return Array.from(allUnlocked);
};

/**
 * Determines if a newly completed checkpoint should award a key.
 *
 * @param {number} completedCheckpointId The ID of the checkpoint to check.
 * @returns {boolean} True if a key is awarded, false otherwise.
 */
const shouldAwardKey = (completedCheckpointId) => {
  return KEY_CHECKPOINTS.includes(completedCheckpointId);
};

/**
 * Checks if the team has met the requirements to complete the final checkpoint and end the game.
 *
 * @param {object} teamState The current state of the team.
 * @returns {boolean} True if the game is completable, false otherwise.
 */
const canCompleteGame = (teamState) => {
  const { completedCheckpoints, keysCollected } = teamState;
  const { requiredCheckpoints, requiredKeys } = FINAL_CHECKPOINT_REQUIREMENTS;

  // This logic assumes the final checkpoint itself is not in the completed list yet.
  return (
    completedCheckpoints.length >= requiredCheckpoints &&
    keysCollected.length >= requiredKeys
  );
};

module.exports = {
  calculateUnlockedCheckpoints,
  shouldAwardKey,
  canCompleteGame,
};
