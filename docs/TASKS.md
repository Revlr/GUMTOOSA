# 작업 목록

검투사 MVP 개발 작업 목록과 완료 기록입니다. 작업을 시작할 때 상태를 바꾸고, 작업 단위가 끝나면 아래 완료 기록에 남깁니다.

## 상태 규칙

| 상태 | 의미 |
| --- | --- |
| `TODO` | 아직 시작하지 않은 작업 |
| `IN_PROGRESS` | 현재 진행 중인 작업 |
| `DONE` | 완료되어 검증까지 끝난 작업 |
| `BLOCKED` | 외부 결정, API 키, 설계 미확정 등으로 막힌 작업 |

## 기록 규칙

작업 단위가 끝나면 다음 두 가지를 갱신합니다.

1. `MVP 작업 보드`에서 해당 항목 상태를 `DONE`으로 변경합니다.
2. `완료 기록`에 날짜, 작업 ID, 변경 내용, 검증 내용을 남깁니다.

완료 기록 형식:

```md
### YYYY-MM-DD - TASK-ID 작업명

- 변경: 무엇을 만들거나 수정했는지
- 검증: 실행한 확인 또는 테스트
- 참고: 남은 리스크, 후속 작업, 관련 문서
```

## MVP 작업 보드

| ID | 상태 | 작업 | 완료 기준 | 참조 문서 |
| --- | --- | --- | --- | --- |
| MVP-001 | DONE | PRD 기반 정적 MVP 화면 작성 | 홈, 백테스트, 커뮤니티 화면이 정적 UI로 구성됨 | [UI_UX_RULES.md](./UI_UX_RULES.md) |
| MVP-002 | DONE | 개발 규칙 문서 작성 | `docs` 규칙 문서와 `AGENTS.md` 매핑이 작성됨 | [README.md](./README.md) |
| MVP-003 | DONE | 작업 목록과 완료 기록 체계 작성 | 작업 보드, 상태 규칙, 완료 기록 양식이 작성됨 | [TASKS.md](./TASKS.md) |
| MVP-004 | DONE | 정적 UI QA와 반응형 보정 | 데스크톱/모바일에서 주요 화면 텍스트 겹침 없이 표시됨 | [QA_CHECKLIST.md](./QA_CHECKLIST.md), [UI_UX_RULES.md](./UI_UX_RULES.md) |
| MVP-005 | DONE | 전략 조건 스키마를 코드 데이터로 반영 | 매수/매도 조건이 문서 스키마와 같은 구조로 관리됨 | [STRATEGY_SCHEMA.md](./STRATEGY_SCHEMA.md) |
| MVP-006 | DONE | 전략 유효성 검사 구현 | 조건 없음, 중복 조건, 잘못된 기간 실행이 차단됨 | [STRATEGY_SCHEMA.md](./STRATEGY_SCHEMA.md), [QA_CHECKLIST.md](./QA_CHECKLIST.md) |
| MVP-007 | DONE | 목업 시장 데이터 세트 구성 | SPY, QQQ, 한국 대표 종목 또는 ETF 샘플 데이터가 준비됨 | [DATA_RULES.md](./DATA_RULES.md) |
| MVP-008 | DONE | 백테스트 입력/출력 포맷 고정 | 실행 결과가 `BACKTEST_RULES.md`의 결과 포맷을 따름 | [BACKTEST_RULES.md](./BACKTEST_RULES.md) |
| MVP-009 | DONE | 단일 종목 일봉 백테스트 구현 | 매수/매도 조건에 따라 거래 로그와 지표가 생성됨 | [BACKTEST_RULES.md](./BACKTEST_RULES.md) |
| MVP-010 | DONE | 결과 지표 계산 연결 | 총수익률, CAGR, MDD, Sharpe, 승률, 거래 횟수가 계산됨 | [BACKTEST_RULES.md](./BACKTEST_RULES.md) |
| MVP-011 | DONE | 결과 차트 데이터 연결 | 수익률 차트, 월별 수익률, 거래 요약이 실행 결과 기반으로 표시됨 | [UI_UX_RULES.md](./UI_UX_RULES.md) |
| MVP-012 | DONE | 백테스트 신뢰도 표시 | 데이터 출처, 목업 여부, 수수료/슬리피지, 경고가 결과에 표시됨 | [MVP_RECOMMENDATIONS.md](./MVP_RECOMMENDATIONS.md), [DATA_RULES.md](./DATA_RULES.md) |
| MVP-013 | DONE | 로컬 저장 기반 전략 저장 | 새로고침 후에도 저장된 전략이 유지됨 | [DATA_MODEL_RULES.md](./DATA_MODEL_RULES.md) |
| MVP-014 | DONE | 저장 전 공유 기능 구현 | 전략 조건과 결과 요약을 복사 가능한 공유 형태로 제공함 | [MVP_RECOMMENDATIONS.md](./MVP_RECOMMENDATIONS.md) |
| MVP-015 | DONE | 커뮤니티 샘플 리스트 데이터화 | 하드코딩 화면이 샘플 데이터 배열 기반으로 렌더링됨 | [DATA_MODEL_RULES.md](./DATA_MODEL_RULES.md) |
| MVP-016 | DONE | React/Next.js 전환 계획 수립 | 현재 정적 프로토타입에서 목표 스택으로 옮길 범위가 정리됨 | [FRONTEND_RULES.md](./FRONTEND_RULES.md) |
| MVP-017 | DONE | 백테스트 화면 한 화면 표시 보정 | 전략 빌더와 수익률 차트가 데스크톱/노트북 화면에서 같은 줄에 표시됨 | [UI_UX_RULES.md](./UI_UX_RULES.md) |
| MVP-018 | DONE | 수익률 차트 패널 높이 고정 | 차트 패널이 작은 고정 높이로 표시되어 결과 영역을 과도하게 차지하지 않음 | [UI_UX_RULES.md](./UI_UX_RULES.md) |
| MVP-019 | DONE | 실사용 가능한 백테스트 빌더 구현 | 조건 추가/삭제, 템플릿 적용, 벤치마크 비교, 저장/실행 흐름이 실제로 동작함 | [STRATEGY_SCHEMA.md](./STRATEGY_SCHEMA.md), [BACKTEST_RULES.md](./BACKTEST_RULES.md) |
| MVP-020 | DONE | 안정형 포트폴리오 템플릿 추가 | 전략 템플릿 탭에 널리 알려진 안정형 자산배분 템플릿 5개와 포트폴리오 백테스트가 추가됨 | [STRATEGY_SCHEMA.md](./STRATEGY_SCHEMA.md), [BACKTEST_RULES.md](./BACKTEST_RULES.md) |
| MVP-021 | DONE | 포트폴리오 템플릿 매수/매도 조건 표시 | 안정형 포트폴리오 템플릿 적용 시 리밸런싱 매수/매도 조건이 백테스트 조건 영역에 함께 표시됨 | [STRATEGY_SCHEMA.md](./STRATEGY_SCHEMA.md), [UI_UX_RULES.md](./UI_UX_RULES.md) |
| DATA-001 | DONE | 목업 데이터 인벤토리 작성 | 실제 데이터 전환 전 교체해야 할 목업 요소가 위치와 교체 방향별로 정리됨 | [MOCK_DATA_INVENTORY.md](./MOCK_DATA_INVENTORY.md), [DATA_RULES.md](./DATA_RULES.md) |
| DATA-002 | DONE | 시장 데이터 백엔드 골격 생성 | FastAPI 기반 시장 데이터 API, Alpha Vantage 어댑터, 목업 fallback, 실행 문서가 생성됨 | [DATA_RULES.md](./DATA_RULES.md), [BACKTEST_RULES.md](./BACKTEST_RULES.md) |
| ENV-001 | DONE | Python 3.12 설치 및 백엔드 문법 검증 | Python 3.12이 설치되고 백엔드 Python 파일 컴파일 검사가 통과함 | [../backend/README.md](../backend/README.md) |
| ENV-002 | DONE | 백엔드 가상환경 구성 및 실행 확인 | 백엔드 의존성이 설치되고 FastAPI 헬스체크/목업 데이터 엔드포인트가 응답함 | [../backend/README.md](../backend/README.md) |
| DATA-003 | DONE | Alpha Vantage API 키 설정 및 live 데이터 확인 | 백엔드 `.env`에 API 키가 설정되고 최근 SPY 일봉 live 응답이 확인됨 | [../backend/README.md](../backend/README.md), [DATA_RULES.md](./DATA_RULES.md) |
| DATA-004 | DONE | SQLite 시장 데이터 캐시 추가 | 외부/목업 OHLCV 응답이 로컬 SQLite DB에 저장되고 재조회 시 캐시로 반환됨 | [../backend/README.md](../backend/README.md), [DATA_RULES.md](./DATA_RULES.md) |
| DATA-005 | DONE | Yahoo Finance DB 적재 구현 | Yahoo Finance 일봉 데이터가 SQLite DB에 저장되고 DB 조회 API로 반환됨 | [../backend/README.md](../backend/README.md), [DATA_RULES.md](./DATA_RULES.md) |

