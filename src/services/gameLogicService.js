const firestoreService = require('./firestoreService');
const cacheService = require('./cacheService');
const gameRules = require('../utils/gameRules');
const logger = require('../config/logging');

/**
 * @fileoverview This service orchestrates the core game logic by combining data
 * from Firestore with the rules defined in the utils. It is responsible for
 * managing the lifecycle of a team's game session.
 */

/**
 * Retrieves the state of a team, prioritizing cache over Firestore.
 *
 * @param {string} teamId The team's ID.
 * @returns {Promise<object|null>} The team's state or null if not found.
 */
const getTeamStatus = async (teamId) => {
  const cachedState = cacheService.get(teamId);
  if (cachedState) {
    return cachedState;
  }

  const dbState = await firestoreService.getTeamState(teamId);
  if (dbState) {
    cacheService.set(teamId, dbState);
  }
  return dbState;
};

/**
 * Initializes a new game for a team or returns their existing session.
 *
 * @param {string} teamId The team's ID.
 * @returns {Promise<{teamState: object, isNew: boolean}>} An object containing the team state and a flag indicating if it was newly created.
 */
const startGame = async (teamId) => {
  let teamState = await getTeamStatus(teamId);
  if (teamState) {
    return { teamState, isNew: false };
  }

  logger.info(`No existing game found for team "${teamId}". Creating a new one.`);
  const now = new Date().toISOString();
  const newTeamState = {
    teamId,
    startTime: now,
    endTime: null,
    completedCheckpoints: [],
    unlockedCheckpoints: [1], // Start with the first checkpoint unlocked
    keysCollected: [],
    createdAt: now,
    updatedAt: now,
  };

  await firestoreService.createTeamState(teamId, newTeamState);
  cacheService.set(teamId, newTeamState);

  return { teamState: newTeamState, isNew: true };
};

/**
 * Processes a checkpoint completion for a team.
 *
 * @param {string} teamId The team's ID.
 * @param {number} checkpointId The ID of the completed checkpoint.
 * @returns {Promise<object>} The updated team state.
 */
const completeCheckpoint = async (teamId, checkpointId) => {
  const teamState = await getTeamStatus(teamId);
  if (!teamState) {
    throw Object.assign(new Error('No active game session found for this team.'), { statusCode: 404, title: 'Team Not Found' });
  }

  if (teamState.completedCheckpoints.includes(checkpointId)) {
    throw Object.assign(new Error('Checkpoint has already been completed.'), { statusCode: 400, title: 'Checkpoint Not Available' });
  }

  if (!teamState.unlockedCheckpoints.includes(checkpointId)) {
    throw Object.assign(new Error('Checkpoint is not yet unlocked.'), { statusCode: 400, title: 'Checkpoint Not Available' });
  }

  const updates = {
    completedCheckpoints: [...teamState.completedCheckpoints, checkpointId],
    keysCollected: gameRules.shouldAwardKey(checkpointId)
      ? [...teamState.keysCollected, checkpointId] // This is a simplification; keys should be unique
      : [...teamState.keysCollected],
  };

  updates.unlockedCheckpoints = gameRules.calculateUnlockedCheckpoints(
    checkpointId,
    teamState.unlockedCheckpoints,
    updates.completedCheckpoints
  );

  await firestoreService.updateTeamState(teamId, updates);
  const updatedState = { ...teamState, ...updates, updatedAt: new Date().toISOString() };
  cacheService.set(teamId, updatedState);

  return updatedState;
};

/**
 * Ends the game for a team if they meet the requirements.
 *
 * @param {string} teamId The team's ID.
 * @returns {Promise<object>} The final team state.
 */
const endGame = async (teamId) => {
  const teamState = await getTeamStatus(teamId);
  if (!teamState) {
    throw Object.assign(new Error('No active game session found for this team.'), { statusCode: 404, title: 'Team Not Found' });
  }

  if (teamState.endTime) {
    logger.warn(`Team "${teamId}" attempted to end a game that was already finished.`);
    return teamState; // Game is already over.
  }

  if (!gameRules.canCompleteGame(teamState)) {
    throw Object.assign(new Error('All checkpoints must be completed to end the game.'), { statusCode: 400, title: 'Game Not Completable' });
  }

  const finalState = {
    ...teamState,
    endTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await firestoreService.updateTeamState(teamId, { endTime: finalState.endTime });
  cacheService.set(teamId, finalState);

  return finalState;
};

module.exports = {
  getTeamStatus,
  startGame,
  completeCheckpoint,
  endGame,
};
