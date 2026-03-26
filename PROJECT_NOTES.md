# SuperApp - Complete Project Notes

> One-stop reference. Read this before touching any code.

---

## WHAT IS THIS PROJECT?

A **production-ready Super App** — one unified platform combining 12+ major services.
Think: WhatsApp + Uber + Zomato + OLX + LinkedIn + Discord + WeChat, all in one app.

App title: **"SUPERAPP"**
Target: Indian market (seed data = Indian users)
Two modes: **User Mode** (consumer) and **Business Mode** (merchant/driver/seller)

---

## TECH STACK

### Frontend
- **Next.js** (App Router, latest) — `frontend/`
- **Tailwind CSS 3.3** — DO NOT upgrade to v4
- **Zustand** — global auth state (`frontend/store/useAuthStore.ts`)
- **React Query (@tanstack)** — server state, caching
- **Axios** — HTTP client with JWT interceptor (`frontend/services/api.ts`)
- **Socket.io-client** — real-time chat
- **Convex** — real-time pub/sub events
- **Firebase** — analytics + auth
- **Supabase** — optional BaaS
- **Framer Motion** — animations
- **Lucide React** — icons

### Backend (all Node.js + Express)
- **MongoDB** (Atlas) + Mongoose ODM — primary DB for all services
- **Redis** — caching, session store (chat service)
- **Socket.io** — WebSocket server (chat service)
- **JWT** — auth tokens (shared `JWT_SECRET` across all services)
- **bcryptjs** — password hashing
- **Helmet + CORS + rate-limit** — security
- **Google Gemini API** — AI features

### Infrastructure
- **Docker Compose** — local dev (all services + MongoDB + Redis)
- **Dockerfile.node** — shared Dockerfile for all Node services
- **Convex** — real-time DB for pub/sub events
- Deploy: Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas

---

## ARCHITECTURE

```
Browser/Mobile
     │
     ▼
API Gateway :5050  ← single entry point, JWT verification, rate limiting
     │
     ├── auth-service :5001
     ├── user-service :5002
     ├── chat-service :5003  (also has Socket.io WebSocket)
     ├── social-service :5004
     ├── ... (39 total microservices)
     │
     ├── MongoDB :27017
     └── Redis :6379

Convex (cloud) ← real-time pub/sub (separate from Socket.io)
```

---

## ALL 39 MICROSERVICES

| Service | Port | Purpose |
|---------|------|---------|
| auth-service | 5001 | JWT login/register, OAuth, 2FA (TOTP) |
| user-service | 5002 | User profiles, preferences |
| chat-service | 5003 | 1-to-1 + group chat, Socket.io |
| social-service | 5004 | Feed, posts, likes, comments |
| professional-service | 5006 | Dev profiles, LeetCode/GitHub stats |
| dating-service | 5007 | Dating profiles, matching |
| marketplace-service | 5008 | C2C buy/sell listings |
| ride-service | 5009 | Ride booking, driver matching |
| food-service | 5010 | Restaurant + food delivery |
| productivity-service | 5011 | Tasks, notes, calendar |
| mini-app-service | 5012 | Mini apps ecosystem |
| notification-service | 5013 | Push notifications |
| dashboard-service | 5024 | User dashboards |
| global-search-service | 5025 | Unified search |
| settings-service | 5027 | User settings/privacy |
| super-communication-service | 5028 | Channels, broadcast, advanced messaging |
| advanced-interactions-service | 5029 | Reactions, message actions |
| snap-service | 5031 | Disappearing messages/media |
| payment-service | 5032 | UPI, wallet, transactions |
| ai-service | 5033 | Gemini AI: summaries, smart replies |
| cart-service | 5035 | Shopping cart |
| order-service | 5036 | Order processing/tracking |
| advanced-dating-service | — | Enhanced dating |
| advanced-food-service | — | Enhanced food |
| advanced-marketplace-service | — | Enhanced marketplace |
| advanced-miniapp-service | — | Enhanced mini apps |
| advanced-ride-service | — | Enhanced rides |
| aggregator-service | — | Data aggregation |
| analytics-service | — | Usage analytics |
| business-dashboard-service | — | Seller/driver analytics |
| community-service | — | Community management |
| discord-service | — | Discord-like servers with roles |
| economy-service | — | Gig economy, freelancing |
| facebook-service | — | Facebook-like features |
| game-service | — | In-app games |
| group-chat-service | — | Group chat management |
| hotel-service | — | Hotel booking |
| monetization-service | — | Creator economy, revenue sharing |
| story-service | — | Stories/status |

