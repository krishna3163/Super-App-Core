# 🚀 SuperApp - The Ultimate Everything Platform

**"One App to rule them all. Chat, shop, ride, eat, work, and play in a single unified ecosystem."**

---

## 📖 SECTION 2: PROJECT DESCRIPTION

### What is this Super App?
This project is a massive, production-ready **Microservices-based Super App**. Instead of having 20 different apps on your phone for chatting, ordering food, booking rides, and checking social media, this app combines everything into one seamless experience.

### Why does it exist?
Modern users suffer from "app fatigue"—constantly switching between applications, managing different accounts, and sharing payment details across dozens of platforms. This project solves that by unifying identity, wallet, and communication across every daily digital need.

### Major Inspirations
We took the best features from industry leaders and combined them:
*   💬 **WhatsApp** - Fast, secure 1-to-1 and group chatting.
*   📢 **Telegram** - Unlimited broadcast channels and bots.
*   🎮 **Discord** - Role-based community servers with voice/text channels.
*   🚗 **Uber / Ola** - Real-time ride booking and driver tracking.
*   🛒 **OLX** - C2C marketplace for buying and selling used goods.
*   🍔 **Zomato / Swiggy** - Restaurant browsing and food delivery.
*   💼 **LinkedIn / GitHub** - Professional resumes and developer portfolio tracking.
*   🟢 **WeChat** - A robust ecosystem of "Mini Apps" running inside the main app.

---

## ✨ SECTION 3: FEATURES (IN DETAIL)

### 1. 💬 Chat System (Advanced)
*   **Private Chat:** Fast 1-to-1 messaging with read receipts (✓✓) and typing indicators.
*   **Groups & Communities:** Create WhatsApp-style groups or Discord-style servers with roles.
*   **Channels:** Telegram-style broadcast channels for announcements.
*   **Voice & Video Calls:** 1:1 and Group calls powered by WebRTC.
*   **Voice Notes:** Hold-to-record voice messages with waveform playback.
*   **Message Actions:** React (👍❤️🔥), reply, forward, edit, and delete messages.
*   **Privacy Features:** Disappearing messages (24h/7d) and View-Once media that deletes after opening.

### 2. 🌍 Social System
*   **Unified Feed:** A mix of short text (Tweets), media posts (Facebook), and threaded discussions (Reddit).
*   **Interactions:** Like, dislike (upvote/downvote), comment, and repost.

### 3. 🛍️ Marketplace
*   **Buy & Sell:** List products with images, price, and location.
*   **Negotiation:** Dedicated chat rooms for buyers and sellers to negotiate prices.
*   **Order System:** Mark items as sold and process payments.

### 4. 🚖 Ride System
*   **Dual Mode:** Switch between "Rider" (book rides) and "Driver" (earn money).
*   **Real-time Matching:** Finds nearest drivers using geo-location math.
*   **Earnings Tracker:** Drivers can track daily/weekly income.

### 5. 🍕 Food Delivery
*   **Restaurant Listing:** Browse local restaurants and their menus.
*   **Order Tracking:** Live status from "Preparing" to "Out for Delivery".

### 6. 🛠️ Service Marketplace
*   **Hire Local Pros:** Find electricians, plumbers, developers, or designers.
*   **Booking Flow:** Chat with the provider, confirm the job, and pay securely.

### 7. 📊 Business Dashboard
*   **Role-Based Views:** Dynamic dashboards that change if you are a seller, driver, or restaurant owner.
*   **Analytics:** View earnings, total orders, and engagement charts.

### 8. 🤖 AI Features
*   **Chat Summary:** AI reads long group chats and gives you a bullet-point summary.
*   **Smart Reply:** AI suggests 3 contextual replies based on the conversation.
*   **Ask AI:** Use `/ask` in any chat to instantly get answers from Google Gemini/OpenAI.

### 9. 💳 Payment System
*   **UPI Integration:** Support for standard UPI IDs and QR codes.
*   **Virtual Wallet:** Store real currency and in-app "coins" for tipping and micro-transactions.

### 10. 👨‍💻 Developer Profile
*   **Coding Stats:** Connect LeetCode, Codeforces, and GitHub to show your ranks and streaks.
*   **Project Showcase:** Display up to 10 portfolio projects on your public page.

### 11. 🧩 Mini Apps
*   **App inside an App:** Run games, weather tools, or utility apps inside the Super App without installing anything new.

