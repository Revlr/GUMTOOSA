# AGENTS.md

이 파일은 `docs` 디렉토리의 문서 매핑 파일입니다. 개발을 시작하기 전에 현재 작업 범위에 맞는 문서를 먼저 확인하고, PRD와 충돌하는 경우 `PRD.md`를 우선 기준으로 삼습니다.

## 기본 참조 순서

1. [PRD.md](./PRD.md): 제품 범위, 핵심 기능, MVP 기준
2. [docs/README.md](./docs/README.md): 문서 전체 지도와 개발 원칙
3. [docs/TASKS.md](./docs/TASKS.md): 현재 작업 목록과 완료 기록
4. 작업 유형별 세부 규칙 문서
5. [docs/QA_CHECKLIST.md](./docs/QA_CHECKLIST.md): 완료 전 검증 체크리스트

## 문서 매핑

| 작업 범위 | 먼저 볼 문서 | 함께 볼 문서 |
| --- | --- | --- |
| 작업 선택, 진행 상태 기록, 완료 로그 작성 | [docs/TASKS.md](./docs/TASKS.md) | [docs/QA_CHECKLIST.md](./docs/QA_CHECKLIST.md) |
| 제품 요구사항 해석, 우선순위 판단 | [docs/PRODUCT_RULES.md](./docs/PRODUCT_RULES.md) | [PRD.md](./PRD.md), [docs/MVP_RECOMMENDATIONS.md](./docs/MVP_RECOMMENDATIONS.md) |
| 화면, 레이아웃, 사용자 흐름 구현 | [docs/UI_UX_RULES.md](./docs/UI_UX_RULES.md) | [docs/FRONTEND_RULES.md](./docs/FRONTEND_RULES.md) |
| 프론트엔드 구조, 상태, 컴포넌트 구현 | [docs/FRONTEND_RULES.md](./docs/FRONTEND_RULES.md) | [docs/STRATEGY_SCHEMA.md](./docs/STRATEGY_SCHEMA.md), [docs/REACT_MIGRATION_PLAN.md](./docs/REACT_MIGRATION_PLAN.md) |
| 전략 빌더, 조건 JSON, 템플릿 | [docs/STRATEGY_SCHEMA.md](./docs/STRATEGY_SCHEMA.md) | [docs/BACKTEST_RULES.md](./docs/BACKTEST_RULES.md) |
| 백테스트 엔진, 성과 지표, 결과 포맷 | [docs/BACKTEST_RULES.md](./docs/BACKTEST_RULES.md) | [docs/DATA_RULES.md](./docs/DATA_RULES.md), [docs/STRATEGY_SCHEMA.md](./docs/STRATEGY_SCHEMA.md) |
| 시장 데이터, 목업 데이터, 데이터 출처 | [docs/DATA_RULES.md](./docs/DATA_RULES.md) | [docs/BACKTEST_RULES.md](./docs/BACKTEST_RULES.md) |
| 저장, 공유, 커뮤니티 데이터 모델 | [docs/DATA_MODEL_RULES.md](./docs/DATA_MODEL_RULES.md) | [docs/PRODUCT_RULES.md](./docs/PRODUCT_RULES.md) |
| QA, 접근성, 회귀 확인 | [docs/QA_CHECKLIST.md](./docs/QA_CHECKLIST.md) | 변경한 영역의 세부 규칙 문서 |

## 작업 원칙

- MVP에서는 로그인, AI 전략 추천, 실시간 자동매매를 구현하지 않습니다.
- 실제 API가 준비되지 않은 기능은 목업 데이터로 사용자 흐름을 먼저 검증합니다.
- 백테스트 결과는 투자 조언이 아니라 검증 보조 정보로 표시합니다.
- 전략 조건, 백테스트 입력, 결과 출력은 문서화된 스키마를 유지합니다.
- 화면 변경은 데스크톱과 모바일에서 모두 확인합니다.
- 작업 단위가 끝나면 `docs/TASKS.md`의 상태와 완료 기록을 갱신합니다.

## 현재 구현 상태

현재 루트의 `index.html`, `styles.css`, `app.js`는 PRD 기반 정적 MVP 화면입니다. 이후 React/Next.js로 전환하더라도 화면 정보 구조와 사용자 흐름은 이 프로토타입을 기준으로 유지합니다.
