api:
	cd api && .venv/bin/uvicorn main:app --reload --port 8001
web:
	cd web && npm run dev
.PHONY: api web
