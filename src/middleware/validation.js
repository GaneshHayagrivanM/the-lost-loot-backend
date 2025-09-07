const { validationResult } = require('express-validator');

/**
 * @fileoverview Middleware to handle validation errors from express-validator.
 * This should be placed after any route that uses validation chains.
 */

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  // Format the errors to be more user-friendly and consistent.
  const extractedErrors = errors.array().map(err => ({
    param: err.param,
    message: err.msg,
    location: err.location,
  }));

  // Log the validation errors for debugging.
  console.error('Validation Errors:', extractedErrors);

  // Respond with a 400 Bad Request and the details of the validation errors.
  return res.status(400).json({
    title: 'Validation Failed',
    status: 400,
    detail: 'One or more parameters failed validation.',
    errors: extractedErrors,
  });
};

module.exports = handleValidationErrors;
