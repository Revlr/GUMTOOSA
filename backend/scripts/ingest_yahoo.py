import argparse
import asyncio
import json
import sys
from datetime import date
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import get_settings  # noqa: E402
from app.database import load_market_data, save_market_data  # noqa: E402
from app.mock_data import SUPPORTED_SYMBOLS  # noqa: E402
from app.providers.yahoo_finance import fetch_daily  # noqa: E402


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest Yahoo Finance daily OHLCV data into SQLite.")
    parser.add_argument("--symbols", default=",".join(SUPPORTED_SYMBOLS.keys()), help="Comma-separated symbols.")
    parser.add_argument("--start", required=True, help="Start date in YYYY-MM-DD format.")
    parser.add_argument("--end", required=True, help="End date in YYYY-MM-DD format.")
    parser.add_argument("--refresh", action="store_true", help="Fetch even when cached rows already exist.")
    return parser.parse_args()


async def _main() -> None:
    args = _parse_args()
    settings = get_settings()
    start = date.fromisoformat(args.start)
    end = date.fromisoformat(args.end)
    symbols = [symbol.strip().upper() for symbol in args.symbols.split(",") if symbol.strip()]

    results: list[dict[str, object]] = []
    total_rows_saved = 0

    for symbol in symbols:
        if not args.refresh:
            cached = load_market_data(symbol, start, end, "yahoo_finance", settings)
            if cached is not None:
                results.append(
                    {
                        "symbol": symbol,
                        "status": "cached",
                        "rows_saved": 0,
                        "cached_rows": len(cached.bars),
                    }
                )
                continue

        try:
            response = await fetch_daily(symbol, start, end, settings)
            rows_saved = save_market_data(response, settings)
            total_rows_saved += rows_saved
            results.append({"symbol": symbol, "status": "saved" if rows_saved else "empty", "rows_saved": rows_saved})
        except Exception as exc:
            results.append({"symbol": symbol, "status": "failed", "rows_saved": 0, "detail": str(exc)})

    print(
        json.dumps(
            {
                "provider": "yahoo_finance",
                "start": start.isoformat(),
                "end": end.isoformat(),
                "total_rows_saved": total_rows_saved,
                "results": results,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    asyncio.run(_main())
