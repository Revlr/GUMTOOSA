from datetime import date, datetime, timezone
from math import sqrt
from statistics import stdev
from typing import Any

from fastapi import HTTPException, status

from app.models import BacktestOptionsInput, ConditionGroupInput, OperandInput, OhlcvBar, StrategyInput


def _sma(values: list[float], index: int, period: int) -> float | None:
    if period <= 0 or index + 1 < period:
        return None
    return sum(values[index - period + 1 : index + 1]) / period


def _rsi(values: list[float], index: int, period: int) -> float | None:
    if period <= 0 or index < period:
        return None

    gains = 0.0
    losses = 0.0
    for cursor in range(index - period + 1, index + 1):
        change = values[cursor] - values[cursor - 1]
        if change >= 0:
            gains += change
        else:
            losses += abs(change)

    if losses == 0:
        return 100.0
    relative_strength = gains / losses
    return 100 - 100 / (1 + relative_strength)


def _operand_value(operand: OperandInput, row: OhlcvBar, closes: list[float], index: int) -> float | None:
    if operand.type == "number":
        return float(operand.value) if operand.value is not None else None

    if operand.type == "price":
        field = operand.field or "close"
        value = getattr(row, field, None)
        return float(value) if isinstance(value, int | float) else None

    if operand.type == "indicator":
        period = int(operand.params.get("period", 0))
        if operand.name == "SMA":
            return _sma(closes, index, period)
        if operand.name == "RSI":
            return _rsi(closes, index, period)

    return None


def _compare(left: float | None, comparator: str, right: float | None) -> bool:
    if left is None or right is None:
        return False
    if comparator == ">":
        return left > right
    if comparator == ">=":
        return left >= right
    if comparator == "<":
        return left < right
    if comparator == "<=":
        return left <= right
    if comparator == "==":
        return left == right
    return False


def _cross_compare(
    rule_left: OperandInput,
    comparator: str,
    rule_right: OperandInput,
    row: OhlcvBar,
    previous_row: OhlcvBar | None,
    closes: list[float],
    index: int,
) -> bool:
    if comparator not in {"crosses_above", "crosses_below"}:
        return _compare(
            _operand_value(rule_left, row, closes, index),
            comparator,
            _operand_value(rule_right, row, closes, index),
        )
    if previous_row is None or index == 0:
        return False

    current_left = _operand_value(rule_left, row, closes, index)
    current_right = _operand_value(rule_right, row, closes, index)
    previous_left = _operand_value(rule_left, previous_row, closes, index - 1)
    previous_right = _operand_value(rule_right, previous_row, closes, index - 1)

    if None in {current_left, current_right, previous_left, previous_right}:
        return False
    if comparator == "crosses_above":
        return previous_left <= previous_right and current_left > current_right
    return previous_left >= previous_right and current_left < current_right


def _evaluate_group(group: ConditionGroupInput, rows: list[OhlcvBar], closes: list[float], index: int) -> bool:
    row = rows[index]
    previous_row = rows[index - 1] if index > 0 else None
    evaluations = [
        _cross_compare(rule.left, rule.comparator, rule.right, row, previous_row, closes, index)
        for rule in group.rules
    ]
    return any(evaluations) if group.operator == "OR" else all(evaluations)


def _drawdown(equity: list[dict[str, Any]]) -> list[dict[str, Any]]:
    peak = equity[0]["value"] if equity else 0
    result: list[dict[str, Any]] = []
    for point in equity:
        peak = max(peak, point["value"])
        value = point["value"] / peak - 1 if peak else 0
        result.append({"date": point["date"], "value": value})
    return result


def _monthly_returns(equity: list[dict[str, Any]]) -> list[dict[str, Any]]:
    monthly: dict[str, dict[str, float]] = {}
    for point in equity:
        month = point["date"][:7]
        monthly.setdefault(month, {"start": point["value"], "end": point["value"]})
        monthly[month]["end"] = point["value"]
    return [
        {"month": month, "returnRate": item["end"] / item["start"] - 1 if item["start"] else 0}
        for month, item in list(monthly.items())[-12:]
    ]


def _benchmark_series(
    benchmark_rows: list[OhlcvBar] | None,
    strategy_rows: list[OhlcvBar],
    initial_capital: float,
) -> list[dict[str, Any]]:
    if not benchmark_rows:
        return []

    first_close = benchmark_rows[0].close
    values_by_date = {
        row.date.isoformat(): initial_capital * (row.close / first_close)
        for row in benchmark_rows
    }
    return [
        {"date": row.date.isoformat(), "value": values_by_date[row.date.isoformat()]}
        for row in strategy_rows
        if row.date.isoformat() in values_by_date
    ]


