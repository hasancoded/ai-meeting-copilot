# API Reference

## Overview

The AI Meeting Copilot API is a RESTful backend service built with Express.js and TypeScript. It provides authentication, meeting management, audio file uploads, and AI-powered transcription and analysis capabilities.

**Base URL (Development):** `http://localhost:4000`  
**Base URL (Production):** Configure via `FRONTEND_URL` environment variable

### Architecture

- **Authentication:** JWT tokens stored in httpOnly cookies
- **Database:** SQLite (development), PostgreSQL (production)
- **File Storage:** Local filesystem with multer (upgradeable to S3)
- **AI Providers:** Stub (development) or OpenAI (production)

---

## Global Conventions

### Response Format

**Success responses** follow this pattern:

```json
{
  "item": {
    /* resource object */
  },
  "items": [
    /* array of resources */
  ],
  "message": "Optional success message"
}
```

**Error responses** follow this pattern:

```json
{
  "error": "Human-readable error message",
  "details": [
    /* optional validation errors */
  ]
}
```

### HTTP Status Codes

| Code | Meaning               | When Used                         |
| ---- | --------------------- | --------------------------------- |
| 200  | OK                    | Successful GET, POST, or action   |
| 201  | Created               | Resource successfully created     |
| 400  | Bad Request           | Validation error or invalid input |
| 401  | Unauthorized          | Missing or invalid authentication |
| 404  | Not Found             | Resource does not exist           |
| 500  | Internal Server Error | Server-side error                 |

---

## Authentication

All endpoints under `/api/meetings` require authentication. Authentication is handled via JWT tokens stored in httpOnly cookies.

**Cookie Name:** `token`

**Cookie Attributes:**

- `httpOnly: true` - Not accessible via JavaScript
- `secure: true` (production only) - HTTPS only
- `sameSite: 'lax'` - CSRF protection
- `expires: 7 days` - Token lifetime

### Authentication Flow

1. **Register** → User provides email and password → Server creates account and sets JWT cookie
2. **Login** → User provides credentials → Server validates and sets JWT cookie
3. **Authenticated Requests** → Client includes cookie automatically → Server validates token
4. **Logout** → Server clears cookie

---

## Health Check Endpoints

### GET `/api/health`

Check if the API server is running.

**Authentication:** Not required

**Request:**

```http
GET /api/health HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**

```json
{
  "ok": true
}
```

**Use Case:** Load balancer health checks, monitoring, service availability testing

---

### GET `/`

Root endpoint with server information.

**Authentication:** Not required

**Request:**

```http
GET / HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**

```json
{
  "ok": true,
  "env": "development",
  "timestamp": "2025-01-10T15:30:00.000Z"
}
```

---

## Authentication Endpoints

### POST `/api/auth/register`

Create a new user account.

**Authentication:** Not required

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com", // Required, valid email format
  "password": "password123", // Required, minimum 6 characters
  "name": "John Doe" // Optional
}
```

**Validation Rules:**

- `email`: Must be valid email format, unique in database
- `password`: Minimum 6 characters, will be bcrypt hashed
- `name`: Optional string

**Success Response (200 OK):**

```json
{
  "id": 1,
  "email": "user@example.com"
}
```

**Response Headers:**

```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Lax; Max-Age=604800
```

**Error Responses:**

_400 Bad Request - Validation failed:_

```json
{
  "error": "Validation error message"
}
```

_400 Bad Request - Email already exists:_

```json
{
  "error": "Email already in use"
}
```

**Example Request (curl):**

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secure123","name":"John Doe"}' \
  -c cookies.txt
```

**Side Effects:**

- Creates User record in database
- Password is bcrypt hashed (10 rounds)
- Sets JWT cookie with 7-day expiration
- Returns user ID and email (password never returned)

---

### POST `/api/auth/login`

Authenticate existing user and receive JWT token.

**Authentication:** Not required

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com", // Required, valid email format
  "password": "password123" // Required, minimum 6 characters
}
```

**Validation Rules:**

- `email`: Must be valid email format
- `password`: Minimum 6 characters

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Response Headers:**

```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Lax; Max-Age=604800
```

**Error Responses:**

_400 Bad Request - Validation failed:_

```json
{
  "error": "Validation error message"
}
```

_401 Unauthorized - Invalid credentials:_

```json
{
  "error": "Invalid credentials"
}
```

**Example Request (curl):**

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secure123"}' \
  -c cookies.txt
```

