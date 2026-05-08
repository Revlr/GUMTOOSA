from datetime import date
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.backtest import run_backtest, run_portfolio_backtest
from app.config import Settings, get_settings
from app.database import get_db_stats, init_db, load_market_data, save_market_data
from app.mock_data import SUPPORTED_SYMBOLS, get_mock_market_data
from app.models import BacktestRequest, MarketDataResponse, MarketIngestRequest, MarketIngestResult, MarketIngestSymbolResult, SymbolInfo
from app.providers.alpha_vantage import fetch_daily as fetch_alpha_vantage_daily
from app.providers.yahoo_finance import fetch_daily as fetch_yahoo_daily


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
init_db(settings)


@app.get("/health")
async def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.get("/api/market/symbols", response_model=list[SymbolInfo])
async def list_symbols() -> list[SymbolInfo]:
    return [
        SymbolInfo(symbol=symbol, name=name, market=market, asset_type=asset_type, provider="yahoo_finance")
        for symbol, (name, market, asset_type, *_rest) in SUPPORTED_SYMBOLS.items()
    ]


@app.get("/api/db/stats")
async def database_stats(settings: Settings = Depends(get_settings)) -> dict[str, object]:
    return get_db_stats(settings)


@app.post("/api/backtests")
async def create_backtest(
    payload: BacktestRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    if payload.strategy.allocation:
        rows_by_symbol = {}
        for item in payload.strategy.allocation.weights:
            symbol = item.symbol.upper()
            data = load_market_data(symbol, payload.options.startDate, payload.options.endDate, "yahoo_finance", settings)
            if data is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No Yahoo Finance DB data found for {symbol}. Run /api/market/ingest/yahoo first.",
                )
            rows_by_symbol[symbol] = data.bars

        benchmark_rows = None
        benchmark = payload.options.benchmark.upper() if payload.options.benchmark else ""
        if benchmark:
            benchmark_data = load_market_data(
                benchmark,
                payload.options.startDate,
                payload.options.endDate,
                "yahoo_finance",
                settings,
            )
            benchmark_rows = benchmark_data.bars if benchmark_data else None

        return run_portfolio_backtest(payload.strategy, payload.options, rows_by_symbol, benchmark_rows)

    symbol = payload.options.symbols[0].upper() if payload.options.symbols else ""
    data = load_market_data(symbol, payload.options.startDate, payload.options.endDate, "yahoo_finance", settings)
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No Yahoo Finance DB data found for {symbol}. Run /api/market/ingest/yahoo first.",
        )

    benchmark_rows = None
    benchmark = payload.options.benchmark.upper() if payload.options.benchmark else ""
    if benchmark:
        benchmark_data = load_market_data(
            benchmark,
            payload.options.startDate,
            payload.options.endDate,
            "yahoo_finance",
            settings,
        )
        benchmark_rows = benchmark_data.bars if benchmark_data else None

    return run_backtest(payload.strategy, payload.options, data.bars, benchmark_rows)


@app.get("/api/market/daily", response_model=MarketDataResponse)
async def get_daily_market_data(
    symbol: str = Query(min_length=1, max_length=20),
    start: date = Query(...),
    end: date = Query(...),
    provider: Literal["alpha_vantage", "yahoo", "yahoo_finance", "db", "mock"] = "yahoo_finance",
    refresh: bool = False,
    settings: Settings = Depends(get_settings),
) -> MarketDataResponse:
    if start > end:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start must be before or equal to end.")

    normalized_symbol = symbol.upper()
    source_by_provider = {
        "alpha_vantage": "alpha_vantage",
        "yahoo": "yahoo_finance",
        "yahoo_finance": "yahoo_finance",
        "db": "yahoo_finance",
        "mock": "mock",
    }
    source = source_by_provider[provider]

    if not refresh:
        cached = load_market_data(normalized_symbol, start, end, source, settings)
        if cached is not None:
            return cached

    if provider == "db":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No cached Yahoo Finance data found for {normalized_symbol} in the selected range.",
        )

    if provider == "mock":
        response = get_mock_market_data(normalized_symbol, start, end)
        save_market_data(response, settings)
        return response

    try:
        if provider == "alpha_vantage":
            response = await fetch_alpha_vantage_daily(normalized_symbol, start, end, settings)
        else:
            response = await fetch_yahoo_daily(normalized_symbol, start, end, settings)
        save_market_data(response, settings)
        return response
    except HTTPException as exc:
        if settings.allow_mock_fallback and exc.status_code in {
            status.HTTP_503_SERVICE_UNAVAILABLE,
            status.HTTP_429_TOO_MANY_REQUESTS,
        }:
            fallback = get_mock_market_data(normalized_symbol, start, end)
            fallback.quality.warnings.insert(0, f"Live data fallback: {exc.detail}")
            save_market_data(fallback, settings)
            return fallback
        raise


@app.post("/api/market/ingest/yahoo", response_model=MarketIngestResult)
async def ingest_yahoo_market_data(
    payload: MarketIngestRequest,
    settings: Settings = Depends(get_settings),
) -> MarketIngestResult:
    if payload.start > payload.end:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start must be before or equal to end.")

    symbols = [symbol.upper() for symbol in payload.symbols] if payload.symbols else list(SUPPORTED_SYMBOLS.keys())
    results: list[MarketIngestSymbolResult] = []
    total_rows_saved = 0

    for symbol in symbols:
        if not payload.refresh:
            cached = load_market_data(symbol, payload.start, payload.end, "yahoo_finance", settings)
            if cached is not None:
                results.append(
                    MarketIngestSymbolResult(
                        symbol=symbol,
                        source="yahoo_finance",
                        rows_saved=0,
                        status="cached",
                        detail=f"{len(cached.bars)} cached rows already exist.",
                    )
                )
                continue

        try:
            response = await fetch_yahoo_daily(symbol, payload.start, payload.end, settings)
            rows_saved = save_market_data(response, settings)
            total_rows_saved += rows_saved
            results.append(
                MarketIngestSymbolResult(
                    symbol=symbol,
                    source="yahoo_finance",
                    rows_saved=rows_saved,
                    status="saved" if rows_saved else "empty",
                    detail=None if rows_saved else "Yahoo Finance returned no rows.",
                )
            )
        except HTTPException as exc:
            results.append(
                MarketIngestSymbolResult(
                    symbol=symbol,
                    source="yahoo_finance",
                    rows_saved=0,
                    status="failed",
                    detail=str(exc.detail),
                )
            )

    return MarketIngestResult(
        provider="yahoo_finance",
        start=payload.start,
        end=payload.end,
        total_rows_saved=total_rows_saved,
        results=results,
    )
