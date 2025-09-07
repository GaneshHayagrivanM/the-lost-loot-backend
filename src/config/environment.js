const process = require('process');

const environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT,
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  logLevel: process.env.LOG_LEVEL || 'info',
  cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10),
};

module.exports = environment;
