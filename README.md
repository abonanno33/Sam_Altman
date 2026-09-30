# Roommates (KBC challenge, Tectonic Hackathon)

A concept extension for the KBC app: roommates share bills and household goals without a joint account.
Payments are detected from each person's own account and sorted automatically as shared or private.

## Quick start

Needs: Node 18+, Python 3.10+, `make`.

```bash
git clone https://github.com/abonanno33/Sam_Altman.git
cd Sam_Altman
make setup   # installs Python and npm dependencies, one time
make dev     # starts API (http://localhost:8001) and web app (http://localhost:5173)
```

Open http://localhost:5173. Stop with Ctrl+C.

No `make`? Run the same steps by hand:

```bash
cd api && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && cd ..
cd web && npm install && cd ..
(cd api && .venv/bin/uvicorn main:app --reload --port 8001) &
(cd web && npm run dev)
```

## Layout

- `api/`: FastAPI backend (`main.py`, `requirements.txt`). Not yet wired to the UI.
- `web/`: Vite + React + TypeScript mockup. App logic and demo data are in `web/src/lib.ts`.

## Notes

- Secrets go in `api/.env`, which is git-ignored. Never commit keys.
- The UI currently runs on demo data, nothing real is sent anywhere.