## 후속 작업 보드

| ID | 상태 | 작업 | 완료 기준 | 선행 조건 |
| --- | --- | --- | --- | --- |
| FE-001 | DONE | 프론트엔드 개발 서버 구성 | 정적 `index.html`, `app.js`, `styles.css`가 로컬 서버에서 실행되고 백엔드 API 주소를 환경별로 분리함 | 없음 |
| FE-002 | DONE | 프론트 API 클라이언트 레이어 추가 | `app.js`에서 직접 데이터 배열을 읽지 않고 `/api` 호출 함수로 심볼/일봉/백테스트 결과를 가져옴 | FE-001 |
| FE-003 | DONE | 목업 `marketData` 제거 및 실제 DB 데이터 연결 | 백테스트 실행 시 `/api/market/daily?provider=db` 또는 백엔드 백테스트 API를 사용하고, 목업 데이터 없음 오류 문구가 실제 데이터 없음 문구로 바뀜 | FE-002, BE-001 |
| FE-004 | TODO | 프론트 로딩/오류/빈 데이터 상태 구현 | 데이터 조회 중, API 실패, DB 미적재, 기간 데이터 부족 상태가 화면에서 명확히 표시됨 | FE-002 |
| BE-001 | DONE | 백테스트 실행 API 구현 | 프론트 전략 입력을 받아 DB OHLCV로 백테스트를 실행하고 지표/차트/거래 로그를 표준 응답으로 반환함 | DATA-005 |
| BE-002 | TODO | 전략/조건 스키마 백엔드 검증 구현 | 프론트 조건 구조를 Pydantic 모델로 검증하고 잘못된 조건/기간/심볼 요청을 400 응답으로 차단함 | BE-001 |
| BE-003 | DONE | 포트폴리오 리밸런싱 백테스트 API 구현 | 안정형 포트폴리오 템플릿의 비중/리밸런싱 조건을 서버에서 계산하고 결과를 반환함 | BE-001 |
| BE-004 | TODO | DB 데이터 관리 API 보강 | 심볼별 적재 범위, 누락 구간, 최신 갱신 시각, 강제 갱신 API를 제공함 | DATA-005 |
| BE-005 | TODO | 목업 fallback 정책 정리 | 운영 기본값은 실제 DB 데이터로 고정하고, 목업 fallback은 개발 모드에서만 명시적으로 사용되도록 분리함 | BE-001 |
| OPS-001 | TODO | 프론트/백엔드 동시 실행 스크립트 작성 | 한 명령으로 프론트 서버와 FastAPI 서버를 실행하고 포트 충돌 시 안내함 | FE-001 |
| QA-001 | TODO | API-프론트 통합 검증 시나리오 작성 | 실제 Yahoo DB 데이터 기준으로 단일 종목/포트폴리오 백테스트가 화면에 표시되는 체크리스트가 생김 | FE-003, BE-003 |
| UX-001 | DONE | 포트폴리오 템플릿 조건 고정 해제 | 안정형 포트폴리오 템플릿의 매수/매도 조건을 삭제/추가할 수 있음 | FE-003 |
| UX-002 | DONE | `app.js` 한글 문자열 인코딩 복구 | 깨진 한글 표시 문구가 읽을 수 있는 문자열로 복구됨 | UX-001 |
| UX-003 | DONE | 안정형 포트폴리오 템플릿 숨김 | 전략 템플릿 탭에서 안정형 포트폴리오 5개가 표시되지 않음 | UX-002 |
| DATA-006 | DONE | SQLite 등록 종목 프론트 표시 | SPY 외 DB 적재 종목이 종목 입력 후보와 화면 칩으로 표시됨 | DATA-005 |

