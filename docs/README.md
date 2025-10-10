# 🤖 AI Meeting Copilot — MVP

## 📌 Overview

**AI Meeting Copilot** is a SaaS application designed to boost team productivity by automatically processing meetings. It transcribes uploaded audio/video files, generates AI-powered summaries, extracts action items, and stores meeting decisions in a searchable knowledge base.

This repository contains the **MVP monorepo** implementation with a **production-ready backend** built on **Node.js + Express + Prisma** and a frontend scaffolding using **React + Vite + TailwindCSS**.

---

## 📂 Current Directory Structure

```
ai-meeting-copilot
├── docs
│   ├── api-documentation.md        # Complete API reference
│   ├── dir-structure-mind-map.md
│   ├── dir-structure.md
│   └── README.md
├── server
│   ├── prisma
│   │   ├── migrations
│   │   │   ├── 20250901101552_init/migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── dev.db
│   │   └── schema.prisma
│   ├── src
│   │   ├── middleware
│   │   │   └── auth.ts             # JWT authentication middleware
│   │   ├── routes
│   │   │   ├── auth.ts             # User registration & login
│   │   │   ├── health.ts           # Health check endpoint
│   │   │   └── meetings.ts         # Meeting CRUD + upload + process
│   │   ├── services
│   │   │   ├── ai
│   │   │   │   ├── openai.ts       # OpenAI GPT-4o-mini integration
│   │   │   │   ├── provider.ts     # AI provider interface
│   │   │   │   └── stub.ts         # Development stub
│   │   │   └── transcription
│   │   │       ├── provider.ts     # Transcription interface
│   │   │       ├── stub.ts         # Development stub
│   │   │       └── whisper.ts      # OpenAI Whisper implementation
│   │   ├── tests
│   │   │   ├── auth.test.ts        # Auth route tests
│   │   │   ├── meetings.test.ts    # Meeting route tests
│   │   │   └── setup.ts            # Test configuration
│   │   ├── utils
│   │   │   ├── jwt.ts              # JWT sign/verify helpers
│   │   │   └── parsing.ts          # JSON parsing utilities
│   │   ├── db.ts                   # Prisma client
│   │   ├── env.ts                  # Environment validation
│   │   ├── index.ts                # Express server bootstrap
│   │   └── types.ts                # TypeScript types
│   ├── uploads/.gitkeep
│   ├── .dockerignore
│   ├── .env.example
│   ├── .env.production.example
│   ├── .gitignore
│   ├── jest.config.js              # Jest test configuration
│   ├── package.json
│   └── tsconfig.json
├── web
│   ├── public
│   ├── src
│   │   ├── assets/react.svg
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .dockerignore
├── docker-compose.yml              # Production deployment
├── Dockerfile                      # Multi-stage production build
├── package-lock.json
└── package.json
```

---

## ✅ Backend Implementation (Complete)

### 🔐 Authentication & Authorization

- ✅ JWT-based authentication with httpOnly cookies
- ✅ Secure password hashing (bcrypt, 10 rounds)
- ✅ User registration with email validation
- ✅ Login with credential verification
- ✅ Logout with cookie clearing
- ✅ Protected routes with auth middleware

### 📊 Meeting Management

- ✅ Create meeting metadata (title)
- ✅ List all user meetings (ordered by creation date)
- ✅ Get detailed meeting information
- ✅ User isolation (users can only access their own meetings)
- ✅ Comprehensive input validation (Zod schemas)

### 📁 File Handling

- ✅ Audio/video file upload (mp3, wav, m4a, mp4, webm)
- ✅ 100MB file size limit
- ✅ File type validation (MIME type + extension)
- ✅ Cross-platform path normalization (Windows/Linux)
- ✅ Automatic file cleanup on errors
- ✅ Replace existing audio files

### 🤖 AI Integration

- ✅ OpenAI GPT-4o-mini for summarization
- ✅ OpenAI Whisper for transcription
- ✅ Retry logic with exponential backoff (3 attempts)
- ✅ Action item extraction (owner, task, due date)
- ✅ Decision extraction from transcripts
- ✅ Stub providers for development (no API keys required)
- ✅ Error handling for rate limits (429) and API failures

### 🗄️ Database

- ✅ Prisma ORM with TypeScript
- ✅ SQLite for development
- ✅ PostgreSQL support for production
- ✅ User and Meeting models with relations
- ✅ Foreign key constraints with cascade delete
- ✅ Automatic timestamps (createdAt, updatedAt)

### ✅ Testing

- ✅ Jest + Supertest configuration
- ✅ 36 comprehensive tests (all passing)
- ✅ Auth tests (register, login, logout, validation)
- ✅ Meeting tests (CRUD, upload, process, authorization)
- ✅ User isolation tests
- ✅ File upload tests with cleanup
- ✅ Test coverage for error scenarios

### 🐳 DevOps & Deployment

- ✅ Multi-stage Dockerfile for production
- ✅ Docker Compose with PostgreSQL
- ✅ Health check endpoints
- ✅ Environment variable validation
- ✅ CORS configuration
- ✅ Production-ready error handling

### 📝 Documentation

