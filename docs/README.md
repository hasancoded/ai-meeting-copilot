# 🤖 AI Meeting Copilot — MVP

## 📌 Overview

**AI Meeting Copilot** is a SaaS application designed to boost team productivity by automatically processing meetings. It transcribes uploaded audio/video files, generates AI-powered summaries, extracts action items, and stores meeting decisions in a searchable knowledge base.

This repository contains the **MVP monorepo** implementation with a **production-ready backend** built on **Node.js + Express + Prisma** and a **complete, production-ready frontend** built with **React 19 + Vite + TailwindCSS**.

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
│   │   ├── components
│   │   │   ├── ui
│   │   │   │   ├── Badge.tsx       # Status badge component
│   │   │   │   ├── Button.tsx      # Reusable button with variants
│   │   │   │   ├── Card.tsx        # Card layout components
│   │   │   │   ├── EmptyState.tsx  # No data placeholder
│   │   │   │   ├── Input.tsx       # Form input with validation
│   │   │   │   └── Spinner.tsx     # Loading indicators
│   │   │   ├── CreateMeetingModal.tsx  # Meeting creation modal
│   │   │   ├── FileDrop.tsx        # Drag & drop file upload
│   │   │   ├── Layout.tsx          # Main app layout with nav
│   │   │   └── ProtectedRoute.tsx  # Route authentication guard
│   │   ├── lib
│   │   │   └── api.ts              # Axios API client
│   │   ├── pages
│   │   │   ├── Dashboard.tsx       # Meetings list page
│   │   │   ├── Login.tsx           # Login page
│   │   │   ├── MeetingDetail.tsx   # Meeting detail page
│   │   │   └── Register.tsx        # Registration page
│   │   ├── store
│   │   │   └── auth.ts             # Zustand auth store
│   │   ├── App.tsx                 # Main app with routing
│   │   ├── index.css               # Global styles
│   │   ├── main.tsx                # React entry point
│   │   └── vite-env.d.ts           # Vite TypeScript declarations
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
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

## ✅ Frontend Implementation (Complete)

### 🎨 Pages

- ✅ Login page with form validation (react-hook-form + zod)
- ✅ Register page with error handling and password confirmation
- ✅ Dashboard with meeting list (card-based layout)
- ✅ Meeting detail page with tabs (transcript, summary, action items, decisions)
- ✅ Meeting creation modal with navigation to upload
- ✅ File upload interface with drag & drop (react-dropzone)

### 🧩 Components

- ✅ Layout component with responsive navigation
- ✅ TopBar with user menu and logout
- ✅ FileDrop component for audio uploads with progress
- ✅ Card component for meeting items with hover effects
- ✅ Badge component for status indicators
- ✅ Button component with variants and loading states
- ✅ Input component with validation errors
- ✅ Spinner and loading screen components
- ✅ EmptyState component for no data scenarios
- ✅ ProtectedRoute component for authentication

### 🔧 State Management & API

- ✅ Zustand auth store (user session, login/logout, persistence)
- ✅ API client with axios and interceptors
- ✅ Cookie-based authentication handling
- ✅ Automatic 401 redirect to login
- ✅ Toast notifications for all actions (sonner)
- ✅ Error handling with user-friendly messages
- ✅ Upload progress tracking
- ✅ Processing status indicators

### 🎯 Features

- ✅ **Modern UI/UX**: Gradient auth pages, smooth animations, responsive design
- ✅ **Form Validation**: Real-time validation with react-hook-form + zod
- ✅ **File Upload**: Drag & drop with progress bar and file type validation
- ✅ **Meeting Processing**: Upload → Process → View results workflow
- ✅ **Tab Navigation**: Organized content display (summary, transcript, actions, decisions)
- ✅ **Status Badges**: Visual indicators (Processed, Ready to Process, No Audio)
- ✅ **Empty States**: Helpful messages when no data available
- ✅ **Loading States**: Spinners, skeletons, and progress bars
- ✅ **Responsive Design**: Mobile-first with hamburger menu
- ✅ **Accessibility**: Proper labels, keyboard navigation, ARIA attributes

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
# Install root dependencies (optional)
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../web
npm install
```

**3. Configure backend environment**

```bash
cd server
cp .env.example .env
# Edit .env and set JWT_SECRET (minimum 32 characters)
```

Example `.env`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_32_character_secret_key_here
DATABASE_URL="file:./dev.db"
AI_PROVIDER=stub
TRANSCRIBE_PROVIDER=stub
```

