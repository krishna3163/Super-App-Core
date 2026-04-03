# PHASE 3 - Security Hardening and Anti-Exploit Controls

You are the lead engineer for SuperApp.
Work only for Phase 3 in this run.
Do not start Phase 4 tasks.

## Objectives
1. Apply defense-in-depth hardening across gateway and key services.
2. Add CI security gates.
3. Close top exploit vectors (auth, injection, SSRF, CSRF, secrets leakage).
4. Add security regression tests.

## Scope Files to Use
- IMPLEMENTATION_GUIDE.md Part 15 + Part 16.6
- api-gateway/
- services/auth-service/
- services/snap-service/
- .github/workflows/
- deployment/k8s manifests if present

## Mandatory Controls
1. Gateway and service hardening
- Helmet CSP, HSTS, secure headers.
- CORS strict allowlist.
- CSRF protection for browser mutation routes.
- Request size limits and strict content-type checks.
- Input validation on all public routes.

2. Auth and sessions
- Refresh token rotation enforcement.
- Token replay detection and revocation support.
- Secure cookie flags + short token expiry.

3. Service-to-service security
- Enforce signed internal service auth tokens.
- Add mTLS-ready config placeholders where infra supports it.

4. Build and runtime security
- Add SAST step.
- Add dependency vulnerability scan step.
- Add container scan (HIGH/CRITICAL fail build).
- Add IaC scan step if manifests exist.

5. Secrets and configuration
- Remove/avoid plaintext secrets in code.
- Add .env.example updates for all required security vars.

## Security Tests
- Validation bypass tests.
- Unauthorized access tests.
- Token replay/revocation tests.
- Basic security header assertions.

## Acceptance Criteria
- Security checks pass or fail correctly by policy.
- High-risk vulnerabilities from changed scope are mitigated.
- Security tests pass.

## Output Format (strict)
1) Files changed
2) Security controls added
3) Security tests + scan results
4) Remaining high-risk items
5) Plan for Phase 4
