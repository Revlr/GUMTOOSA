# 데이터 모델 규칙

이 문서는 DB 스키마 확정 전 도메인 모델 후보입니다. 구현 초기에는 로컬 저장소 또는 JSON 파일로 시작해도 동일한 필드 구조를 유지합니다.

## Strategy

| 필드 | 설명 |
| --- | --- |
| `id` | 전략 ID |
| `name` | 전략 이름 |
| `description` | 전략 설명 |
| `market` | 시장 구분 |
| `symbols` | 대상 종목 |
| `buyCondition` | 매수 조건 그룹 |
| `sellCondition` | 매도 조건 그룹 |
| `backtestOptions` | 백테스트 옵션 |
| `isPublic` | 공개 여부 |
| `createdAt` | 생성 시간 |
| `updatedAt` | 수정 시간 |

## BacktestRun

| 필드 | 설명 |
| --- | --- |
| `id` | 실행 ID |
| `strategyId` | 전략 ID |
| `inputSnapshot` | 실행 당시 전략과 옵션 스냅샷 |
| `status` | `pending`, `running`, `success`, `failed` |
| `summary` | 핵심 지표 |
| `series` | 차트 시계열 |
| `warnings` | 신뢰도와 유효성 경고 |
| `startedAt` | 시작 시간 |
| `finishedAt` | 완료 시간 |

## TradeLog

| 필드 | 설명 |
| --- | --- |
| `id` | 거래 ID |
| `runId` | 백테스트 실행 ID |
| `symbol` | 종목 |
| `entryDate` | 진입일 |
| `entryPrice` | 진입가 |
| `exitDate` | 청산일 |
| `exitPrice` | 청산가 |
| `returnRate` | 거래 수익률 |
| `holdingDays` | 보유 일수 |

## CommunityStrategy

| 필드 | 설명 |
| --- | --- |
| `id` | 커뮤니티 항목 ID |
| `strategyId` | 전략 ID |
| `authorName` | 작성자 표시명 |
| `riskType` | 투자 성향 |
| `likeCount` | 좋아요 수 |
| `forkCount` | 복제 수 |
| `isFeatured` | 추천 노출 여부 |
| `publishedAt` | 공개 시간 |

## 저장 규칙

- 백테스트 실행 결과는 전략 변경 후 재사용하지 않습니다.
- 공유용 데이터는 실행 당시 입력과 결과 요약을 스냅샷으로 저장합니다.
- 공개 전략은 개인정보 없이 전략 설명과 조건만 포함합니다.
- 로그인 도입 전에는 작성자명을 샘플 또는 로컬 표시명으로 처리합니다.
