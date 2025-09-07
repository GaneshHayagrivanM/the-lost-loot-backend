const admin = require('firebase-admin');
const { googleCloudProject, firestoreDatabaseId } = require('./environment');

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: googleCloudProject,
  databaseId: firestoreDatabaseId,
});

const db = admin.firestore();

console.log('Firestore initialized successfully.');

module.exports = { db };