**Side Effects:**

- Sets JWT cookie with 7-day expiration
- Token contains user ID and email

**Security Notes:**

- Same error message for non-existent users and wrong passwords (prevents user enumeration)
- Passwords compared using bcrypt.compare (timing-safe)

---

### POST `/api/auth/logout`

Clear authentication cookie and end session.

**Authentication:** Not required (works even if not logged in)

**Request:**

```http
POST /api/auth/logout HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**

```json
{
  "message": "Logged out"
}
```

**Response Headers:**

```
Set-Cookie: token=; HttpOnly; SameSite=Lax; Max-Age=0
```

**Example Request (curl):**

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -b cookies.txt
```

**Side Effects:**

- Clears authentication cookie
- Client must discard JWT token

---

## Meeting Endpoints

All meeting endpoints require authentication via JWT cookie.

### GET `/api/meetings`

List all meetings for the authenticated user.

**Authentication:** Required (JWT cookie)

**Request:**

```http
GET /api/meetings HTTP/1.1
Host: localhost:4000
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Team Standup - Jan 10",
      "audioPath": "uploads/audio-123456.mp3",
      "summary": "Discussed Q1 priorities and blockers...",
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:30:00.000Z"
    },
    {
      "id": 2,
      "title": "Client Meeting",
      "audioPath": null,
      "summary": null,
      "createdAt": "2025-01-09T14:00:00.000Z",
      "updatedAt": "2025-01-09T14:00:00.000Z"
    }
  ]
}
```

**Empty List Response:**

```json
{
  "items": []
}
```

**Error Responses:**

_401 Unauthorized - Missing or invalid token:_

```json
{
  "error": "Unauthorized"
}
```

_401 Unauthorized - Invalid JWT signature:_

```json
{
  "error": "Invalid token"
}
```

**Example Request (curl):**

```bash
curl -X GET http://localhost:4000/api/meetings \
  -b cookies.txt \
  | jq '.items'
```

**Notes:**

- Results ordered by createdAt descending (newest first)
- Transcript field excluded from list view for performance
- Only returns meetings owned by authenticated user
- Returns empty array if user has no meetings

---

### POST `/api/meetings`

Create a new meeting (metadata only, no audio yet).

**Authentication:** Required (JWT cookie)

**Request Headers:**

```
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

```json
{
  "title": "Team Standup - Jan 10" // Required, 1-200 characters
}
```

**Validation Rules:**

- `title`: Required, minimum 1 character, maximum 200 characters

**Success Response (201 Created):**

```json
{
  "item": {
    "id": 1,
    "title": "Team Standup - Jan 10",
    "audioPath": null,
    "transcript": null,
    "summary": null,
    "actionItems": null,
    "decisions": null,
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z",
    "ownerId": 1
  }
}
```

**Error Responses:**

_400 Bad Request - Validation failed:_

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "message": "Title is required",
      "path": ["title"]
    }
  ]
}
```

