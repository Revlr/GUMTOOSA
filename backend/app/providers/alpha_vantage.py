from datetime import date, datetime, timezone
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import Settings
from app.models import DataQuality, MarketDataResponse, OhlcvBar


ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query"


def _parse_daily(symbol: str, payload: dict[str, Any], start: date, end: date) -> list[OhlcvBar]:
    if "Error Message" in payload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=payload["Error Message"])
    if "Note" in payload or "Information" in payload:
        detail = payload.get("Note") or payload.get("Information") or "Alpha Vantage rate limit reached."
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)

    series = payload.get("Time Series (Daily)", {})
    bars: list[OhlcvBar] = []

    for day, values in series.items():
        current_date = date.fromisoformat(day)
        if current_date < start or current_date > end:
            continue

        bars.append(
            OhlcvBar(
                symbol=symbol,
                date=current_date,
                open=float(values["1. open"]),
                high=float(values["2. high"]),
                low=float(values["3. low"]),
                close=float(values["4. close"]),
                adjusted_close=None,
                volume=int(float(values["5. volume"])),
                source="alpha_vantage",
            )
        )

    return sorted(bars, key=lambda item: item.date)


async def fetch_daily(symbol: str, start: date, end: date, settings: Settings) -> MarketDataResponse:
    if not settings.alpha_vantage_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ALPHA_VANTAGE_API_KEY is not configured.",
        )

    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol.upper(),
        "outputsize": "compact",
        "apikey": settings.alpha_vantage_api_key,
    }

    async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as client:
        response = await client.get(ALPHA_VANTAGE_URL, params=params)
        response.raise_for_status()

    bars = _parse_daily(symbol.upper(), response.json(), start, end)
    warnings: list[str] = []
    if not bars:
        warnings.append("No bars returned for the selected date range. Alpha Vantage free daily data is limited to compact recent history.")

    return MarketDataResponse(
        symbol=symbol.upper(),
        data_mode="live",
        data_source="alpha_vantage",
        last_updated_at=datetime.now(timezone.utc),
        quality=DataQuality(adjusted=False, warnings=warnings),
        bars=bars,
    )
