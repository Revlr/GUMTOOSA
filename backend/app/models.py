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


class SymbolInfo(BaseModel):
    symbol: str
    name: str
    market: str
    asset_type: str
    provider: str


class ErrorResponse(BaseModel):
    detail: str