- ✅ Complete API documentation (docs/api-documentation.md)
- ✅ All endpoints documented with examples
- ✅ Request/response schemas
- ✅ Error scenarios and status codes
- ✅ curl and Postman examples
- ✅ Environment configuration guide

---

## 🔜 Frontend Implementation (Pending)

### Pages to Build

- ⏳ Login page with form validation
- ⏳ Register page with error handling
- ⏳ Dashboard with meeting list
- ⏳ Meeting detail page (transcript, summary, action items, decisions)
- ⏳ Meeting creation flow
- ⏳ File upload interface (drag & drop)

### Components to Build

- ⏳ Layout component with navigation
- ⏳ TopBar with user menu
- ⏳ FileDrop component for audio uploads
- ⏳ Card component for meeting items
- ⏳ Badge component for status indicators
- ⏳ Loading states for async operations

### State Management

- ⏳ Auth store (user session, login/logout)
- ⏳ Meeting store (list, current meeting)
- ⏳ API client with axios
- ⏳ Cookie-based authentication handling

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- SQLite (development)
- Docker (optional, for production)

### Development Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd ai-meeting-copilot
```

**2. Install dependencies**

```bash
npm install
cd server && npm install
cd ../web && npm install
```

**3. Configure environment**

```bash
cd server
cp .env.example .env
# Edit .env and set JWT_SECRET
```

**4. Run database migrations**

```bash
cd server
npx prisma migrate dev
```

**5. Start the backend**

```bash
cd server
npm run dev
# Server runs on http://localhost:4000
```

**6. Run tests**

```bash
cd server
npm test
```

**7. Start the frontend (in separate terminal)**

```bash
cd web
npm run dev
# Frontend runs on http://localhost:5173
```

---

### Using Real AI Providers

To use OpenAI instead of stub providers:

**1. Get an OpenAI API key** from https://platform.openai.com

**2. Update .env:**

```env
AI_PROVIDER=openai
TRANSCRIBE_PROVIDER=whisper
OPENAI_API_KEY=sk-your-actual-key-here
```

---

### Production Deployment

**1. Configure production environment**

```bash
cp server/.env.production.example server/.env.production
# Edit with production values
```

**2. Build and start with Docker**

```bash
docker-compose up -d
```

**3. Check logs**

```bash
docker-compose logs -f server
```

---

## 📊 API Endpoints

See `docs/api-documentation.md` for complete API reference.

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `POST /api/auth/logout` - End session

### Meetings

- `GET /api/meetings` - List user's meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings/:id/upload` - Upload audio file
- `POST /api/meetings/:id/process` - Transcribe & analyze

### Health

- `GET /api/health` - API status check
- `GET /` - Server information

---

## 🧪 Testing

Run the complete test suite:

```bash
cd server
npm test
```

### Test coverage:

- ✅ 36 tests total
- ✅ Authentication flows
- ✅ Meeting CRUD operations
- ✅ File upload handling
- ✅ Processing pipeline
- ✅ User isolation
- ✅ Error scenarios

---

## 🛠️ Technology Stack

### Backend

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Prisma ORM (SQLite dev, PostgreSQL prod)
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **File Upload:** Multer
- **AI:** OpenAI GPT-4o-mini + Whisper

### Frontend (Scaffolding)

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Language:** TypeScript

### DevOps

- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL 16
- **Deployment:** Production-ready multi-stage build

---

## 📦 Environment Variables

### Required

- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `DATABASE_URL` - Database connection string

### Optional

- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode (default: development)
- `FRONTEND_URL` - CORS origin (default: http://localhost:5173)
- `AI_PROVIDER` - AI service (stub | openai, default: stub)
- `TRANSCRIBE_PROVIDER` - Transcription service (stub | whisper, default: stub)
- `OPENAI_API_KEY` - OpenAI API key (required if using openai providers)

See `.env.example` for complete configuration.

---

## 🗺️ Roadmap

### Phase 1: Backend MVP ✅ (Complete)

- ✅ Authentication system
- ✅ Meeting CRUD operations
- ✅ File upload handling
- ✅ AI integration (OpenAI + Whisper)
- ✅ Comprehensive testing
- ✅ Docker deployment
- ✅ API documentation

### Phase 2: Frontend MVP ⏳ (In Progress)

- ⏳ Auth pages (Login, Register)
- ⏳ Dashboard with meeting list
- ⏳ Meeting detail page
- ⏳ File upload interface
- ⏳ API integration
- ⏳ State management

### Phase 3: Enhancements 🔮 (Future)

- 🔮 Real-time processing status (WebSockets)
- 🔮 Full-text search across transcripts
- 🔮 S3 file storage
- 🔮 Export to PDF/DOCX
- 🔮 Calendar integrations (Google, Outlook)
- 🔮 Team collaboration features
- 🔮 Slack/Jira integrations
- 🔮 Multi-language support
- 🔮 Speaker diarization

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `chore:` Build/config changes

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Authors

[Your Name] - Initial work

---

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini and Whisper APIs
- Prisma team for excellent ORM
- Express.js community
- React and Vite teams

---

**Status:** Backend MVP Complete ✅ | Frontend In Progress ⏳

For detailed API documentation, see `docs/api-documentation.md`
