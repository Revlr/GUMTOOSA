from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


DataMode = Literal["mock", "live", "cached"]


class OhlcvBar(BaseModel):
    symbol: str
    date: date
    open: float = Field(gt=0)
    high: float = Field(gt=0)
    low: float = Field(gt=0)
    close: float = Field(gt=0)
    adjusted_close: float | None = Field(default=None, gt=0)
    volume: int = Field(ge=0)
    source: str


class DataQuality(BaseModel):
    adjusted: bool
    missing_dates: list[date] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class MarketDataResponse(BaseModel):
    symbol: str
    data_mode: DataMode
    data_source: str
    last_updated_at: datetime
    quality: DataQuality
    bars: list[OhlcvBar]


class MarketIngestRequest(BaseModel):
    symbols: list[str] = Field(default_factory=list)
    start: date
    end: date
    refresh: bool = False


class MarketIngestSymbolResult(BaseModel):
    symbol: str
    source: str
    rows_saved: int
    status: Literal["saved", "cached", "empty", "failed"]
    detail: str | None = None


class MarketIngestResult(BaseModel):
    provider: str
    start: date
    end: date
    total_rows_saved: int
    results: list[MarketIngestSymbolResult]


class OperandInput(BaseModel):
    type: Literal["number", "price", "indicator"]
    value: float | None = None
    field: str | None = None
    name: str | None = None
    params: dict[str, int | float | str] = Field(default_factory=dict)


class RuleInput(BaseModel):
    id: str | None = None
    left: OperandInput
    comparator: Literal[">", ">=", "<", "<=", "==", "crosses_above", "crosses_below"]
    right: OperandInput


class ConditionGroupInput(BaseModel):
    operator: Literal["AND", "OR"] = "AND"
    rules: list[RuleInput] = Field(default_factory=list)


class AllocationWeightInput(BaseModel):
    symbol: str
    weight: float = Field(gt=0)


class AllocationInput(BaseModel):
    weights: list[AllocationWeightInput]
    rebalanceFrequency: Literal["quarterly", "annual"] = "quarterly"


class StrategyInput(BaseModel):
    id: str
    name: str | None = None
    buyCondition: ConditionGroupInput
    sellCondition: ConditionGroupInput
    allocation: AllocationInput | None = None


class BacktestOptionsInput(BaseModel):
    symbols: list[str]
    startDate: date
    endDate: date
    initialCapital: float = Field(gt=0)
    feeRate: float = Field(default=0, ge=0)
    slippageRate: float = Field(default=0, ge=0)
    positionSizing: Literal["all_in"] = "all_in"
    benchmark: str | None = None


class BacktestRequest(BaseModel):
    strategy: StrategyInput
    options: BacktestOptionsInput


class SymbolInfo(BaseModel):
    symbol: str
    name: str
    market: str
    asset_type: str
    provider: str


class ErrorResponse(BaseModel):
    detail: str