def _summary(
    equity: list[dict[str, Any]],
    trades: list[dict[str, Any]],
    options: BacktestOptionsInput,
    benchmark: list[dict[str, Any]],
) -> dict[str, Any]:
    final_value = equity[-1]["value"] if equity else options.initialCapital
    daily_returns = [
        equity[index]["value"] / equity[index - 1]["value"] - 1
        for index in range(1, len(equity))
        if equity[index - 1]["value"]
    ]
    years = max(1 / 365, (options.endDate - options.startDate).days / 365.25)
    drawdown = _drawdown(equity)
    volatility = stdev(daily_returns) * sqrt(252) if len(daily_returns) > 1 else 0
    mean_daily_return = sum(daily_returns) / len(daily_returns) if daily_returns else 0
    sharpe = (mean_daily_return * 252) / volatility if volatility else 0
    wins = len([trade for trade in trades if trade["returnRate"] > 0])
    average_trade_return = sum(trade["returnRate"] for trade in trades) / len(trades) if trades else 0
    benchmark_return = benchmark[-1]["value"] / options.initialCapital - 1 if benchmark else None

    return {
        "totalReturn": final_value / options.initialCapital - 1,
        "cagr": (final_value / options.initialCapital) ** (1 / years) - 1,
        "mdd": min((point["value"] for point in drawdown), default=0),
        "sharpe": sharpe,
        "volatility": volatility,
        "winRate": wins / len(trades) if trades else 0,
        "tradeCount": len(trades),
        "averageTradeReturn": average_trade_return,
        "benchmarkReturn": benchmark_return,
    }


def _validate(strategy: StrategyInput, options: BacktestOptionsInput, rows: list[OhlcvBar]) -> None:
    if strategy.allocation:
        return
    if len(options.symbols) != 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MVP backtests support exactly one symbol.")
    if options.startDate >= options.endDate:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="startDate must be before endDate.")
    if not strategy.buyCondition.rules:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="buyCondition requires at least one rule.")
    if not strategy.sellCondition.rules:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="sellCondition requires at least one rule.")
    if len(rows) < 60:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least 60 daily bars are required.")


def _should_rebalance(current: date, previous: date | None, frequency: str) -> bool:
    if previous is None:
        return True
    if frequency == "annual":
        return current.year != previous.year
    current_quarter = (current.month - 1) // 3
    previous_quarter = (previous.month - 1) // 3
    return current.year != previous.year or current_quarter != previous_quarter


def run_portfolio_backtest(
    strategy: StrategyInput,
    options: BacktestOptionsInput,
    rows_by_symbol: dict[str, list[OhlcvBar]],
    benchmark_rows: list[OhlcvBar] | None = None,
) -> dict[str, Any]:
    if not strategy.allocation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="allocation is required.")

    weights = strategy.allocation.weights
    total_weight = sum(item.weight for item in weights)
    if abs(total_weight - 1) > 0.001:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="allocation weights must sum to 1.")

    symbols = [item.symbol.upper() for item in weights]
    missing = [symbol for symbol in symbols if symbol not in rows_by_symbol or len(rows_by_symbol[symbol]) < 60]
    if missing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Missing DB data for: {', '.join(missing)}")

    price_maps = {
        symbol: {row.date: row.close for row in rows}
        for symbol, rows in rows_by_symbol.items()
    }
    primary_rows = rows_by_symbol[symbols[0]]
    rows = [
        row
        for row in primary_rows
        if all(row.date in price_maps[symbol] for symbol in symbols)
    ]
    if len(rows) < 60:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least 60 common daily bars are required.")

    holdings = {symbol: 0.0 for symbol in symbols}
    cash = options.initialCapital
    equity: list[dict[str, Any]] = []
    trades: list[dict[str, Any]] = []
    previous_rebalance_date: date | None = None
    trading_cost = options.feeRate + options.slippageRate

    for row in rows:
        total_value = cash + sum(holdings[symbol] * price_maps[symbol][row.date] for symbol in symbols)

        if _should_rebalance(row.date, previous_rebalance_date, strategy.allocation.rebalanceFrequency):
            for item in weights:
                symbol = item.symbol.upper()
                price = price_maps[symbol][row.date]
                target_value = total_value * item.weight
                current_value = holdings[symbol] * price
                trade_value = abs(target_value - current_value)
                fee = trade_value * trading_cost
                holdings[symbol] = max(0, (target_value - fee) / price)
                trades.append(
                    {
                        "symbol": symbol,
                        "entryDate": row.date.isoformat(),
                        "entryPrice": price,
                        "exitDate": row.date.isoformat(),
                        "exitPrice": price,
                        "returnRate": 0,
                        "holdingDays": 0,
                        "type": "rebalance",
                    }
                )
            cash = 0
            previous_rebalance_date = row.date

        equity.append(
            {
                "date": row.date.isoformat(),
                "value": cash + sum(holdings[symbol] * price_maps[symbol][row.date] for symbol in symbols),
            }
        )

    benchmark = _benchmark_series(benchmark_rows, rows, options.initialCapital)
    summary = _summary(equity, trades, options, benchmark)
    drawdown = _drawdown(equity)
    warnings = ["Portfolio backtest executed with Yahoo Finance data loaded from local SQLite."]
    if options.benchmark and not benchmark:
        warnings.append("Benchmark data was unavailable for comparison.")
    if summary["mdd"] < -0.3:
        warnings.append("MDD is below -30%.")

    return {
        "runId": f"run_{int(datetime.now(timezone.utc).timestamp())}",
        "strategyId": strategy.id,
        "status": "success",
        "dataMode": "cached",
        "dataSource": "yahoo_finance_sqlite",
        "summary": summary,
        "series": {
            "equity": equity,
            "drawdown": drawdown,
            "benchmark": benchmark,
        },
        "monthlyReturns": _monthly_returns(equity),
        "trades": trades,
        "warnings": warnings,
    }


