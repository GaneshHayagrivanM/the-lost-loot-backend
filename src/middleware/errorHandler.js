const environment = require('../config/environment');

/**
 * @fileoverview Global error handling middleware.
 * This should be the last middleware added to the Express app.
 * It catches all errors and formats them into a standardized RFC 7807 response.
 */

// This function signature (err, req, res, next) is special in Express.
// It identifies this as an error-handling middleware.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // If the error has a statusCode, use it; otherwise, default to 500.
  const statusCode = err.statusCode || 500;

  // In production, we don't want to leak implementation details.
  const message =
    statusCode === 500 && environment.nodeEnv === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message;

  // Basic logging of the error for debugging purposes.
  // A more robust logger like Winston would be used in a real app.
  console.error({
    error: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  // Format the response according to RFC 7807 Problem Details.
  res.status(statusCode).json({
    type: err.type || 'about:blank',
    title: err.title || 'Internal ServerError',
    status: statusCode,
    detail: message,
    instance: req.originalUrl,
  });
};

module.exports = errorHandler;
