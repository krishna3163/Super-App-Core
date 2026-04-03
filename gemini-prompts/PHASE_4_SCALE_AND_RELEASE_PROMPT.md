# PHASE 4 - 10K Concurrent Users, Bug Sweep, Final Release Validation

You are the lead engineer for SuperApp.
Work only for Phase 4 in this run.
This is the release validation phase.

## Objectives
1. Validate and tune for 10k concurrent users.
2. Fix performance and stability defects found during load.
3. Verify observability, alerts, and recovery behaviors.
4. Produce final readiness report.

## Scope Files to Use
- scripts/load/10k-concurrency.js
- IMPLEMENTATION_GUIDE.md Part 13 and Part 14
- service configs related to scaling and pooling
- dashboards/alerts configs if present

## Performance SLO Targets
- p95 latency < 300ms
- p99 latency < 800ms
- API error rate < 1%
- Socket disconnect rate < 2%
- No message/event data loss during peak

## Required Work Items
1. Load execution
- Run staged load tests (1k -> 5k -> 10k -> soak).
- Capture latency, errors, CPU/memory, DB and cache metrics.

2. Bottleneck fixes
- Optimize top slow endpoints and DB queries.
- Tune connection pools and Redis caching where needed.
- Fix backpressure issues in async consumers.

3. Resilience checks
- Simulate one critical service failure.
- Validate retry, fallback, and recovery behavior.

4. Final quality gate
- Run unit + integration + e2e + load test summary.
- Ensure no unresolved critical defects.

## Acceptance Criteria
- SLO targets met or documented with mitigation plan.
- Critical bug count is zero for release scope.
- Final report is produced.

## Output Format (strict)
1) Files changed
2) Load test results against targets
3) Bugs fixed in this phase
4) Remaining issues with severity
5) Release decision: GO / NO-GO + rationale
