# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in Confluence, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

### How to Report

1. Email or DM with details of the vulnerability
2. Include:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. Allow reasonable time for a fix before public disclosure

### What We Will Do

- Acknowledge receipt within 48 hours
- Provide an estimated timeline for a fix
- Credit you in the changelog (unless you prefer anonymity)

## Security Considerations

### Current Architecture

- **No authentication** — the API is designed for local development and trusted deployments. For production, place behind an authenticated reverse proxy.
- **Rate limiting** — not yet implemented. Deploy behind a rate-limiting proxy in production.
- **Input validation** — Pydantic schemas enforce bounds on all request fields.
- **CORS** — configurable via `CORS_ORIGINS` env var. Never set to `*` in production.
- **WebSocket DoS protection** — all user-controlled parameters (resolution, n_estimators, max_depth, n_epochs, max_epochs) are clamped to safe maximums.

### Known Limitations

- Redis has no authentication by default in Docker Compose
- No HTTPS termination — use a reverse proxy (Nginx, Caddy) for TLS
- No request logging or audit trail
- No brute-force protection

### Best Practices for Deployment

1. **Never expose Redis to the public internet** without authentication
2. **Use HTTPS** via a reverse proxy (Nginx, Caddy, Cloudflare)
3. **Set `CORS_ORIGINS`** to your exact frontend domain — never `*`
4. **Use a non-root user** in Docker (add `USER appuser` to Dockerfiles)
5. **Add rate limiting** via Nginx `limit_req` or a dedicated proxy
6. **Monitor logs** for unusual request patterns
7. **Keep dependencies updated** — run `pip audit` and `npm audit` regularly

### Dependency Auditing

```bash
# Backend
cd backend && pip-audit

# Frontend
cd frontend && npm audit
```

## Past Vulnerabilities

None reported yet.
