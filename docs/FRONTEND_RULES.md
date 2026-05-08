# 프론트엔드 규칙

## 목표 스택

PRD의 목표 스택은 React 또는 Next.js, TailwindCSS, TradingView Chart, Zustand 또는 Redux입니다. 현재 정적 프로토타입은 React 전환 전 정보 구조 기준으로 봅니다.

## 구조 원칙

- 페이지 단위: 홈, 백테스트, 커뮤니티
- 도메인 단위: 전략, 조건, 백테스트 실행, 결과, 커뮤니티
- UI 컴포넌트는 도메인 로직을 직접 계산하지 않습니다.
- 전략 조건과 백테스트 결과는 스키마 객체를 통해 전달합니다.

## 상태 관리

전역 상태 후보:

- 현재 선택된 전략
- 전략 목록
- 백테스트 실행 상태
- 최근 실행 결과
- 데이터 모드: `mock` 또는 `live`

지역 상태 후보:

- 탭 선택
- 사이드바 접힘 여부
- 조건 추가 모달 입력값
- 필터와 정렬 값

## 컴포넌트 후보

- `TopNavigation`
- `MarketStrip`
- `StrategyList`
- `StrategyEditor`
- `ConditionBuilder`
- `TemplatePicker`
- `BacktestOptionsForm`
- `BacktestResult`
- `MetricCard`
- `EquityChart`
- `DrawdownChart`
- `MonthlyReturnHeatmap`
- `TradeLogTable`
- `CommunityStrategyList`

## 구현 규칙

- 조건 추가/수정은 `STRATEGY_SCHEMA.md`의 타입을 따릅니다.
- 숫자 입력은 내부 값과 표시 값을 분리합니다.
- 통화, 퍼센트, 날짜 포맷은 유틸 함수로 통일합니다.
- API 실패 시 사용자에게 데이터 모드와 실패 이유를 안내합니다.
- 목업 데이터는 실제 API 응답과 같은 형태로 유지합니다.

## 에러 처리

- 전략 조건이 비어 있으면 실행을 막고 구체적인 메시지를 표시합니다.
- 기간이 너무 짧으면 경고를 표시합니다.
- 데이터가 없거나 결측이 많으면 결과 화면에 신뢰도 경고를 표시합니다.
- 계산 실패 시 부분 결과를 조용히 보여주지 말고 실패 상태를 명확히 표시합니다.

## 정적 프로토타입 유지 규칙

React 전환 전까지 루트의 `index.html`, `styles.css`, `app.js`는 다음 원칙을 지킵니다.

- 외부 빌드 도구 없이 브라우저에서 열 수 있어야 합니다.
- 문서화된 사용자 흐름을 깨지 않습니다.
- 목업 데이터는 화면 검증 목적임을 표시합니다.