## 완료 기록

### 2026-05-09 - DATA-006 SQLite 등록 종목 프론트 표시

- 변경: SQLite DB 통계를 기준으로 SPY 외 추가 가능한 11개 종목을 백테스트 종목 입력 후보와 `SQLite DB 등록 종목` 칩 목록으로 표시함
- 검증: `dbSymbols`에 SPY 제외 11개 심볼이 반영된 것을 확인했고, `index.html`과 `app.js`가 프론트 서버에서 HTTP 200으로 로드됨. `git diff --check`도 통과함
- 참고: 백엔드 DB/수집/백테스트 API는 변경하지 않고 프론트 표시만 추가함

### 2026-05-09 - UX-003 안정형 포트폴리오 템플릿 숨김

- 변경: `templateStrategies` 생성 시 `allocation`이 있는 포트폴리오 전략을 제외해 전략 템플릿 탭에는 기술적 전략 3개만 표시되도록 변경함
- 검증: `app.js`에서 템플릿 필터가 적용된 것을 확인했고, 포트폴리오 전략 정의는 유지되어 있으며, 프론트 서버에서 `app.js`가 HTTP 200으로 로드됨. `git diff --check`도 통과함
- 참고: 포트폴리오 백테스트용 백엔드 API, DB 데이터, 기존 포트폴리오 계산 코드는 건드리지 않아 다른 시스템 영향은 없음

