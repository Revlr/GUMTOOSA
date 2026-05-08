# React/Next.js 전환 계획

현재 정적 프로토타입(`index.html`, `styles.css`, `app.js`)을 PRD의 목표 스택인 React 또는 Next.js 기반으로 전환하기 위한 작업 계획입니다.

## 전환 원칙

- 사용자 흐름과 화면 정보 구조는 현재 프로토타입을 기준으로 유지합니다.
- 전략 스키마, 백테스트 입력/출력 포맷, 데이터 모델은 기존 문서를 그대로 따릅니다.
- 전환 과정에서 기능을 새로 늘리지 않고, 먼저 동일 동작을 컴포넌트 구조로 옮깁니다.
- 목업 데이터와 백테스트 엔진은 API 연동 전까지 프론트엔드 로컬 모듈로 유지합니다.

## 권장 폴더 구조

```text
src/
  app/
    page.tsx
  components/
    navigation/
    strategy/
    backtest/
    community/
    charts/
  domain/
    strategy/
    backtest/
    market-data/
  lib/
    format.ts
    validation.ts
  data/
    mock-market-data.ts
    sample-community.ts
```

## 컴포넌트 분해

| 현재 영역 | 전환 컴포넌트 |
| --- | --- |
| 상단 네비게이션 | `TopNavigation`, `MarketStrip` |
| 홈 템플릿 | `TemplatePreviewGrid`, `MarketOverview`, `PopularStrategyList` |
| 전략 목록 | `StrategyList`, `StrategyListItem` |
| 전략 편집 | `StrategyEditor`, `ConditionBuilder`, `BacktestOptionsForm` |
| 결과 영역 | `BacktestResult`, `MetricCard`, `EquityChart`, `MonthlyReturnHeatmap`, `TradeLogTable` |
| 커뮤니티 | `CommunityStrategyGrid`, `RankingList`, `DiscussionList` |

## 상태 관리 후보

MVP 단계에서는 Zustand를 우선 후보로 둡니다.

- `strategies`: 저장된 전략 목록
- `selectedStrategyId`: 현재 선택 전략
- `latestRun`: 최근 백테스트 결과
- `dataMode`: `mock`, `live`, `cached`
- `ui`: 탭, 사이드바 접힘 여부

## 전환 순서

1. 정적 HTML을 React 컴포넌트로 단순 이전
2. `app.js`의 전략 스키마와 목업 데이터를 `domain`, `data` 모듈로 분리
3. 백테스트 계산 로직을 `domain/backtest` 모듈로 분리
4. 상태 관리를 Zustand store로 이전
5. localStorage 저장과 공유 기능을 hook으로 분리
6. 차트 영역을 SVG 또는 TradingView Chart 후보로 교체
7. FastAPI 연동 전 API 클라이언트 인터페이스만 정의

## 완료 기준

- 현재 정적 프로토타입의 홈, 백테스트, 커뮤니티 흐름이 동일하게 동작합니다.
- 전략 저장, 실행, 결과 표시, 공유 기능이 유지됩니다.
- 스키마와 계산 로직이 UI 컴포넌트에서 분리됩니다.
- 목업 데이터와 실제 API 연동 지점이 분리되어 있습니다.
