# PHASE 1 - Foundation, Auth Hardening, Permission Wizard, Snap Schema

You are the lead engineer for SuperApp.
Work only for Phase 1 in this run.
Do not start Phase 2+ tasks.

## Objectives
1. Harden auth-service baseline.
2. Implement permission-first onboarding wizard in frontend.
3. Create initial snap-service schema and service scaffolding.
4. Add baseline tests and fix any blocking bugs found.

## Scope Files to Use
- prompt.txt
- IMPLEMENTATION_GUIDE.md
- QUICK_REFERENCE.md
- frontend/
- services/auth-service/
- services/snap-service/ (create if missing)

## Mandatory Implementation Rules
- Add correlationId for all API requests/responses in changed services.
- Add centralized error middleware in changed services.
- Add timeout + retry wrapper for external/network calls.
- Denied permissions must have graceful fallback UI.
- No hardcoded secrets.

## Required Work Items
1. Auth hardening
- Strengthen refresh token rotation.
- Enforce secure cookie settings.
- Add login rate limit and lockout policy.
- Add unit tests for token issue/refresh/logout.

2. Permission wizard
- First-run onboarding requests:
  camera, microphone, location, contacts, notifications, storage.
- Save permission state to user settings.
- If denied, app still runs in reduced mode.
- Add settings screen controls to re-request permissions.

3. Snap service foundation
- Create collections/models:
  snaps, streaks, story_audiences, screenshot_events, snap_memories.
- Add base routes:
  POST /api/v1/snaps/send
  GET /api/v1/snaps/inbox
  POST /api/v1/snaps/:id/open
- Add validation and auth middleware.

4. Tests
- Unit tests for auth token lifecycle.
- API integration tests for snap send/open.
- Frontend test for permission wizard state transitions.

## Acceptance Criteria
- Phase 1 code compiles.
- Tests in changed modules pass.
- No new high-severity lint/type errors in changed files.
- Output includes clear summary.

## Output Format (strict)
1) Files changed
2) Tests run + results
3) Bugs fixed in this phase
4) Remaining risks
5) Plan for Phase 2