def run_backtest(
    strategy: StrategyInput,
    options: BacktestOptionsInput,
    rows: list[OhlcvBar],
    benchmark_rows: list[OhlcvBar] | None = None,
) -> dict[str, Any]:
    _validate(strategy, options, rows)

    symbol = options.symbols[0].upper()
    closes = [row.close for row in rows]
    trading_cost = options.feeRate + options.slippageRate
    cash = options.initialCapital
    shares = 0.0
    entry: dict[str, Any] | None = None
    equity: list[dict[str, Any]] = []
    trades: list[dict[str, Any]] = []
    warnings: list[str] = ["Executed with Yahoo Finance data loaded from local SQLite."]

    for index, row in enumerate(rows):
        sell_signal = shares > 0 and _evaluate_group(strategy.sellCondition, rows, closes, index)
        buy_signal = shares == 0 and _evaluate_group(strategy.buyCondition, rows, closes, index)

        if sell_signal:
            exit_price = row.close * (1 - trading_cost)
            cash = shares * exit_price
            trades.append(
                {
                    "symbol": symbol,
                    "entryDate": entry["date"],
                    "entryPrice": entry["price"],
                    "exitDate": row.date.isoformat(),
                    "exitPrice": exit_price,
                    "returnRate": exit_price / entry["price"] - 1,
                    "holdingDays": max(1, (row.date - date.fromisoformat(entry["date"])).days),
                }
            )
            shares = 0
            entry = None
        elif buy_signal:
            entry_price = row.close * (1 + trading_cost)
            shares = cash / entry_price
            cash = 0
            entry = {"date": row.date.isoformat(), "price": entry_price}

        equity.append({"date": row.date.isoformat(), "value": shares * row.close if shares > 0 else cash})

    if shares > 0 and entry is not None:
        last = rows[-1]
        exit_price = last.close * (1 - trading_cost)
        cash = shares * exit_price
        trades.append(
            {
                "symbol": symbol,
                "entryDate": entry["date"],
                "entryPrice": entry["price"],
                "exitDate": last.date.isoformat(),
                "exitPrice": exit_price,
                "returnRate": exit_price / entry["price"] - 1,
                "holdingDays": max(1, (last.date - date.fromisoformat(entry["date"])).days),
            }
        )
        equity[-1]["value"] = cash

    drawdown = _drawdown(equity)
    benchmark = _benchmark_series(benchmark_rows, rows, options.initialCapital)
    summary = _summary(equity, trades, options, benchmark)
    min_drawdown = min((point["value"] for point in drawdown), default=0)

    if len(trades) < 5:
        warnings.append("Trade count is below 5.")
    if min_drawdown < -0.3:
        warnings.append("MDD is below -30%.")
    if options.benchmark and not benchmark:
        warnings.append("Benchmark data was unavailable for comparison.")

    return {
        "runId": f"run_{int(datetime.now(timezone.utc).timestamp())}",
        "strategyId": strategy.id,
        "status": "success",
        "dataMode": "cached",
        "dataSource": "yahoo_finance_sqlite",
        "summary": summary,
        "series": {
            "equity": equity,
            "drawdown": drawdown,
            "benchmark": benchmark,
        },
        "monthlyReturns": _monthly_returns(equity),
        "trades": trades,
        "warnings": warnings,
    }
