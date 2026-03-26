# Workspace — Super App

## Overview

pnpm workspace monorepo using TypeScript. A full-stack Super App with a mobile frontend (Expo) and a microservices-style Express backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + WebSocket (ws)
- **Database**: MongoDB (mongoose) + PostgreSQL (Drizzle ORM)
- **Cache**: Redis (ioredis)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router

## Architecture

### Microservices (Express API Server)

All services run within a single Express server with route-based separation:

| Service | Route | Description |
|---|---|---|
| Health | GET /api/healthz | System health + service status |
| Auth | /api/auth | Firebase token validation, user registration |
| Users | /api/users | Profile CRUD, search |
| Chat | /api/chat | Conversations, messages (WebSocket real-time) |
| Notifications | /api/notifications | Push notification management |
| Mini Apps | /api/mini-apps | Mini app ecosystem catalog |
| AI | /api/ai | Ollama/Llama chat, summarization |

### Real-time

WebSocket server at `/ws` path. Clients connect with `?userId=XXX` and join conversations with `{type:"join", conversationId:"X"}`.

### Integrations

| Service | Purpose | Status |
|---|---|---|
| MongoDB Atlas | Chat, users, notifications storage | Optional (MONGODB_URI env var) |
| Redis | Caching, pub/sub | Optional (REDIS_URL env var) |
| Firebase Auth | Authentication (JWT token parsing) | Configured in frontend |
| Firebase FCM | Push notifications | Configured in frontend |
| Ollama | AI/LLM inference (Llama models) | Optional (OLLAMA_URL env var, default localhost:11434) |

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API + WebSocket server
│   │   └── src/
│   │       ├── lib/        # mongodb.ts, redis.ts, websocket.ts
│   │       ├── models/     # Mongoose models (User, Message, Conversation, etc.)
│   │       └── routes/     # auth, users, chat, notifications, mini-apps, ai
│   └── super-app/          # Expo React Native mobile app
│       └── app/
│           ├── (tabs)/     # Chat, Mini Apps, AI, Notifications, Profile
│           ├── chat/[id].tsx   # Chat conversation screen
│           ├── ai/[id].tsx     # AI conversation screen
│           └── mini-app/[id].tsx # Mini app detail
├── lib/
│   ├── api-spec/           # OpenAPI 3.1 spec + Orval config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

### MongoDB Collections

- **users** — firebaseUid, username, displayName, email, phone, bio, avatarUrl, status, onlineStatus, followersCount, followingCount, fcmToken
- **conversations** — type (private/group/channel), name, description, participants[], lastMessageId, unreadCounts, pinnedBy, mutedBy
- **messages** — conversationId, senderId, content, type, status, replyTo, reactions[]
- **notifications** — userId, title, body, type, isRead, data, actionUrl, avatarUrl
- **aiconversations** — userId, title, model, systemPrompt, messageCount, lastMessage
- **aimessages** — conversationId, role, content, model

## API Endpoints

Full OpenAPI spec at `lib/api-spec/openapi.yaml`

### Auth
- GET  /api/auth/profile    — Get profile from Firebase token
- POST /api/auth/register   — Register user after Firebase auth

### Users
- GET  /api/users/:id       — Get user by ID
- PATCH /api/users/:id      — Update user profile
- GET  /api/users/search    — Search users by username/name

### Chat
- GET  /api/chat/conversations            — List all conversations
- POST /api/chat/conversations            — Create conversation
- GET  /api/chat/conversations/:id        — Get conversation
- GET  /api/chat/conversations/:id/messages — Get messages
- POST /api/chat/conversations/:id/messages — Send message

### Notifications
- GET  /api/notifications           — List notifications
- PATCH /api/notifications/:id/read — Mark read
- PATCH /api/notifications/read-all — Mark all read

### Mini Apps
- GET  /api/mini-apps         — List mini apps
- GET  /api/mini-apps/:id     — Get mini app
- POST /api/mini-apps/:id/launch — Track launch

### AI (Ollama)
- POST /api/ai/chat                          — Send message to AI
- POST /api/ai/summarize                     — Summarize text
- GET  /api/ai/conversations                 — List AI conversations
- POST /api/ai/conversations                 — Create AI conversation
- DELETE /api/ai/conversations/:id           — Delete AI conversation
- GET  /api/ai/conversations/:id/messages    — Get AI messages

## Environment Variables

| Variable | Purpose |
|---|---|
| PORT | Server port (auto-assigned) |
| DATABASE_URL | PostgreSQL connection (Drizzle ORM) |
| MONGODB_URI | MongoDB connection string |
| REDIS_URL | Redis connection string |
| OLLAMA_URL | Ollama server URL (default: http://localhost:11434) |
| EXPO_PUBLIC_DOMAIN | Domain for Expo app API calls |

## Mobile App (Super App)

5 main tabs:
1. **Chat** — Conversations list, real-time messaging via WebSocket
2. **Mini Apps** — App ecosystem with categories, featured apps, ratings
3. **AI** — Ollama-powered AI assistant with conversation history
4. **Notifications** — Push notification management
5. **Profile** — User settings, service status, architecture overview

## Scalability Strategy

1. **Redis Caching** — User profiles, message cache, search results (configurable TTL)
2. **MongoDB Indexing** — Compound indexes on conversationId+timestamp, userId+createdAt
3. **WebSocket Pub/Sub** — Ready to extend with Redis pub/sub for multi-instance support
4. **Rate Limiting** — Can be added via `express-rate-limit`
5. **CDN** — Frontend assets can be served via Cloudflare
6. **Horizontal Scaling** — Stateless API + Redis sessions = multi-instance ready

## Deployment Architecture

- **Frontend**: Vercel/Netlify (Expo web export)
- **Backend**: Render/Railway (Express server)
- **Database**: MongoDB Atlas free tier
- **Cache**: Redis Cloud free tier
- **AI**: Ollama (local or cloud VM)
- **Auth/Notifications**: Firebase (free tier)
- **Storage**: Cloudflare R2 or Firebase Storage

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- Run `pnpm run typecheck` from root for full type check
- Run `pnpm --filter @workspace/api-spec run codegen` after OpenAPI spec changes
- Run `pnpm --filter @workspace/db run push` to sync DB schema

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with WebSocket, MongoDB, Redis.

- `src/index.ts` — reads PORT, starts server
- `src/app.ts` — Express setup, HTTP server, WebSocket init, MongoDB+Redis connect
- `src/lib/` — mongodb.ts, redis.ts, websocket.ts
- `src/models/` — Mongoose schemas
- `src/routes/` — auth, users, chat, notifications, miniapps, ai
- Dev: `pnpm --filter @workspace/api-server run dev`
- Build: `pnpm --filter @workspace/api-server run build`

### `artifacts/super-app` (`@workspace/super-app`)

Expo React Native mobile app with Expo Router.

- `app/(tabs)/` — 5 main tab screens
- `app/chat/[id].tsx` — Chat conversation screen
- `app/ai/[id].tsx` — AI conversation screen
- `app/mini-app/[id].tsx` — Mini app detail screen
- Dev: `pnpm --filter @workspace/super-app run dev`
