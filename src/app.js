const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Local middleware and routes
const corsMiddleware = require('./middleware/cors');
const requestLogger = require('./middleware/logging');
const errorHandler = require('./middleware/errorHandler');
const gameRoutes = require('./routes/game');
const teamRoutes = require('./routes/team');
const checkpointRoutes = require('./routes/checkpoint');
const { version } = require('../package.json'); // For health check

// Create the Express application
const app = express();

// --- Core Middleware ---

// Security headers
app.use(helmet());

// Enable CORS
app.use(corsMiddleware);

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    title: 'Too Many Requests',
    detail: 'You have exceeded the request limit. Please try again later.',
  },
});
app.use('/api/', apiLimiter);

// Body parser for JSON payloads
app.use(express.json());

// Request logging
app.use(requestLogger);


// --- API Routes ---

const apiBase = '/api/v1';

app.use(`${apiBase}/game`, gameRoutes);
app.use(`${apiBase}/team`, teamRoutes);
app.use(`${apiBase}/checkpoint`, checkpointRoutes);

// --- Health Check Endpoint ---

app.get(`${apiBase}/health`, (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version,
    timestamp: new Date().toISOString(),
  });
});


// --- Error Handling ---

// Catch-all for 404 Not Found errors
app.use((req, res, next) => {
  const error = new Error('The requested resource was not found on this server.');
  error.statusCode = 404;
  error.title = 'Not Found';
  next(error);
});

// Global error handler (must be the last middleware)
app.use(errorHandler);


module.exports = app;
