from datetime import date
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, get_settings
from app.database import get_db_stats, init_db, load_market_data, save_market_data
from app.mock_data import SUPPORTED_SYMBOLS, get_mock_market_data
from app.models import MarketDataResponse, SymbolInfo
from app.providers.alpha_vantage import fetch_daily


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
        SymbolInfo(symbol=symbol, name=name, market=market, asset_type=asset_type, provider="mock")
        for symbol, (name, market, asset_type, *_rest) in SUPPORTED_SYMBOLS.items()
    ]


@app.get("/api/db/stats")
async def database_stats(settings: Settings = Depends(get_settings)) -> dict[str, object]:
    return get_db_stats(settings)


@app.get("/api/market/daily", response_model=MarketDataResponse)
async def get_daily_market_data(
    symbol: str = Query(min_length=1, max_length=20),
    start: date = Query(...),
    end: date = Query(...),
    provider: Literal["alpha_vantage", "mock"] = "alpha_vantage",
    refresh: bool = False,
    settings: Settings = Depends(get_settings),
) -> MarketDataResponse:
    if start > end:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start must be before or equal to end.")

    normalized_symbol = symbol.upper()
    source = "mock" if provider == "mock" else "alpha_vantage"

    if not refresh:
        cached = load_market_data(normalized_symbol, start, end, source, settings)
        if cached is not None:
            return cached

    if provider == "mock":
        response = get_mock_market_data(normalized_symbol, start, end)
        save_market_data(response, settings)
        return response

    try:
        response = await fetch_daily(normalized_symbol, start, end, settings)
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
