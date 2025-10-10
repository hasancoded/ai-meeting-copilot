## 📂 Current Directory Structure

This reflects the **files that currently exist** in the project:

```
ai-meeting-copilot
├── docs
│   ├── api-documentation.md
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
│   ├── server/uploads/.gitkeep
│   ├── src
│   │   ├── middleware/auth.ts
│   │   ├── routes
│   │   │   ├── auth.ts
│   │   │   ├── health.ts
│   │   │   └── meetings.ts
│   │   ├── services
│   │   │   ├── ai
│   │   │   │   ├── openai.ts
│   │   │   │   ├── provider.ts
│   │   │   │   └── stub.ts
│   │   │   └── transcription
│   │   │       ├── provider.ts
│   │   │       ├── stub.ts
│   │   │       └── whisper.ts
│   │   ├── tests
│   │   │   ├── auth.test.ts
│   │   │   ├── meetings.test.ts
│   │   │   └── setup.ts
│   │   ├── utils
│   │   │   ├── jwt.ts
│   │   │   └── parsing.ts
│   │   ├── db.ts
│   │   ├── env.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── uploads/.gitkeep
│   ├── .env
│   ├── .env.development.example
│   ├── .env.development
│   ├── .env.production
│   ├── .env.production.example
│   ├── .gitignore
│   ├── jest.config.js
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
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package-lock.json
└── package.json
```