---

## FRONTEND PAGES (32+ routes)

```
/                    → Home dashboard (mini apps grid, nearby rides, food, people)
/login               → Login page
/register            → Register page
/forgot-password     → Password reset
/onboarding          → New user onboarding

/feed                → Social feed (posts, likes, comments)
/explore             → Explore/discover + map view
/snaps               → Disappearing media (Snapchat-like)
/status              → Stories/status

/chat                → Chat list
/chat/[id]           → Individual chat
/channels/[id]       → Broadcast channels
/random-chat         → Random stranger chat
/calls               → Voice/video calls
/live                → Live streaming

/marketplace         → Browse listings
/marketplace/[id]    → Product detail
/marketplace/sell    → Create listing
/marketplace/cart    → Shopping cart
/marketplace/orders  → Order history

/rides               → Book a ride
/rides/jobs          → Driver mode (business)
/food                → Food delivery
/dating              → Dating/matching
/professional        → Professional profile
/coding              → Coding stats (LeetCode/GitHub)

/calendar            → Calendar
/tasks               → Task manager
/notes               → Notes

/business-dashboard  → Business analytics
/business/[id]       → Business profile
/business/analytics  → Analytics (business mode)

/u/[username]        → Public user profile
/settings            → User settings
/wallet              → Wallet/payments
/notifications       → Notifications
/apps                → Mini apps hub
/forms               → Forms builder
/services/[id]       → Service marketplace
```

---

## FRONTEND KEY FILES

```
frontend/
├── app/layout.tsx              ← Root layout, wraps with Providers + ConvexClientProvider + Layout
├── app/page.tsx                ← Home page (MobileView + DesktopView components)
├── app/globals.css             ← Global styles
├── components/Layout.tsx       ← Sidebar (desktop) + bottom nav (mobile) + mode switcher
├── components/Providers.tsx    ← React Query provider
├── components/ConvexClientProvider.tsx ← Convex real-time provider
├── hooks/useAuth.ts            ← Auth state, token management, route protection
├── hooks/usePermissions.ts     ← Role-based access control
├── services/api.ts             ← Axios instance, JWT interceptor, base URL
├── services/authApi.ts         ← Login, register, OAuth, password reset calls
├── services/apiServices.ts     ← General API calls
├── store/useAuthStore.ts       ← Zustand: user, token, appMode, activities
├── lib/firebase.ts             ← Firebase config
├── lib/supabase.ts             ← Supabase config
└── lib/socket.ts               ← Socket.io client config
```

---

## NAVIGATION STRUCTURE

Layout has two nav modes (toggled by `appMode` in Zustand store):

**User Mode nav:** Home → Feed → Messages → Apps → Settings

**Business Mode nav:** Dashboard → Listings → Ride Jobs → Analytics → Settings

Desktop: left sidebar (272px wide)
Mobile: fixed bottom nav bar

---

## AUTH FLOW

1. User registers/logs in → `auth-service :5001`
2. JWT token returned → stored in Zustand (`useAuthStore`) + persisted to localStorage
3. Axios interceptor adds `Authorization: Bearer <token>` to every request
4. API Gateway verifies JWT → passes `X-User-Id` header to downstream services
5. `useAuth` hook checks token validity → redirects to `/login` if expired

---

## STANDARD SERVICE STRUCTURE

Every microservice follows this pattern:
```
services/<name>/
├── index.js          ← Express app, middleware, route mounting
├── config/
│   ├── db.js         ← MongoDB connection
│   └── supabase.js   ← (optional)
├── controllers/      ← Business logic
├── models/           ← Mongoose schemas
├── routes/           ← Express routers
├── utils/            ← Helpers, middleware
└── package.json
```

---

## API GATEWAY ROUTING

