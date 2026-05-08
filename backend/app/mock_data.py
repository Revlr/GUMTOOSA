from datetime import date, datetime, timedelta, timezone

from app.models import DataQuality, MarketDataResponse, OhlcvBar


SUPPORTED_SYMBOLS = {
    "SPY": ("SPDR S&P 500 ETF Trust", "US", "ETF", 320, 0.00032, 0.012),
    "QQQ": ("Invesco QQQ Trust", "US", "ETF", 210, 0.00045, 0.016),
    "005930": ("Samsung Electronics", "KR", "STOCK", 56000, 0.00024, 0.018),
    "VTI": ("Vanguard Total Stock Market ETF", "US", "ETF", 180, 0.00028, 0.011),
    "VXUS": ("Vanguard Total International Stock ETF", "US", "ETF", 52, 0.00018, 0.012),
    "BND": ("Vanguard Total Bond Market ETF", "US", "ETF", 82, 0.00008, 0.0035),
    "TLT": ("iShares 20+ Year Treasury Bond ETF", "US", "ETF", 135, 0.00007, 0.008),
    "IEF": ("iShares 7-10 Year Treasury Bond ETF", "US", "ETF", 110, 0.00006, 0.0048),
    "SHY": ("iShares 1-3 Year Treasury Bond ETF", "US", "ETF", 84, 0.000035, 0.0015),
    "GLD": ("SPDR Gold Shares", "US", "ETF", 145, 0.00016, 0.010),
    "DBC": ("Invesco DB Commodity Index Tracking Fund", "US", "ETF", 15, 0.0001, 0.014),
    "VBR": ("Vanguard Small-Cap Value ETF", "US", "ETF", 130, 0.0003, 0.014),
}


def _seeded_noise(index: int, symbol: str) -> float:
    seed = sum(ord(char) for char in symbol)
    raw = __import__("math").sin(index * 12.9898 + seed * 78.233) * 43758.5453
    return raw - int(raw)


def _generate_mock_prices(symbol: str, start: date, end: date) -> list[OhlcvBar]:
    if symbol not in SUPPORTED_SYMBOLS:
        return []

    _, _, _, start_price, drift, volatility = SUPPORTED_SYMBOLS[symbol]
    rows: list[OhlcvBar] = []
    cursor = date(2020, 1, 1)
    close = float(start_price)
    index = 0
    math = __import__("math")

    while cursor <= end:
        if cursor.weekday() < 5:
            wave = math.sin(index / 42) * volatility * 0.18
            noise = (_seeded_noise(index, symbol) - 0.5) * volatility * 0.72
            close = max(1, close * (1 + drift + wave + noise))
            open_price = close * (1 + (_seeded_noise(index + 3, symbol) - 0.5) * 0.006)
            high = max(open_price, close) * (1 + abs(_seeded_noise(index + 5, symbol)) * 0.01)
            low = min(open_price, close) * (1 - abs(_seeded_noise(index + 8, symbol)) * 0.01)

            if cursor >= start:
                rows.append(
                    OhlcvBar(
                        symbol=symbol,
                        date=cursor,
                        open=round(open_price, 4),
                        high=round(high, 4),
                        low=round(low, 4),
                        close=round(close, 4),
                        adjusted_close=round(close, 4),
                        volume=round(1_000_000 + abs(_seeded_noise(index + 13, symbol)) * 9_000_000),
                        source="mock",
                    )
                )
            index += 1
        cursor += timedelta(days=1)

    return rows


def get_mock_market_data(symbol: str, start: date, end: date) -> MarketDataResponse:
    normalized_symbol = symbol.upper()
    bars = _generate_mock_prices(normalized_symbol, start, end)
    warnings = ["Mock market data. Do not use for investment decisions."]
    if not bars:
        warnings.append(f"No mock data configured for {normalized_symbol}.")

    return MarketDataResponse(
        symbol=normalized_symbol,
        data_mode="mock",
        data_source="mock-generator",
        last_updated_at=datetime.now(timezone.utc),
        quality=DataQuality(adjusted=True, warnings=warnings),
        bars=bars,
    )