### 12. 🔒 Security
*   **JWT Auth:** Secure, short-lived tokens with refresh token rotation.
*   **Rate Limiting:** Prevents hackers from brute-forcing passwords or spamming APIs.
*   **Encryption:** Sensitive data is encrypted using AES-256-GCM.

---

## 🛠️ SECTION 4: TECH STACK

**Frontend:**
*   **Next.js (App Router):** Fast, SEO-friendly React framework.
*   **Tailwind CSS:** For beautiful, responsive styling.
*   **Zustand & React Query:** For global state management and API caching.

**Backend:**
*   **Node.js & Express.js:** Fast and scalable backend servers.
*   **WebSockets (Socket.io):** For real-time chat, calls, and live locations.
*   **WebRTC:** For peer-to-peer audio and video streaming.

**Database:**
*   **MongoDB (Atlas):** NoSQL database, perfect for flexible schemas and Geo-spatial queries.

**AI & Third-Party:**
*   **Google Gemini AI:** For smart replies and chat summarization.

---

## 📂 SECTION 5: PROJECT STRUCTURE

This project uses a **Microservices Architecture**. Instead of one giant backend file, the backend is split into multiple small, independent services.

```text
/Super-App-Core
│
├── /frontend/                 # The Next.js user interface
│   ├── /app                   # Pages and routing (e.g., /chat, /rides)
│   ├── /components            # Reusable UI parts (Buttons, Navbars)
│   └── /services              # Axios API clients talking to the backend
│
├── /api-gateway/              # The main entry point for all backend traffic. 
│                              # Handles Security, JWT checking, and routes requests to services.
│
├── /services/                 # Contains 15+ independent microservices
│   ├── /auth-service          # Handles Login, Signup, Passwords
│   ├── /chat-service          # Handles messaging
│   ├── /economy-service       # Handles payments, gig-workers, services
│   ├── /ai-service            # Talks to Google Gemini/OpenAI
│   └── ...                    # (food, ride, marketplace, etc.)
│
└── start-app.mjs              # Master script to run everything at once
```

---

## 🏗️ SECTION 6: ARCHITECTURE

How does data flow in this app?

```text
[ User's Browser / Phone ]  (Next.js Frontend)
          │
          ▼  (HTTP Requests / WebSockets)
          │
[ API Gateway (Port 5050) ] (Checks JWT Token, Blocks spam, routes traffic)
          │
          ├──────────────► [ Auth Service (Port 5001) ]   ──► (Auth DB)
          ├──────────────► [ Chat Service (Port 5003) ]   ──► (Chat DB)
          ├──────────────► [ Ride Service (Port 5009) ]   ──► (Ride DB)
          └──────────────► [ AI Service   (Port 5033) ]   ──► (Gemini API)
```
*Every service runs on its own port and connects to its own isolated database collection.*

---

## 🔗 SECTION 7: HOW FRONTEND CONNECTS TO BACKEND

The frontend uses **Axios** to talk to the backend. 
We have a central API Gateway running on `http://localhost:5050`. The frontend NEVER talks directly to the microservices (like port 5003). It only talks to the Gateway.

1. User logs in. Backend returns a `JWT Token`.
2. Frontend stores this token in LocalStorage (using Zustand).
3. We use an **Axios Interceptor**. Every time the frontend makes an API call, it automatically attaches the JWT token to the headers:
   `Authorization: Bearer <token>`
4. The API Gateway sees the token, verifies the user is legit, and passes the request to the correct microservice.

---

## 💻 SECTION 8: INSTALLATION (Step-by-Step)

Follow these steps exactly to run the Super App on your local machine.

### Step 1: Clone the repository
```bash
# Download the code to your computer
git clone https://github.com/your-username/Super-App-Core.git

# Go into the project folder
cd Super-App-Core
```

### Step 2: Install Dependencies
Because this is a microservices app, you need to install NPM packages for the frontend, gateway, and ALL services.

```bash
# Go to frontend and install
cd frontend
npm install

# Go back to main folder, then into gateway
cd ../api-gateway
npm install

# Repeat for services...
cd ../services/auth-service
npm install
# (You will need to do this for every service folder you want to run)
```

### Step 3: Setup Environment Variables
Every service needs a `.env` file to know what port to run on and how to connect to the database. (See Section 9 for details).

### Step 4: Run the Backend & Frontend
To make life easy, we created a master startup script.

