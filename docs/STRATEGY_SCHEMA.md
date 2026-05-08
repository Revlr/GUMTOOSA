# 전략 스키마

전략 조건, 템플릿, 백테스트 요청은 같은 스키마 계열을 사용합니다. 저장, 공유, 백테스트 엔진 입력이 서로 다른 형태로 갈라지지 않도록 이 문서를 기준으로 맞춥니다.

## Strategy

```json
{
  "id": "strategy_ma_cross",
  "name": "이동평균 돌파",
  "description": "20일 이동평균이 60일 이동평균을 상향 돌파할 때 진입합니다.",
  "market": "US_STOCK",
  "symbols": ["SPY"],
  "timeframe": "1d",
  "buyCondition": {
    "operator": "AND",
    "rules": []
  },
  "sellCondition": {
    "operator": "AND",
    "rules": []
  },
  "backtestOptions": {},
  "isPublic": false,
  "updatedAt": "2026-05-08T00:00:00.000Z"
}
```

## ConditionGroup

```json
{
  "operator": "AND",
  "rules": [
    {
      "id": "rule_1",
      "left": { "type": "indicator", "name": "SMA", "params": { "period": 20 } },
      "comparator": ">",
      "right": { "type": "indicator", "name": "SMA", "params": { "period": 60 } }
    }
  ]
}
```

`operator`는 `AND` 또는 `OR`만 허용합니다.

## Rule

| 필드 | 설명 |
| --- | --- |
| `id` | 조건 고유 ID |
| `left` | 비교 좌항 |
| `comparator` | `>`, `>=`, `<`, `<=`, `==`, `crosses_above`, `crosses_below` |
| `right` | 비교 우항 |

## Operand

```json
{ "type": "indicator", "name": "RSI", "params": { "period": 14 } }
```

```json
{ "type": "number", "value": 35 }
```

```json
{ "type": "price", "field": "close" }
```

## 지원 지표 MVP

- SMA: 단순 이동평균
- EMA: 지수 이동평균
- RSI
- MACD
- VolumeAverage

## BacktestOptions

```json
{
  "startDate": "2020-01-01",
  "endDate": "2025-12-31",
  "initialCapital": 10000000,
  "feeRate": 0.00015,
  "slippageRate": 0.0003,
  "positionSizing": "all_in",
  "benchmark": "SPY"
}
```

## 유효성 규칙

- 매수 조건과 매도 조건은 각각 최소 1개 이상 필요합니다.
- 같은 그룹 안에서 완전히 동일한 조건을 중복 저장하지 않습니다.
- 지표 기간은 1 이상 정수여야 합니다.
- 시작일은 종료일보다 앞서야 합니다.
- `symbols`는 MVP에서 우선 1개만 실행합니다. 다중 종목은 포트폴리오 확장 때 활성화합니다.