All requests go through `http://localhost:5050`

| Frontend calls | Gateway routes to |
|---------------|-------------------|
| `/api/auth/*` | auth-service (PUBLIC, no JWT needed) |
| `/api/users/*` | user-service |
| `/api/chats/*` | chat-service (WebSocket supported) |
| `/api/snaps/*` | snap-service |
| `/api/social/*` | social-service |
| `/api/notifications/*` | notification-service |
| `/api/wallet/*` | payment-service |
| `/api/marketplace/*` | marketplace-service |
| `/api/cart/*` | cart-service |
| `/api/orders/*` | order-service |
| `/api/rides/*` | ride-service |
| `/api/food/*` | food-service |
| `/api/dating/*` | dating-service |
| `/api/professional/*` | professional-service |
| `/api/productivity/*` | productivity-service |
| `/api/ai/*` | ai-service |
| `/api/super-comm/*` | super-communication-service |
| `/api/search/*` | global-search-service |
| `/api/advanced-interactions/*` | advanced-interactions-service |

---

## CONVEX REAL-TIME

Schema: `realtimeEvents` table
- `channel: string` — pub/sub channel name
- `event: any` — event payload
- `publishedAt: number` — timestamp
- Indexed by `channel` and `channel + publishedAt`

Functions in `convex/realtime.ts`:
- `publish()` — push event to channel
- `byChannel()` — query events (max 200)

Used for: notifications, live feed updates, activity streams

---

## ENVIRONMENT VARIABLES

Each service has its own `.env`. Key vars:
- `PORT` — service port
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — `super_secret_for_super_app` (shared)
- `REDIS_URL` — Redis connection (chat service)
- `GEMINI_API_KEY` — Google Gemini (ai-service)

Frontend `.env.local`:
- `NEXT_PUBLIC_API_URL` — API Gateway URL
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL

---

## DOCKER COMPOSE SERVICES

Running `docker-compose up` starts:
- `mongodb` :27017
- `redis` :6379
- `api-gateway` :5050
- All 27+ microservices
- `frontend` :3000

---

## IMPORTANT RULES / GOTCHAS

1. **Tailwind CSS must stay at 3.3/3.4** — do NOT upgrade to v4
2. **JWT_SECRET is shared** across all services — changing it breaks all tokens
3. **All DB inserts use array format** in Mongoose: `Model.insertMany([{...}])`
4. **API Gateway is the only public endpoint** — services never exposed directly in prod
5. **appMode** in Zustand controls which nav items show (user vs business)
6. **Convex is separate from Socket.io** — Convex = pub/sub events, Socket.io = chat messages
7. **Frontend uses `prefetch={false}`** on most Links to avoid over-fetching
8. **Mobile and Desktop views are separate components** in `page.tsx` (MobileView / DesktopView)
9. **Auth service uses both MongoDB and Supabase** — Supabase for OAuth, MongoDB for custom auth
10. **Rate limit**: 100 requests per 15 minutes per IP (set in API Gateway)

---

## FEATURES SUMMARY

| Feature | Inspired By | Service |
|---------|------------|---------|
| 1-to-1 + Group Chat | WhatsApp | chat-service |
| Channels + Broadcast | Telegram | super-communication-service |
| Community Servers | Discord | discord-service |
| Social Feed | Twitter/Facebook | social-service |
| Disappearing Media | Snapchat | snap-service |
| Stories | Instagram | story-service |
| Ride Hailing | Uber/Ola | ride-service |
| Food Delivery | Zomato/Swiggy | food-service |
| C2C Marketplace | OLX | marketplace-service |
| Professional Profile | LinkedIn | professional-service |
| Coding Stats | LeetCode/GitHub | professional-service |
| Mini Apps | WeChat | mini-app-service |
| Dating | Tinder | dating-service |
| AI Features | — | ai-service (Gemini) |
| UPI Wallet | PhonePe/GPay | payment-service |
| Business Dashboard | — | business-dashboard-service |
| Hotel Booking | OYO | hotel-service |
| Gig Economy | Fiverr | economy-service |
| Live Streaming | — | (frontend /live) |
| Voice/Video Calls | — | WebRTC (calls service) |
 