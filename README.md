# AcreWise 2.0

React + Vite frontend, FastAPI + SQLAlchemy + SQLite backend, and SciPy HiGHS optimization. All agricultural assumptions are clearly labeled sample data. Original English frontend features remain available at `/classic.html`; the main application supports English, Hindi and Punjabi.

## Run on Windows (two PowerShell terminals)

Backend:

```powershell
cd C:\Users\dell\Downloads\acrewise-hackathon\backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd C:\Users\dell\Downloads\acrewise-hackathon
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Interactive REST documentation: http://127.0.0.1:8000/docs. The Vite development proxy connects `/api` and `/health` to port 8000. No paid AI key is needed for optimization, simulation or the local multilingual guide.

## Verification

```powershell
npm run build
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

Tests cover known optimal profit, resource constraints, soil/season filters, impossible plans, exact price/yield/cost scenario arithmetic, water shortages, persistence through the API, authorization and isolation between workspaces, and three-language local assistant responses.

## Main journey

1. Save a farm profile in My Farm.
2. Set land, budget, irrigation, soil, season, objective and maximum crop share in Crop Mix Optimizer.
3. Run the optimizer and inspect allocation, cost, water and estimated profit. Save the plan.
4. Open What-if Simulator; change prices, yield, cost or water. Compare the original plan, unchanged crop mix and newly optimized mix. Simulations are stored automatically.
5. Ask Saathi to explain the mix. Choose English, Hindi or Punjabi. Click the microphone, speak, review recognized text, then send. Enable spoken responses or click Read aloud.
6. Reload and retrieve your farm, saved plans and simulation history.

## Optimization and simulation

`backend/app/services/catalog.py` contains the versioned sample dataset, units, soil/season eligibility, water requirements and illustrative risk haircuts. No live mandi, weather or agronomic source is claimed.

The linear program allocates all land, enforces budget and irrigation caps, excludes crops incompatible with soil/season, and bounds each crop by the selected maximum share. Objectives: maximize net profit; maximize profit after an illustrative revenue-risk haircut; or minimize irrigation. Infeasible requests return HTTP 422 without silently relaxing limits. Continuous acreage may need practical rounding by a farmer; displayed rounding does not change solver values.

The simulator applies price, yield and cost changes multiplicatively to the original allocation. Water changes the irrigation allowance, not yield. A plan exceeding water or budget is marked conditional. A second solve finds a new feasible allocation, or explicitly reports infeasibility. No artificial yield-loss equation is invented.

## Saathi and speech

Set `GEMINI_API_KEY` and `GEMINI_MODEL` in **backend/.env** to enable the Gemini REST integration with a model available to your account. Never put secrets in `VITE_*` variables. The provider receives typed/recognized text, recent conversation and farm/optimizer context. No key is embedded in the frontend. Without configuration, or on provider failure, responses are explicitly labeled as a local rule-based planning guide, not generative AI.

Speech input uses browser SpeechRecognition with `en-IN`, `hi-IN`, or `pa-IN`; output uses SpeechSynthesis with a matching installed voice. Browser support, recognition language support, network and OS voice installation vary. Unsupported recognition, microphone errors and missing voices are shown in the UI. No prerecorded audio or simulated recognition is used. Real microphone/provider round trips require testing on your device and a configured provider.

## Consent-first SMS and weather

Settings persists alert language, categories and explicit SMS consent to the backend and shows an audit history. Only enabled, useful categories are eligible: severe weather, crop-plan changes, market opportunities, oversupply, and harvest reminders. Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` only in the backend host's secret environment. When credentials are absent, AcreWise records `not_sent_provider_unconfigured`; it never claims an SMS was delivered. This demo stores only a masked number—use encrypted phone storage and a consent-retention policy in production.

Weather first attempts the Open-Meteo forecast API without exposing a browser key. If unreachable, the dashboard explicitly labels its illustrative offline fallback. Confirm severe-weather decisions through official local advisories.

## REST endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Health, sample data mode, assistant capability |
| `POST /api/workspaces` | Create an anonymous workspace; returns a bearer token once |
| `GET, PUT /api/farm` | Read/save this workspace's farm profile |
| `GET, PUT /api/farm/details` | Persist extended parcels, crop history and expense ledger |
| `GET /api/crops` | Sample crop catalog and assumptions |
| `POST /api/optimize` | Constrained SciPy optimization |
| `POST /api/simulate` | Scenario calculation and database history |
| `GET /api/simulations` | Recent history for this workspace |
| `GET, POST /api/plans` | List/save calculated plans |
| `DELETE /api/plans/{id}` | Delete an owned plan |
| `POST /api/assistant` | Contextual multilingual AI/local guide |
| `GET, PUT /api/notifications/preferences` | Consent, languages and useful-alert categories |
| `POST /api/notifications/sms` | Consent-gated Twilio alert attempt / honest demo record |
| `GET /api/notifications/history` | Alert audit history for this workspace |
| `GET /api/weather` | Live Open-Meteo forecast with identified fallback |
| `POST /api/recommendations` | Original frontend compatibility |

Farm, plan, simulation and assistant endpoints require `Authorization: Bearer <workspace token>`. Only the token hash is stored in SQLite. Tokens are stored in browser localStorage; clearing it loses access to that anonymous workspace. This is a hackathon workspace session, not production identity/account recovery. Original frontend plans and intentions remain browser-local; they are not silently merged with new database plans. Original profiles are migrated on first workspace creation when found on the same origin.

## Deployment: Netlify or Vercel frontend + Render backend

The repository includes `netlify.toml`, `vercel.json`, and `render.yaml`. These configuration files do not mean the app is already deployed.

1. Deploy `backend` as a Render Python web service. Build: `pip install -r requirements.txt`. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Health path: `/health`.
2. The provided Blueprint uses the **free demo option selected by the user**, with `DATABASE_URL=sqlite:///./acrewise.db` and `STORAGE_MODE=ephemeral`. SQLite data and anonymous sessions may disappear when the backend restarts or redeploys. The UI displays this limitation. For durable SQLite later, attach a paid persistent disk at `/var/data`, change the database URL to `sqlite:////var/data/acrewise.db`, and set `STORAGE_MODE=persistent` after reviewing pricing.
3. Set `CORS_ORIGINS` to the exact frontend origins, comma-separated, e.g. your actual Vercel and Netlify URLs. Do not include trailing slashes. Add AI secrets only on Render if desired.
4. On both frontend hosts, set the **build** environment variable `VITE_API_BASE_URL` to the actual HTTPS Render origin. This public URL is not a secret. Build: `npm run build`. Publish/output directory: `dist`. Node 22+ recommended.
5. Deploy/rebuild both frontends after setting the API URL. Their SPA rewrite configurations support direct navigation and refresh. `classic.html` is an additional built entry point.
6. Verify `/health`, create a farm, optimize, save a plan, run a scenario and reload the deployed app. HTTPS is needed for browser microphone access outside localhost.

The frontend hosts do not run this long-lived Python/SQLite service. A frontend-only deploy without a real backend URL reports an explicit connection error. The Render filesystem must retain the database for browser tokens to remain valid. A free restarted database may require explicitly starting a new workspace.

Before wider public use, add real account login/recovery, durable backups, edge/IP rate limiting and provider spending controls. Current assistant throttling is per workspace and process, suitable for a hackathon rather than abuse-resistant public billing protection.