_400 Bad Request - Title too long:_

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_big",
      "maximum": 200,
      "type": "string",
      "message": "Title too long",
      "path": ["title"]
    }
  ]
}
```

_401 Unauthorized - Not authenticated:_

```json
{
  "error": "Unauthorized"
}
```

**Example Request (curl):**

```bash
curl -X POST http://localhost:4000/api/meetings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Team Standup - Jan 10"}'
```

**Side Effects:**

- Creates Meeting record in database
- Associates meeting with authenticated user (ownerId)
- All optional fields (audioPath, transcript, summary) are null initially

**Workflow:**

1. Create meeting → 2. Upload audio → 3. Process meeting

---

### GET `/api/meetings/:id`

Get detailed information about a specific meeting.

**Authentication:** Required (JWT cookie)

**URL Parameters:**

- `id` (integer) - Meeting ID

**Request:**

```http
GET /api/meetings/1 HTTP/1.1
Host: localhost:4000
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "item": {
    "id": 1,
    "title": "Team Standup - Jan 10",
    "audioPath": "uploads/audio-123456.mp3",
    "transcript": "John: Good morning everyone. Let's start with updates...",
    "summary": "Team discussed Q1 priorities. Main focus is completing MVP by end of month. Sarah reported progress on authentication module. Mike mentioned database optimization needed.",
    "actionItems": [
      {
        "owner": "Sarah",
        "task": "Complete authentication module",
        "due": "Jan 15"
      },
      {
        "owner": "Mike",
        "task": "Optimize database queries",
        "due": "Jan 20"
      }
    ],
    "decisions": [
      "Ship MVP by January 31",
      "Use PostgreSQL for production",
      "Weekly standups on Mondays at 10am"
    ],
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:30:00.000Z",
    "ownerId": 1
  }
}
```

**Response for Unprocessed Meeting:**

```json
{
  "item": {
    "id": 2,
    "title": "Client Meeting",
    "audioPath": "uploads/audio-789012.mp3",
    "transcript": null,
    "summary": null,
    "actionItems": [],
    "decisions": [],
    "createdAt": "2025-01-09T14:00:00.000Z",
    "updatedAt": "2025-01-09T14:00:00.000Z",
    "ownerId": 1
  }
}
```

**Error Responses:**

_400 Bad Request - Invalid ID format:_

```json
{
  "error": "Invalid meeting ID format"
}
```

_401 Unauthorized - Not authenticated:_

```json
{
  "error": "Unauthorized"
}
```

_404 Not Found - Meeting doesn't exist or doesn't belong to user:_

```json
{
  "error": "Meeting not found"
}
```

**Example Request (curl):**

```bash
curl -X GET http://localhost:4000/api/meetings/1 \
  -b cookies.txt \
  | jq '.item'
```

**Notes:**

- `actionItems` and `decisions` are parsed from JSON strings to arrays
- Returns empty arrays `[]` if meeting not yet processed
- User can only access their own meetings (enforces ownerId check)
- Full transcript included (can be large)

---

### POST `/api/meetings/:id/upload`

Upload an audio or video file for a meeting.

**Authentication:** Required (JWT cookie)

**URL Parameters:**

- `id` (integer) - Meeting ID

**Request Headers:**

```
Content-Type: multipart/form-data
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body (multipart/form-data):**

- **Field name:** `audio`
- **Content-Type:** `audio/mpeg` (or audio/wav, audio/m4a, video/mp4, etc.)
- **File data:** `<binary audio/video file>`

**Supported File Types:**

- **Audio:** mp3, wav, m4a, mpeg, webm
- **Video:** mp4, mpeg, webm
- **MIME types:** audio/mpeg, audio/mp3, audio/wav, audio/m4a, audio/x-m4a, video/mp4, video/mpeg, audio/webm, video/webm

**File Size Limit:** 100MB

**Success Response (200 OK):**

```json
{
  "ok": true,
  "audioPath": "uploads/1234567890-audio.mp3",
  "message": "Audio file uploaded successfully"
}
```

**Error Responses:**

_400 Bad Request - Invalid meeting ID:_

```json
{
  "error": "Invalid meeting ID format"
}
```

_400 Bad Request - No file provided:_

```json
{
  "error": "No audio file provided"
}
```

_400 Bad Request - Invalid file type:_

```json
{
  "error": "Invalid file type. Only audio/video files are allowed."
}
```

_401 Unauthorized - Not authenticated:_

```json
{
  "error": "Unauthorized"
}
```

_404 Not Found - Meeting not found:_

```json
{
  "error": "Meeting not found"
}
```

_500 Internal Server Error - File save failed:_

```json
{
  "error": "Failed to upload audio file"
}
```

**Example Request (curl):**

```bash
curl -X POST http://localhost:4000/api/meetings/1/upload \
  -b cookies.txt \
  -F "audio=@/path/to/recording.mp3"
```

**Example with File Size Check:**

```bash
# Check file size before upload (must be < 100MB)
ls -lh recording.mp3

# Upload
curl -X POST http://localhost:4000/api/meetings/1/upload \
  -b cookies.txt \
  -F "audio=@recording.mp3" \
  | jq '.'
```

**Side Effects:**

- Saves file to `server/uploads/` directory
- Updates meeting record with audioPath
- Deletes previous audio file if exists
- File stored with unique name (multer generates)
- On error, uploaded file is automatically cleaned up

**Important Notes:**