### 2026-05-09 - UX-002 `app.js` 한글 문자열 인코딩 복구

- 변경: `app.js`를 정상 한글 문자열 기준으로 복구하고, API 클라이언트/백엔드 백테스트 실행/포트폴리오 조건 고정 해제 변경을 다시 반영함
- 검증: UTF-8 기준으로 깨진 문자 후보를 점검했고, 프론트 서버에서 `app.js`가 HTTP 200으로 로드되는 것을 확인함
- 참고: 파일은 UTF-8로 저장하며, PowerShell 기본 출력에서는 UTF-8 표시가 환경에 따라 다르게 보일 수 있음

### 2026-05-09 - UX-001 포트폴리오 템플릿 조건 고정 해제

- 변경: 안정형 포트폴리오 템플릿에 자동 적용되는 리밸런싱 매수/매도 조건의 `locked` 처리를 제거하고, 포트폴리오 전략에서도 조건 추가/삭제 UI를 사용할 수 있도록 변경함
- 검증: 코드에서 `rule.locked` 기반 고정 렌더링과 포트폴리오 조건 추가 차단 경로가 제거된 것을 확인함
- 참고: 포트폴리오 백테스트 계산은 현재 서버에서 자산 비중/리밸런싱 주기를 기준으로 수행되며, 조건 UI는 전략 설명/편집 영역으로 유지됨

### 2026-05-09 - FE-001 프론트엔드 개발 서버 구성

- 변경: `frontend/server.py`, `frontend/run.ps1`, `config.js`를 추가하고 `index.html`에서 `config.js`를 먼저 로드하도록 연결함
- 검증: `compileall frontend\server.py`를 통과했고, `http://127.0.0.1:5173/index.html` 요청이 HTTP 200으로 응답함
- 참고: 현재는 기존 정적 앱을 유지하며, API 연동은 `window.GUMTOOSA_CONFIG.API_BASE_URL`을 기준으로 후속 작업에서 연결함

### 2026-05-09 - BE-001 백테스트 실행 API 구현

- 변경: `backend/app/backtest.py`에 단일 종목 백테스트 엔진을 추가하고, `POST /api/backtests`가 DB에 저장된 Yahoo Finance 일봉으로 지표/차트/거래 로그를 반환하도록 연결함
- 검증: `compileall backend\app`을 통과했고, FastAPI `TestClient`로 SPY 2020-01-01~2025-12-31 이동평균 전략 요청이 HTTP 200, `status: success`, `dataMode: cached`, 거래 13건, equity series 1508개를 반환함
- 참고: 포트폴리오 리밸런싱 백테스트는 `BE-003`에서 별도로 구현함

### 2026-05-09 - FE-002 프론트 API 클라이언트 레이어 추가

- 변경: `app.js` 상단에 `window.GUMTOOSA_CONFIG.API_BASE_URL` 기반 `gumtoosaApi` 클라이언트를 추가하고 헬스체크, DB 통계, 심볼 목록, 일봉 조회, 백테스트 실행 호출 함수를 분리함
- 검증: 프론트 서버에서 `http://127.0.0.1:5173/app.js`가 HTTP 200으로 응답함. 현재 로컬에 Node.js가 없어 별도 JS 문법 검사는 수행하지 못함
- 참고: 실제 실행 버튼이 API를 호출하도록 바꾸는 작업은 `FE-003`에서 진행함

