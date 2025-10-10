Directory Structure (Mind Map)

```
ai-meeting-copilot
├── server
│ ├── prisma
│ │ └── schema.prisma
│ ├── src
│ │ ├── index.ts # Express bootstrap
│ │ ├── env.ts # Env loader/validator
│ │ ├── db.ts # Prisma client
│ │ ├── middleware
│ │ │ └── auth.ts # JWT auth middleware
│ │ ├── routes
│ │ │ ├── auth.ts # /api/auth
│ │ │ ├── meetings.ts # /api/meetings CRUD + upload + process
│ │ │ └── health.ts # /api/health
│ │ ├── services
│ │ │ ├── ai
│ │ │ │ ├── provider.ts # interface
│ │ │ │ ├── openai.ts # OpenAI implementation
│ │ │ │ └── stub.ts # Deterministic dev outputs
│ │ │ └── transcription
│ │ │ ├── provider.ts # interface
│ │ │ ├── whisper.ts # Whisper/OpenAI hook (placeholder)
│ │ │ └── stub.ts # returns canned transcript
│ │ ├── utils
│ │ │ ├── parsing.ts # action item/decision parsers
│ │ │ └── jwt.ts # sign/verify helpers
│ │ └── types.ts
│ ├── uploads/.gitkeep
│ ├── .env.example
│ ├── package.json
│ └── tsconfig.json
└── web
├── index.html
├── src
│ ├── main.tsx
│ ├── App.tsx
│ ├── lib/api.ts # axios client
│ ├── store/auth.ts # auth state
│ ├── components
│ │ ├── Layout.tsx
│ │ ├── TopBar.tsx
│ │ ├── FileDrop.tsx
│ │ ├── Card.tsx
│ │ └── Badge.tsx
│ ├── pages
│ │ ├── Login.tsx
│ │ ├── Register.tsx
│ │ ├── Dashboard.tsx
│ │ └── MeetingDetail.tsx
│ ├── styles.css
│ └── vite-env.d.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```