**4. Configure frontend environment**

```bash
cd web
cp .env.example .env
```

Example `.env`:

```env
VITE_API_URL=http://localhost:4000
```

**5. Run database migrations**

```bash
cd server
npx prisma migrate dev
```

**6. Start the backend**

```bash
cd server
npm run dev
# Server runs on http://localhost:4000
```

**7. Start the frontend (in separate terminal)**

```bash
cd web
npm run dev
# Frontend runs on http://localhost:5173
```

**8. Open browser**

Navigate to `http://localhost:5173` and start using the application!

---

### Running Tests

**Backend tests:**

```bash
cd server
npm test
```

**Frontend linting:**

```bash
cd web
npm run lint
```

---

### Using Real AI Providers

To use OpenAI instead of stub providers:

**1. Get an OpenAI API key** from https://platform.openai.com

**2. Update server/.env:**

```env
AI_PROVIDER=openai
TRANSCRIBE_PROVIDER=whisper
OPENAI_API_KEY=sk-your-actual-key-here
```

**3. Restart backend server**

```bash
cd server
npm run dev
```

---

### Production Deployment

**1. Configure production environment**

```bash
cp server/.env.production.example server/.env.production
# Edit with production values (PostgreSQL, OpenAI keys, etc.)
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

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Language:** TypeScript
- **Routing:** React Router 6
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Notifications:** Sonner
- **File Upload:** React Dropzone
- **Icons:** Lucide React

### DevOps

- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL 16 (production)
- **Deployment:** Multi-stage production build

---

## 📦 Environment Variables

### Backend (server/.env)

#### Required

- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `DATABASE_URL` - Database connection string

#### Optional

- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode (default: development)
- `FRONTEND_URL` - CORS origin (default: http://localhost:5173)
- `AI_PROVIDER` - AI service (stub | openai, default: stub)
- `TRANSCRIBE_PROVIDER` - Transcription service (stub | whisper, default: stub)
- `OPENAI_API_KEY` - OpenAI API key (required if using openai providers)

### Frontend (web/.env)

#### Required

- `VITE_API_URL` - Backend API URL (default: http://localhost:4000)

See `.env.example` files for complete configuration templates.

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

### Phase 2: Frontend MVP ✅ (Complete)

- ✅ Auth pages (Login, Register)
- ✅ Dashboard with meeting list
- ✅ Meeting detail page
- ✅ File upload interface
- ✅ API integration
- ✅ State management
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

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
- 🔮 Meeting analytics and insights
- 🔮 Custom AI prompts
- 🔮 Audio playback with timestamps

---

## 🎯 User Workflow

### Complete End-to-End Flow

1. **Register** → Create account with email and password
2. **Login** → Authenticate and receive JWT cookie
3. **Dashboard** → View all meetings or empty state
4. **Create Meeting** → Click "New Meeting" and enter title
5. **Upload Audio** → Drag & drop or select audio/video file
6. **Process Meeting** → Click "Process Meeting" to transcribe and analyze
7. **View Results** → Navigate between tabs:
   - **Summary**: AI-generated executive summary
   - **Transcript**: Full meeting transcription
   - **Action Items**: Extracted tasks with owners and due dates
   - **Decisions**: Key decisions made during meeting
8. **Navigate Back** → Return to dashboard to view all meetings
9. **Logout** → End session and clear authentication

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
- `style:` Code style changes
- `refactor:` Code refactoring

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
- TailwindCSS for utility-first CSS
- Zustand for lightweight state management

---

## 🐛 Known Issues & Troubleshooting

### Backend

- **Issue**: `JWT_SECRET not set` error

  - **Solution**: Copy `.env.example` to `.env` and set a 32+ character secret

- **Issue**: Database migration errors
  - **Solution**: Delete `dev.db` and run `npx prisma migrate dev` again

### Frontend

- **Issue**: CORS errors

  - **Solution**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL

- **Issue**: API requests failing
  - **Solution**: Check that both backend and frontend servers are running

### AI Processing

- **Issue**: OpenAI rate limit exceeded

  - **Solution**: Use stub providers for development or upgrade OpenAI tier

- **Issue**: File too large for Whisper
  - **Solution**: Compress audio file to under 25MB using ffmpeg

---

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Check `docs/api-documentation.md` for API details
- Review backend tests for usage examples

---

**Status:** Full-Stack MVP Complete ✅ | Production Ready 🚀

**Last Updated:** January 2025

For detailed API documentation, see `docs/api-documentation.md`