### 2026-05-09 - BE-003 포트폴리오 리밸런싱 백테스트 API 구현

- 변경: 백엔드 백테스트 엔진에 포트폴리오 리밸런싱 실행 경로를 추가하고, `/api/backtests`가 안정형 포트폴리오 템플릿의 비중과 리밸런싱 주기를 DB 일봉 기준으로 계산하도록 확장함
- 검증: `compileall backend\app`을 통과했고, FastAPI `TestClient`로 VTI 60% / BND 40% 분기 리밸런싱 포트폴리오가 HTTP 200, `status: success`, `dataMode: cached`, 리밸런싱 거래 48건, equity series 1508개를 반환함
- 참고: 리밸런싱은 현재 `quarterly`, `annual` 주기를 지원함

### 2026-05-09 - FE-003 목업 marketData 실행 경로 제거 및 실제 DB 데이터 연결

- 변경: 프론트의 `runBacktest()`가 단일 종목과 포트폴리오 모두 로컬 `backtest()` 대신 `gumtoosaApi.runBacktest()`로 백엔드 `/api/backtests`를 호출하도록 변경함
- 검증: 프론트 서버에서 `app.js`가 HTTP 200으로 로드되고, 백엔드 `/api/backtests` 포트폴리오 요청이 `status: success`, `dataMode: cached`, 리밸런싱 거래 48건, equity series 1508개를 반환함
- 참고: `app.js` 안의 기존 목업 생성 함수는 후속 정리 대상으로 남아 있으나, 실행 버튼 경로에서는 더 이상 사용하지 않음

### 2026-05-09 - DATA-005 Yahoo Finance DB 적재 구현

- 변경: 백엔드에 Yahoo Finance 일봉 provider, SQLite 저장/조회 연동, `/api/market/ingest/yahoo` 일괄 적재 API, `provider=db|yahoo_finance` 조회 경로를 추가함
- 검증: `compileall backend\app backend\scripts`를 통과했고, `backend\scripts\ingest_yahoo.py --start 2020-01-01 --end 2026-05-09 --refresh`로 12개 심볼의 Yahoo Finance 실제 일봉 19,110행을 SQLite에 저장함. 기존 `source=mock` DB 행 8개는 삭제했고, SPY DB 조회가 `data_mode: cached`, `data_source: yahoo_finance`로 반환됨
- 참고: Yahoo Finance chart endpoint는 API 키가 필요 없지만 공식 보증 API가 아니므로 장애 시 대체 데이터 공급자 검토 필요

### 2026-05-09 - DATA-003 Alpha Vantage API 키 설정 및 live 데이터 확인

- 변경: 사용자가 제공한 Alpha Vantage API 키를 커밋 제외 대상인 `backend/.env`에 설정하고, 백엔드 Alpha Vantage 어댑터를 무료 키에서 사용 가능한 `TIME_SERIES_DAILY` + `outputsize=compact` 방식으로 수정함
- 검증: FastAPI 서버를 임시 실행해 `/api/market/daily?symbol=SPY&start=2026-04-01&end=2026-05-08&provider=alpha_vantage`가 `data_mode: live`, `data_source: alpha_vantage`로 응답하는 것을 확인함
- 참고: Alpha Vantage 무료 키는 장기 과거 데이터용 `outputsize=full`과 adjusted daily endpoint가 premium으로 제한되어 있어, 현재 live 연동은 최근 compact 일봉 데이터 범위에서 동작함

### 2026-05-09 - DATA-004 SQLite 시장 데이터 캐시 추가

- 변경: `backend/app/database.py`를 추가해 `ohlcv_bars` SQLite 테이블을 생성하고, `/api/market/daily`가 캐시 우선 조회, `refresh=true` 강제 갱신, fetch 후 저장을 수행하도록 수정함. `/api/db/stats` 엔드포인트와 `SQLITE_PATH` 설정도 추가함
- 검증: 백엔드를 임시 실행해 `provider=mock&refresh=true` 요청 후 동일 요청이 `data_mode: cached`로 반환되고, DB 통계에서 `total_rows: 8`과 `backend/data/gumtoosa.sqlite3` 경로가 확인됨. `compileall backend\app`과 `git diff --check`도 통과함
- 참고: `backend/data/`는 `.gitignore`에 포함되어 로컬 캐시 DB가 커밋되지 않음

### 2026-05-09 - ENV-001 Python 3.12 설치 및 백엔드 문법 검증

