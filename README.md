# The Lost Loot Backend API

Express-based backend for The Lost Loot game. This service manages team sessions, checkpoint progression, and overall game lifecycle.

- Language: Node.js (Express)
- Data store: Google Cloud Firestore (via Firebase Admin SDK)
- Caching: In-memory cache abstraction
- Security: Helmet, CORS, rate limiting
- Versioning: `/api/v1`

## Table of Contents
- Overview
- Getting Started
  - Prerequisites
  - Environment Variables
  - Install and Run
  - Docker
- API Conventions
  - Base URL
  - Content Type
  - Versioning
  - Rate Limiting
  - Error Format
  - Validation Rules
- Game Logic
  - Checkpoint Unlock Rules
  - Keys and Final Requirements
  - Source of Truth for Rules
- Endpoints
  - Health
  - Game
    - Start Game
    - End Game
  - Team
    - Get Team Status
  - Checkpoint
    - Complete Checkpoint
- Logging
- Development Notes

---

## Overview

This API coordinates a team’s progress through a set of checkpoints, applying game rules to determine what unlocks next and when the game can end.

Key files:
- `src/app.js` – Express app, middleware, routing, health, and error handling
- `src/routes/*.js` – Route definitions
- `src/controllers/*.js` – Request handling and orchestration
- `src/services/firestoreService.js` – Firestore persistence
- `src/services/cacheService.js` – Cache helper
- `src/utils/constants.js` – Core rules and constants
- `src/utils/gameRules.js` – Logic to compute progression
- `src/utils/validators.js` – Input validation chains

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud project with Firestore
- Service account credentials available to Firebase Admin SDK (see Firebase Admin docs if running outside GCP)

### Environment Variables

The app reads configuration from `src/config/environment.js` (and standard process environment). Based on usage:
- `GOOGLE_CLOUD_PROJECT` (or equivalent) – Project ID
- `FIRESTORE_DATABASE_ID` – Firestore database ID (usually `(default)`)
- `PORT` – Port the server listens on (default `8080`)
- Other environment variables may be required depending on your deployment of Firebase Admin credentials.

Note: `src/config/database.js` initializes Firebase Admin using `googleCloudProject` and `firestoreDatabaseId`.

### Install and Run

```bash
npm install
npm start
# Server listens on $PORT (default 8080)
```

### Docker

A multi-stage Dockerfile is provided at `docker/Dockerfile`:

```bash
docker build -t lost-loot-backend -f docker/Dockerfile .
docker run -p 8080:8080 -e PORT=8080 lost-loot-backend
```

---

## API Conventions

### Base URL
All endpoints are prefixed with:
- Base: `/api/v1`

Example: `/api/v1/game/start`

### Content Type
- Requests and responses use JSON: `Content-Type: application/json`

### Versioning
- Currently `v1` via the `/api/v1` path prefix.

### Rate Limiting
- Global rate limit: 100 requests per 15 minutes per IP.
- Exceeding the limit returns HTTP 429 with:
```json
{
  "title": "Too Many Requests",
  "detail": "You have exceeded the request limit. Please try again later."
}
```

### Error Format
Validation errors are returned as HTTP 400 with:
```json
{
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more parameters failed validation.",
  "errors": [
    { "param": "teamId", "message": "Team ID must be alphanumeric and 3-50 characters long.", "location": "body" }
  ]
}
```

Non-existent routes return HTTP 404:
```json
{
  "title": "Not Found",
  "status": 404,
  "detail": "The requested resource was not found on this server."
}
```

### Validation Rules

- `teamId` (body or path depending on endpoint):
  - Must match `TEAM_ID_REGEX` (alphanumeric, 3–50 chars)
- `checkpointId` (body):
  - Integer between 1 and 8 inclusive

Validation is enforced by `express-validator` via `src/utils/validators.js` and `src/middleware/validation.js`.

---

## Game Logic

Core rules are defined in `src/utils/constants.js` and computed via helpers in `src/utils/gameRules.js`.

### Checkpoint Unlock Rules

When a checkpoint is completed, subsequent checkpoints unlock per the rules:

```js
CHECKPOINT_UNLOCK_RULES = {
  1: [2, 3],
  2: [4],
  3: [4],
  4: [5, 6],
  5: [7],
  6: [7],
  7: [8] // final checkpoint unlock
}
```

The unlock calculation:
- Combine current unlocked set with new unlocks
- Remove any checkpoints already completed
- De-duplicate results

See: `calculateUnlockedCheckpoints()` in `src/utils/gameRules.js`.

### Keys and Final Requirements

- Key checkpoints: `[1, 4, 7]`
- Final checkpoint ID: `8`
- Ending the game requires (from `FINAL_CHECKPOINT_REQUIREMENTS`):
  - `requiredCheckpoints: 7`
  - `requiredKeys: 3`

Completing a key checkpoint should award a key to the team.

### Source of Truth for Rules

In addition to `constants.js`, the game configuration can be fetched from Firestore:
- Collection: `game_config`
- Document: `progression_rules`
- Function: `getGameConfig()` in `src/services/firestoreService.js`

This allows central rule management.

---

## Endpoints

Base path prefix: `/api/v1`

### Health

GET `/api/v1/health`

- Purpose: Service liveness and version check
- Request: none
- Response 200:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### Game

#### 1) Start Game

POST `/api/v1/game/start`

- Description: Initialize a new game session for a team, or retrieve the existing session if already started.
- Request body:
```json
{
  "teamId": "my-team-123"
}
```
- Validation:
  - `teamId`: alphanumeric, 3–50 chars
