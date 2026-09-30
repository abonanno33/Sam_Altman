.PHONY: setup dev api web

# One-time install of everything (Python venv + npm packages)
setup:
	cd api && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd web && npm install

# Run API (port 8001) and web app (port 5173) together
dev:
	@trap 'kill 0' INT TERM EXIT; \
	(cd api && .venv/bin/uvicorn main:app --reload --port 8001) & \
	(cd web && npm run dev) & \
	wait

api:
	cd api && .venv/bin/uvicorn main:app --reload --port 8001
web:
	cd web && npm run dev
