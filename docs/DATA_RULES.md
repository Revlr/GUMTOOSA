# 데이터 규칙

## 데이터 모드

검투사는 데이터 모드를 명시합니다.

- `mock`: 목업 또는 샘플 데이터
- `live`: 외부 API에서 가져온 실제 시장 데이터
- `cached`: 이전에 저장된 실제 시장 데이터

MVP에서는 `mock`을 기본으로 사용할 수 있지만, 화면과 결과에 반드시 표시합니다.

## 지원 시장 MVP

- 미국 주식: SPY, QQQ 같은 대표 ETF 우선
- 한국 주식: 삼성전자, KOSPI/KOSDAQ 대표 ETF 우선
- ETF: SPY를 기본 벤치마크로 사용

암호화폐는 MVP 제외입니다.

## 데이터 필드

일봉 OHLCV는 다음 필드를 기준으로 합니다.

```json
{
  "symbol": "SPY",
  "date": "2025-01-02",
  "open": 100,
  "high": 103,
  "low": 99,
  "close": 102,
  "volume": 12345678,
  "source": "mock"
}
```

## 품질 규칙

- 날짜는 ISO 형식 `YYYY-MM-DD`를 사용합니다.
- 가격과 거래량은 음수가 될 수 없습니다.
- 결측치가 있으면 조용히 보간하지 않고 경고를 남깁니다.
- 액면분할, 배당 보정 여부를 데이터 메타데이터에 표시합니다.
- 서로 다른 시장의 휴장일 차이를 고려합니다.

## 외부 데이터 후보

- Yahoo Finance
- Alpha Vantage
- Polygon.io
- 한국투자증권 API
- OpenDart

외부 API 키가 없거나 호출 제한이 있으면 목업 데이터로 전환하고 사용자에게 안내합니다.

## 벤치마크 기본값

- 미국 주식: SPY 또는 S&P 500
- 미국 기술주/ETF: QQQ 또는 NASDAQ
- 한국 주식: KOSPI 또는 KOSDAQ
- 한국 ETF: 해당 ETF 또는 KOSPI 200 후보