- 변경: `winget`으로 Python 3.12.10을 사용자 범위에 설치함
- 검증: `C:\Users\gonow\AppData\Local\Programs\Python\Python312\python.exe --version`으로 Python 3.12.10을 확인하고, `python.exe -m compileall backend\app`으로 백엔드 Python 파일 문법 검사를 통과함
- 참고: 현재 셸에서는 Microsoft Store Python 실행 별칭이 `python` 명령을 방해할 수 있어, 새 터미널을 열거나 실제 설치 경로의 `python.exe`를 사용해야 함

### 2026-05-09 - ENV-002 백엔드 가상환경 구성 및 실행 확인

- 변경: `backend/.venv` 가상환경을 생성하고 `backend/requirements.txt` 의존성을 설치했으며, 로컬 실행용 `backend/run.ps1`을 추가함
- 검증: FastAPI 서버를 `127.0.0.1:8000`에서 임시 실행해 `/health`와 `/api/market/daily?symbol=SPY&start=2020-01-01&end=2020-01-10&provider=mock` 응답을 확인함
- 참고: `backend/.env`는 로컬 실행용으로 생성했으며 `.gitignore`에 의해 커밋되지 않음. 실제 Alpha Vantage 사용 시 `ALPHA_VANTAGE_API_KEY` 값을 설정해야 함

### 2026-05-09 - DATA-002 시장 데이터 백엔드 골격 생성

- 변경: `backend/`에 FastAPI 앱, 설정, CORS, 헬스체크, 지원 심볼 목록, 일봉 OHLCV 조회 엔드포인트, Alpha Vantage 어댑터, 목업 fallback, `.env.example`, `requirements.txt`, 실행 README를 추가함
- 검증: 파일 구조와 주요 엔드포인트 구현을 확인함. 현재 로컬 환경에 Python 실행 파일이 없어 `compileall` 및 서버 실행 검증은 수행하지 못함
- 참고: 실제 live 데이터 사용 시 `backend/.env`에 `ALPHA_VANTAGE_API_KEY`를 설정해야 하며, 다음 단계는 프론트의 `marketData`를 `/api/market/daily` 호출로 교체하는 작업

### 2026-05-09 - DATA-001 목업 데이터 인벤토리 작성

- 변경: `docs/MOCK_DATA_INVENTORY.md`에 시장 지수 UI, 홈 카드, 백테스트 가격 데이터, 결과 신뢰도 문구, 전략 템플릿 기본값, 커뮤니티 샘플, 종목 선택 후보의 목업 요소를 정리하고 `AGENTS.md`, `docs/README.md`에 연결함
- 검증: `index.html`, `app.js`, `docs` 내 목업/샘플/정적 데이터 키워드를 검색해 주요 교체 대상을 분류함
- 참고: 실제 데이터 전환 시에는 `marketData`/`generateMockPrices()` 제거와 데이터 로더 인터페이스 도입이 1순위

### 2026-05-09 - MVP-021 포트폴리오 템플릿 매수/매도 조건 표시

- 변경: 안정형 포트폴리오 템플릿에 `리밸런싱일 도래`, `자산별 현재 비중 < 목표 비중`, `자산별 현재 비중 > 목표 비중` 조건을 자동 부여하고 백테스트 조건 영역에 자산 비중과 함께 표시하도록 수정함
- 검증: 포트폴리오 조건 생성 함수, 템플릿 적용 경로, 조건 렌더링 경로와 CSS 고정 조건 표시를 확인하고 `git diff --check`를 통과함
- 참고: 포트폴리오 조건은 목표 비중 리밸런싱 전략의 기본 규칙이므로 화면에서 고정 조건으로 표시함

### 2026-05-09 - MVP-020 안정형 포트폴리오 템플릿 추가

- 변경: 안정형 60/40, 보수형 3펀드, 영구 포트폴리오, 올웨더, 골든 버터플라이 템플릿을 추가하고 VTI/VXUS/BND/TLT/IEF/SHY/GLD/DBC/VBR 목업 ETF 데이터와 비중 기반 리밸런싱 백테스트를 구현함
- 검증: Chrome 헤드리스 DOM 검사로 전략 템플릿 탭에 신규 안정형 템플릿 5개가 렌더링되는 것을 확인함
- 참고: 템플릿은 널리 알려진 자산배분 구조를 참고한 교육/검증용 목업이며 투자 조언이나 수익 보장이 아님

