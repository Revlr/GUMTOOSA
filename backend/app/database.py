import sqlite3
from contextlib import contextmanager
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Iterator

from app.config import Settings
from app.models import DataQuality, MarketDataResponse, OhlcvBar


def database_path(settings: Settings) -> Path:
    path = Path(settings.sqlite_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[1] / path
    return path


@contextmanager
def connect(settings: Settings) -> Iterator[sqlite3.Connection]:
    path = database_path(settings)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db(settings: Settings) -> None:
    with connect(settings) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS ohlcv_bars (
                symbol TEXT NOT NULL,
                date TEXT NOT NULL,
                open REAL NOT NULL,
                high REAL NOT NULL,
                low REAL NOT NULL,
                close REAL NOT NULL,
                adjusted_close REAL,
                volume INTEGER NOT NULL,
                source TEXT NOT NULL,
                adjusted INTEGER NOT NULL DEFAULT 0,
                fetched_at TEXT NOT NULL,
                PRIMARY KEY (symbol, date, source)
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_date ON ohlcv_bars(symbol, date)")


def save_market_data(response: MarketDataResponse, settings: Settings) -> int:
    if not response.bars:
        return 0

    fetched_at = datetime.now(timezone.utc).isoformat()
    rows = [
        (
            bar.symbol.upper(),
            bar.date.isoformat(),
            bar.open,
            bar.high,
            bar.low,
            bar.close,
            bar.adjusted_close,
            bar.volume,
            bar.source,
            1 if response.quality.adjusted else 0,
            fetched_at,
        )
        for bar in response.bars
    ]

    with connect(settings) as conn:
        conn.executemany(
            """
            INSERT OR REPLACE INTO ohlcv_bars (
                symbol, date, open, high, low, close, adjusted_close, volume, source, adjusted, fetched_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )

    return len(rows)


def load_market_data(symbol: str, start: date, end: date, source: str, settings: Settings) -> MarketDataResponse | None:
    init_db(settings)
    normalized_symbol = symbol.upper()

    with connect(settings) as conn:
        rows = conn.execute(
            """
            SELECT symbol, date, open, high, low, close, adjusted_close, volume, source, adjusted
            FROM ohlcv_bars
            WHERE symbol = ? AND source = ? AND date BETWEEN ? AND ?
            ORDER BY date ASC
            """,
            (normalized_symbol, source, start.isoformat(), end.isoformat()),
        ).fetchall()

    if not rows:
        return None

    bars = [
        OhlcvBar(
            symbol=row["symbol"],
            date=date.fromisoformat(row["date"]),
            open=row["open"],
            high=row["high"],
            low=row["low"],
            close=row["close"],
            adjusted_close=row["adjusted_close"],
            volume=row["volume"],
            source=row["source"],
        )
        for row in rows
    ]

    return MarketDataResponse(
        symbol=normalized_symbol,
        data_mode="cached",
        data_source=source,
        last_updated_at=datetime.now(timezone.utc),
        quality=DataQuality(
            adjusted=bool(rows[0]["adjusted"]),
            warnings=["Loaded from local SQLite cache."],
        ),
        bars=bars,
    )


def get_db_stats(settings: Settings) -> dict[str, object]:
    init_db(settings)
    with connect(settings) as conn:
        total_rows = conn.execute("SELECT COUNT(*) AS count FROM ohlcv_bars").fetchone()["count"]
        symbols = conn.execute(
            """
            SELECT symbol, source, COUNT(*) AS rows, MIN(date) AS start_date, MAX(date) AS end_date
            FROM ohlcv_bars
            GROUP BY symbol, source
            ORDER BY symbol, source
            """
        ).fetchall()

    return {
        "path": str(database_path(settings)),
        "total_rows": total_rows,
        "symbols": [dict(row) for row in symbols],
    }