- Can upload multiple times (replaces previous file)
- Audio file must be uploaded before processing
- Original filename not preserved (security)
- Files served via `GET /uploads/<filename>` (static route)

**Workflow:**

1. Create meeting → 2. Upload audio → 3. Process meeting

---

### POST `/api/meetings/:id/process`

Transcribe audio and generate AI summary, action items, and decisions.

**Authentication:** Required (JWT cookie)

**URL Parameters:**

- `id` (integer) - Meeting ID

**Request:**

```http
POST /api/meetings/1/process HTTP/1.1
Host: localhost:4000
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "item": {
    "id": 1,
    "title": "Team Standup - Jan 10",
    "audioPath": "uploads/audio-123456.mp3",
    "transcript": "John: Good morning everyone. Sarah, can you give us an update on the authentication module? Sarah: Sure, I'm about 80% done. Should be ready by next week. Mike: I've been working on database optimization...",
    "summary": "Team discussed Q1 priorities and current sprint progress. Sarah is completing the authentication module by January 15. Mike identified database performance issues that need attention. Team agreed to ship MVP by end of month.",
    "actionItems": [
      {
        "owner": "Sarah",
        "task": "Complete authentication module testing",
        "due": "January 15"
      },
      {
        "owner": "Mike",
        "task": "Profile and optimize slow database queries",
        "due": "January 20"
      },
      {
        "owner": "John",
        "task": "Schedule client demo for MVP",
        "due": "January 25"
      }
    ],
    "decisions": [
      "Ship MVP by January 31",
      "Use PostgreSQL for production database",
      "Implement Redis caching for frequently accessed data",
      "Weekly standups moved to Mondays at 10am"
    ],
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:35:00.000Z",
    "ownerId": 1
  },
  "message": "Meeting processed successfully"
}
```

**Error Responses:**

_400 Bad Request - Invalid meeting ID:_

```json
{
  "error": "Invalid meeting ID format"
}
```

_400 Bad Request - No audio uploaded:_

```json
{
  "error": "No audio file found. Please upload audio first."
}
```

_400 Bad Request - Audio file missing on disk:_

```json
{
  "error": "Audio file not found on server. Please re-upload."
}
```

_401 Unauthorized - Not authenticated:_

```json
{
  "error": "Unauthorized"
}
```

_404 Not Found - Meeting not found:_

```json
{
  "error": "Meeting not found"
}
```

_500 Internal Server Error - Transcription failed:_

```json
{
  "error": "Failed to transcribe audio",
  "details": "OpenAI API error: Rate limit exceeded"
}
```

_500 Internal Server Error - AI analysis failed:_

```json
{
  "error": "Failed to analyze transcript with AI",
  "details": "Invalid OpenAI API key"
}
```

**Example Request (curl):**

```bash
curl -X POST http://localhost:4000/api/meetings/1/process \
  -b cookies.txt \
  | jq '.'
```

**Processing Pipeline:**

1. **Validate:** Check meeting exists, audio uploaded, file exists on disk
2. **Transcribe:** Send audio to transcription provider (Whisper or Stub)
3. **Analyze:** Send transcript to AI provider (OpenAI or Stub) for summarization
4. **Extract:** Parse action items (owner, task, due date) and decisions
5. **Save:** Update meeting with transcript, summary, actionItems (JSON), decisions (JSON)
6. **Return:** Parsed data with arrays (not JSON strings)

**Provider Configuration:**

_Development (Stub Providers):_

```env
AI_PROVIDER=stub
TRANSCRIBE_PROVIDER=stub
```

- Instant processing (no API calls)
- Deterministic outputs for testing
- No API keys required

_Production (Real Providers):_

```env
AI_PROVIDER=openai
TRANSCRIBE_PROVIDER=whisper
OPENAI_API_KEY=sk-...
```

- Real transcription via Whisper API
- AI summarization via GPT-4o-mini
- Requires valid OpenAI API key

**Performance Notes:**

- Processing time depends on audio length and API response
- **Stub providers:** < 1 second
- **Whisper API:** 10-60 seconds (depends on file size)
- **OpenAI analysis:** 5-15 seconds
- **Total with real providers:** 15-75 seconds

**Rate Limits:**

