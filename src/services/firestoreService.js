const { db } = require('../config/database');
const logger = require('../config/logging');

const TEAM_STATES_COLLECTION = 'team_states';
const GAME_CONFIG_COLLECTION = 'game_config';
const GAME_RULES_DOC = 'progression_rules';

/**
 * @fileoverview This service encapsulates all interactions with the Firestore database.
 * It provides a clean, reusable interface for the rest of the application to
 * access and manipulate game data.
 */

/**
 * Retrieves the current state for a given team.
 *
 * @param {string} teamId The unique identifier for the team.
 * @returns {Promise<object|null>} A promise that resolves to the team's state object, or null if not found.
 */
const getTeamState = async (teamId) => {
  try {
    const teamDocRef = db.collection(TEAM_STATES_COLLECTION).doc(teamId);
    const docSnapshot = await teamDocRef.get();

    if (!docSnapshot.exists) {
      logger.warn(`Team state for teamId "${teamId}" not found.`);
      return null;
    }
    return docSnapshot.data();
  } catch (error) {
    logger.error(`Error fetching team state for teamId "${teamId}":`, error);
    throw new Error('Failed to retrieve team state from database.');
  }
};

/**
 * Creates a new team state document in Firestore.
 *
 * @param {string} teamId The team's unique identifier.
 * @param {object} teamState The initial state object for the team.
 * @returns {Promise<void>} A promise that resolves when the creation is complete.
 */
const createTeamState = async (teamId, teamState) => {
  try {
    const teamDocRef = db.collection(TEAM_STATES_COLLECTION).doc(teamId);
    await teamDocRef.set(teamState);
    logger.info(`Successfully created team state for teamId "${teamId}".`);
  } catch (error) {
    logger.error(`Error creating team state for teamId "${teamId}":`, error);
    throw new Error('Failed to create new team state in database.');
  }
};

/**
 * Updates specific fields of a team's state document.
 *
 * @param {string} teamId The ID of the team to update.
 * @param {object} updates An object containing the fields to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
const updateTeamState = async (teamId, updates) => {
  try {
    const teamDocRef = db.collection(TEAM_STATES_COLLECTION).doc(teamId);
    await teamDocRef.update({
      ...updates,
      updatedAt: new Date().toISOString(), // Automatically update the timestamp
    });
    logger.info(`Successfully updated team state for teamId "${teamId}".`);
  } catch (error) {
    logger.error(`Error updating team state for teamId "${teamId}":`, error);
    throw new Error('Failed to update team state in database.');
  }
};

/**
 * Fetches the game's configuration document.
 * In a real application, this could be cached to reduce reads.
 *
 * @returns {Promise<object>} A promise that resolves to the game configuration object.
 */
const getGameConfig = async () => {
  try {
    const configDocRef = db.collection(GAME_CONFIG_COLLECTION).doc(GAME_RULES_DOC);
    const docSnapshot = await configDocRef.get();

    if (!docSnapshot.exists) {
      logger.error('CRITICAL: Game configuration document not found!');
      throw new Error('Game configuration is missing.');
    }
    return docSnapshot.data();
  } catch (error) {
    logger.error('Failed to retrieve game configuration:', error);
    throw new Error('Could not load game configuration.');
  }
};


module.exports = {
  getTeamState,
  createTeamState,
  updateTeamState,
  getGameConfig,
};
