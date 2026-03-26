# Super App Project TODO (Pending Work)

Date: 2026-03-24
Owner: Project Team
Status: Open

## P0 - Critical Runtime Fixes (Do First)

- [x] Docker compose me all required service URLs add karo jo gateway use kar raha hai
	- [x] DASHBOARD_SERVICE_URL
	- [x] SETTINGS_SERVICE_URL
	- [x] NOTIFICATION_SERVICE_URL
	- [x] RIDE_SERVICE_URL
	- [x] FOOD_SERVICE_URL
	- [x] DATING_SERVICE_URL
	- [x] PROFESSIONAL_SERVICE_URL
	- [x] PRODUCTIVITY_SERVICE_URL
	- [x] AI_SERVICE_URL
	- [x] SUPER_COMMUNICATION_SERVICE_URL
	- [x] GLOBAL_SEARCH_SERVICE_URL

- [x] API Gateway me missing proxy route add karo for advanced interactions
	- [x] Route: /api/advanced-interactions
	- [x] Target: advanced-interactions-service

- [x] Port consistency fix karo (README, gateway, compose, env)
	- [x] Gateway port 5050 vs docs 5000 align karo
	- [x] Service port mapping centrally document karo

## P1 - Remove Mock/Fallback Logic

- [x] Chat screen se dummy data remove karo and pure backend-driven flow karo
	- [x] frontend/app/chat/page.tsx

- [x] Marketplace listing/detail/sell flow se dummy fallback remove karo
	- [x] frontend/app/marketplace/page.tsx
	- [x] frontend/app/marketplace/[id]/page.tsx
	- [x] frontend/app/marketplace/sell/page.tsx

- [x] Home dashboard me random mock users fallback ko API-driven banao
	- [x] frontend/app/page.tsx

- [x] Random chat simulation timeout/mocked session hatao, realtime matching use karo
	- [x] frontend/app/random-chat/page.tsx

- [ ] Auth mock alerts remove karo, real implementations do
	- [ ] OAuth flow (google/github) या explicitly disable with proper UX
	- [ ] Reset password email flow
	- [ ] frontend/services/authApi.ts

- [x] Coding topics mock data replace karo with real service/API
	- [x] frontend/services/apiServices.ts

## P1 - Frontend Modules Missing (Prompt Scope se)

- [x] Dedicated Dating app UI route/page complete karo
	- [x] frontend/app/dating/page.tsx (new)

- [x] Calendar module UI add karo (events, reminders, recurring)
	- [x] frontend/app/calendar/page.tsx (new)

- [x] Task manager UI add karo (lists, due date, assignee)
	- [x] frontend/app/tasks/page.tsx (new)

- [x] Forms builder + responses UI add karo
	- [x] frontend/app/forms/page.tsx (new)
	- [x] frontend/app/forms/[id]/page.tsx (new)

- [x] Live video/stream UI add karo
	- [x] frontend/app/live/page.tsx (new)

- [x] Voice/Video call full-screen call experience add karo
	- [x] frontend/app/calls/page.tsx (new)

- [x] Channel management dedicated UI strengthen karo (create, analytics, moderation)
	- [x] frontend/app/channels/[channelId]/page.tsx improve

- [x] Professional/job module UI complete karo (jobs, apply, tracking)
	- [x] frontend/app/professional/page.tsx (new)

- [x] Restaurant partner and driver partner flows ke separate dashboards add karo
	- [x] frontend/app/business-dashboard/page.tsx expand

## P1 - FE <-> BE Connection Gaps (Exact)

### Frontend -> Backend mismatches (endpoint-level)

- [x] frontend/services/authApi.ts endpoints fix karo
	- [x] /users/me (PATCH) currently defined in frontend but user-service routes me available nahi
	- [x] Decide: ya to backend me /users/me add karo, ya frontend ko /users/profile and dedicated update endpoints pe shift karo

- [x] frontend/app/random-chat/page.tsx
	- [x] Calls /advanced-interactions/random/match and /advanced-interactions/random/skip
	- [x] Gateway me /api/advanced-interactions proxy add karo

- [x] frontend/components/chat/ChatGamePanel.tsx
	- [x] Commented API call /advanced-interactions/games/start ko enable karo
	- [x] Matching backend route ensure karo (route naming align)

- [x] frontend/components/chat/PollCard.tsx
	- [x] Poll vote API commented hai (/super-comm/engagement/poll/vote)
	- [x] Isko connect karke optimistic UI + error rollback add karo

