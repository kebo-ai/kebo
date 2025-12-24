# Security Policy

Kebo is a personal finance application. We treat security and privacy issues with high priority.

## Supported Versions

We provide security fixes for supported versions only.

| Version | Supported |
|--------|-----------|
| Latest release | ✅ |
| Older releases | ❌ |

> If you are running an older version, please upgrade before reporting unless the issue prevents upgrading.
> If you need a longer support window (e.g., “latest minor + previous minor”), update the table accordingly.

## Reporting a Vulnerability

We take security vulnerabilities seriously. Please report issues responsibly and privately.

### Please do NOT report security vulnerabilities via public GitHub issues

Instead, email **security@kebo.app**.

If you believe the issue is actively being exploited, include **“URGENT”** in the subject.

### What to include

Please include as much of the following as possible:

1. **Description** of the vulnerability and why it matters
2. **Affected component(s)** (mobile app, backend/API, authentication, storage, build/release pipeline, etc.)
3. **Affected version(s)** (app version, commit SHA, and platform: iOS/Android)
4. **Steps to reproduce** (ideally a minimal PoC)
5. **Impact** (what an attacker can do) and any constraints/assumptions
6. **Suggested fix / mitigation** (if you have ideas)
7. **Any logs or screenshots** — **redacted** (see “Data handling” below)

### Data handling (important for finance apps)

- **Do not send real financial data** (statements, account numbers, transaction history tied to a person, credentials, tokens).
- **Do not access other users’ data.** Test only with accounts and data you own and are authorized to use.
- **Redact** screenshots/logs thoroughly (names, emails, account IDs, tokens, addresses, unique identifiers).

### What to expect

- **Acknowledgment**: within **2 business days**
- **Triage**: initial assessment within **7 days**
- **Status updates**: at least every **7 days** until resolution or a plan is agreed
- **Fix targets (guideline)**:
  - **Critical**: mitigation or fix as soon as practical, typically **≤ 14 days**
  - **High**: typically **≤ 30 days**
  - **Medium/Low**: scheduled based on risk and release cadence
- **Credit**: we’ll credit you in release notes/advisory unless you prefer anonymity

### Coordinated disclosure

We prefer coordinated disclosure. Unless otherwise agreed:
- Please allow up to **90 days** before public disclosure.
- If we need more time (complex fix), we’ll propose a revised timeline and keep you updated.

### Encryption (optional but recommended)

If you want to encrypt your report, request our PGP key by emailing **security@kebo.app** (or publish the key fingerprint here).

## Scope

### In scope

Examples include (not limited to):

- Authentication/authorization flaws (session/token issues, privilege escalation)
- **Sensitive data exposure** (PII/financial data in logs, storage, caches, screenshots, crash reports)
- Insecure local storage (tokens, secrets, exported files, backups)
- Insecure network communication (TLS misconfiguration, MITM risks, missing cert validation)
- Injection vulnerabilities (SQL/NoSQL injection, command injection, etc.)
- XSS/CSRF (for any web surfaces, admin panels, or embedded web views)
- Broken access control in APIs (IDOR, mass assignment)
- Deep link / URL scheme vulnerabilities and app-to-app communication issues
- Supply-chain or CI/CD risks (malicious dependency updates, leaked build secrets)

### Out of scope (by default)

- Social engineering attacks (phishing, vishing)
- Physical device attacks (unless a software weakness makes them significantly easier)
- Denial of Service (DoS) without a demonstrated security impact

> If you’re unsure whether something is in scope, report it anyway — we’ll triage.

### Third-party dependencies

- If a vulnerability in a dependency is **exploitable in Kebo**, please report it to us.
- If it does **not** affect Kebo directly, report it upstream to the dependency maintainers.

## Security best practices for contributors

When contributing:

1. **Never commit secrets**
   - Use environment variables and secret managers; rotate any leaked keys immediately.
2. **Redact logs**
   - Do not log credentials, tokens, account identifiers, or transaction details.
   - Avoid `console.log` for anything that could include sensitive fields.
3. **Validate & sanitize input**
   - Treat all inputs as untrusted (including imported CSV/OFX files).
4. **Protect privacy by default**
   - Use mock/test data in screenshots and test fixtures.
5. **Keep dependencies updated**
   - Prefer pinned versions; review changelogs for security-sensitive upgrades.

## Security features (current)

This application implements:

- Secure token storage using `expo-secure-store`
- Automatic token refresh (where applicable)
- Environment-based configuration
- Development-only logging (avoid sensitive logs in production builds)

> Note: secure storage behavior can vary by platform and device state. Avoid storing more than necessary and prefer short-lived tokens.

## Contact

Security reports: **security@kebo.app**
