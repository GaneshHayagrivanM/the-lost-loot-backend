const winston = require('winston');
const environment = require('./environment');

/**
 * @fileoverview Winston logger configuration.
 * This sets up a global logger for the application. In a real application,
 * this might include transports for sending logs to a service like
 * Google Cloud Logging.
 */

const logger = winston.createLogger({
  level: environment.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'lost-loot-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// In production, also log to a file or a logging service.
if (environment.nodeEnv === 'production') {
  // Example: Add a transport for Google Cloud Logging
  // (requires additional setup)
}

module.exports = logger;
