const NodeCache = require('node-cache');
const environment = require('../config/environment');
const logger = require('../config/logging');

/**
 * @fileoverview This service provides an in-memory caching layer for the application.
 * It helps to reduce latency and Firestore read costs for frequently accessed data,
 * such as a team's state during active gameplay.
 */

// stdTTL is the standard time-to-live in seconds for every cache entry.
const cache = new NodeCache({ stdTTL: environment.cacheTtl });

logger.info(`Cache service initialized with a TTL of ${environment.cacheTtl} seconds.`);

/**
 * Retrieves a value from the cache for a given key.
 *
 * @param {string} key The unique identifier for the cache entry.
 * @returns {*} The cached value, or undefined if the key is not found or expired.
 */
const get = (key) => {
  const value = cache.get(key);
  if (value) {
    logger.debug(`[Cache HIT] Found value for key: ${key}`);
  } else {
    logger.debug(`[Cache MISS] No value found for key: ${key}`);
  }
  return value;
};

/**
 * Stores a key-value pair in the cache.
 * If the key already exists, its value and TTL will be updated.
 *
 * @param {string} key The unique identifier for the cache entry.
 * @param {*} value The value to be stored.
 * @param {number} [ttl] Optional. The time-to-live in seconds for this specific entry.
 */
const set = (key, value, ttl = environment.cacheTtl) => {
  logger.debug(`[Cache SET] Storing value for key: ${key} with TTL: ${ttl}s`);
  cache.set(key, value, ttl);
};

/**
 * Deletes a key-value pair from the cache.
 * Useful for invalidating cache when the underlying data changes in the database.
 *
 * @param {string} key The key to delete.
 */
const del = (key) => {
  logger.debug(`[Cache DEL] Deleting key: ${key}`);
  cache.del(key);
};

/**
 * Flushes the entire cache, deleting all entries.
 */
const flush = () => {
  logger.info('[Cache FLUSH] Clearing all cache entries.');
  cache.flushAll();
};

module.exports = {
  get,
  set,
  del,
  flush,
};
