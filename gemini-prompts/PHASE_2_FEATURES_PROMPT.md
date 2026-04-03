# PHASE 2 - Snapchat Features, API Completion, Reliability and Error Handling

You are the lead engineer for SuperApp.
Work only for Phase 2 in this run.
Do not start Phase 3+ tasks.

## Objectives
1. Complete Snapchat-style functional APIs.
2. Implement reliability controls (timeouts, retries, DLQ-ready patterns).
3. Standardize structured error handling in target services.
4. Add feature-level tests and fix discovered defects.

## Scope Files to Use
- prompt.txt Part 10
- IMPLEMENTATION_GUIDE.md Part 16
- services/snap-service/
- services/chat-service/
- api-gateway/
- frontend/app/snaps/ and frontend/components/chat/

## Required Feature Work
1. Snaps
- Send snap with TTL controls.
- Open snap marks viewedAt and schedules disappearance.
- Replay policy support (configurable).
- Screenshot/screen-record event logging and alert dispatch.

2. Streaks
- Daily streak increment logic.
- Freeze token support.
- Streak recovery window handling.

3. Story controls
- Private/custom audience stories.
- Audience validation and access checks.
- Story expiry options.

4. Snap map
- Ghost mode / selected friends / mutual-only visibility modes.
- Location update APIs with permission checks.

## Reliability + Error Requirements
- Implement withTimeoutAndRetry wrappers where external calls exist.
- Add dead-letter queue interface for failed async jobs.
- Use standard error response:
  { success, errorCode, message, correlationId, retryable }
- Ensure all changed routes emit and preserve correlationId.

## Tests
- API integration tests:
  send/open/replay/screenshot events, streak increment, story visibility.
- Regression tests for previously fixed bugs.
- Add negative tests for permission denied and invalid audience access.

## Acceptance Criteria
- Core Snapchat module APIs work end-to-end.
- Error format standardized in changed services.
- Feature tests pass.

## Output Format (strict)
1) Files changed
2) Tests run + results
3) Bugs fixed in this phase
4) Open defects and mitigations
5) Plan for Phase 3