### Backend -> Frontend integration gaps

- [x] Real-time sockets wired but frontend consumers incomplete
	- [x] chat-service socket events (typing, message received) ko consistent client listeners se bind karo
	- [x] super-communication-service socket events (call_user, answer_call, end_call) ke UI handlers add karo
- [x] Notification lifecycle complete connect karo
	- [x] Backend mark-read/read-all available hai
	- [x] Frontend me unread badge + polling/socket sync strengthen karo
- [x] Error contract unify karo
	- [x] Backend mixed response shapes use karta hai ({status,data}, direct object, {error})
	- [x] Frontend API layer me normalized response adapter implement karo (api.ts interceptors)
- [x] Auth identity propagation enforce karo
	- [x] Body-based userId use reduce karo
	- [x] Gateway x-user-id header se authoritative identity use karne ke liye all services align karo

### Connection verification checklist (run before release)

- [ ] FE endpoint inventory vs gateway routes one-to-one map document banao
- [ ] Gateway routes vs service routes one-to-one map document banao
- [ ] Har page ka E2E happy path run karo (auth, chat, feed, marketplace, wallet, snaps, settings)
- [ ] Broken links/404 API paths ka automated smoke script add karo

## P1 - Service Coverage vs Prompt Spec

### Missing service modules from original spec

- [x] analytics-service (Created as stub, integration ready)
- [x] calendar-service (Already available)
- [x] channel-service (Already available)
- [x] comment-service (Merged into social-service)
- [x] driver-service (Already available in ride-service)
- [x] food-delivery-service (Already available in food-service)
- [x] form-service (Merged into productivity-service)
- [x] live-video-service (Already available in super-communication-service)
- [x] notion-service (Merged into productivity-service)
- [x] omegle-service (Already available in advanced-interactions-service)
- [x] post-service (Already available in social-service)
- [x] reaction-service (Merged into social-service)
- [x] restaurant-service (Already available in food-service)
- [x] search-service (Already available in global-search-service)
- [x] service-marketplace-service (Already available in marketplace-service)
- [x] social-feed-service (Already available in social-service)
- [x] task-service (Already available in productivity-service)
- [x] voice-video-service (Already available in super-communication-service)

Note: Inme se kuch functionality existing services me merge bhi ki ja sakti hai. Final architecture decision lock karo before coding.

## P2 - Feature Depth Improvements

- [ ] Ride fare logic me real distance API integrate karo (Google Maps/OSRM)
- [ ] Payment transfer me transactional safety improve karo (DB transaction/session)
- [ ] Chat service me access control strengthen karo (req user vs body userId)
- [ ] Marketplace me authz checks add karo (only seller can edit/sold/delete)
- [ ] Settings + admin routes ke role checks add karo

## P2 - Testing

- [ ] Har active service ke liye minimum test baseline add karo
	- [ ] smoke test (health endpoint)
	- [ ] one happy path API test
	- [ ] one auth/permission test

- [ ] Existing tests expand karo beyond auth/user/snap
	- [ ] chat-service
	- [ ] marketplace-service
	- [ ] order-service
	- [ ] payment-service
	- [ ] settings-service
	- [ ] social-service

- [ ] Root-level CI test command standardize karo

## P2 - DevOps and Delivery

- [ ] GitHub Actions workflows add karo
	- [ ] lint + test on PR
	- [ ] build validation
	- [ ] optional docker image build

- [ ] K8s manifests ya deployment templates repo me add/update karo
- [ ] Env var contract document (single source of truth)

## P3 - Code Quality and Cleanup

- [ ] Frontend lint/sonar issues fix karo
	- [ ] unused imports
	- [ ] nested ternary refactor
	- [ ] img alt props
	- [ ] complexity reduction in large pages

- [ ] Backend lint/sonar issues fix karo
	- [ ] empty catch handlers
	- [ ] top-level await recommendations
	- [ ] parseInt/parseFloat Number.* usage

- [ ] Build artifacts cleanup
	- [ ] ensure .next, temp outputs git ignore me properly handled

## Suggested Execution Order

1. P0 complete karo (runtime reliability)
2. P1 mocks remove karo (real user flows)
3. P1 missing service strategy finalize karo (implement or merge)
4. P2 tests + CI add karo
5. P3 cleanup and hardening

