const logger = require('../config/logging');

/**
 * @fileoverview Middleware for logging HTTP requests.
 * This provides visibility into the traffic the API is receiving.
 */

const requestLogger = (req, res, next) => {
  // Log the request as soon as it comes in
  logger.info('Incoming Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  // Capture the start time to calculate response time
  const start = process.hrtime();

  // Listen for the 'finish' event to log when the response is sent
  res.on('finish', () => {
    const durationInMs = getDurationInMs(start);
    logger.info('Request Completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${durationInMs.toFixed(2)}ms`,
    });
  });

  next();
};

/**
 * Calculates the duration since a start time in milliseconds.
 * @param {[number, number]} start The result of process.hrtime()
 * @returns {number} The duration in milliseconds.
 */
function getDurationInMs(start) {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

module.exports = requestLogger;
