const appConfig = window.GUMTOOSA_CONFIG || {};
const apiBaseUrl = appConfig.API_BASE_URL || "http://127.0.0.1:8000";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = `API request failed with HTTP ${response.status}`;
    try {
      const payload = await response.json();
      detail = payload.detail || detail;
    } catch (_error) {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  return response.json();
}

const gumtoosaApi = {
  getHealth: () => apiRequest("/health"),
  getDbStats: () => apiRequest("/api/db/stats"),
  listSymbols: () => apiRequest("/api/market/symbols"),
  getDailyMarketData: ({ symbol, start, end, provider = "db", refresh = false }) => {
    const params = new URLSearchParams({ symbol, start, end, provider, refresh: String(refresh) });
    return apiRequest(`/api/market/daily?${params.toString()}`);
  },
  runBacktest: (strategy, options) =>
    apiRequest("/api/backtests", {
      method: "POST",
      body: JSON.stringify({ strategy, options }),
    }),
};

window.gumtoosaApi = gumtoosaApi;

const strategies = [
  {
    id: "strategy_ma_cross",
    name: "이동평균 돌파",
    description: "20일 이동평균이 60일 이동평균보다 높고 RSI가 과열 전일 때 진입합니다.",
    market: "US_STOCK",
    symbols: ["SPY"],
    timeframe: "1d",
    buyCondition: {
      operator: "AND",
      rules: [
        {
          id: "buy_sma_20_gt_60",
          left: { type: "indicator", name: "SMA", params: { period: 20 } },
          comparator: ">",
          right: { type: "indicator", name: "SMA", params: { period: 60 } },
        },
        {
          id: "buy_rsi_under_55",
          left: { type: "indicator", name: "RSI", params: { period: 14 } },
          comparator: "<",
          right: { type: "number", value: 55 },
        },
      ],
    },
    sellCondition: {
      operator: "OR",
      rules: [
        {
          id: "sell_rsi_over_70",
          left: { type: "indicator", name: "RSI", params: { period: 14 } },
          comparator: ">",
          right: { type: "number", value: 70 },
        },
        {
          id: "sell_sma_20_lt_60",
          left: { type: "indicator", name: "SMA", params: { period: 20 } },
          comparator: "<",
          right: { type: "indicator", name: "SMA", params: { period: 60 } },
        },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "all_in",
      benchmark: "SPY",
    },
    isPublic: false,
    updatedAt: "2026-05-09T00:00:00.000Z",
  },
  {
    id: "strategy_rsi_rebound",
    name: "RSI 과매도 반등",
    description: "RSI 과매도 구간에서 진입하고 회복 구간에서 청산합니다.",
    market: "US_STOCK",
    symbols: ["QQQ"],
    timeframe: "1d",
    buyCondition: {
      operator: "AND",
      rules: [
        {
          id: "buy_rsi_under_35",
          left: { type: "indicator", name: "RSI", params: { period: 14 } },
          comparator: "<",
          right: { type: "number", value: 35 },
        },
      ],
    },
    sellCondition: {
      operator: "AND",
      rules: [
        {
          id: "sell_rsi_over_60",
          left: { type: "indicator", name: "RSI", params: { period: 14 } },
          comparator: ">",
          right: { type: "number", value: 60 },
        },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "all_in",
      benchmark: "QQQ",
    },
    isPublic: false,
    updatedAt: "2026-05-08T00:00:00.000Z",
  },
  {
    id: "strategy_dual_momentum",
    name: "ETF 듀얼모멘텀",
    description: "장기 이동평균보다 가격이 높을 때 추세를 따라 진입합니다.",
    market: "ETF",
    symbols: ["SPY"],
    timeframe: "1d",
    buyCondition: {
      operator: "AND",
      rules: [
        {
          id: "buy_close_over_sma_120",
          left: { type: "price", field: "close" },
          comparator: ">",
          right: { type: "indicator", name: "SMA", params: { period: 120 } },
        },
      ],
    },
    sellCondition: {
      operator: "AND",
      rules: [
        {
          id: "sell_close_under_sma_120",
          left: { type: "price", field: "close" },
          comparator: "<",
          right: { type: "indicator", name: "SMA", params: { period: 120 } },
        },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "all_in",
      benchmark: "SPY",
    },
    isPublic: false,
    updatedAt: "2026-05-06T00:00:00.000Z",
  },
  {
    id: "strategy_balanced_60_40",
    name: "안정형 60/40 포트폴리오",
    description: "주식 60%, 채권 40%로 구성하는 전통적인 균형형 자산배분입니다.",
    market: "ETF",
    symbols: ["VTI", "BND"],
    timeframe: "1d",
    buyCondition: { operator: "AND", rules: [] },
    sellCondition: { operator: "AND", rules: [] },
    allocation: {
      rebalanceFrequency: "quarterly",
      weights: [
        { symbol: "VTI", weight: 0.6, label: "미국 전체 주식" },
        { symbol: "BND", weight: 0.4, label: "미국 전체 채권" },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "target_allocation",
      benchmark: "SPY",
    },
    isPublic: false,
    updatedAt: "2026-05-09T00:00:00.000Z",
  },
  {
    id: "strategy_three_fund_defensive",
    name: "보수형 3펀드 포트폴리오",
    description: "미국 주식, 해외 주식, 채권을 단순하게 섞는 Bogleheads 계열 분산 포트폴리오입니다.",
    market: "ETF",
    symbols: ["VTI", "VXUS", "BND"],
    timeframe: "1d",
    buyCondition: { operator: "AND", rules: [] },
    sellCondition: { operator: "AND", rules: [] },
    allocation: {
      rebalanceFrequency: "quarterly",
      weights: [
        { symbol: "VTI", weight: 0.3, label: "미국 전체 주식" },
        { symbol: "VXUS", weight: 0.2, label: "미국 외 주식" },
        { symbol: "BND", weight: 0.5, label: "미국 전체 채권" },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "target_allocation",
      benchmark: "SPY",
    },
    isPublic: false,
    updatedAt: "2026-05-09T00:00:00.000Z",
  },
  {
    id: "strategy_permanent_portfolio",
    name: "영구 포트폴리오",
    description: "주식, 장기채, 금, 단기채/현금을 25%씩 나누는 방어형 포트폴리오입니다.",
    market: "ETF",
    symbols: ["VTI", "TLT", "GLD", "SHY"],
    timeframe: "1d",
    buyCondition: { operator: "AND", rules: [] },
    sellCondition: { operator: "AND", rules: [] },
    allocation: {
      rebalanceFrequency: "annual",
      weights: [
        { symbol: "VTI", weight: 0.25, label: "미국 전체 주식" },
        { symbol: "TLT", weight: 0.25, label: "장기 미국채" },
        { symbol: "GLD", weight: 0.25, label: "금" },
        { symbol: "SHY", weight: 0.25, label: "단기 미국채" },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "target_allocation",
      benchmark: "SPY",
    },
    isPublic: false,
    updatedAt: "2026-05-09T00:00:00.000Z",
  },
  {
    id: "strategy_all_weather",
    name: "올웨더 포트폴리오",
    description: "주식, 장기채, 중기채, 금, 원자재를 섞어 경기 국면 분산을 노리는 포트폴리오입니다.",
    market: "ETF",
    symbols: ["VTI", "TLT", "IEF", "GLD", "DBC"],
    timeframe: "1d",
    buyCondition: { operator: "AND", rules: [] },
    sellCondition: { operator: "AND", rules: [] },
    allocation: {
      rebalanceFrequency: "quarterly",
      weights: [
        { symbol: "VTI", weight: 0.3, label: "미국 전체 주식" },
        { symbol: "TLT", weight: 0.4, label: "장기 미국채" },
        { symbol: "IEF", weight: 0.15, label: "중기 미국채" },
        { symbol: "GLD", weight: 0.075, label: "금" },
        { symbol: "DBC", weight: 0.075, label: "원자재" },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "target_allocation",
      benchmark: "SPY",
    },
    isPublic: false,
    updatedAt: "2026-05-09T00:00:00.000Z",
  },
  {
    id: "strategy_golden_butterfly",
    name: "골든 버터플라이",
    description: "주식, 소형가치주, 장기채, 단기채, 금을 20%씩 나누는 안정 성장형 포트폴리오입니다.",
    market: "ETF",
    symbols: ["VTI", "VBR", "TLT", "SHY", "GLD"],
    timeframe: "1d",
    buyCondition: { operator: "AND", rules: [] },
    sellCondition: { operator: "AND", rules: [] },
    allocation: {
      rebalanceFrequency: "annual",
      weights: [
        { symbol: "VTI", weight: 0.2, label: "미국 전체 주식" },
        { symbol: "VBR", weight: 0.2, label: "미국 소형가치주" },
        { symbol: "TLT", weight: 0.2, label: "장기 미국채" },
        { symbol: "SHY", weight: 0.2, label: "단기 미국채" },
        { symbol: "GLD", weight: 0.2, label: "금" },
      ],
    },
    backtestOptions: {
      startDate: "2020-01-01",
      endDate: "2025-12-31",
      initialCapital: 10000000,
      feeRate: 0.00015,
      slippageRate: 0.0003,
      positionSizing: "target_allocation",
      benchmark: "SPY",
    },
    isPublic: false,
    updatedAt: "2026-05-09T00:00:00.000Z",
  },
];

const marketData = {
  SPY: generateMockPrices("SPY", 320, 0.00032, 0.012, "2020-01-01", "2025-12-31"),
  QQQ: generateMockPrices("QQQ", 210, 0.00045, 0.016, "2020-01-01", "2025-12-31"),
  "005930": generateMockPrices("005930", 56000, 0.00024, 0.018, "2020-01-01", "2025-12-31"),
  VTI: generateMockPrices("VTI", 180, 0.00028, 0.011, "2020-01-01", "2025-12-31"),
  VXUS: generateMockPrices("VXUS", 52, 0.00018, 0.012, "2020-01-01", "2025-12-31"),
  BND: generateMockPrices("BND", 82, 0.00008, 0.0035, "2020-01-01", "2025-12-31"),
  TLT: generateMockPrices("TLT", 135, 0.00007, 0.008, "2020-01-01", "2025-12-31"),
  IEF: generateMockPrices("IEF", 110, 0.00006, 0.0048, "2020-01-01", "2025-12-31"),
  SHY: generateMockPrices("SHY", 84, 0.000035, 0.0015, "2020-01-01", "2025-12-31"),
  GLD: generateMockPrices("GLD", 145, 0.00016, 0.010, "2020-01-01", "2025-12-31"),
  DBC: generateMockPrices("DBC", 15, 0.0001, 0.014, "2020-01-01", "2025-12-31"),
  VBR: generateMockPrices("VBR", 130, 0.0003, 0.014, "2020-01-01", "2025-12-31"),
};

const dbSymbols = [
  { symbol: "005930", name: "삼성전자", rows: 1554, startDate: "2020-01-02", endDate: "2026-05-07" },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "DBC", name: "Invesco DB Commodity Index Tracking Fund", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "GLD", name: "SPDR Gold Shares", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "IEF", name: "iShares 7-10 Year Treasury Bond ETF", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "SHY", name: "iShares 1-3 Year Treasury Bond ETF", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "VBR", name: "Vanguard Small-Cap Value ETF", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
  { symbol: "VXUS", name: "Vanguard Total International Stock ETF", rows: 1596, startDate: "2020-01-02", endDate: "2026-05-08" },
];

const templateStrategies = strategies
  .filter((strategy) => !strategy.allocation)
  .map((strategy) => clone(strategy));
const starterStrategyIds = new Set(["strategy_ma_cross", "strategy_rsi_rebound", "strategy_dual_momentum"]);
templateStrategies.forEach(applyPortfolioConditions);
strategies.forEach(applyPortfolioConditions);
strategies.splice(0, strategies.length, ...strategies.filter((strategy) => starterStrategyIds.has(strategy.id)));

const communityStrategies = [
  {
    riskType: "안정형",
    name: "저변동성 퀄리티",
    description: "MDD를 낮춘 장기 보유 전략",
    authorName: "SlowAlpha",
    likeCount: 128,
    forkCount: 24,
  },
  {
    riskType: "성장형",
    name: "나스닥 모멘텀",
    description: "추세 강도 기반 월간 교체",
    authorName: "ETFBuilder",
    likeCount: 96,
    forkCount: 18,
  },
  {
    riskType: "단기형",
    name: "RSI 반등 스윙",
    description: "과매도 구간 분할 진입",
    authorName: "QuantKim",
    likeCount: 74,
    forkCount: 11,
  },
];

const communityRanking = [
  { authorName: "QuantKim", returnRate: 0.314 },
  { authorName: "SlowAlpha", returnRate: 0.248 },
  { authorName: "ETFBuilder", returnRate: 0.192 },
];

const communityDiscussions = [
  "NVDA 실적 이후 모멘텀 조건 조정",
  "한국 ETF 데이터 소스 추천",
  "분할매수 옵션은 어느 기준이 좋을까요?",
];

const operandOptions = [
  { value: "price.close", label: "종가", operand: { type: "price", field: "close" } },
  { value: "indicator.SMA.20", label: "20일 SMA", operand: { type: "indicator", name: "SMA", params: { period: 20 } } },
  { value: "indicator.SMA.60", label: "60일 SMA", operand: { type: "indicator", name: "SMA", params: { period: 60 } } },
  { value: "indicator.SMA.120", label: "120일 SMA", operand: { type: "indicator", name: "SMA", params: { period: 120 } } },
  { value: "indicator.RSI.14", label: "14일 RSI", operand: { type: "indicator", name: "RSI", params: { period: 14 } } },
  { value: "number", label: "숫자 값", operand: { type: "number", value: 55 } },
];

let selectedStrategyId = strategies[0].id;
let latestRun = null;

const navButtons = document.querySelectorAll("[data-view], [data-view-target]");
const views = document.querySelectorAll(".view");

function showView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });

  window.location.hash = viewId;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function formatPercent(value, digits = 1) {
  if (!Number.isFinite(value)) return "-";
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(digits)}%`;
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(digits);
}

function parseMoney(value) {
  return Number(String(value).replace(/[^\d.-]/g, ""));
}

function parseRate(value) {
  const normalized = String(value).trim();
  const parsed = Number(normalized.replace("%", ""));
  return normalized.includes("%") ? parsed / 100 : parsed;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function rebalanceLabel(frequency) {
  if (frequency === "annual") return "연 1회 리밸런싱일";
  if (frequency === "quarterly") return "분기 리밸런싱일";
  return "리밸런싱일";
}

function portfolioRuleSet(strategy) {
  const frequencyLabel = rebalanceLabel(strategy.allocation.rebalanceFrequency);
  return {
    buyCondition: {
      operator: "AND",
      rules: [
        {
          id: `${strategy.id}_buy_rebalance_day`,
          left: { type: "event", label: frequencyLabel },
          comparator: "==",
          right: { type: "state", label: "도래" },
        },
        {
          id: `${strategy.id}_buy_underweight`,
          left: { type: "portfolio", label: "자산별 현재 비중" },
          comparator: "<",
          right: { type: "portfolio", label: "목표 비중" },
        },
      ],
    },
    sellCondition: {
      operator: "AND",
      rules: [
        {
          id: `${strategy.id}_sell_rebalance_day`,
          left: { type: "event", label: frequencyLabel },
          comparator: "==",
          right: { type: "state", label: "도래" },
        },
        {
          id: `${strategy.id}_sell_overweight`,
          left: { type: "portfolio", label: "자산별 현재 비중" },
          comparator: ">",
          right: { type: "portfolio", label: "목표 비중" },
        },
      ],
    },
  };
}

function applyPortfolioConditions(strategy) {
  if (!strategy.allocation) return strategy;
  if (strategy.buyCondition.rules.length || strategy.sellCondition.rules.length) {
    strategy.buyCondition.rules.forEach((rule) => {
      delete rule.locked;
    });
    strategy.sellCondition.rules.forEach((rule) => {
      delete rule.locked;
    });
    return strategy;
  }
  const conditions = portfolioRuleSet(strategy);
  strategy.buyCondition = conditions.buyCondition;
  strategy.sellCondition = conditions.sellCondition;
  return strategy;
}

function seededNoise(index, symbol) {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const raw = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function generateMockPrices(symbol, startPrice, drift, volatility, startDate, endDate) {
  const rows = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  let close = startPrice;
  let index = 0;

  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const wave = Math.sin(index / 42) * volatility * 0.18;
      const noise = (seededNoise(index, symbol) - 0.5) * volatility * 0.72;
      close = Math.max(1, close * (1 + drift + wave + noise));
      const open = close * (1 + (seededNoise(index + 3, symbol) - 0.5) * 0.006);
      const high = Math.max(open, close) * (1 + Math.abs(seededNoise(index + 5, symbol)) * 0.01);
      const low = Math.min(open, close) * (1 - Math.abs(seededNoise(index + 8, symbol)) * 0.01);

      rows.push({
        symbol,
        date: cursor.toISOString().slice(0, 10),
        open,
        high,
        low,
        close,
        volume: Math.round(1000000 + Math.abs(seededNoise(index + 13, symbol)) * 9000000),
        source: "mock",
      });
      index += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return rows;
}

function getSelectedStrategy() {
  return strategies.find((strategy) => strategy.id === selectedStrategyId) || strategies[0];
}

function loadSavedStrategies() {
  try {
    const saved = JSON.parse(localStorage.getItem("gumtoosa.strategies") || "[]");
    saved.forEach((savedStrategy) => {
      const index = strategies.findIndex((strategy) => strategy.id === savedStrategy.id);
      if (index >= 0) strategies[index] = savedStrategy;
      else strategies.push(savedStrategy);
    });
  } catch {
    try {
      localStorage.removeItem("gumtoosa.strategies");
    } catch {
      // Some browser privacy modes block storage access.
    }
  }
}

function persistStrategies() {
  const saved = strategies.filter((strategy) => strategy.updatedAt);
  localStorage.setItem("gumtoosa.strategies", JSON.stringify(saved));
}

function operandLabel(operand) {
  if (operand.label) return operand.label;
  if (operand.type === "indicator") {
    const period = operand.params?.period ? `${operand.params.period}일 ` : "";
    return `${period}${operand.name}`;
  }
  if (operand.type === "number") return String(operand.value);
  if (operand.type === "price") return operand.field === "close" ? "종가" : operand.field;
  return "-";
}

function renderRule(rule) {
  return `
    <div class="rule-chip" data-rule-id="${rule.id}">
      <span>${operandLabel(rule.left)}</span>
      <b>${rule.comparator}</b>
      <span>${operandLabel(rule.right)}</span>
      <button class="remove-rule" type="button" data-remove-rule="${rule.id}" title="조건 삭제" aria-label="조건 삭제">×</button>
    </div>
  `;
}

function renderAllocation(strategy) {
  if (!strategy.allocation) return "";
  return `
    <div class="allocation-list">
      ${strategy.allocation.weights
        .map((item) => `
          <div class="allocation-row">
            <span>${item.label}</span>
            <b>${item.symbol}</b>
            <em>${formatPercent(item.weight, item.weight * 100 % 1 ? 1 : 0).replace("+", "")}</em>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function bindRuleRemoveButtons() {
  document.querySelectorAll("[data-remove-rule]").forEach((button) => {
    button.addEventListener("click", () => {
      const strategy = getSelectedStrategy();
      const ruleId = button.dataset.removeRule;
      strategy.buyCondition.rules = strategy.buyCondition.rules.filter((rule) => rule.id !== ruleId);
      strategy.sellCondition.rules = strategy.sellCondition.rules.filter((rule) => rule.id !== ruleId);
      renderStrategy(strategy);
      showValidation(["조건을 삭제했습니다. 실행을 눌러 결과를 갱신하세요."], "warning");
    });
  });
}

function renderStrategy(strategy) {
  selectedStrategyId = strategy.id;
  document.querySelector("#strategy-name").value = strategy.name;
  document.querySelector("#backtest-title").textContent = `${strategy.name} 결과`;
  document.querySelector('[data-rule-list="buy"]').innerHTML = strategy.allocation
    ? `${renderAllocation(strategy)}${strategy.buyCondition.rules.map(renderRule).join("")}`
    : strategy.buyCondition.rules.map(renderRule).join("");
  document.querySelector('[data-rule-list="sell"]').innerHTML = strategy.sellCondition.rules.map(renderRule).join("");
  document.querySelector('[data-condition-operator="buy"]').value = `${strategy.buyCondition.operator} 조건`;
  document.querySelector('[data-condition-operator="sell"]').value = `${strategy.sellCondition.operator} 조건`;
  document.querySelector('[data-option="market"]').value = strategy.market;
  document.querySelector('[data-option="symbols"]').value = strategy.allocation
    ? strategy.allocation.weights.map((item) => item.symbol).join(", ")
    : strategy.symbols.join(", ");
  document.querySelector('[data-option="startDate"]').value = strategy.backtestOptions.startDate;
  document.querySelector('[data-option="endDate"]').value = strategy.backtestOptions.endDate;
  document.querySelector('[data-option="initialCapital"]').value = strategy.backtestOptions.initialCapital.toLocaleString("ko-KR");
  document.querySelector('[data-option="feeRate"]').value = `${strategy.backtestOptions.feeRate * 100}%`;
  document.querySelector('[data-option="slippageRate"]').value = `${strategy.backtestOptions.slippageRate * 100}%`;
  document.querySelector('[data-option="benchmark"]').value = strategy.backtestOptions.benchmark;
  bindRuleRemoveButtons();
  clearValidation();
}

function renderStrategyList() {
  const list = document.querySelector(".strategy-list");
  list.innerHTML = strategies
    .map(
      (strategy) => `
        <button class="strategy-item ${strategy.id === selectedStrategyId ? "active" : ""}" data-strategy-id="${strategy.id}">
          <span>${strategy.name}</span>
          <small>${strategy.updatedAt ? "저장됨" : "샘플"}</small>
        </button>
      `,
    )
    .join("");

  list.querySelectorAll(".strategy-item").forEach((item) => {
    item.addEventListener("click", () => {
      const strategy = strategies.find((candidate) => candidate.id === item.dataset.strategyId) || strategies[0];
      selectedStrategyId = strategy.id;
      renderStrategyList();
      renderStrategy(strategy);
    });
  });
}

function templateMeta(strategy) {
  if (!strategy.allocation) return strategy.description;
  const weights = strategy.allocation.weights
    .map((item) => `${item.symbol} ${(item.weight * 100).toFixed(item.weight * 100 % 1 ? 1 : 0)}%`)
    .join(" · ");
  const rebalance = strategy.allocation.rebalanceFrequency === "annual" ? "연 1회" : "분기";
  return `${weights} · ${rebalance} 리밸런싱`;
}

function renderTemplateList() {
  document.querySelector("#template-list").innerHTML = templateStrategies
    .map((strategy) => `
      <article class="template-row">
        <div>
          <span class="card-kicker">${strategy.allocation ? "안정형 포트폴리오" : "기술적 전략"}</span>
          <h3>${strategy.name}</h3>
          <p>${templateMeta(strategy)}</p>
        </div>
        <button class="secondary-action small" data-template-id="${strategy.id}">적용</button>
      </article>
    `)
    .join("");

  document.querySelectorAll("[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => applyTemplate(button.dataset.templateId));
  });
}

function renderOperandControls() {
  const options = operandOptions
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
  document.querySelector("#rule-left").innerHTML = options;
  document.querySelector("#rule-right").innerHTML = options;
  document.querySelector("#rule-left").value = "indicator.SMA.20";
  document.querySelector("#rule-right").value = "indicator.SMA.60";
}

function renderDbSymbols() {
  const container = document.querySelector("#db-symbol-chips");
  if (!container) return;

  container.innerHTML = dbSymbols
    .map(
      (item) => `
        <button class="symbol-chip" type="button" data-symbol="${item.symbol}" title="${item.name} · ${item.rows.toLocaleString("ko-KR")} rows · ${item.startDate}~${item.endDate}">
          <b>${item.symbol}</b>
          <span>${item.name}</span>
        </button>
      `,
    )
    .join("");

  container.querySelectorAll("[data-symbol]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector('[data-option="symbols"]').value = button.dataset.symbol;
    });
  });
}

function operandFromControl(value) {
  const option = operandOptions.find((candidate) => candidate.value === value) || operandOptions[0];
  const operand = clone(option.operand);
  if (value === "number") {
    operand.value = Number(document.querySelector("#rule-number").value);
  }
  return operand;
}

function addRuleFromComposer() {
  const strategy = getSelectedStrategy();
  if (strategy.allocation) {
    showValidation(["포트폴리오 템플릿은 조건 추가 대신 목표 비중으로 백테스트합니다."], "warning");
    return;
  }
  const target = document.querySelector("#rule-target").value;
  const rightValue = document.querySelector("#rule-right").value;
  const rightOperand = operandFromControl(rightValue);

  if (rightValue === "number" && !Number.isFinite(rightOperand.value)) {
    showValidation(["숫자 값은 유효한 숫자여야 합니다."], "error");
    return;
  }

  const rule = {
    id: `${target}_${Date.now()}`,
    left: operandFromControl(document.querySelector("#rule-left").value),
    comparator: document.querySelector("#rule-comparator").value,
    right: rightOperand,
  };
  const group = target === "buy" ? strategy.buyCondition : strategy.sellCondition;
  const signature = JSON.stringify([rule.left, rule.comparator, rule.right]);
  const duplicated = group.rules.some((existingRule) => JSON.stringify([existingRule.left, existingRule.comparator, existingRule.right]) === signature);

  if (duplicated) {
    showValidation(["같은 조건이 이미 있습니다."], "error");
    return;
  }

  group.rules.push(rule);
  renderStrategy(strategy);
  showValidation(["조건을 추가했습니다. 실행을 눌러 결과를 갱신하세요."], "warning");
}

function createNewStrategy() {
  const base = clone(templateStrategies[0]);
  base.id = `strategy_custom_${Date.now()}`;
  base.name = `새 전략 ${strategies.length + 1}`;
  base.description = "사용자가 직접 만든 전략입니다.";
  base.buyCondition.rules = [];
  base.sellCondition.rules = [];
  base.updatedAt = new Date().toISOString();
  strategies.push(base);
  selectedStrategyId = base.id;
  renderStrategyList();
  renderStrategy(base);
  showValidation(["새 전략을 만들었습니다. 조건을 추가한 뒤 실행해 주세요."], "warning");
}

function applyTemplate(templateId) {
  const template = templateStrategies.find((strategy) => strategy.id === templateId);
  const strategy = getSelectedStrategy();
  if (!template) return;

  strategy.name = template.name;
  strategy.description = template.description;
  strategy.market = template.market;
  strategy.symbols = [...template.symbols];
  strategy.buyCondition = clone(template.buyCondition);
  strategy.sellCondition = clone(template.sellCondition);
  if (template.allocation) {
    strategy.allocation = clone(template.allocation);
    applyPortfolioConditions(strategy);
  } else {
    delete strategy.allocation;
  }
  strategy.backtestOptions = clone(template.backtestOptions);
  strategy.updatedAt = new Date().toISOString();
  renderStrategyList();
  renderStrategy(strategy);
  showValidation([`${template.name} 템플릿을 현재 전략에 적용했습니다.`], "warning");
}

function readOptions() {
  return {
    market: document.querySelector('[data-option="market"]').value,
    symbols: document
      .querySelector('[data-option="symbols"]')
      .value.split(",")
      .map((symbol) => symbol.trim())
      .filter(Boolean),
    startDate: document.querySelector('[data-option="startDate"]').value,
    endDate: document.querySelector('[data-option="endDate"]').value,
    initialCapital: parseMoney(document.querySelector('[data-option="initialCapital"]').value),
    feeRate: parseRate(document.querySelector('[data-option="feeRate"]').value),
    slippageRate: parseRate(document.querySelector('[data-option="slippageRate"]').value),
    positionSizing: "all_in",
    benchmark: document.querySelector('[data-option="benchmark"]').value.trim(),
  };
}

function validateStrategy(strategy, options) {
  const errors = [];
  const warnings = [];
  const ruleIds = new Set();
  const isPortfolio = Boolean(strategy.allocation);

  if (!isPortfolio && !strategy.buyCondition.rules.length) errors.push("매수 조건을 1개 이상 추가해야 합니다.");
  if (!isPortfolio && !strategy.sellCondition.rules.length) errors.push("매도 조건을 1개 이상 추가해야 합니다.");
  if (isPortfolio) {
    const totalWeight = strategy.allocation.weights.reduce((sum, item) => sum + item.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.001) errors.push("포트폴리오 비중 합계는 100%여야 합니다.");
    strategy.allocation.weights.forEach((item) => {
      if (!marketData[item.symbol]) errors.push(`${item.symbol} 목업 데이터가 없습니다.`);
    });
  }

  [...strategy.buyCondition.rules, ...strategy.sellCondition.rules].forEach((rule) => {
    const signature = JSON.stringify([rule.left, rule.comparator, rule.right]);
    if (ruleIds.has(signature)) errors.push("동일한 조건이 중복되어 있습니다.");
    ruleIds.add(signature);
  });

  if (!options.symbols.length) errors.push("백테스트할 종목을 입력해야 합니다.");
  if (!isPortfolio && !marketData[options.symbols[0]]) errors.push(`${options.symbols[0] || "입력 종목"} 목업 데이터가 없습니다.`);
  if (options.benchmark && !marketData[options.benchmark]) warnings.push(`${options.benchmark} 벤치마크 데이터가 없어 비교를 생략합니다.`);
  if (!options.startDate || !options.endDate || options.startDate >= options.endDate) {
    errors.push("시작일은 종료일보다 앞서야 합니다.");
  }
  if (!Number.isFinite(options.initialCapital) || options.initialCapital <= 0) {
    errors.push("초기 자본은 0보다 커야 합니다.");
  }

  const periodDays = (new Date(options.endDate) - new Date(options.startDate)) / 86400000;
  if (periodDays < 180) warnings.push("테스트 기간이 6개월보다 짧아 결과 신뢰도가 낮을 수 있습니다.");
  if (!isPortfolio && marketData[options.symbols[0]]) {
    const rows = marketData[options.symbols[0]].filter((row) => row.date >= options.startDate && row.date <= options.endDate);
    if (rows.length < 60) errors.push("선택한 기간에 백테스트할 데이터가 부족합니다.");
  }

  return { errors, warnings };
}

function showValidation(messages, type = "error") {
  const panel = document.querySelector("#validation-panel");
  panel.className = `validation-panel ${type}`;
  panel.innerHTML = messages.map((message) => `<p>${message}</p>`).join("");
}

function clearValidation() {
  const panel = document.querySelector("#validation-panel");
  panel.className = "validation-panel";
  panel.innerHTML = "";
}

function sma(values, index, period) {
  if (index + 1 < period) return null;
  let sum = 0;
  for (let i = index - period + 1; i <= index; i += 1) sum += values[i];
  return sum / period;
}

function rsi(values, index, period) {
  if (index < period) return null;
  let gains = 0;
  let losses = 0;

  for (let i = index - period + 1; i <= index; i += 1) {
    const change = values[i] - values[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  if (losses === 0) return 100;
  const relativeStrength = gains / losses;
  return 100 - 100 / (1 + relativeStrength);
}

function operandValue(operand, row, closes, index) {
  if (operand.type === "number") return operand.value;
  if (operand.type === "price") return row[operand.field];
  if (operand.type === "indicator" && operand.name === "SMA") {
    return sma(closes, index, operand.params.period);
  }
  if (operand.type === "indicator" && operand.name === "RSI") {
    return rsi(closes, index, operand.params.period);
  }
  return null;
}

function compare(left, comparator, right) {
  if (left === null || right === null || !Number.isFinite(left) || !Number.isFinite(right)) return false;
  if (comparator === ">") return left > right;
  if (comparator === ">=") return left >= right;
  if (comparator === "<") return left < right;
  if (comparator === "<=") return left <= right;
  if (comparator === "==") return left === right;
  return false;
}

function evaluateGroup(group, row, closes, index) {
  const evaluations = group.rules.map((rule) =>
    compare(
      operandValue(rule.left, row, closes, index),
      rule.comparator,
      operandValue(rule.right, row, closes, index),
    ),
  );
  return group.operator === "OR" ? evaluations.some(Boolean) : evaluations.every(Boolean);
}

function maxDrawdown(equitySeries) {
  let peak = equitySeries[0]?.value || 0;
  let mdd = 0;
  return equitySeries.map((point) => {
    peak = Math.max(peak, point.value);
    const drawdown = peak ? point.value / peak - 1 : 0;
    mdd = Math.min(mdd, drawdown);
    return { date: point.date, value: drawdown, mdd };
  });
}

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function buildMonthlyReturns(equitySeries) {
  const monthly = new Map();
  equitySeries.forEach((point) => {
    const key = point.date.slice(0, 7);
    if (!monthly.has(key)) monthly.set(key, { start: point.value, end: point.value });
    monthly.get(key).end = point.value;
  });
  return Array.from(monthly, ([month, item]) => ({
    month,
    returnRate: item.start ? item.end / item.start - 1 : 0,
  })).slice(-12);
}

function buildBenchmarkSeries(symbol, options, strategyRows) {
  const source = marketData[symbol];
  if (!source) return [];
  const rows = source.filter((row) => row.date >= options.startDate && row.date <= options.endDate);
  if (rows.length < 2) return [];

  const firstClose = rows[0].close;
  const valuesByDate = new Map(
    rows.map((row) => [row.date, options.initialCapital * (row.close / firstClose)]),
  );

  return strategyRows.map((row) => ({
    date: row.date,
    value: valuesByDate.get(row.date) ?? null,
  })).filter((point) => point.value !== null);
}

function shouldRebalance(date, previousDate, frequency) {
  if (!previousDate) return true;
  if (frequency === "annual") return date.slice(0, 4) !== previousDate.slice(0, 4);
  if (frequency === "quarterly") {
    const currentQuarter = Math.floor((Number(date.slice(5, 7)) - 1) / 3);
    const previousQuarter = Math.floor((Number(previousDate.slice(5, 7)) - 1) / 3);
    return date.slice(0, 4) !== previousDate.slice(0, 4) || currentQuarter !== previousQuarter;
  }
  return false;
}

function backtestPortfolio(strategy, options) {
  const weights = strategy.allocation.weights;
  const primaryRows = marketData[weights[0].symbol].filter((row) => row.date >= options.startDate && row.date <= options.endDate);
  const priceMaps = new Map(
    weights.map((item) => [
      item.symbol,
      new Map(marketData[item.symbol].map((row) => [row.date, row.close])),
    ]),
  );
  const rows = primaryRows.filter((row) => weights.every((item) => priceMaps.get(item.symbol).has(row.date)));
  const holdings = new Map(weights.map((item) => [item.symbol, 0]));
  const equity = [];
  const trades = [];
  const warnings = ["목업 포트폴리오 데이터로 실행되었습니다."];
  let cash = options.initialCapital;
  let previousDate = null;

  rows.forEach((row) => {
    const totalValue = cash + weights.reduce((sum, item) => {
      return sum + holdings.get(item.symbol) * priceMaps.get(item.symbol).get(row.date);
    }, 0);

    if (shouldRebalance(row.date, previousDate, strategy.allocation.rebalanceFrequency)) {
      weights.forEach((item) => {
        const price = priceMaps.get(item.symbol).get(row.date);
        const targetValue = totalValue * item.weight;
        const currentValue = holdings.get(item.symbol) * price;
        const tradeValue = Math.abs(targetValue - currentValue);
        const fee = tradeValue * (options.feeRate + options.slippageRate);
        holdings.set(item.symbol, Math.max(0, (targetValue - fee) / price));
        trades.push({
          symbol: item.symbol,
          entryDate: row.date,
          entryPrice: price,
          exitDate: row.date,
          exitPrice: price,
          returnRate: 0,
          holdingDays: 0,
          type: "rebalance",
        });
      });
      cash = 0;
      previousDate = row.date;
    }

    equity.push({
      date: row.date,
      value: weights.reduce((sum, item) => sum + holdings.get(item.symbol) * priceMaps.get(item.symbol).get(row.date), cash),
    });
  });

  const finalValue = equity[equity.length - 1]?.value || options.initialCapital;
  const dailyReturns = equity.slice(1).map((point, index) => point.value / equity[index].value - 1);
  const years = Math.max(1 / 365, (new Date(options.endDate) - new Date(options.startDate)) / 86400000 / 365.25);
  const drawdown = maxDrawdown(equity);
  const volatility = standardDeviation(dailyReturns) * Math.sqrt(252);
  const meanDailyReturn = dailyReturns.reduce((sum, value) => sum + value, 0) / Math.max(1, dailyReturns.length);
  const sharpe = volatility ? (meanDailyReturn * 252) / volatility : 0;
  const benchmarkSeries = buildBenchmarkSeries(options.benchmark, options, rows);
  const benchmarkReturn = benchmarkSeries.length
    ? benchmarkSeries[benchmarkSeries.length - 1].value / options.initialCapital - 1
    : null;

  if (!benchmarkSeries.length) warnings.push("벤치마크 비교 데이터를 만들 수 없습니다.");

  return {
    runId: `run_${Date.now()}`,
    strategyId: strategy.id,
    status: "success",
    dataMode: "mock",
    dataSource: "sample-portfolio-dataset",
    summary: {
      totalReturn: finalValue / options.initialCapital - 1,
      cagr: (finalValue / options.initialCapital) ** (1 / years) - 1,
      mdd: Math.min(...drawdown.map((point) => point.value)),
      sharpe,
      volatility,
      winRate: 0,
      tradeCount: trades.length,
      averageTradeReturn: 0,
      benchmarkReturn,
    },
    series: {
      equity,
      drawdown,
      benchmark: benchmarkSeries,
    },
    monthlyReturns: buildMonthlyReturns(equity),
    trades,
    warnings,
  };
}

function backtest(strategy, options) {
  if (strategy.allocation) return backtestPortfolio(strategy, options);

  const symbol = options.symbols[0];
  const rows = marketData[symbol].filter((row) => row.date >= options.startDate && row.date <= options.endDate);
  const closes = rows.map((row) => row.close);
  const warnings = ["목업 데이터로 실행되었습니다."];
  let cash = options.initialCapital;
  let shares = 0;
  let entry = null;
  const equity = [];
  const trades = [];

  rows.forEach((row, index) => {
    const sellSignal = shares > 0 && evaluateGroup(strategy.sellCondition, row, closes, index);
    const buySignal = shares === 0 && evaluateGroup(strategy.buyCondition, row, closes, index);
    const tradingCost = options.feeRate + options.slippageRate;

    if (sellSignal) {
      const exitPrice = row.close * (1 - tradingCost);
      cash = shares * exitPrice;
      trades.push({
        symbol,
        entryDate: entry.date,
        entryPrice: entry.price,
        exitDate: row.date,
        exitPrice,
        returnRate: exitPrice / entry.price - 1,
        holdingDays: Math.max(1, Math.round((new Date(row.date) - new Date(entry.date)) / 86400000)),
      });
      shares = 0;
      entry = null;
    } else if (buySignal) {
      const entryPrice = row.close * (1 + tradingCost);
      shares = cash / entryPrice;
      cash = 0;
      entry = { date: row.date, price: entryPrice };
    }

    equity.push({
      date: row.date,
      value: shares > 0 ? shares * row.close : cash,
    });
  });

  if (shares > 0) {
    const last = rows[rows.length - 1];
    const exitPrice = last.close * (1 - options.feeRate - options.slippageRate);
    cash = shares * exitPrice;
    trades.push({
      symbol,
      entryDate: entry.date,
      entryPrice: entry.price,
      exitDate: last.date,
      exitPrice,
      returnRate: exitPrice / entry.price - 1,
      holdingDays: Math.max(1, Math.round((new Date(last.date) - new Date(entry.date)) / 86400000)),
    });
    equity[equity.length - 1].value = cash;
  }

  const finalValue = equity[equity.length - 1]?.value || options.initialCapital;
  const dailyReturns = equity.slice(1).map((point, index) => point.value / equity[index].value - 1);
  const years = Math.max(1 / 365, (new Date(options.endDate) - new Date(options.startDate)) / 86400000 / 365.25);
  const drawdown = maxDrawdown(equity);
  const volatility = standardDeviation(dailyReturns) * Math.sqrt(252);
  const meanDailyReturn = dailyReturns.reduce((sum, value) => sum + value, 0) / Math.max(1, dailyReturns.length);
  const sharpe = volatility ? (meanDailyReturn * 252) / volatility : 0;
  const wins = trades.filter((trade) => trade.returnRate > 0).length;
  const averageTradeReturn = trades.reduce((sum, trade) => sum + trade.returnRate, 0) / Math.max(1, trades.length);

  if (trades.length < 5) warnings.push("거래 횟수가 5회 미만입니다.");
  if (Math.min(...drawdown.map((point) => point.value)) < -0.3) warnings.push("MDD가 30%보다 큽니다.");
  const benchmarkSeries = buildBenchmarkSeries(options.benchmark, options, rows);
  const benchmarkReturn = benchmarkSeries.length
    ? benchmarkSeries[benchmarkSeries.length - 1].value / options.initialCapital - 1
    : null;
  if (!benchmarkSeries.length) warnings.push("벤치마크 비교 데이터를 만들 수 없습니다.");

  return {
    runId: `run_${Date.now()}`,
    strategyId: strategy.id,
    status: "success",
    dataMode: "mock",
    dataSource: "sample-dataset",
    summary: {
      totalReturn: finalValue / options.initialCapital - 1,
      cagr: (finalValue / options.initialCapital) ** (1 / years) - 1,
      mdd: Math.min(...drawdown.map((point) => point.value)),
      sharpe,
      volatility,
      winRate: trades.length ? wins / trades.length : 0,
      tradeCount: trades.length,
      averageTradeReturn,
      benchmarkReturn,
    },
    series: {
      equity,
      drawdown,
      benchmark: benchmarkSeries,
    },
    monthlyReturns: buildMonthlyReturns(equity),
    trades,
    warnings,
  };
}

function renderMetric(selector, value, className) {
  const node = document.querySelector(selector);
  node.textContent = value;
  node.className = className || "";
}

function chartPoints(series, min, max) {
  if (!series.length) return "";
  return series
    .filter((_, index) => index % Math.ceil(series.length / 80) === 0 || index === series.length - 1)
    .map((point, index, sampled) => {
      const x = sampled.length === 1 ? 0 : (index / (sampled.length - 1)) * 100;
      const y = max === min ? 50 : 92 - ((point.value - min) / (max - min)) * 78;
      return `${x},${y}`;
    })
    .join(" ");
}

function renderEquityChart(series, benchmarkSeries = []) {
  const chart = document.querySelector("#equity-chart");
  if (!series.length) return;
  const allValues = [...series, ...benchmarkSeries].map((point) => point.value);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const points = chartPoints(series, min, max);
  const benchmarkPoints = chartPoints(benchmarkSeries, min, max);

  chart.classList.add("has-data");
  chart.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${benchmarkPoints ? `<polyline class="benchmark-line" points="${benchmarkPoints}" />` : ""}
      <polyline class="strategy-line" points="${points}" />
    </svg>
    <div class="chart-legend"><span>전략</span>${benchmarkPoints ? "<span>벤치마크</span>" : ""}</div>
  `;
}

function renderDistribution(trades) {
  const container = document.querySelector("#return-distribution");
  const buckets = [-0.08, -0.03, 0, 0.03, 0.08];
  const counts = buckets.map((limit, index) =>
    trades.filter((trade) => {
      const previous = buckets[index - 1] ?? -Infinity;
      return trade.returnRate > previous && trade.returnRate <= limit;
    }).length,
  );
  const maxCount = Math.max(1, ...counts);
  container.innerHTML = counts
    .map((count) => `<span style="height: ${Math.max(12, (count / maxCount) * 100)}%"></span>`)
    .join("");
}

function renderMonthlyReturns(monthlyReturns) {
  const container = document.querySelector("#monthly-returns");
  container.innerHTML = monthlyReturns
    .map((item) => {
      let className = "flat";
      if (item.returnRate > 0.04) className = "gain high";
      else if (item.returnRate > 0) className = "gain";
      else if (item.returnRate < -0.04) className = "loss high";
      else if (item.returnRate < 0) className = "loss";
      return `<span class="${className}" title="${item.month} ${formatPercent(item.returnRate)}"></span>`;
    })
    .join("");
}

function renderTrades(trades) {
  const tbody = document.querySelector("#trade-log");
  const rows = trades.slice(-6).reverse();
  tbody.innerHTML = rows.length
    ? rows
        .map(
          (trade) => `
            <tr>
              <td>${trade.symbol}</td>
              <td>${trade.entryDate}</td>
              <td class="${trade.returnRate >= 0 ? "up" : "down"}">${formatPercent(trade.returnRate)}</td>
            </tr>
          `,
        )
        .join("")
    : '<tr><td colspan="3">조건에 맞는 거래가 없습니다.</td></tr>';
}

function renderResult(result) {
  const summary = result.summary;
  renderMetric('[data-metric="totalReturn"]', formatPercent(summary.totalReturn), summary.totalReturn >= 0 ? "up" : "down");
  renderMetric('[data-metric="cagr"]', formatPercent(summary.cagr), summary.cagr >= 0 ? "up" : "down");
  renderMetric('[data-metric="mdd"]', formatPercent(summary.mdd), "down");
  renderMetric('[data-metric="sharpe"]', formatNumber(summary.sharpe), summary.sharpe >= 1 ? "up" : "");
  document.querySelector('[data-metric-note="totalReturn"]').textContent =
    Number.isFinite(summary.benchmarkReturn) ? `벤치마크 ${formatPercent(summary.benchmarkReturn)}` : "목업 데이터";
  document.querySelector('[data-metric-note="cagr"]').textContent = "연평균";
  document.querySelector('[data-metric-note="mdd"]').textContent = summary.mdd < -0.3 ? "고위험" : "주의";
  document.querySelector('[data-metric-note="sharpe"]').textContent = summary.sharpe >= 1 ? "양호" : "검토";

  document.querySelector('[data-summary="tradeCount"]').textContent = `${summary.tradeCount}회`;
  document.querySelector('[data-summary="winRate"]').textContent = formatPercent(summary.winRate);
  document.querySelector('[data-summary="averageTradeReturn"]').textContent = formatPercent(summary.averageTradeReturn);
  document.querySelector('[data-summary="volatility"]').textContent = formatPercent(summary.volatility);

  document.querySelector("#result-meta").innerHTML = `
    데이터: ${result.dataMode} / ${result.dataSource} · 수수료와 슬리피지 적용 ·
    백테스트 결과는 투자 조언이 아니며 과거 성과가 미래 수익을 보장하지 않습니다.
    ${result.warnings.length ? `<strong>${result.warnings.join(" ")}</strong>` : ""}
  `;

  renderEquityChart(result.series.equity, result.series.benchmark);
  renderDistribution(result.trades);
  renderMonthlyReturns(result.monthlyReturns);
  renderTrades(result.trades);
}

async function runBacktest() {
  const strategy = getSelectedStrategy();
  const options = readOptions();
  const button = document.querySelector("#run-backtest");
  strategy.market = options.market;
  strategy.symbols = options.symbols;
  strategy.backtestOptions = { ...strategy.backtestOptions, ...options };

  const validation = validateStrategy(strategy, options);
  if (validation.errors.length) {
    showValidation(validation.errors, "error");
    return;
  }
  if (validation.warnings.length) showValidation(validation.warnings, "warning");
  else clearValidation();

  button.disabled = true;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = "실행 중";

  try {
    latestRun = await gumtoosaApi.runBacktest(strategy, options);
    renderResult(latestRun);
  } catch (error) {
    showValidation([error.message || "백테스트 실행 중 오류가 발생했습니다."], "error");
    return;
  } finally {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
  }

  document.querySelector(".results-panel").animate(
    [
      { transform: "translateY(8px)", opacity: 0.7 },
      { transform: "translateY(0)", opacity: 1 },
    ],
    { duration: 260, easing: "ease-out" },
  );
}

function saveCurrentStrategy() {
  const strategy = getSelectedStrategy();
  const options = readOptions();
  const name = document.querySelector("#strategy-name").value.trim();

  if (!name) {
    showValidation(["전략 이름을 입력해야 저장할 수 있습니다."], "error");
    return;
  }

  strategy.name = name;
  strategy.market = options.market;
  strategy.symbols = options.symbols;
  strategy.backtestOptions = { ...strategy.backtestOptions, ...options };
  strategy.updatedAt = new Date().toISOString();
  try {
    persistStrategies();
  } catch {
    showValidation(["브라우저 저장소 접근이 제한되어 전략을 저장하지 못했습니다."], "error");
    return;
  }
  renderStrategyList();
  showValidation([`${strategy.name} 전략을 로컬 저장소에 저장했습니다.`], "warning");
}

async function shareLatestResult() {
  if (!latestRun) {
    showValidation(["공유할 백테스트 결과가 없습니다. 먼저 실행해 주세요."], "error");
    return;
  }

  const strategy = getSelectedStrategy();
  const summary = latestRun.summary;
  const shareText = [
    `[검투사] ${strategy.name} 백테스트 결과`,
    `총수익률: ${formatPercent(summary.totalReturn)}`,
    `CAGR: ${formatPercent(summary.cagr)}`,
    `MDD: ${formatPercent(summary.mdd)}`,
    `Sharpe: ${formatNumber(summary.sharpe)}`,
    `거래 횟수: ${summary.tradeCount}회`,
    "백테스트 결과는 투자 조언이 아니며 과거 성과가 미래 수익을 보장하지 않습니다.",
  ].join("\n");

  try {
    await navigator.clipboard.writeText(shareText);
    document.querySelector("#result-meta").innerHTML = "결과 요약을 클립보드에 복사했습니다.";
  } catch {
    document.querySelector("#result-meta").innerHTML = `<strong>클립보드 복사가 제한되어 공유 문구를 표시합니다.</strong><br>${shareText.replace(/\n/g, "<br>")}`;
  }
}

function renderCommunity() {
  document.querySelector("#community-strategies").innerHTML = communityStrategies
    .map(
      (strategy) => `
        <article>
          <span>${strategy.riskType}</span>
          <h3>${strategy.name}</h3>
          <p>${strategy.description}</p>
          <p class="community-meta">${strategy.authorName} · 좋아요 ${strategy.likeCount} · 복제 ${strategy.forkCount}</p>
        </article>
      `,
    )
    .join("");

  document.querySelector("#community-ranking").innerHTML = communityRanking
    .map((rank) => `<li><span>${rank.authorName}</span><b>${formatPercent(rank.returnRate)}</b></li>`)
    .join("");

  document.querySelector("#community-discussions").innerHTML = communityDiscussions
    .map((discussion) => `<button type="button">${discussion}</button>`)
    .join("");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view || button.dataset.viewTarget);
  });
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((button) => {
      button.classList.toggle("active", button === tab);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === target);
    });
  });
});