- **OpenAI:** Varies by account tier (handle 429 errors)
- **Whisper:** Max file size 25MB, subject to OpenAI rate limits
- Backend implements retry logic for transient failures (3 retries with exponential backoff)

**Workflow:**

1. Create meeting → 2. Upload audio → 3. Process meeting

**Side Effects:**

- Updates meeting record with transcript, summary, actionItems, decisions
- `updatedAt` timestamp refreshed
- `actionItems` and `decisions` stored as JSON strings in database
- Original audio file preserved (not deleted)

---

## Data Models

### User Model

Represents an authenticated user account.

**Database Table:** `User`

| Field     | Type      | Description                | Constraints             |
| --------- | --------- | -------------------------- | ----------------------- |
| id        | Integer   | Primary key                | Auto-increment          |
| email     | String    | User's email address       | Unique, valid email     |
| name      | String?   | Optional display name      | Nullable                |
| password  | String    | Bcrypt hashed password     | Min 6 chars (plaintext) |
| createdAt | DateTime  | Account creation timestamp | Auto-generated          |
| meetings  | Meeting[] | User's meetings (relation) | Cascade delete          |

**Password Security:**

- Stored using bcrypt with 10 rounds
- Never returned in API responses
- Minimum 6 characters (plaintext) enforced at validation

**Relations:**

