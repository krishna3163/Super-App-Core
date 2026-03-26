# Super App Core

Production-grade Super App monorepo with:
- Expo app (mobile + web)
- API server (Express + Mongo + realtime + push)
- UI blueprint studio (Vite + React + Tailwind)

## Workspace Structure
- artifacts/super-app: Expo frontend app
- artifacts/api-server: backend API + realtime + push notifications
- artifacts/mockup-sandbox: design review and component-driven UI blueprint studio
- lib/api-client-react, lib/api-zod, lib/db: shared libraries and generated clients/types

## Google Services Integration

### What is configured
- google-services.json is present at project root.
- Expo Android app is now configured to consume this file.

Config applied in:
- artifacts/super-app/app.json
	- expo.android.package: com.krishna.suparapp
	- expo.android.googleServicesFile: ../../google-services.json

### How it works
1. Android build reads google-services.json through expo.android.googleServicesFile.
2. Firebase project metadata (project id, app id, API key) is bundled for Android services.
3. App-side push stack uses expo-notifications (already installed in artifacts/super-app/package.json).
4. Backend push sending uses firebase-admin in artifacts/api-server/src/lib/pushNotifications.ts with FIREBASE_SERVICE_ACCOUNT_JSON.

### Required env for backend push
- FIREBASE_SERVICE_ACCOUNT_JSON: JSON string of Firebase service account

If FIREBASE_SERVICE_ACCOUNT_JSON is missing, backend push route stays in graceful no-op mode.

## Current Build Progress (Completed So Far)

### App feature work
- Auth session flow with Supabase bearer-based API wiring.
- Login + Register screens with OAuth options and account recovery actions.
- Chat page improvements:
	- media pick and image preview-before-send
	- message actions
	- header menu actions
	- search panel
	- status ticks progression
	- web microphone fallback behavior

### Backend feature work
- Supabase auth middleware integration.
- Health endpoints extended with auth/push/realtime readiness.
- Push notification helper with firebase-admin wiring.
- Chat APIs with conversation/message flows and realtime emits.

### UI Blueprint system
- 134-screen structured catalog across major domains.
- Interactive design studio with web + mobile mock frames.
- Route-based single-screen blueprint pages.
- Reusable component primitives and design tokens.

## Mockup Studio: How to Use

Location:
- artifacts/mockup-sandbox

### Run
From repo root:
1. Set environment variables required by Vite config:
	 - PORT (example: 5173)
	 - BASE_PATH (example: /)
2. Start dev server:
	 - pnpm --filter @workspace/mockup-sandbox run dev

### Main routes
- / : Super App Studio dashboard
- /super-app/<screen-id> : dedicated blueprint page per catalog screen
- /preview/<component-path> : preview renderer for mockup component files

Example:
- /super-app/chat-01
- /preview/super-app/routes/chat-01

## Auto-Generated Route Files (134)

Generated route components are created at:
- artifacts/mockup-sandbox/src/components/mockups/super-app/routes

Generator script:
- artifacts/mockup-sandbox/scripts/generate-screen-route-files.mjs

Run manually:
- cd artifacts/mockup-sandbox
- node scripts/generate-screen-route-files.mjs

Generated route index summary:
- artifacts/mockup-sandbox/src/super-app/ROUTES.generated.md

## Design System and Component Base
- design tokens: artifacts/mockup-sandbox/src/super-app/designSystem.ts
- reusable components: artifacts/mockup-sandbox/src/super-app/components.tsx
- studio shell: artifacts/mockup-sandbox/src/super-app/SuperAppStudio.tsx
- route page template: artifacts/mockup-sandbox/src/super-app/ScreenBlueprintPage.tsx

## Advanced Domain Mock Blocks Included
- Chat family: WhatsApp-like composer states, Telegram channel hints, Discord server panel feel
- Dating family: swipe physics card interactions
- Ride family: Uber-style tracking map and driver progress panel
- Food family: Swiggy-style menu hierarchy and category chips
- Marketplace family: eBay-like bid and commerce cards

## Token-Driven Live Controls in Studio
- Palette switcher presets
- Density scale presets
- Border radius presets
- Dark/light theme toggle

## Security Notes
- Rotate exposed API keys if this repo is shared publicly.
- Keep service account credentials in environment variables only, never in committed code.

## Next Recommended Steps
1. Connect blueprint cards to real API data contracts domain-by-domain.
2. Add accessibility audit pass (focus order, keyboard nav, reduced motion).
3. Add visual regression screenshots for key route pages.