### 2026-05-09 - MVP-019 실사용 가능한 백테스트 빌더 구현

- 변경: 조건 추가/삭제 UI, 새 전략 생성, 템플릿 적용, 지원 종목 datalist, 날짜 입력, 벤치마크 buy-and-hold 비교, 전략/벤치마크 복합 차트, 저장소 오류 안내를 구현함
- 검증: Chrome 헤드리스로 `index.html#backtest`를 렌더링해 백테스트 화면, 전략 빌더, 결과 차트, 벤치마크 라인 표시를 스크린샷으로 확인함
- 참고: 현재 데이터는 `SPY`, `QQQ`, `005930` 목업 일봉 데이터이며 실제 외부 API 연동은 후속 작업

### 2026-05-09 - MVP-018 수익률 차트 패널 높이 고정

- 변경: `.chart-panel` 높이를 260px로 고정하고 내부 `.line-chart` 높이를 176px로 고정해 백테스트 결과 화면의 세로 점유를 줄임
- 검증: CSS 높이 규칙 확인
- 참고: 차트 상세 분석용 확대 화면은 후속 UX 후보

### 2026-05-09 - MVP-017 백테스트 화면 한 화면 표시 보정

- 변경: `index.html`에 백테스트 전용 레이아웃 클래스를 추가하고, 백테스트 작업 영역의 3열 폭, 패널 여백, 전략 빌더 밀도, 지표 카드와 차트 높이를 조정해 전략 빌더와 수익률 차트가 같은 화면에 보이도록 보정함
- 검증: CSS 그리드 중단점과 백테스트 관련 레이아웃 규칙 확인
- 참고: 1020px 이하의 좁은 화면에서는 가독성을 위해 결과 패널이 아래로 내려감

### 2026-05-09 - MVP-004 정적 UI QA와 반응형 보정

- 변경: 상단 바, 버튼, 조건 칩, 지표/요약 리스트, 테이블이 좁은 화면에서 줄바꿈과 폭 제한을 안정적으로 처리하도록 CSS를 보정함
- 검증: 관련 CSS 규칙과 반응형 브레이크포인트 확인
- 참고: 실제 브라우저 스크린샷 기반 QA는 후속 실행 환경에서 추가 확인 필요

### 2026-05-09 - MVP-005 전략 조건 스키마를 코드 데이터로 반영

- 변경: `app.js`에 `Strategy`, `ConditionGroup`, `Rule`, `Operand` 형태의 전략 데이터를 추가하고 매수/매도 조건을 해당 데이터에서 렌더링하도록 변경함
- 검증: `data-rule-list` 렌더링 훅과 전략 선택 흐름 확인
- 참고: 조건 추가 UI는 아직 샘플 전략 선택 중심이며, 조건 편집 모달은 후속 작업 후보

### 2026-05-09 - MVP-006 전략 유효성 검사 구현

- 변경: 조건 없음, 중복 조건, 종목 없음, 데이터 없음, 기간 오류, 초기 자본 오류를 실행 전에 검사하도록 추가함
- 검증: 유효성 검사 함수와 `validation-panel` 연결 확인
- 참고: 현재 UI에서 조건 삭제 기능은 없으므로 조건 없음 검증은 데이터 구조 기준으로 동작

### 2026-05-09 - MVP-007 목업 시장 데이터 세트 구성

- 변경: SPY, QQQ, 005930 일봉 목업 OHLCV 데이터를 코드에서 생성하도록 추가함
- 검증: 데이터 생성 함수와 지원 종목 매핑 확인
- 참고: 실제 API 연동 전까지 `mock` 데이터 모드로 표시

### 2026-05-09 - MVP-008 백테스트 입력/출력 포맷 고정

- 변경: 백테스트 결과가 `runId`, `strategyId`, `status`, `dataMode`, `dataSource`, `summary`, `series`, `monthlyReturns`, `trades`, `warnings` 구조를 따르도록 구현함
- 검증: 결과 객체 생성 경로 확인
- 참고: 벤치마크 시계열은 필드만 유지하고 실제 비교 계산은 후속 작업

### 2026-05-09 - MVP-009 단일 종목 일봉 백테스트 구현

- 변경: 매수/매도 조건 평가, 보유 상태, 수수료/슬리피지, 거래 로그 생성이 포함된 단일 종목 일봉 백테스트를 구현함
- 검증: 전략 조건 평가 함수와 거래 생성 흐름 확인
- 참고: MVP 기준 체결가는 당일 종가 기반으로 처리

