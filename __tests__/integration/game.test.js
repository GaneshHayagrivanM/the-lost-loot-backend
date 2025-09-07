const request = require('supertest');
const app = require('../../src/app');
const firestoreService = require('../../src/services/firestoreService');
const cacheService = require('../../src/services/cacheService');

// Mock the services to isolate the controller and routes
jest.mock('../../src/services/firestoreService');
jest.mock('../../src/services/cacheService');

describe('Game API Endpoints', () => {
  let teamId;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Generate a unique teamId for each test to prevent cross-test interference
    teamId = `test-team-${Date.now()}`;
  });

  describe('POST /api/v1/game/start', () => {
    it('should return 201 and a new team state for a new team', async () => {
      const teamState = { teamId, startTime: new Date().toISOString() };
      firestoreService.getTeamState.mockResolvedValue(null);
      firestoreService.createTeamState.mockResolvedValue();

      const response = await request(app)
        .post('/api/v1/game/start')
        .send({ teamId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('teamId', teamId);
      expect(firestoreService.createTeamState).toHaveBeenCalled();
    });

    it('should return 200 and the existing team state for an existing team', async () => {
      const existingState = { teamId, startTime: 'some-iso-string' };
      firestoreService.getTeamState.mockResolvedValue(existingState);

      const response = await request(app)
        .post('/api/v1/game/start')
        .send({ teamId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(existingState);
      expect(firestoreService.createTeamState).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid teamId', async () => {
      const response = await request(app)
        .post('/api/v1/game/start')
        .send({ teamId: 'a' }); // Invalid short teamId

      expect(response.status).toBe(400);
      expect(response.body.title).toBe('Validation Failed');
    });
  });

  // Add more tests for other endpoints like /game/end, /team/status, etc.
});
