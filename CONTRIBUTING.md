# Contributing to Confluence

## Development Setup

1. Python 3.11+, Node.js 20+, Redis
2. `pip install -r requirements.txt` (backend)
3. `npm install` (frontend)
4. Copy `.env.example` to `.env`

## Running

```bash
# Backend
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

## Code Quality

Before submitting changes:

```bash
make typecheck     # Frontend TypeScript check
make lint          # Frontend lint
make test-backend  # Backend tests
```

## Project Structure

- `backend/app/routers/` — API endpoints
- `backend/app/algorithms/` — ML algorithm wrappers
- `backend/app/models/schemas.py` — Pydantic request/response models
- `backend/app/cache.py` — Redis caching layer
- `frontend/src/app/` — Next.js App Router pages
- `frontend/src/components/` — React components
- `frontend/src/lib/api/` — API client and generated types

## Adding a New Algorithm

1. Add the algorithm to the appropriate file in `backend/app/algorithms/`
2. Add hyperparameter config in `frontend/src/lib/store.ts`
3. Update the API schema in `backend/app/models/schemas.py` if needed
4. Regenerate types: `npm run generate-types` (requires backend running)

## Type Safety

Frontend types are auto-generated from the backend's OpenAPI schema. Never hand-edit `src/lib/api/types.ts` — run `npm run generate-types` instead.

## Commit Messages

Use conventional commits:
- `feat(scope): description`
- `fix(scope): description`
- `docs(scope): description`
- `test(scope): description`
- `perf(scope): description`
