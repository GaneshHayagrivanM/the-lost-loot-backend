const app = require('./app');
const environment = require('./config/environment');
const logger = require('./config/logging');

const { port } = environment;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

// --- Graceful Shutdown ---

const shutdown = (signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully.`);
  server.close(() => {
    logger.info('✅ Server closed. Exiting process.');
    // In a real app, you'd also close database connections here.
    process.exit(0);
  });
};

// Listen for termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // It's often recommended to crash the process on unhandled rejections
  // so that process managers (like Docker, PM2) can restart it.
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
