.PHONY: typecheck lint test test-backend test-frontend install

typecheck:
	cd frontend && npm run typecheck

lint:
	cd frontend && npm run lint

test-backend:
	cd backend && python -m pytest tests/ -v

test: test-backend

install:
	cd frontend && npm install
	cd backend && pip install -r requirements.txt
	cd backend && pip install -r requirements-dev.txt
