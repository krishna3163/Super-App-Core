# 🚀 SuperApp — The Ultimate Everything Platform

<div align="center">

**"One App to rule them all. Chat, shop, ride, eat, work, and play in one unified ecosystem."**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![Android APK](https://img.shields.io/badge/Android-APK%20Build-3DDC84?style=flat-square&logo=android)](./BUILDING_APK.md)

</div>

---

## 📖 What is SuperApp?

SuperApp is a **production-ready, microservices-based super app** built for the Indian market. Instead of juggling 20 different apps, everything lives in one unified platform — chat, food delivery, ride hailing, marketplace, dating, professional networking, payments, and more.

### 🌟 Inspired by the best

| App | Feature Borrowed |
|-----|-----------------|
| 💬 WhatsApp | Fast 1-to-1 & group chat with read receipts |
| 📢 Telegram | Broadcast channels and bots |
| 🎮 Discord | Community servers with roles & channels |
| 🚗 Uber / Ola | Real-time ride booking & driver tracking |
| 🛒 OLX | C2C marketplace for buying & selling |
| 🍔 Zomato / Swiggy | Restaurant browsing & food delivery |
| 💼 LinkedIn / GitHub | Professional profiles & coding stats |
| 🟢 WeChat | Mini Apps ecosystem inside the main app |
| 👻 Snapchat | Disappearing messages & view-once media |

---

## ✨ Feature Highlights

<details>
<summary><b>💬 Chat System</b></summary>

- Private 1-to-1 messaging with read receipts (✓✓) and typing indicators
- WhatsApp-style groups & Discord-style community servers with roles
- Telegram-style broadcast channels
- Voice & Video calls (WebRTC)
- Hold-to-record voice notes with waveform playback
- Message reactions (👍❤️🔥), reply, forward, edit, delete
- Disappearing messages (24h / 7d) and View-Once media
</details>

<details>
<summary><b>🌍 Social Feed</b></summary>

- Unified feed mixing tweets, media posts, and Reddit-style threads
- Like, comment, repost, and upvote/downvote
- Story/status updates (Instagram-like)
</details>

<details>
<summary><b>🛍️ Marketplace</b></summary>

- List items with images, price, and location
- Buyer-seller negotiation chat rooms
- Order management and payment processing
</details>

<details>
<summary><b>🚖 Ride Hailing</b></summary>

- Rider mode (book rides) and Driver mode (earn money)
- Real-time driver matching via geo-location
- Earnings tracker for drivers
</details>

<details>
<summary><b>🍕 Food Delivery</b></summary>

- Browse restaurants and menus
- Live order tracking: Preparing → Picked up → Delivered
</details>

<details>
<summary><b>🤖 AI Features (Google Gemini)</b></summary>

- Chat summary: AI generates bullet-point summaries of long group chats
- Smart Reply: 3 contextual AI-generated reply suggestions
- `/ask` command: Ask anything in any chat
</details>

<details>
<summary><b>💳 Payments & Wallet</b></summary>

- UPI ID and QR code support
- Virtual wallet with real currency and in-app coins
</details>

<details>
<summary><b>👨‍💻 Developer Profile</b></summary>

- LeetCode, Codeforces, GitHub integration
- Portfolio showcase with up to 10 projects
</details>

<details>
<summary><b>🧩 Mini Apps</b></summary>

- Run games, tools, and utility apps inside SuperApp — no extra install
</details>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** (App Router) | Fast, SEO-friendly React framework |
| **Tailwind CSS 3.4** | Utility-first styling |
| **Zustand** | Global auth & app state |
| **React Query (@tanstack)** | Server state caching & sync |
| **Axios** | HTTP client with JWT interceptor |
| **Socket.io-client** | Real-time chat |
| **WebRTC** | Peer-to-peer audio/video |
| **Framer Motion** | Animations |
| **Capacitor** | Android / iOS APK packaging |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express.js** | Microservice servers |
| **MongoDB Atlas + Mongoose** | Primary database |
| **Redis** | Caching & session store |
| **Socket.io** | WebSocket server (chat) |
| **JWT** | Stateless authentication |
| **Helmet + CORS + rate-limit** | Security hardening |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker Compose** | Local dev orchestration |
| **Convex** | Real-time pub/sub events |
| **Google Gemini API** | AI features |

---

## 📂 Project Structure

```
/Super-App-Core
│
├── /frontend/                  # Next.js PWA (32+ pages)
│   ├── /app                    # Pages: /chat, /rides, /food, /marketplace…
│   ├── /components             # Reusable UI: Layout, Navbar, Cards…
│   ├── /services               # Axios API clients (api.ts, authApi.ts)
│   ├── /store                  # Zustand stores (useAuthStore.ts)
│   ├── /hooks                  # useAuth, usePermissions…
│   ├── capacitor.config.ts     # Android/iOS APK config
│   └── next.config.js          # Next.js + perf settings
│
├── /api-gateway/               # Single entry point :5050
│                               # JWT verification, rate limiting, proxying
│
├── /services/                  # 39 independent microservices
│   ├── /auth-service      :5001   # Login, signup, OAuth, 2FA
│   ├── /user-service      :5002   # Profiles, preferences
│   ├── /chat-service      :5003   # Messaging + Socket.io
│   ├── /social-service    :5004   # Feed, posts, likes
│   ├── /ride-service      :5009   # Ride booking
│   ├── /food-service      :5010   # Food delivery
│   ├── /payment-service   :5032   # UPI, wallet
│   ├── /ai-service        :5033   # Gemini AI
│   └── …(see full list below)
│
├── /convex/                    # Convex real-time schema & functions
├── /k8s/                       # Kubernetes manifests
├── docker-compose.yml          # One-command local dev
├── start-app.mjs               # Master startup script
└── BUILDING_APK.md             # Android APK build guide
```

---

## 🏗️ Architecture

```
[ Browser / Mobile App ]  ← Next.js PWA + Capacitor APK
          │
          ▼  HTTP / WebSockets
          │
[ API Gateway :5050 ]  ← JWT check, rate limit, proxy
          │
          ├──► auth-service      :5001  ──► MongoDB
          ├──► user-service      :5002  ──► MongoDB
          ├──► chat-service      :5003  ──► MongoDB + Redis + Socket.io
          ├──► social-service    :5004  ──► MongoDB
          ├──► ride-service      :5009  ──► MongoDB
          ├──► food-service      :5010  ──► MongoDB
          ├──► payment-service   :5032  ──► MongoDB
          └──► ai-service        :5033  ──► Google Gemini API

Convex (cloud) ← pub/sub for notifications, activity streams
```

---

## ⚙️ All 39 Microservices

| Service | Port | Purpose |
|---------|------|---------|
| auth-service | 5001 | JWT login/register, OAuth, 2FA |
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
| super-communication-service | 5028 | Channels, broadcast |
| advanced-interactions-service | 5029 | Reactions, message actions |
| snap-service | 5031 | Disappearing messages/media |
| payment-service | 5032 | UPI, wallet, transactions |
| ai-service | 5033 | Gemini AI: summaries, smart replies |
| cart-service | 5035 | Shopping cart |
| order-service | 5036 | Order processing/tracking |
| analytics-service | — | Usage analytics |
| business-dashboard-service | — | Seller/driver analytics |
| community-service | — | Community management |
| discord-service | — | Discord-like servers |
| economy-service | — | Gig economy, freelancing |
| game-service | — | In-app games |
| hotel-service | — | Hotel booking |
| monetization-service | — | Creator economy |
| story-service | — | Stories/status |
| … and more | — | |

---

## 💻 Installation & Setup

### Prerequisites
- Node.js 18+
- Docker + Docker Compose (recommended)
- MongoDB Atlas account (free tier works)

### Option A: Docker Compose (Recommended ✅)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Super-App-Core.git
cd Super-App-Core

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT_SECRET, and Gemini API key

# 3. Start everything in one command
docker-compose up --build
```

Open `http://localhost:3000` in your browser.

### Option B: Manual (without Docker)

```bash
# 1. Clone
git clone https://github.com/your-username/Super-App-Core.git
cd Super-App-Core

# 2. Install frontend
cd frontend && npm install

# 3. Install API Gateway
cd ../api-gateway && npm install

# 4. Install each service (repeat per service)
cd ../services/auth-service && npm install
cd ../services/chat-service && npm install
# … repeat for each service you want to run

# 5. Create .env files (see Environment Variables section below)

# 6. Run everything with the master script
cd ../..
node start-app.mjs
```

---

## 🔐 Environment Variables

Create a `.env` file in each service folder. Minimum required variables:

```env
# Service port (each service has its own)
PORT=5001

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/superapp?retryWrites=true&w=majority

# JWT secret — MUST be identical across ALL services
JWT_SECRET=your_super_secret_key_here

# Redis URL (required by chat-service)
REDIS_URL=redis://localhost:6379

# Google Gemini API key (required by ai-service only)
GEMINI_API_KEY=your_gemini_key_here
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud
```

---

## 🏃 Running the Project

| What | URL |
|------|-----|
| 🌐 Frontend (Web App) | `http://localhost:3000` |
| 🚪 API Gateway | `http://localhost:5050` |
| 🔐 Auth Service | `http://localhost:5001` |
| 💬 Chat Service | `http://localhost:5003` |
| 🚖 Ride Service | `http://localhost:5009` |
| 🍕 Food Service | `http://localhost:5010` |
| 🤖 AI Service | `http://localhost:5033` |

---

## 📱 Android APK Build

SuperApp can be packaged as a native Android APK using **Capacitor**.

```bash
cd frontend
npm install
npm run build:export      # Build & export Next.js as static HTML
npx cap add android       # Add Android platform (first time only)
npx cap sync android      # Sync web assets to Android project
npx cap open android      # Open Android Studio to build the APK
```

> **Full step-by-step guide** → [`BUILDING_APK.md`](./BUILDING_APK.md)

---

## 📡 API Endpoints

All requests go through the gateway at `http://localhost:5050/api`.

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/auth/signup` | Register new user |
| **Auth** | POST | `/auth/login` | Login and get JWT |
| **Auth** | GET | `/auth/google` | Google OAuth |
| **Auth** | GET | `/auth/github` | GitHub OAuth |
| **Chat** | POST | `/chats/message` | Send a message |
| **Chat** | GET | `/chats/:chatId/messages` | Get chat history |
| **Social** | GET | `/social/unified/feed` | Get social feed |
| **Rides** | POST | `/rides/request` | Book a ride |
| **Food** | GET | `/food/restaurants` | List restaurants |
| **AI** | POST | `/ai/ask` | Ask the AI a question |
| **Search** | GET | `/search?q=...` | Global search |
| **Wallet** | GET | `/wallet/balance` | Get wallet balance |
| **Marketplace** | GET | `/marketplace/listings` | Browse listings |

---

## 🚀 Deployment

### Frontend → [Vercel](https://vercel.com)
1. Connect your GitHub repo on Vercel.
2. Set **Root Directory** to `frontend`.
3. Add environment variable: `NEXT_PUBLIC_API_URL = https://your-gateway.onrender.com/api`
4. Deploy!

### Backend → [Render](https://render.com) or [Railway](https://railway.app)
1. Create one **Web Service** per microservice (start with `api-gateway` + core services).
2. Set `MONGO_URI`, `JWT_SECRET`, and other vars in the dashboard.
3. Copy the API Gateway live URL to your frontend env var.

### Database → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
1. Create a free cluster.
2. Add database user + allow all IPs (`0.0.0.0/0`).
3. Copy the connection string as `MONGO_URI`.

---

## 🤝 Contributing

1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/Super-App-Core.git`
3. **Create a branch**: `git checkout -b feature/my-feature`
4. **Make your changes** and test them
5. **Commit**: `git commit -m "feat: add my feature"`
6. **Push**: `git push origin feature/my-feature`
7. **Open a Pull Request** on GitHub

Found a bug? [Open an Issue](https://github.com/your-username/Super-App-Core/issues) with steps to reproduce.

---

## 📄 License

This project is licensed under the **MIT License** — you are free to use, modify, and distribute it for personal or commercial purposes. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with ❤️ using **Next.js** · **Node.js** · **MongoDB** · **Socket.io** · **Google Gemini**

*Made for India 🇮🇳*

</div>