document.querySelectorAll("[data-condition-operator]").forEach((select) => {
  select.addEventListener("change", () => {
    const strategy = getSelectedStrategy();
    const target = select.dataset.conditionOperator === "buy" ? strategy.buyCondition : strategy.sellCondition;
    target.operator = select.value.startsWith("OR") ? "OR" : "AND";
  });
});

document.querySelector("#toggle-builder").addEventListener("click", () => {
  document.querySelector(".builder-sidebar").classList.toggle("collapsed");
  document.querySelector(".workspace").classList.toggle("builder-collapsed");
});

document.querySelector("#add-strategy").addEventListener("click", createNewStrategy);
document.querySelector("#add-rule").addEventListener("click", addRuleFromComposer);
document.querySelector("#run-backtest").addEventListener("click", runBacktest);
document.querySelector("#save-strategy").addEventListener("click", saveCurrentStrategy);
document.querySelector("#share-result").addEventListener("click", shareLatestResult);

loadSavedStrategies();
renderOperandControls();
renderDbSymbols();
renderStrategyList();
renderTemplateList();
renderCommunity();
renderStrategy(strategies[0]);
runBacktest();

const initialView = window.location.hash.replace("#", "");
if (["home", "backtest", "community"].includes(initialView)) {
  showView(initialView);
}