```bash
# Go back to the main root folder
cd Super-App-Core

# Run the master boot script using Node.js
# This will open multiple background processes for the Gateway, Services, and Frontend
node start-app.mjs
```

---

## 🔐 SECTION 9: ENVIRONMENT VARIABLES

You must create a `.env` file in **every** service folder (`/api-gateway`, `/services/auth-service`, etc.).

Here is a standard template:

```env
# The port this specific service runs on
PORT=5001 

# Your MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/superapp?retryWrites=true&w=majority

# A highly secret string used to sign JWT tokens. Must be exactly the SAME across all services!
JWT_SECRET=my_super_secret_key_123

# (Only needed in /services/ai-service)
GEMINI_API_KEY=your_google_ai_key_here
```

---

## 🏃‍♂️ SECTION 10: RUNNING THE PROJECT

Once started, the system operates on the following ports:

*   🌐 **Frontend Website:** `http://localhost:3000` (Open this in your browser!)
*   🚪 **API Gateway:** `http://localhost:5050` (All API calls go here)
*   ⚙️ **Microservices:** `5001` through `5033` (Running in the background)

---

## 🚀 SECTION 11: DEPLOYMENT

To put this app on the live internet, follow these steps:

### 1. Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new Cluster.
3. In "Database Access", create a new database user and password.
4. In "Network Access", allow IP `0.0.0.0/0` (so your hosted backend can connect).
5. Click "Connect" -> "Connect your application" and copy the `MONGO_URI`.

### 2. Backend (Render / Railway)
1. Create an account on [Render](https://render.com) or [Railway](https://railway.app).
2. Create a new "Web Service".
3. Connect your GitHub repository.
4. **Important:** Because this is a microservices app, you must deploy the `api-gateway` and each `service` as separate web services.
5. In the dashboard settings, paste your `MONGO_URI` and `JWT_SECRET` into the Environment Variables section.
6. Deploy! Copy the new live URL for your API Gateway.

### 3. Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and connect your GitHub.
2. Select the `frontend` folder as the Root Directory.
3. In Environment Variables, add:
   `NEXT_PUBLIC_API_URL = https://your-live-api-gateway-url.onrender.com/api`
4. Click Deploy!

---

## 📡 SECTION 12: API ENDPOINTS (BASIC)

Here are the main endpoints exposed through the API Gateway (`http://localhost:5050`):

*   **Auth:** 
    *   `POST /api/auth/signup` - Register user
    *   `POST /api/auth/login` - Login and get JWT
*   **Chat:** 
    *   `POST /api/chats/message` - Send a message
    *   `GET /api/chats/:chatId/messages` - Get chat history
*   **Economy (Marketplace/Ride/Service):**
    *   `GET /api/economy/services/providers/search` - Find freelancers
    *   `POST /api/economy/payments/initiate` - Start a UPI payment
*   **Social:**
    *   `GET /api/social/unified/feed` - Get social feed
*   **AI:**
    *   `POST /api/ai/ask` - Ask the AI bot a question

---

## 🔮 SECTION 13: FUTURE IMPROVEMENTS

We are constantly improving the Super App! Up next:
1.  **Mobile App:** Build a native Android/iOS version using React Native or Expo.
2.  **Kubernetes Scaling:** Dockerize all microservices and use Kubernetes to auto-scale individual services (e.g., scale up the Ride service during rush hour).
3.  **Message Broker:** Replace direct HTTP Axios calls between microservices with **Apache Kafka** or **RabbitMQ** for better fault tolerance.
4.  **Advanced AI Agents:** AI that can book rides or order food for you automatically based on text prompts.

---

## 🤝 SECTION 14: CONTRIBUTION GUIDE

We welcome beginners and experts to contribute! 

1. **Fork** the repository on GitHub.
2. **Clone** your fork to your local machine.
3. Create a **new branch**: `git checkout -b feature/my-new-feature`
4. Make your changes and test them.
5. **Commit** your changes: `git commit -m "Added a cool new feature"`
6. **Push** to your branch: `git push origin feature/my-new-feature`
7. Open a **Pull Request** on the main repository.

If you find a bug, please open an Issue with steps to reproduce it!

---

## 📄 SECTION 15: LICENSE

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this software for personal or commercial purposes. See the `LICENSE` file for more details.

---
*Happy Coding! ❤️ Built with Next.js & Node.js Microservices.*
