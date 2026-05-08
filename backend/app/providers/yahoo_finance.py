from datetime import date, datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import Settings
from app.models import DataQuality, MarketDataResponse, OhlcvBar


YAHOO_CHART_URLS = (
    "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
    "https://query2.finance.yahoo.com/v8/finance/chart/{symbol}",
)
YAHOO_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept": "application/json,text/plain,*/*",
}
YAHOO_SYMBOL_ALIASES = {
    "005930": "005930.KS",
}


def yahoo_symbol_for(symbol: str) -> str:
    normalized_symbol = symbol.upper()
    return YAHOO_SYMBOL_ALIASES.get(normalized_symbol, normalized_symbol)


def _to_unix_seconds(value: date) -> int:
    return int(datetime(value.year, value.month, value.day, tzinfo=timezone.utc).timestamp())


def _parse_chart_payload(symbol: str, payload: dict[str, Any], start: date, end: date) -> list[OhlcvBar]:
    chart = payload.get("chart", {})
    error = chart.get("error")
    if error:
        description = error.get("description") or error.get("code") or "Yahoo Finance chart request failed."
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=description)

    results = chart.get("result") or []
    if not results:
        return []

    result = results[0]
    timestamps = result.get("timestamp") or []
    indicators = result.get("indicators") or {}
    quote = (indicators.get("quote") or [{}])[0]
    adjclose = (indicators.get("adjclose") or [{}])[0].get("adjclose") or []

    opens = quote.get("open") or []
    highs = quote.get("high") or []
    lows = quote.get("low") or []
    closes = quote.get("close") or []
    volumes = quote.get("volume") or []

    bars: list[OhlcvBar] = []
    for index, timestamp in enumerate(timestamps):
        bar_date = datetime.fromtimestamp(timestamp, tz=timezone.utc).date()
        if bar_date < start or bar_date > end:
            continue

        open_price = opens[index] if index < len(opens) else None
        high = highs[index] if index < len(highs) else None
        low = lows[index] if index < len(lows) else None
        close = closes[index] if index < len(closes) else None
        volume = volumes[index] if index < len(volumes) else None
        adjusted_close = adjclose[index] if index < len(adjclose) else None

        if None in {open_price, high, low, close, volume}:
            continue

        bars.append(
            OhlcvBar(
                symbol=symbol.upper(),
                date=bar_date,
                open=round(float(open_price), 6),
                high=round(float(high), 6),
                low=round(float(low), 6),
                close=round(float(close), 6),
                adjusted_close=round(float(adjusted_close), 6) if adjusted_close is not None else None,
                volume=int(volume),
                source="yahoo_finance",
            )
        )

    return bars


async def fetch_daily(symbol: str, start: date, end: date, settings: Settings) -> MarketDataResponse:
    if start > end:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start must be before or equal to end.")

    normalized_symbol = symbol.upper()
    yahoo_symbol = yahoo_symbol_for(normalized_symbol)
    params = {
        "period1": _to_unix_seconds(start),
        "period2": _to_unix_seconds(end + timedelta(days=1)),
        "interval": "1d",
        "events": "history",
        "includeAdjustedClose": "true",
    }

    last_status_code: int | None = None
    try:
        async with httpx.AsyncClient(timeout=settings.http_timeout_seconds, headers=YAHOO_HEADERS) as client:
            for url in YAHOO_CHART_URLS:
                response = await client.get(url.format(symbol=yahoo_symbol), params=params)
                if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                    last_status_code = response.status_code
                    continue
                response.raise_for_status()
                break
            else:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Yahoo Finance rate limit or anti-bot protection returned HTTP 429.",
                )
    except httpx.HTTPStatusError as exc:
        last_status_code = exc.response.status_code
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Yahoo Finance request failed with HTTP {last_status_code}.",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Yahoo Finance request failed: {exc}",
        ) from exc

    bars = _parse_chart_payload(normalized_symbol, response.json(), start, end)
    warnings: list[str] = []
    if yahoo_symbol != normalized_symbol:
        warnings.append(f"Yahoo Finance symbol mapped from {normalized_symbol} to {yahoo_symbol}.")
    if not bars:
        warnings.append("No bars returned for the selected date range.")

    return MarketDataResponse(
        symbol=normalized_symbol,
        data_mode="live",
        data_source="yahoo_finance",
        last_updated_at=datetime.now(timezone.utc),
        quality=DataQuality(adjusted=any(bar.adjusted_close is not None for bar in bars), warnings=warnings),
        bars=bars,
    )