- One user has many meetings
- Deleting user cascades to meetings (all user's meetings deleted)

---

### Meeting Model

Represents a single meeting with transcription and AI analysis.

**Database Table:** `Meeting`

| Field       | Type     | Description                    | Constraints            |
| ----------- | -------- | ------------------------------ | ---------------------- |
| id          | Integer  | Primary key                    | Auto-increment         |
| title       | String   | Meeting title                  | 1-200 characters       |
| audioPath   | String?  | Relative path to audio file    | Nullable               |
| transcript  | String?  | Full transcription text        | Nullable, can be large |
| summary     | String?  | AI-generated executive summary | Nullable, ~120 words   |
| actionItems | String?  | JSON array of action items     | Nullable, JSON string  |
| decisions   | String?  | JSON array of decisions        | Nullable, JSON string  |
| createdAt   | DateTime | Meeting creation timestamp     | Auto-generated         |
| updatedAt   | DateTime | Last modification timestamp    | Auto-updated           |
| ownerId     | Integer  | Foreign key to User            | Required               |
| owner       | User     | Meeting owner (relation)       | Cascade delete         |

**JSON Field Structures:**

_actionItems (stored as JSON string):_

```json
[
  {
    "owner": "Sarah", // Optional: person responsible
    "task": "Complete authentication module", // Required: description
    "due": "January 15" // Optional: deadline (free text)
  }
]
```

_decisions (stored as JSON string):_

```json
[
  "Ship MVP by January 31",
  "Use PostgreSQL for production",
  "Implement Redis caching"
]
```

**Relations:**

- Each meeting belongs to one user (owner)
- Deleting user cascades to all their meetings

**File Storage:**

- `audioPath` is relative to `server/` directory
- Example: `uploads/1704895200000-audio.mp3`
- Files served via Express static middleware at `/uploads/:filename`

**Lifecycle:**

1. **Created:** title set, all optional fields null
2. **Audio Uploaded:** audioPath populated
3. **Processed:** transcript, summary, actionItems, decisions populated
4. **Updated:** Can re-upload audio and re-process

---

## Environment Variables

Complete reference for server configuration.

### Required Variables

| Variable     | Description                       | Example                                                           |
| ------------ | --------------------------------- | ----------------------------------------------------------------- |
| JWT_SECRET   | Secret key for signing JWT tokens | `your_32_char_secret_key_here`                                    |
| DATABASE_URL | Database connection string        | `file:./dev.db` (SQLite)<br>`postgresql://user:pass@host:5432/db` |

### Optional Variables (with defaults)

| Variable            | Description                      | Default                 | Values                      |
| ------------------- | -------------------------------- | ----------------------- | --------------------------- |
| PORT                | Server port                      | `4000`                  | Any valid port              |
| NODE_ENV            | Environment mode                 | `development`           | `development`, `production` |
| FRONTEND_URL        | CORS allowed origin              | `http://localhost:5173` | Any URL                     |
| AI_PROVIDER         | AI summarization provider        | `stub`                  | `stub`, `openai`            |
| TRANSCRIBE_PROVIDER | Transcription provider           | `stub`                  | `stub`, `whisper`           |
| OPENAI_API_KEY      | OpenAI API key (if using OpenAI) | -                       | `sk-...`                    |

### Development Configuration

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=dev_secret_at_least_32_characters_long
DATABASE_URL="file:./dev.db"
AI_PROVIDER=stub
TRANSCRIBE_PROVIDER=stub
```

### Production Configuration

```env
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
JWT_SECRET=<generate strong secret>
DATABASE_URL="postgresql://postgres:password@db:5432/meeting_copilot"
AI_PROVIDER=openai
TRANSCRIBE_PROVIDER=whisper
OPENAI_API_KEY=sk-your-real-api-key
```

### Security Best Practices

- Never commit `.env` files to version control
- Use strong, randomly generated `JWT_SECRET` (min 32 chars)
- Rotate secrets regularly in production
- Use environment-specific `.env` files (`.env.development`, `.env.production`)

---

## Error Handling Patterns

### Common Error Scenarios

#### 1. Authentication Errors (401)

```json
{
  "error": "Unauthorized" // Missing token
}
```

```json
{
  "error": "Invalid token" // Expired or malformed JWT
}
```

**Resolution:** Login again to obtain fresh token

---

#### 2. Validation Errors (400)

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["title"],
      "message": "Required"
    }
  ]
}
```

**Resolution:** Fix request body according to validation rules

---

#### 3. Resource Not Found (404)

```json
{
  "error": "Meeting not found"
}
```

**Possible causes:**

- Meeting doesn't exist
- Meeting belongs to different user
- Invalid ID format

**Resolution:** Verify meeting ID and ownership

---

#### 4. API Provider Errors (500)

```json
{
  "error": "Failed to transcribe audio",
  "details": "Rate limit exceeded. Please try again later."
}
```

**Common API errors:**

- Invalid API key (401 from OpenAI)
- Rate limit exceeded (429 from OpenAI)
- Service unavailable (500 from OpenAI)
- File too large for Whisper (413)

**Resolution:**

- Check API key validity
- Wait and retry (backend auto-retries 3x)
- Switch to stub providers for development
- Reduce file size if too large

---

#### 5. File Upload Errors (400)

```json
{
  "error": "Invalid file type. Only audio/video files are allowed."
}
```

**Resolution:** Upload supported file formats (mp3, wav, m4a, mp4, webm)

---

### Error Response Structure

All errors follow this structure:

```typescript
{
  error: string;         // Human-readable message
  details?: string | object;  // Optional additional context
}
```

### HTTP Status Code Summary

| Code | Meaning               | When Used                                                |
| ---- | --------------------- | -------------------------------------------------------- |
| 400  | Bad Request           | Validation failed, missing required data, invalid format |
| 401  | Unauthorized          | Missing/invalid JWT token                                |
| 404  | Not Found             | Resource doesn't exist or user doesn't own it            |
| 500  | Internal Server Error | Database error, API provider error, unexpected failure   |

---

## Testing Guide

### Using curl

**1. Complete Flow Example:**

```bash
# Create cookies file
touch cookies.txt

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}' \
  -c cookies.txt

# Create meeting
MEETING_ID=$(curl -X POST http://localhost:4000/api/meetings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Meeting"}' \
  | jq -r '.item.id')

echo "Created meeting ID: $MEETING_ID"

# Upload audio
curl -X POST http://localhost:4000/api/meetings/$MEETING_ID/upload \
  -b cookies.txt \
  -F "audio=@sample-audio.mp3"

# Process meeting
curl -X POST http://localhost:4000/api/meetings/$MEETING_ID/process \
  -b cookies.txt \
  | jq '.'

# Get meeting details
curl -X GET http://localhost:4000/api/meetings/$MEETING_ID \
  -b cookies.txt \
  | jq '.item | {title, summary, actionItems, decisions}'

# Logout
curl -X POST http://localhost:4000/api/auth/logout \
  -b cookies.txt
```

---

### Using Postman

**1. Setup:**

- Create new collection "AI Meeting Copilot"
- Add environment with variable `baseUrl = http://localhost:4000`

**2. Configure Cookie Handling:**

- Postman automatically handles cookies
- Login once, subsequent requests use stored cookie

**3. Request Sequence:**

1. `POST {{baseUrl}}/api/auth/register`
2. `POST {{baseUrl}}/api/meetings` → Save `item.id` to variable
3. `POST {{baseUrl}}/api/meetings/{{meetingId}}/upload` (form-data, key="audio")
4. `POST {{baseUrl}}/api/meetings/{{meetingId}}/process`
5. `GET {{baseUrl}}/api/meetings/{{meetingId}}`

---

### Automated Testing (Jest)

**Run the test suite:**

```bash
cd server
npm test
```

**Test Coverage:**

- Auth registration (success, duplicate, validation)
- Auth login (success, wrong password, validation)
- Meeting CRUD operations
- File upload (success, validation, user isolation)
- Processing flow (with stub providers)
- User isolation (cannot access other users' meetings)

---

## Rate Limiting and Constraints

### File Upload Constraints

- **Max file size:** 100MB (configurable via multer)
- **Whisper API limit:** 25MB per file
- **Supported formats:** mp3, wav, m4a, mp4, mpeg, webm
- **Recommendation:** Compress large files before upload

### API Rate Limits (OpenAI)

- Varies by account tier (free, paid, enterprise)
- **Typical limits:** 3 RPM (requests per minute) on free tier
- **Backend handling:** 3 automatic retries with exponential backoff
- **Error code:** 429 Too Many Requests

### Database Constraints

- **Meeting title:** 1-200 characters
- **Email:** Must be unique, valid format
- **Password:** Minimum 6 characters (plaintext)

### Best Practices

- **For large files:** Use compression tools (ffmpeg) to reduce size
- **For rate limits:** Implement queue system for batch processing
- **For production:** Consider upgrading OpenAI tier or using dedicated transcription service

---

## Migration from SQLite to PostgreSQL

For production deployment, switch from SQLite to PostgreSQL.

### Steps:

**1. Update DATABASE_URL:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/meeting_copilot"
```

**2. Update Prisma Schema:**

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

**3. Generate New Migration:**

```bash
npx prisma migrate dev --name postgres_init
```

**4. Apply Migrations:**

```bash
npx prisma migrate deploy
```

**5. Docker Compose Handles This Automatically:**

The provided `docker-compose.yml` already configures PostgreSQL.

---

## Additional Resources

### Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Whisper API Guide](https://platform.openai.com/docs/guides/speech-to-text)

### Frontend Integration

The frontend should:

- Store JWT in httpOnly cookie (automatic via Set-Cookie header)
- Include cookie in all requests (automatic via browser)
- Handle 401 errors by redirecting to login
- Show loading states during processing (can take 15-75 seconds)
- Poll `/api/meetings/:id` for status updates (future enhancement)

### Future Enhancements

- Real-time processing status updates (WebSockets)
- S3 file storage for scalability
- Full-text search across transcripts
- Export meetings to PDF/DOCX
- Calendar integrations (Google Calendar, Outlook)
- Slack/Jira integrations for action items
- Multi-language transcription support
- Speaker diarization (identify who said what)

---

## Summary

This API provides:

✅ Secure authentication with JWT cookies  
✅ Meeting management (CRUD operations)  
✅ Audio/video file uploads  
✅ AI-powered transcription and analysis  
✅ Action item and decision extraction  
✅ User isolation (can only access own meetings)  
✅ Comprehensive error handling  
✅ Development and production configurations

### Key Endpoints:

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `POST /api/meetings` - Create meeting
- `POST /api/meetings/:id/upload` - Upload audio
- `POST /api/meetings/:id/process` - Transcribe & analyze
- `GET /api/meetings/:id` - Get results

For questions or issues, refer to the source code or open an issue in the repository.

---

**This completes the comprehensive API documentation for the AI Meeting Copilot backend MVP. The API is production-ready with proper validation, error handling, testing, and Docker deployment support.**

**Commit message:** `docs(api): add comprehensive API endpoints documentation`  
**PR title:** `docs: Complete API reference with all endpoints and examples`  
**Notes:** Comprehensive documentation covering all endpoints, request/response formats, error handling, data models, environment variables, testing guide, and integration examples. Self-contained reference for frontend developers. Includes curl examples, validation rules, and common error scenarios.
