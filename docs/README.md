# docs

검투사(GUMTOOSA) 개발 규칙 문서 모음입니다. 각 문서는 PRD를 구현 가능한 규칙으로 풀어쓴 기준이며, 기능을 만들거나 수정할 때 작업 범위에 맞춰 참조합니다.

## 문서 목록

| 문서 | 목적 |
| --- | --- |
| [TASKS.md](./TASKS.md) | MVP 작업 목록, 진행 상태, 완료 기록 |
| [PRODUCT_RULES.md](./PRODUCT_RULES.md) | 제품 범위, MVP 우선순위, 제외 범위 판단 |
| [UI_UX_RULES.md](./UI_UX_RULES.md) | 화면 구성, 사용성, 접근성, 카피 규칙 |
| [FRONTEND_RULES.md](./FRONTEND_RULES.md) | 프론트엔드 구조, 상태, 컴포넌트 구현 규칙 |
| [STRATEGY_SCHEMA.md](./STRATEGY_SCHEMA.md) | 전략 조건, 템플릿, 백테스트 요청 스키마 |
| [BACKTEST_RULES.md](./BACKTEST_RULES.md) | 백테스트 엔진, 지표 계산, 결과 표시 규칙 |
| [DATA_RULES.md](./DATA_RULES.md) | 시장 데이터, 목업 데이터, 데이터 품질 규칙 |
| [MOCK_DATA_INVENTORY.md](./MOCK_DATA_INVENTORY.md) | 실제 데이터 전환 전 교체해야 할 목업 데이터 목록 |
| [DATA_MODEL_RULES.md](./DATA_MODEL_RULES.md) | 저장, 공유, 커뮤니티 데이터 모델 후보 |
| [QA_CHECKLIST.md](./QA_CHECKLIST.md) | 기능 완료 전 검증 체크리스트 |
| [REACT_MIGRATION_PLAN.md](./REACT_MIGRATION_PLAN.md) | React/Next.js 전환 계획 |
| [MVP_RECOMMENDATIONS.md](./MVP_RECOMMENDATIONS.md) | MVP 보강 추천 사항 |

## 백엔드

시장 데이터 API는 [../backend](../backend) 디렉토리에 FastAPI 기반으로 생성되어 있습니다. 실제 데이터 연동 시 `backend/.env`에 외부 API 키를 설정하고 `/api/market/daily` 응답을 프론트 백테스트 데이터 소스로 연결합니다.

## 공통 개발 원칙

- 사용자는 퀀트/개발 지식이 부족한 개인 투자자를 기본 대상으로 둡니다.
- 기능은 "전략 생성 -> 백테스트 실행 -> 결과 해석 -> 저장/공유" 흐름을 방해하지 않아야 합니다.
- MVP에서는 정교함보다 신뢰 가능한 흐름 검증을 우선합니다.
- 계산 결과, 데이터 출처, 경고 문구는 사용자가 오해하지 않도록 명확히 표시합니다.
- UI는 운영 도구처럼 조밀하지만 읽기 쉽게 구성하고, 장식보다 비교와 판단을 돕는 정보 밀도를 우선합니다.
- 작업 단위가 끝나면 [TASKS.md](./TASKS.md)에 상태 변경과 완료 기록을 남깁니다.

## PRD 해석 기준

- `PRD.md`에 있는 "반드시 포함" 항목은 MVP 개발 우선순위입니다.
- `PRD.md`의 "제외" 항목은 별도 요청이 없는 한 구현하지 않습니다.
- 확장 기능은 MVP 흐름을 안정화한 뒤 별도 이슈로 분리합니다.
- 문서 간 충돌이 생기면 `PRD.md` -> `AGENTS.md` -> 세부 규칙 문서 순서로 판단합니다.
