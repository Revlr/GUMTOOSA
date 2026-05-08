# GUMTOOSA Backend

FastAPI backend for market data and future backtest execution.

## Features

- Health check endpoint
- Daily OHLCV market data endpoint
- Alpha Vantage adapter for US stocks/ETFs using the free daily OHLCV endpoint
- Free Alpha Vantage keys use `outputsize=compact`, so live data is limited to recent daily history
- Yahoo Finance chart adapter for real OHLCV data ingestion into SQLite
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

Use reload mode during backend development:

```powershell
.\backend\run.ps1 -Reload
```

## Endpoints

```text
GET /health
GET /api/db/stats
GET /api/market/symbols
GET /api/market/daily?symbol=SPY&start=2025-01-01&end=2025-12-31&provider=yahoo_finance
POST /api/market/ingest/yahoo
POST /api/backtests
```

`provider=db` reads the local Yahoo Finance cache only.
`provider=mock` forces local mock data.
Use `refresh=true` to bypass the SQLite cache and fetch again.

If `provider=alpha_vantage` is used without an API key, the server returns a clear 503 error unless `ALLOW_MOCK_FALLBACK=true`.
Yahoo Finance ingestion uses the public chart endpoint and does not require an API key.

SQLite data is stored at `backend/data/gumtoosa.sqlite3` by default and is excluded from git.

## Ingest Yahoo Finance Data

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/market/ingest/yahoo -ContentType "application/json" -Body '{"symbols":["SPY","QQQ","VTI"],"start":"2025-01-01","end":"2025-12-31","refresh":true}'
```

Serverless DB ingest from the repository root:

```powershell
backend\.venv\Scripts\python.exe backend\scripts\ingest_yahoo.py --start 2020-01-01 --end 2026-05-09 --refresh
```
