const cors = require('cors');

/**
 * @fileoverview CORS configuration middleware.
 * In a production environment, the origin should be strictly limited to the
 * frontend application's domain for security.
 */

const corsOptions = {
  // In a real-world scenario, this would be set to something like:
  // origin: 'https://your-frontend-app.com',
  origin: '*', // Allowing all for now for ease of development/testing
  methods: 'GET, POST','OPTIONS', // Only allowing necessary methods
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200, // For legacy browser support
};

module.exports = cors(corsOptions);
