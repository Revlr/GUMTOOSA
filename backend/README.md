# GUMTOOSA Backend

FastAPI backend for market data and future backtest execution.

## Features

- Health check endpoint
- Daily OHLCV market data endpoint
- Alpha Vantage adapter for US stocks/ETFs using the free daily OHLCV endpoint
- Free Alpha Vantage keys use `outputsize=compact`, so live data is limited to recent daily history
- SQLite cache for fetched OHLCV bars
- Deterministic mock data fallback for local development
- Normalized response shape for frontend backtesting

## Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Set `ALPHA_VANTAGE_API_KEY` in `.env` to use live data.

## Run

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

From the repository root on Windows:

```powershell
.\backend\run.ps1
```

## Endpoints

```text
GET /health
GET /api/db/stats
GET /api/market/symbols
GET /api/market/daily?symbol=SPY&start=2020-01-01&end=2025-12-31&provider=alpha_vantage
```

`provider=mock` forces local mock data.
Use `refresh=true` to bypass the SQLite cache and fetch again.

If `provider=alpha_vantage` is used without an API key, the server returns a clear 503 error unless `ALLOW_MOCK_FALLBACK=true`.

SQLite data is stored at `backend/data/gumtoosa.sqlite3` by default and is excluded from git.