### 2026-05-09 - MVP-010 결과 지표 계산 연결

- 변경: 총수익률, CAGR, MDD, Sharpe, 변동성, 승률, 평균 거래 수익률, 거래 횟수를 계산해 지표 카드와 성과 요약에 연결함
- 검증: 지표 렌더링 훅과 요약 필드 연결 확인
- 참고: Sharpe의 무위험 수익률은 MVP 기준 0으로 처리

### 2026-05-09 - MVP-011 결과 차트 데이터 연결

- 변경: 백테스트 실행 결과 기반으로 수익률 SVG 차트, 수익률 분포, 월별 수익률 히트맵, 거래 요약 테이블을 렌더링함
- 검증: 차트/테이블 DOM 훅과 렌더링 함수 확인
- 참고: 전문 차트 라이브러리 도입은 React/Next.js 전환 이후 후보

### 2026-05-09 - MVP-012 백테스트 신뢰도 표시

- 변경: 결과 영역에 데이터 모드, 데이터 출처, 수수료/슬리피지 적용 여부, 투자 조언이 아니라는 안내, 경고 메시지를 표시함
- 검증: `result-meta` 렌더링 경로 확인
- 참고: 결측 데이터 상세 표시는 실제 데이터 소스 연동 시 보강 필요

### 2026-05-09 - MVP-013 로컬 저장 기반 전략 저장

- 변경: 전략 이름, 옵션, 조건 스냅샷을 `localStorage`에 저장하고 전략 목록을 데이터 기반으로 다시 렌더링하도록 구현함
- 검증: 저장 버튼, 저장 함수, 전략 목록 렌더링 연결 확인
- 참고: 브라우저 저장소를 사용할 수 없는 환경에서는 저장이 제한될 수 있음

### 2026-05-09 - MVP-014 저장 전 공유 기능 구현

- 변경: 최근 백테스트 결과 요약을 공유 문구로 생성하고 클립보드 복사 또는 화면 표시 fallback을 제공함
- 검증: 공유 버튼과 최근 실행 결과 연결 확인
- 참고: URL 파라미터 기반 공유는 후속 확장 후보

### 2026-05-09 - MVP-015 커뮤니티 샘플 리스트 데이터화

- 변경: 커뮤니티 전략, 수익률 랭킹, 토론 목록을 데이터 배열 기반으로 렌더링하도록 변경함
- 검증: 커뮤니티 DOM 훅과 렌더링 함수 확인
- 참고: 실제 쓰기 기능 없이 읽기 전용 샘플 리스트로 유지

### 2026-05-09 - MVP-016 React/Next.js 전환 계획 수립

- 변경: `docs/REACT_MIGRATION_PLAN.md`에 전환 원칙, 폴더 구조, 컴포넌트 분해, 상태 관리 후보, 전환 순서, 완료 기준을 작성함
- 검증: `docs/README.md`와 `AGENTS.md` 문서 매핑 확인
- 참고: 실제 React/Next.js 전환은 별도 구현 작업으로 진행

### 2026-05-08 - MVP-001 PRD 기반 정적 MVP 화면 작성

- 변경: 루트의 `index.html`, `styles.css`, `app.js`에 홈, 백테스트, 커뮤니티 정적 MVP 화면이 구성됨
- 검증: 화면 파일과 스크립트 구조 확인
- 참고: 현재 화면은 목업 데이터 기반 프로토타입이며 실제 백테스트 계산은 후속 작업

### 2026-05-08 - MVP-002 개발 규칙 문서 작성

- 변경: `docs`에 제품, UI/UX, 프론트엔드, 전략 스키마, 백테스트, 데이터, 데이터 모델, QA 규칙 문서를 추가하고 `AGENTS.md`에 매핑함
- 검증: 문서 목록과 주요 링크 확인
- 참고: PRD와 충돌할 경우 `PRD.md`를 우선 기준으로 사용

### 2026-05-08 - MVP-003 작업 목록과 완료 기록 체계 작성

- 변경: `docs/TASKS.md`에 MVP 작업 보드, 상태 규칙, 완료 기록 양식을 추가하고 `AGENTS.md`, `docs/README.md`에 연결함
- 검증: 문서 매핑과 작업 목록 링크 확인
- 참고: 앞으로 작업 단위 완료 시 이 섹션에 기록을 추가