- Responses:
  - 201 Created (new session):
    - Returns the newly created team state
  - 200 OK (existing session):
    - Returns the existing team state
  - 400 Validation Failed (invalid input)
- Response body (example shape):
```json
{
  "teamId": "my-team-123",
  "startTime": "2025-01-01T00:00:00.000Z",
  "completedCheckpoints": [],
  "unlockedCheckpoints": [1],
  "keysCollected": 0,
  "finished": false,
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```
Notes:
- The exact fields in `teamState` are managed by `gameLogicService.startGame()` and persisted via `firestoreService`. The example above illustrates typical fields you should expect.

cURL:
```bash
curl -X POST http://localhost:8080/api/v1/game/start \
  -H "Content-Type: application/json" \
  -d '{"teamId":"my-team-123"}'
```

#### 2) End Game

POST `/api/v1/game/end`

- Description: Finalize the game for a team if final requirements are met (required checkpoints and keys).
- Request body:
```json
{
  "teamId": "my-team-123"
}
```
- Validation:
  - `teamId`: alphanumeric, 3–50 chars
- Business rules (enforced by `gameLogicService.endGame()`):
  - Team must satisfy:
    - At least 7 checkpoints completed
    - 3 keys collected (from checkpoints 1, 4, 7)
  - Usually assumes checkpoint 8 (final) is unlocked and completed as part of finishing.
- Responses:
  - 200 OK: returns the final team state
  - 400 Validation Failed: invalid input
  - 403/409 (implementation-specific): requirements not met (if enforced as errors)
- Response body (example shape):
```json
{
  "teamId": "my-team-123",
  "completedCheckpoints": [1,2,3,4,5,6,7,8],
  "keysCollected": 3,
  "finished": true,
  "endTime": "2025-01-01T01:23:45.000Z",
  "updatedAt": "2025-01-01T01:23:45.000Z"
}
```

cURL:
```bash
curl -X POST http://localhost:8080/api/v1/game/end \
  -H "Content-Type: application/json" \
  -d '{"teamId":"my-team-123"}'
```

---

### Team

#### Get Team Status

GET `/api/v1/team/status/:teamId`

- Description: Fetch the current game state for a team.
- Path params:
  - `teamId`: alphanumeric, 3–50 chars
- Responses:
  - 200 OK: team state object
  - 404 Not Found: team does not exist
- Response body (example shape):
```json
{
  "teamId": "my-team-123",
  "startTime": "2025-01-01T00:00:00.000Z",
  "completedCheckpoints": [1,3],
  "unlockedCheckpoints": [2,4],
  "keysCollected": 1,
  "finished": false,
  "updatedAt": "2025-01-01T00:10:00.000Z"
}
```

cURL:
```bash
curl -X GET http://localhost:8080/api/v1/team/status/my-team-123
```

---

### Checkpoint

#### Complete Checkpoint

POST `/api/v1/checkpoint/complete`

- Description: Mark a checkpoint as completed for a team, unlocking subsequent checkpoints and awarding keys where applicable.
- Request body:
```json
{
  "teamId": "my-team-123",
  "checkpointId": 4
}
```
- Validation:
  - `teamId`: alphanumeric, 3–50 chars
  - `checkpointId`: integer 1–8
- Business rules (enforced by the checkpoint controller and game rules):
  - The `checkpointId` must be currently unlocked for the team.
  - On completion:
    - Move `checkpointId` from `unlockedCheckpoints` to `completedCheckpoints`.
    - If `checkpointId` is a key checkpoint ([1, 4, 7]), increment keys collected.
    - Unlock subsequent checkpoints per `CHECKPOINT_UNLOCK_RULES`, excluding those already completed.
  - After completing checkpoint 7, checkpoint 8 becomes unlocked.
- Responses:
  - 200 OK: updated team state reflecting the completion
  - 400 Bad Request: invalid input or checkpoint not currently available
- Response body (example shape):
```json
{
  "teamId": "my-team-123",
  "completedCheckpoints": [1,4],
  "unlockedCheckpoints": [2,3,5,6],
  "keysCollected": 2,
  "finished": false,
  "updatedAt": "2025-01-01T00:30:00.000Z"
}
```

cURL:
```bash
curl -X POST http://localhost:8080/api/v1/checkpoint/complete \
  -H "Content-Type: application/json" \
  -d '{"teamId":"my-team-123","checkpointId":4}'
```

---

## Logging

Each request is logged with method, URL, and duration. On completion, logs include HTTP status and execution time.

- Middleware: `src/middleware/logging.js`
- Uses: `src/config/logging`

Example log data:
- Incoming: `{ method, url, ip }`
- Completion: `{ method, url, status, duration }`

---

## Development Notes

- Middleware stack includes:
  - Helmet (security headers)
  - CORS
  - JSON body parser
  - Rate limiting
  - Request logging
  - Validation and global error handling
- Firestore collections:
  - `team_states` – per-team state documents
  - `game_config/progression_rules` – game configuration and rules
- Persistence helpers:
  - `getTeamState(teamId)` → object | null
  - `createTeamState(teamId, initialState)` → void
  - `updateTeamState(teamId, updates)` → void
  - `getGameConfig()` → object
- Common fields in a team state (typical):
  - `teamId: string`
  - `startTime: ISO string`
  - `completedCheckpoints: number[]`
  - `unlockedCheckpoints: number[]`
  - `keysCollected: number | string[]` (implementation-specific; examples use a count)
  - `finished: boolean`
  - `endTime?: ISO string`
  - `updatedAt: ISO string`

If your client relies on a specific shape, inspect actual responses or the implementation of `gameLogicService` to confirm the concrete fields at runtime.

---
