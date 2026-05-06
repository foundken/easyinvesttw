const WATCH_KEY = "plain-stock-dashboard-watchlist-v1";
const REFRESH_MS = 60000;

const endpoints = {
  bundle: "/.netlify/functions/market"
};

const els = {
  form: document.querySelector("#watchForm"),
  symbol: document.querySelector("#symbolInput"),
  cost: document.querySelector("#costInput"),
  shares: document.querySelector("#sharesInput"),
  type: document.querySelector("#typeInput"),
  refresh: document.querySelector("#refreshButton"),
  demo: document.querySelector("#demoButton"),
  dataStatus: document.querySelector("#dataStatus"),
  updatedAt: document.querySelector("#updatedAt"),
  watchCount: document.querySelector("#watchCount"),
  holdingValue: document.querySelector("#holdingValue"),
  topHotStock: document.querySelector("#topHotStock"),
  riskCount: document.querySelector("#riskCount"),
  sourceLabel: document.querySelector("#sourceLabel"),
  marketIndexName: document.querySelector("#marketIndexName"),
  marketIndexPrice: document.querySelector("#marketIndexPrice"),
  marketIndexChange: document.querySelector("#marketIndexChange"),
  marketIndexChart: document.querySelector("#marketIndexChart"),
  marketTabs: document.querySelectorAll(".market-tab"),
  groupCards: document.querySelectorAll(".group-card"),
  listedIndexLabel: document.querySelector("#listedIndexLabel"),
  listedIndexPrice: document.querySelector("#listedIndexPrice"),
  listedIndexMeta: document.querySelector("#listedIndexMeta"),
  otcIndexLabel: document.querySelector("#otcIndexLabel"),
  otcIndexPrice: document.querySelector("#otcIndexPrice"),
  otcIndexMeta: document.querySelector("#otcIndexMeta"),
  electronicIndexLabel: document.querySelector("#electronicIndexLabel"),
  electronicIndexPrice: document.querySelector("#electronicIndexPrice"),
  electronicIndexMeta: document.querySelector("#electronicIndexMeta"),
  financeIndexLabel: document.querySelector("#financeIndexLabel"),
  financeIndexPrice: document.querySelector("#financeIndexPrice"),
  financeIndexMeta: document.querySelector("#financeIndexMeta"),
  marketTurnover: document.querySelector("#marketTurnover"),
  marketOpen: document.querySelector("#marketOpen"),
  marketHigh: document.querySelector("#marketHigh"),
  marketLow: document.querySelector("#marketLow"),
  marketPreviousClose: document.querySelector("#marketPreviousClose"),
  marketRealtimeStatus: document.querySelector("#marketRealtimeStatus"),
  quoteRealtimeStatus: document.querySelector("#quoteRealtimeStatus"),
  marketLastUpdated: document.querySelector("#marketLastUpdated"),
  institutionDate: document.querySelector("#institutionDate"),
  foreignNet: document.querySelector("#foreignNet"),
  trustNet: document.querySelector("#trustNet"),
  dealerNet: document.querySelector("#dealerNet"),
  institutionTotalNet: document.querySelector("#institutionTotalNet"),
  institutionStatus: document.querySelector("#institutionStatus"),
  chipThemeTitle: document.querySelector("#chipThemeTitle"),
  chipThemeText: document.querySelector("#chipThemeText"),
  tradeThemeTitle: document.querySelector("#tradeThemeTitle"),
  tradeThemeText: document.querySelector("#tradeThemeText"),
  sectorThemeTitle: document.querySelector("#sectorThemeTitle"),
  sectorThemeText: document.querySelector("#sectorThemeText"),
  sectorThemeCard: document.querySelector("#sectorThemeCard"),
  watchList: document.querySelector("#watchList"),
  holdingList: document.querySelector("#holdingList"),
  newsList: document.querySelector("#newsList"),
  rankingList: document.querySelector("#rankingList"),
  financeList: document.querySelector("#financeList"),
  insightList: document.querySelector("#insightList"),
  detailModal: document.querySelector("#detailModal"),
  closeDetail: document.querySelector("#closeDetailButton"),
  detailTitle: document.querySelector("#detailTitle"),
  detailPrice: document.querySelector("#detailPrice"),
  detailMonthReturn: document.querySelector("#detailMonthReturn"),
  detailPe: document.querySelector("#detailPe"),
  detailRevenue: document.querySelector("#detailRevenue"),
  detailInstitutional: document.querySelector("#detailInstitutional"),
  detailChartStatus: document.querySelector("#detailChartStatus"),
  expandChart: document.querySelector("#expandChartButton"),
  priceChart: document.querySelector("#priceChart"),
  detailPlainText: document.querySelector("#detailPlainText"),
  detailHoldingText: document.querySelector("#detailHoldingText"),
  detailInstitutionalText: document.querySelector("#detailInstitutionalText"),
  detailAiAdviceText: document.querySelector("#detailAiAdviceText"),
  sectorModal: document.querySelector("#sectorModal"),
  closeSector: document.querySelector("#closeSectorButton"),
  sectorDetailTitle: document.querySelector("#sectorDetailTitle"),
  sectorDetailSummary: document.querySelector("#sectorDetailSummary"),
  sectorDetailList: document.querySelector("#sectorDetailList"),
  trendChart: document.querySelector("#trendChart"),
  trendList: document.querySelector("#trendList"),
  trendAiTitle: document.querySelector("#trendAiTitle"),
  trendAiText: document.querySelector("#trendAiText"),
  trendStatus: document.querySelector("#trendStatus"),
  smallCapList: document.querySelector("#smallCapList"),
  smallCapAiTitle: document.querySelector("#smallCapAiTitle"),
  smallCapAiText: document.querySelector("#smallCapAiText"),
  smallCapStatus: document.querySelector("#smallCapStatus")
};

let watchList = loadWatchList();
let market = {
  daily: [],
  valuation: [],
  revenue: [],
  index: null,
  usIndex: null,
  institutional: null,
  news: [],
  source: "sample"
};
const historyCache = new Map();
let activeChartHistory = [];
let chartExpanded = false;
let selectedMarket = "tw";
let selectedGroup = "listed";
let latestRanking = [];
let trendRequestKey = "";
let latestTrendItems = [];
let smallCapRequestKey = "";
let latestSmallCapItems = [];

const sampleDaily = [
  row("2330", "台積電", 108500000, 104800000000, 968, 984, 960, 981, 12, 64000),
  row("2317", "鴻海", 86500000, 17860000000, 206, 210, 203, 208, 3, 42000),
  row("2454", "聯發科", 9300000, 11800000000, 1250, 1280, 1240, 1275, 18, 12000),
  row("2308", "台達電", 17600000, 7200000000, 406, 416, 402, 410, 5, 18000),
  row("2881", "富邦金", 42000000, 3800000000, 90, 91.2, 89.4, 90.8, 0.7, 15000),
  row("0050", "元大台灣50", 22000000, 4200000000, 189.2, 191, 188.8, 190.4, 1.4, 9000)
];

const sampleValuation = [
  valuation("2330", "台積電", 23.4, 2.1, 6.8),
  valuation("2317", "鴻海", 14.8, 2.6, 1.5),
  valuation("2454", "聯發科", 19.2, 5.9, 4.1),
  valuation("2308", "台達電", 31.5, 1.6, 7.2),
  valuation("2881", "富邦金", 12.3, 3.8, 1.4),
  valuation("0050", "元大台灣50", null, null, null)
];

const sampleRevenue = [
  revenue("2330", "台積電", "2026/04", 320000000, 33.1, 8.2),
  revenue("2317", "鴻海", "2026/04", 510000000, 7.4, -3.1),
  revenue("2454", "聯發科", "2026/04", 48000000, 18.9, 2.4),
  revenue("2308", "台達電", "2026/04", 39000000, 11.2, 4.8)
];

const sampleIndex = {
  name: "發行量加權股價指數",
  symbol: "t00",
  index: 41138.85,
  previousClose: 40769.29,
  open: 40983.04,
  high: 41575.84,
  low: 40616.28,
  turnover: 14515.35,
  change: 369.56,
  changePercent: 0.91,
  source: "sample",
  lastUpdated: new Date().toISOString(),
  candles: Array.from({ length: 250 }, (_, index) => ({
    date: `範例 ${index + 1}`,
    close: 41100 + Math.sin(index / 18) * 260 - Math.cos(index / 9) * 90 + (index > 110 ? (index - 110) * 3.2 : -index * 1.4),
    volume: 500 + Math.round(Math.abs(Math.sin(index / 7)) * 900)
  }))
};

sampleIndex.groups = {
  otc: { ...sampleIndex, name: "上櫃指數", index: 410.29, previousClose: 407.44, change: 2.85, changePercent: 0.7, turnover: 4261.58 },
  electronic: { ...sampleIndex, name: "電子類指數", index: 2663.65, previousClose: 2636.97, change: 26.68, changePercent: 1.01, turnover: 11957.85 },
  finance: { ...sampleIndex, name: "金融保險類指數", index: 2532.24, previousClose: 2503.19, change: 29.05, changePercent: 1.16, turnover: 223.37 }
};

const sampleUsMarket = {
  groups: {
    listed: usIndex("S&P 500", "^GSPC", 5321.41, 5292.40, 5338.87, 5285.11, 5305.74),
    otc: usIndex("Nasdaq", "^IXIC", 16685.97, 16532.90, 16721.12, 16480.48, 16511.18),
    electronic: usIndex("Dow", "^DJI", 39110.76, 39005.82, 39232.44, 38880.71, 38972.41),
    finance: usIndex("Russell 2000", "^RUT", 2094.33, 2079.41, 2104.91, 2070.12, 2084.22)
  },
  source: "sample"
};

const sampleInstitutional = {
  date: new Date().toISOString(),
  foreign: 182000000,
  trust: 36000000,
  dealer: -24000000,
  total: 194000000,
  stocks: {
    "2330": { code: "2330", name: "台積電", foreign: 82000000, trust: 12000000, dealer: -6000000, total: 88000000 },
    "2317": { code: "2317", name: "鴻海", foreign: -18000000, trust: 6000000, dealer: 3000000, total: -9000000 },
    "0050": { code: "0050", name: "元大台灣50", foreign: 9000000, trust: 0, dealer: 2000000, total: 11000000 }
  },
  source: "sample"
};

const sampleNews = [
  {
    title: "台股資金熱度升溫，電子權值股仍是盤面焦點",
    url: "https://www.cnyes.com/",
    category: "台股",
    date: new Date().toISOString(),
    source: "鉅亨網"
  },
  {
    title: "美股大型科技股表現牽動全球風險偏好",
    url: "https://www.cnyes.com/",
    category: "美股",
    date: new Date().toISOString(),
    source: "鉅亨網"
  }
];

function usIndex(name, symbol, index, open, high, low, previousClose) {
  const change = index - previousClose;
  return {
    name,
    symbol,
    index,
    open,
    high,
    low,
    previousClose,
    turnover: null,
    change,
    changePercent: (change / previousClose) * 100,
    source: "sample",
    lastUpdated: new Date().toISOString(),
    candles: Array.from({ length: 78 }, (_, point) => ({
      date: `US ${point + 1}`,
      close: index + Math.sin(point / 8) * (index * 0.006) - Math.cos(point / 5) * (index * 0.002),
      volume: 400 + Math.round(Math.abs(Math.sin(point / 4)) * 700)
    }))
  };
}

function row(code, name, volume, value, open, high, low, close, change, trades) {
  return { code, name, volume, value, open, high, low, close, change, trades };
}

function valuation(code, name, pe, yieldRate, pb) {
  return { code, name, pe, yieldRate, pb };
}

function revenue(code, name, month, amount, yoy, mom) {
  return { code, name, month, amount, yoy, mom };
}

function loadWatchList() {
  try {
    return JSON.parse(localStorage.getItem(WATCH_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWatchList() {
  localStorage.setItem(WATCH_KEY, JSON.stringify(watchList));
}

function number(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replaceAll(",", "").replace("--", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function money(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 }).format(value);
}

function compactMoney(value) {
  if (!Number.isFinite(value)) return "--";
  if (value >= 100000000) return `${money(value / 100000000)} 億`;
  if (value >= 10000) return `${money(value / 10000)} 萬`;
  return money(value);
}

function percent(value) {
  if (!Number.isFinite(value)) return "--";
  return `${value > 0 ? "+" : ""}${money(value)}%`;
}

function rocDateToText(value) {
  const parts = String(value).split("/");
  if (parts.length !== 3) return String(value);
  return `${Number(parts[0]) + 1911}/${parts[1]}/${parts[2]}`;
}

function normalizeDaily(raw) {
  return raw.map((item) => ({
    code: item.Code || item["證券代號"] || item.code,
    name: item.Name || item["證券名稱"] || item.name,
    volume: number(item.TradeVolume || item["成交股數"] || item.volume),
    value: number(item.TradeValue || item["成交金額"] || item.value),
    open: number(item.OpeningPrice || item["開盤價"] || item.open),
    high: number(item.HighestPrice || item["最高價"] || item.high),
    low: number(item.LowestPrice || item["最低價"] || item.low),
    close: number(item.ClosingPrice || item["收盤價"] || item.close),
    change: number(item.Change || item["漲跌價差"] || item.change),
    trades: number(item.Transaction || item["成交筆數"] || item.trades)
  })).filter((item) => item.code && item.name && Number.isFinite(item.close));
}

function normalizeValuation(raw) {
  return raw.map((item) => ({
    code: item.Code || item["證券代號"] || item.code,
    name: item.Name || item["證券名稱"] || item.name,
    pe: number(item.PEratio || item["本益比"] || item.pe),
    yieldRate: number(item.DividendYield || item["殖利率(%)"] || item.yieldRate),
    pb: number(item.PBratio || item["股價淨值比"] || item.pb)
  })).filter((item) => item.code);
}

function normalizeRevenue(raw) {
  return raw.map((item) => ({
    code: item["公司代號"] || item.company_code || item.code,
    name: item["公司名稱"] || item.company_name || item.name,
    month: item["出表日期"] || item["資料年月"] || item.month,
    amount: number(item["營業收入-當月營收"] || item.revenue_current_month || item.amount),
    yoy: number(item["去年同月增減(%)"] || item.yoy),
    mom: number(item["上月比較增減(%)"] || item.mom)
  })).filter((item) => item.code);
}

function normalizeRealtimeQuotes(raw) {
  return raw.map((item) => {
    const close = number(item.closePrice || item.lastPrice);
    const previousClose = number(item.previousClose);
    return {
      code: item.symbol || item.code,
      name: item.name,
      open: number(item.openPrice),
      high: number(item.highPrice),
      low: number(item.lowPrice),
      close,
      change: number(item.change) ?? (Number.isFinite(close) && Number.isFinite(previousClose) ? close - previousClose : null),
      volume: number(item.total?.tradeVolume || item.tradeVolume),
      value: number(item.total?.tradeValue || item.tradeValue),
      trades: number(item.total?.transaction || item.transaction),
      realtime: true,
      quoteTime: item.lastUpdated || item.closeTime
    };
  }).filter((item) => item.code && Number.isFinite(item.close));
}

function normalizeIndex(payload) {
  if (!payload) return null;
  const close = number(payload.index ?? payload.closePrice ?? payload.lastPrice);
  const previousClose = number(payload.previousClose);
  const change = number(payload.change) ?? (Number.isFinite(close) && Number.isFinite(previousClose) ? close - previousClose : null);
  const changePercent = number(payload.changePercent) ?? (Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null);
  const candles = (payload.candles || []).map((item) => ({
    date: item.date,
    close: number(item.close ?? item.index),
    volume: number(item.volume)
  })).filter((item) => Number.isFinite(item.close));

  return {
    name: payload.name || "加權指數",
    symbol: payload.symbol || "IR0001",
    index: close,
    previousClose,
    open: number(payload.open),
    high: number(payload.high),
    low: number(payload.low),
    turnover: number(payload.turnover),
    groups: normalizeIndexGroups(payload.groups),
    change,
    changePercent,
    lastUpdated: payload.lastUpdated || payload.time || payload.updatedAt,
    source: payload.source || "Fugle",
    candles
  };
}

function normalizeIndexGroups(groups = {}) {
  return Object.fromEntries(Object.entries(groups).map(([key, group]) => [key, normalizeIndex(group)]));
}

function mergeRealtimeQuotes(daily, realtime) {
  if (!realtime.length) return daily;
  const map = new Map(daily.map((item) => [item.code, item]));

  realtime.forEach((quote) => {
    const current = map.get(quote.code) || {};
    map.set(quote.code, {
      ...current,
      ...quote,
      name: quote.name || current.name || quote.code,
      volume: quote.volume || current.volume,
      value: quote.value || current.value,
      trades: quote.trades || current.trades
    });
  });

  return Array.from(map.values());
}

async function fetchMarket() {
  setStatus("更新中", "正在讀取證交所公開資料");

  try {
    const symbols = watchList.map((item) => item.code).join(",");
    const url = symbols ? `${endpoints.bundle}?symbols=${encodeURIComponent(symbols)}` : endpoints.bundle;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Netlify function unavailable");
    const payload = await response.json();
    const daily = normalizeDaily(payload.daily || []);
    const realtime = normalizeRealtimeQuotes(payload.realtime || []);

    market = {
      daily: mergeRealtimeQuotes(daily, realtime),
      valuation: normalizeValuation(payload.valuation || []),
      revenue: normalizeRevenue(payload.revenue || []),
      index: normalizeIndex(payload.index) || sampleIndex,
      usIndex: normalizeUsMarket(payload.usIndex) || sampleUsMarket,
      institutional: normalizeInstitutional(payload.institutional) || sampleInstitutional,
      news: normalizeNews(payload.news || []),
      source: payload.realtimeSource === "Fugle" ? "TWSE + Fugle" : "TWSE"
    };
  } catch {
    market = {
      daily: sampleDaily,
      valuation: sampleValuation,
      revenue: sampleRevenue,
      index: sampleIndex,
      usIndex: sampleUsMarket,
      institutional: sampleInstitutional,
      news: sampleNews,
      source: "sample"
    };
  }

  setStatus(market.source === "sample" ? "範例資料" : "已更新", new Date().toLocaleString("zh-TW"));
  render();
}

function normalizeInstitutional(payload) {
  if (!payload) return null;
  return {
    date: payload.date,
    foreign: number(payload.foreign),
    trust: number(payload.trust),
    dealer: number(payload.dealer),
    total: number(payload.total),
    stocks: normalizeInstitutionalStocks(payload.stocks || {}),
    source: payload.source || "TWSE"
  };
}

function normalizeInstitutionalStocks(stocks) {
  return Object.fromEntries(Object.entries(stocks).map(([code, item]) => [String(code), {
    code: item.code || code,
    name: item.name || "",
    foreign: number(item.foreign),
    trust: number(item.trust),
    dealer: number(item.dealer),
    total: number(item.total)
  }]));
}

function normalizeUsMarket(payload) {
  if (!payload?.groups) return null;
  return {
    groups: normalizeIndexGroups(payload.groups),
    source: payload.source || "Yahoo"
  };
}

function normalizeNews(items) {
  const news = (items || []).map((item) => ({
    title: String(item.title || "").trim(),
    url: String(item.url || "").trim(),
    category: item.category || "市場",
    date: item.date || item.publishedAt || "",
    source: item.source || "鉅亨網"
  })).filter((item) => item.title && item.url);
  return news.length ? news : sampleNews;
}

function setStatus(status, time) {
  els.dataStatus.textContent = status;
  els.updatedAt.textContent = time;
}

function getStock(code) {
  return market.daily.find((item) => item.code === code);
}

function getValuation(code) {
  return market.valuation.find((item) => item.code === code);
}

function getRevenue(code) {
  return market.revenue.find((item) => item.code === code);
}

function getInstitutional(code) {
  return market.institutional?.stocks?.[code] || null;
}

function sampleHistory(code) {
  const stock = getStock(code) || sampleDaily.find((item) => item.code === code) || sampleDaily[0];
  const base = stock.close || 100;
  return Array.from({ length: 42 }, (_, index) => {
    const wave = Math.sin(index / 4) * base * 0.025;
    const drift = (index - 21) * base * 0.0018;
    const close = Math.max(1, base + wave + drift);
    return {
      date: `範例 ${index + 1}`,
      close,
      volume: Math.round((stock.volume || 1000000) * (0.75 + (index % 7) * 0.08))
    };
  });
}

async function fetchHistory(code) {
  if (historyCache.has(code)) return historyCache.get(code);

  try {
    const response = await fetch(`${endpoints.bundle}?code=${encodeURIComponent(code)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("history unavailable");
    const payload = await response.json();
    const history = (payload.history || []).map((item) => ({
      date: rocDateToText(item.date),
      close: number(item.close),
      volume: number(item.volume)
    })).filter((item) => Number.isFinite(item.close));
    if (!history.length) throw new Error("empty history");
    historyCache.set(code, history);
    return history;
  } catch {
    const history = sampleHistory(code);
    historyCache.set(code, history);
    return history;
  }
}

function scoreStock(stock, val, rev) {
  let score = 50;
  const reasons = [];

  if (!stock) return { score: 0, level: "資料不足", tone: "warn", text: "今天沒有找到成交資料，先確認代號或市場別。" };

  const intradayPosition = stock.high > stock.low ? (stock.close - stock.low) / (stock.high - stock.low) : 0.5;
  const valueRank = market.daily
    .slice()
    .sort((a, b) => b.value - a.value)
    .findIndex((item) => item.code === stock.code);

  if (stock.change > 0) {
    score += 10;
    reasons.push("收盤比前一日強");
  } else if (stock.change < 0) {
    score -= 10;
    reasons.push("今日價格偏弱");
  }

  if (intradayPosition > 0.72) {
    score += 12;
    reasons.push("收在今日高檔區");
  } else if (intradayPosition < 0.28) {
    score -= 12;
    reasons.push("收在今日低檔區");
  }

  if (valueRank >= 0 && valueRank < 20) {
    score += 10;
    reasons.push("市場成交熱度高");
  }

  if (rev?.yoy > 10) {
    score += 10;
    reasons.push("月營收年增亮眼");
  } else if (rev?.yoy < -10) {
    score -= 12;
    reasons.push("月營收年減，需要追原因");
  }

  if (val?.pe > 35 || val?.pb > 6) {
    score -= 8;
    reasons.push("估值偏高，追價風險較大");
  }

  if (score >= 72) return { score, level: "可觀察轉強", tone: "good", text: reasons.join("、") || "資料偏正面，但仍需分批觀察。" };
  if (score <= 42) return { score, level: "先保守", tone: "bad", text: reasons.join("、") || "訊號偏弱，先不要急。" };
  return { score, level: "等待確認", tone: "warn", text: reasons.join("、") || "訊號普通，適合等更明確的量價或財報變化。" };
}

function render() {
  const ranking = market.daily.slice().sort((a, b) => b.value - a.value).slice(0, 20);
  latestRanking = ranking;
  const tracked = watchList.map((item) => {
    const stock = getStock(item.code);
    const val = getValuation(item.code);
    const rev = getRevenue(item.code);
    return { item, stock, val, rev, signal: scoreStock(stock, val, rev) };
  });
  const holdings = tracked.filter((entry) => (entry.item.type || "holding") === "holding");
  const watchOnly = tracked.filter((entry) => entry.item.type === "watch");
  const holdingValue = holdings.reduce((total, entry) => {
    const shares = number(entry.item.shares);
    if (!entry.stock || !shares) return total;
    return total + entry.stock.close * shares;
  }, 0);

  els.watchCount.textContent = watchList.length;
  els.holdingValue.textContent = holdingValue ? compactMoney(holdingValue) : "--";
  els.topHotStock.textContent = ranking[0] ? `${ranking[0].code} ${ranking[0].name}` : "--";
  els.riskCount.textContent = tracked.filter((item) => item.signal.tone === "bad").length;
  els.sourceLabel.textContent = market.source === "sample" ? "範例" : market.source;

  renderHoldings(holdings);
  renderNews();
  renderWatchList(watchOnly);
  renderInsights(tracked, ranking);
  renderRanking(ranking);
  renderFinance(tracked);
  renderMarketIndex();
  renderInstitutional();
  renderMarketThemes(ranking);
  renderTrendPanel(ranking);
  renderSmallCapGuide();
}

function formatShareFlow(value) {
  if (!Number.isFinite(value)) return "--";
  const abs = Math.abs(value);
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  if (abs >= 100000000) return `${sign}${money(abs / 100000000)} 億股`;
  if (abs >= 10000) return `${sign}${money(abs / 10000)} 萬股`;
  return `${sign}${money(abs)} 股`;
}

function setFlowClass(element, value) {
  element.classList.toggle("price-up", value > 0);
  element.classList.toggle("price-down", value < 0);
}

function renderInstitutional() {
  const data = market.institutional || sampleInstitutional;
  const rows = [
    [els.foreignNet, data.foreign],
    [els.trustNet, data.trust],
    [els.dealerNet, data.dealer],
    [els.institutionTotalNet, data.total]
  ];

  rows.forEach(([element, value]) => {
    element.textContent = formatShareFlow(value);
    setFlowClass(element, value);
  });

  els.institutionDate.textContent = `資料日期：${formatUpdateTime(data.date)}`;
  els.institutionStatus.textContent = data.source === "TWSE"
    ? "法人：TWSE 盤後統計，非逐筆即時"
    : "法人：範例資料，等待 TWSE 更新";
}

function renderMarketThemes(ranking) {
  const data = market.institutional || sampleInstitutional;
  const flows = [
    ["外資", number(data.foreign)],
    ["投信", number(data.trust)],
    ["自營商", number(data.dealer)]
  ].filter(([, value]) => Number.isFinite(value));
  const leader = flows.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  const total = number(data.total);

  els.chipThemeTitle.textContent = Number.isFinite(total)
    ? total > 0 ? "法人偏買超" : total < 0 ? "法人偏賣超" : "法人中性"
    : "--";
  els.chipThemeTitle.className = Number.isFinite(total) ? total >= 0 ? "price-up" : "price-down" : "";
  els.chipThemeText.textContent = leader
    ? `${leader[0]}影響最大，${formatShareFlow(leader[1])}；三大法人合計 ${formatShareFlow(total)}。`
    : "等待三大法人盤後資料。";

  const hotStocks = ranking.slice(0, 3).map((stock) => `${stock.code} ${stock.name}`);
  els.tradeThemeTitle.textContent = ranking[0] ? `${ranking[0].code} ${ranking[0].name}` : "--";
  els.tradeThemeText.textContent = hotStocks.length
    ? `成交金額集中在 ${hotStocks.join("、")}。`
    : "等待今日成交排行。";

  const sectors = summarizeSectors(ranking);
  els.sectorThemeTitle.textContent = sectors[0]?.name || "--";
  els.sectorThemeText.textContent = sectors.length
    ? `資金較集中：${sectors.map((item) => `${item.name} ${item.count} 檔`).join("、")}。`
    : "等待產業族群判斷。";
}

function summarizeSectors(stocks) {
  const totals = new Map();
  stocks.slice(0, 10).forEach((stock) => {
    const sector = inferSector(stock);
    const current = totals.get(sector) || { name: sector, count: 0, value: 0, stocks: [] };
    current.count += 1;
    current.value += stock.value || 0;
    current.stocks.push(stock);
    totals.set(sector, current);
  });
  return Array.from(totals.values())
    .sort((a, b) => b.value - a.value || b.count - a.count)
    .slice(0, 3);
}

function sectorBreakdown(stocks) {
  const groups = summarizeSectors(stocks).map((group) => ({
    ...group,
    stocks: group.stocks.slice().sort((a, b) => (b.value || 0) - (a.value || 0))
  }));
  const totalValue = groups.reduce((sum, group) => sum + group.value, 0);
  return { groups, totalValue };
}

function openSectorDetail() {
  const ranking = latestRanking.length ? latestRanking : market.daily.slice().sort((a, b) => b.value - a.value).slice(0, 20);
  const { groups, totalValue } = sectorBreakdown(ranking);
  els.sectorDetailTitle.textContent = "今日產業族群";
  els.sectorDetailSummary.textContent = groups.length
    ? `依今日成交金額前 10 名整理，最高集中在 ${groups[0].name}，合計 ${compactMoney(groups[0].value)}。`
    : "目前沒有足夠成交排行資料。";
  els.sectorDetailList.innerHTML = groups.length ? groups.map((group, index) => `
    <article class="sector-group">
      <div class="sector-group-head">
        <strong>${index + 1}. ${escapeHtml(group.name)}</strong>
        <span class="pill">${group.count} 檔 ｜ ${compactMoney(group.value)} ｜ ${totalValue ? percent((group.value / totalValue) * 100) : "--"}</span>
      </div>
      ${group.stocks.map((stock) => `
        <div class="sector-stock-row" data-code="${escapeAttribute(stock.code)}">
          <strong>${escapeHtml(stock.code)} ${escapeHtml(stock.name)}</strong>
          <small>成交金額 ${compactMoney(stock.value)}</small>
          <span class="${stock.change >= 0 ? "price-up" : "price-down"}">${money(stock.close)} / ${money(stock.change)}</span>
        </div>
      `).join("")}
    </article>
  `).join("") : '<p class="empty">等待今日成交排行更新後，這裡會顯示族群明細。</p>';
  els.sectorModal.hidden = false;
}

function inferSector(stock) {
  const text = `${stock.code || ""} ${stock.name || ""}`;
  if (/台積|聯發科|聯電|日月光|矽|半導體|創意|世芯|力積/.test(text)) return "半導體";
  if (/鴻海|廣達|緯創|英業達|仁寶|和碩|電子|電腦|伺服器|光寶|台達電/.test(text)) return "電子製造";
  if (/富邦|國泰|中信金|玉山|元大金|兆豐|第一金|合庫|金控|銀行|保險/.test(text)) return "金融";
  if (/航|運|長榮|陽明|萬海|華航|貨櫃/.test(text)) return "航運";
  if (/鋼|中鋼|燁輝|東和/.test(text)) return "鋼鐵";
  if (/塑|台塑|南亞|台化|化/.test(text)) return "塑化";
  if (/建|營造|水泥|亞泥|台泥/.test(text)) return "傳產";
  if (/藥|醫|生技|保瑞|藥華/.test(text)) return "生技醫療";
  if (/0050|0056|ETF|元大|富邦台|國泰永續/.test(text)) return "ETF";
  return "其他";
}

async function renderTrendPanel(ranking) {
  const candidates = ranking.slice(0, 20);
  const key = candidates.map((stock) => stock.code).join(",");
  if (!key) {
    latestTrendItems = [];
    els.trendList.innerHTML = '<p class="empty">等待成交排行更新後，這裡會計算近月漲勢。</p>';
    els.trendAiTitle.textContent = "等待資料";
    els.trendAiText.textContent = "目前沒有足夠股票可分析。";
    els.trendStatus.textContent = "趨勢：等待近月資料";
    drawTrendChart([]);
    return;
  }
  if (trendRequestKey === key && latestTrendItems.length) {
    drawTrendChart(latestTrendItems);
    return;
  }

  trendRequestKey = key;
  els.trendStatus.textContent = "趨勢：正在抓取近一個月資料";
  els.trendList.innerHTML = '<p class="empty">正在依每日漲幅計算近期漲勢...</p>';

  const items = await Promise.all(candidates.map(async (stock) => {
    const history = await fetchHistory(stock.code);
    return buildTrendItem(stock, history);
  }));
  if (trendRequestKey !== key) return;

  latestTrendItems = items.filter(Boolean).sort((a, b) => b.recentReturn - a.recentReturn).slice(0, 20);
  renderTrendResults(latestTrendItems);
}

function buildTrendItem(stock, history) {
  const recent = history.filter((item) => Number.isFinite(item.close)).slice(-22);
  if (recent.length < 4) return null;
  const latest = recent.at(-1).close;
  const previousDay = recent[Math.max(0, recent.length - 2)].close;
  const first = recent[0].close;
  const recentReturn = previousDay ? ((latest - previousDay) / previousDay) * 100 : null;
  const monthReturn = first ? ((latest - first) / first) * 100 : null;
  const segments = [];
  for (let index = Math.max(3, recent.length % 3 || 3); index < recent.length; index += 3) {
    const start = recent[index - 3]?.close;
    const end = recent[index]?.close;
    if (start && end) segments.push(((end - start) / start) * 100);
  }
  const positiveSegments = segments.filter((value) => value > 0).length;
  return {
    ...stock,
    sector: inferSector(stock),
    recentReturn,
    monthReturn,
    positiveSegments,
    segmentCount: segments.length,
    trendScore: (recentReturn || 0) * 0.65 + (monthReturn || 0) * 0.35
  };
}

function renderTrendResults(items) {
  if (!items.length) {
    els.trendList.innerHTML = '<p class="empty">近月資料不足，稍後再更新。</p>';
    els.trendAiTitle.textContent = "資料不足";
    els.trendAiText.textContent = "目前無法形成趨勢判讀。";
    els.trendStatus.textContent = "趨勢：資料不足";
    drawTrendChart([]);
    return;
  }

  els.trendList.innerHTML = items.slice(0, 20).map((item, index) => `
    <article class="trend-row">
      <div>
        <strong>${index + 1}. ${escapeHtml(item.code)} ${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.sector)} ｜ 近月 ${percent(item.monthReturn)} ｜ 1 日 ${percent(item.recentReturn)}</small>
      </div>
      <span class="${item.recentReturn >= 0 ? "price-up" : "price-down"}">${percent(item.recentReturn)}</span>
    </article>
  `).join("");

  const sectors = summarizeTrendSectors(items);
  const leader = items[0];
  const sectorLeader = sectors[0];
  els.trendAiTitle.textContent = sectorLeader ? `${sectorLeader.name} 較強` : `${leader.code} 領先`;
  els.trendAiText.textContent = buildTrendAiText(leader, sectorLeader, items);
  els.trendStatus.textContent = `趨勢：已分析 ${items.length} 檔，最後更新 ${new Date().toLocaleString("zh-TW")}`;
  drawTrendChart(items);
}

function summarizeTrendSectors(items) {
  const map = new Map();
  items.forEach((item) => {
    const current = map.get(item.sector) || { name: item.sector, count: 0, avgRecent: 0, avgMonth: 0 };
    current.count += 1;
    current.avgRecent += item.recentReturn || 0;
    current.avgMonth += item.monthReturn || 0;
    map.set(item.sector, current);
  });
  return Array.from(map.values()).map((item) => ({
    ...item,
    avgRecent: item.avgRecent / item.count,
    avgMonth: item.avgMonth / item.count
  })).sort((a, b) => b.avgRecent - a.avgRecent || b.count - a.count);
}

function buildTrendAiText(leader, sectorLeader, items) {
  const strongCount = items.filter((item) => item.recentReturn > 2 && item.monthReturn > 0).length;
  if (sectorLeader && sectorLeader.count >= 2) {
    return `${sectorLeader.name}有 ${sectorLeader.count} 檔進入漲勢榜，最近 1 日平均 ${percent(sectorLeader.avgRecent)}。後續可優先觀察同族群中基本面沒有轉弱、且回檔量縮的標的；追高時要等拉回或突破確認。`;
  }
  if (strongCount >= 3) {
    return `短線漲勢不只集中在單一股票，代表盤面風險偏好轉強。可觀察 ${leader.code} ${leader.name} 這類領漲股是否續強，同時留意漲多後震盪。`;
  }
  return `目前漲勢偏集中在少數個股，${leader.code} ${leader.name} 最近 1 日表現最好。方向上先偏觀察，不急著追價，等族群擴散或回測支撐後再評估。`;
}

function drawTrendChart(items) {
  const canvas = els.trendChart;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(640, Math.round(rect.width * ratio));
  const height = Math.max(560 * ratio, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#6f6a61";
  context.font = `${13 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  if (!items.length) {
    context.fillText("等待近月漲勢資料", 24 * ratio, 44 * ratio);
    return;
  }

  const top = items.slice(0, 20);
  const padding = { top: 18 * ratio, right: 78 * ratio, bottom: 18 * ratio, left: 138 * ratio };
  const chartWidth = width - padding.left - padding.right;
  const rowHeight = (height - padding.top - padding.bottom) / top.length;
  const maxValue = Math.max(...top.map((item) => Math.abs(item.recentReturn)), 1);

  top.forEach((item, index) => {
    const y = padding.top + rowHeight * index + rowHeight * 0.18;
    const barHeight = Math.max(10 * ratio, rowHeight * 0.5);
    const barWidth = (Math.abs(item.recentReturn) / maxValue) * chartWidth;
    context.fillStyle = "#242423";
    context.font = `${12 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    context.fillText(`${item.code} ${item.name}`.slice(0, 12), 14 * ratio, y + barHeight * 0.68);
    context.fillStyle = item.recentReturn >= 0 ? "#ad3032" : "#176b55";
    roundedRect(context, padding.left, y, Math.max(4 * ratio, barWidth), barHeight, 5 * ratio);
    context.fill();
    context.fillStyle = "#242423";
    context.font = `${12 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    context.fillText(percent(item.recentReturn), padding.left + barWidth + 10 * ratio, y + barHeight * 0.68);
  });
}

async function renderSmallCapGuide() {
  const baseCandidates = market.daily
    .filter((stock) => stock.close > 0 && stock.close < 100 && /^\d{4}$/.test(stock.code) && inferSector(stock) !== "ETF")
    .map((stock) => {
      const val = getValuation(stock.code);
      const rev = getRevenue(stock.code);
      const inst = getInstitutional(stock.code);
      const qualityScore =
        (rev?.yoy > 0 ? Math.min(rev.yoy, 80) : -20) +
        (stock.change > 0 ? 10 : -8) +
        (val?.pe && val.pe > 0 && val.pe < 25 ? 12 : 0) +
        (val?.yieldRate >= 2 ? 8 : 0) +
        (inst?.total > 0 ? 8 : 0) +
        Math.min((stock.value || 0) / 100000000, 15);
      return { stock, val, rev, inst, qualityScore };
    })
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 28);
  const key = baseCandidates.map((item) => item.stock.code).join(",");

  if (!key) {
    latestSmallCapItems = [];
    els.smallCapList.innerHTML = '<p class="empty">目前沒有找到 100 元以下且資料足夠的候選股。</p>';
    els.smallCapAiTitle.textContent = "等待資料";
    els.smallCapAiText.textContent = "小型股需要更重視流動性與停損，等待資料更新後再判讀。";
    els.smallCapStatus.textContent = "小型股：等待資料";
    return;
  }
  if (smallCapRequestKey === key && latestSmallCapItems.length) return;

  smallCapRequestKey = key;
  els.smallCapStatus.textContent = "小型股：正在分析近月表現";
  els.smallCapList.innerHTML = '<p class="empty">正在篩選 100 元以下、營收與價格表現較佳的股票...</p>';

  const items = await Promise.all(baseCandidates.map(async ({ stock, val, rev, inst, qualityScore }) => {
    const history = await fetchHistory(stock.code);
    return buildSmallCapItem(stock, val, rev, inst, qualityScore, history);
  }));
  if (smallCapRequestKey !== key) return;

  latestSmallCapItems = items.filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  renderSmallCapResults(latestSmallCapItems);
}

function buildSmallCapItem(stock, val, rev, inst, qualityScore, history) {
  const recent = history.filter((item) => Number.isFinite(item.close)).slice(-22);
  if (recent.length < 4) return null;
  const latest = recent.at(-1).close;
  const previous3 = recent[Math.max(0, recent.length - 4)].close;
  const first = recent[0].close;
  const recentReturn = previous3 ? ((latest - previous3) / previous3) * 100 : 0;
  const monthReturn = first ? ((latest - first) / first) * 100 : 0;
  const revScore = rev?.yoy > 0 ? Math.min(rev.yoy, 80) : -25;
  const valueScore = val?.pe && val.pe > 0 && val.pe < 25 ? 14 : val?.pe > 35 ? -10 : 0;
  const score = qualityScore + revScore * 0.5 + recentReturn * 1.3 + monthReturn * 0.55 + valueScore;
  if (rev?.yoy < 0 && monthReturn < 0) return null;
  return {
    stock,
    val,
    rev,
    inst,
    recentReturn,
    monthReturn,
    score,
    sector: inferSector(stock)
  };
}

function renderSmallCapResults(items) {
  if (!items.length) {
    els.smallCapList.innerHTML = '<p class="empty">沒有符合「營收與價格表現都偏好」的 100 元以下候選。</p>';
    els.smallCapAiTitle.textContent = "暫無候選";
    els.smallCapAiText.textContent = "低價股波動較大，沒有好訊號時寧可等待。";
    els.smallCapStatus.textContent = "小型股：沒有足夠候選";
    return;
  }

  els.smallCapList.innerHTML = items.map((item, index) => `
    <article class="small-cap-card">
      <div class="small-cap-head">
        <div>
          <strong>${index + 1}. ${escapeHtml(item.stock.code)} ${escapeHtml(item.stock.name)}</strong>
          <small>${escapeHtml(item.sector)} ｜ 股價 ${money(item.stock.close)} ｜ 分數 ${money(item.score)}</small>
        </div>
        <span class="${item.monthReturn >= 0 ? "price-up" : "price-down"}">近月 ${percent(item.monthReturn)}</span>
      </div>
      <p>3 日 ${percent(item.recentReturn)}，營收年增 ${item.rev ? percent(item.rev.yoy) : "--"}，本益比 ${item.val?.pe ?? "--"}，法人 ${item.inst ? formatShareFlow(item.inst.total) : "--"}。</p>
      <p>${smallCapAdvice(item)}</p>
    </article>
  `).join("");

  const top = items[0];
  const sectors = summarizeTrendSectors(items.map((item) => ({
    sector: item.sector,
    recentReturn: item.recentReturn,
    monthReturn: item.monthReturn
  })));
  els.smallCapAiTitle.textContent = `${top.stock.code} ${top.stock.name} 分數最高`;
  els.smallCapAiText.textContent = `${sectors[0]?.name || top.sector} 目前較集中。這 20 檔只代表「可觀察候選」，進場上建議等回檔不破支撐、成交量沒有失控放大，再用小部位分批測試。`;
  els.smallCapStatus.textContent = `小型股：已篩選 ${items.length} 檔，最後更新 ${new Date().toLocaleString("zh-TW")}`;
}

function smallCapAdvice(item) {
  if (item.recentReturn > 8) return "短線已明顯上漲，適合等拉回或突破後再評估，避免直接追高。";
  if (item.rev?.yoy > 15 && item.monthReturn > 0 && item.inst?.total > 0) return "營收、價格與法人方向偏正面，可列入優先觀察名單。";
  if (item.val?.pe && item.val.pe < 18 && item.rev?.yoy > 0) return "估值不算太高且營收成長，適合觀察是否有量價轉強。";
  return "資料偏正向但仍需確認流動性、停損點與下一期營收。";
}

function formatUpdateTime(value) {
  if (!value) return "尚未同步";
  const date = typeof value === "number" ? new Date(value / (value > 10000000000000 ? 1000 : 1)) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-TW");
}

function renderMarketIndex() {
  const marketData = selectedMarket === "us" ? (market.usIndex || sampleUsMarket) : { groups: (market.index?.groups || sampleIndex.groups), source: market.index?.source };
  const groups = selectedMarket === "us" ? marketData.groups : {
    listed: market.index || sampleIndex,
    ...(market.index?.groups || {})
  };
  const fallbackGroups = selectedMarket === "us" ? sampleUsMarket.groups : {
    listed: sampleIndex,
    ...sampleIndex.groups
  };
  const index = groups[selectedGroup] || fallbackGroups[selectedGroup] || sampleIndex;
  const change = number(index.change);
  const changePercent = number(index.changePercent);
  const isUp = change >= 0;
  const hasMarketIndex = (index.source === "TWSE" || index.source === "Yahoo") && Number.isFinite(index.index);
  const hasFugleQuotes = market.source.includes("Fugle");

  els.marketIndexName.textContent = index.name || "加權指數";
  els.marketIndexPrice.textContent = Number.isFinite(index.index) ? money(index.index) : "--";
  els.marketIndexChange.textContent = Number.isFinite(change)
    ? `${change > 0 ? "+" : ""}${money(change)} (${percent(changePercent)})`
    : "--";
  els.marketIndexChange.className = isUp ? "price-up" : "price-down";
  renderMarketGroupCards(groups, fallbackGroups);
  els.marketTurnover.textContent = Number.isFinite(index.turnover) ? `${money(index.turnover)} 億` : "--";
  els.marketOpen.textContent = Number.isFinite(index.open) ? money(index.open) : "--";
  els.marketHigh.textContent = Number.isFinite(index.high) ? money(index.high) : "--";
  els.marketLow.textContent = Number.isFinite(index.low) ? money(index.low) : "--";
  els.marketPreviousClose.textContent = Number.isFinite(index.previousClose) ? money(index.previousClose) : "--";
  els.marketRealtimeStatus.textContent = hasMarketIndex
    ? `大盤：${index.source === "Yahoo" ? "美股公開行情" : "TWSE 即時指數資料"}`
    : "大盤：非即時或範例資料";
  els.quoteRealtimeStatus.textContent = hasFugleQuotes ? "個股：Fugle 即時報價" : "個股：TWSE 公開資料，非逐筆即時";
  els.marketLastUpdated.textContent = `最後更新：${formatUpdateTime(index.lastUpdated || new Date())}`;
  drawMarketBoardChart(index.candles?.length ? index.candles : sampleIndex.candles, index, isUp);
}

function renderMarketGroupCards(groups, fallbackGroups) {
  const labels = selectedMarket === "us"
    ? { listed: "S&P 500", otc: "Nasdaq", electronic: "Dow", finance: "Russell 2000" }
    : { listed: "上市", otc: "上櫃", electronic: "電子", finance: "金融" };
  const labelEls = {
    listed: els.listedIndexLabel,
    otc: els.otcIndexLabel,
    electronic: els.electronicIndexLabel,
    finance: els.financeIndexLabel
  };
  const priceEls = {
    listed: els.listedIndexPrice,
    otc: els.otcIndexPrice,
    electronic: els.electronicIndexPrice,
    finance: els.financeIndexPrice
  };
  const metaEls = {
    listed: els.listedIndexMeta,
    otc: els.otcIndexMeta,
    electronic: els.electronicIndexMeta,
    finance: els.financeIndexMeta
  };

  Object.keys(labels).forEach((key) => {
    const group = groups[key] || fallbackGroups[key];
    const groupChange = number(group?.change);
    labelEls[key].textContent = labels[key];
    priceEls[key].textContent = Number.isFinite(group?.index) ? money(group.index) : "--";
    metaEls[key].textContent = Number.isFinite(groupChange) ? `${groupChange > 0 ? "▲" : "▼"} ${money(Math.abs(groupChange))}` : "資料不足";
  });

  els.groupCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.group === selectedGroup);
  });
  els.marketTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.market === selectedMarket);
  });
}

function drawMarketBoardChart(points, index, isUp) {
  const canvas = els.marketIndexChart;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const targetWidth = Math.max(640, Math.round(rect.width * ratio));
  const targetHeight = Math.max(210, Math.round(rect.height * ratio));
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 18, right: 96, bottom: 42, left: 12 };
  const values = points.map((item) => item.close).filter(Number.isFinite);
  if (Number.isFinite(index.previousClose)) values.push(index.previousClose);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const color = isUp ? "#ad3032" : "#176b55";

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#ece6dc";
  context.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartHeight / 4) * i;
    if (i % 2 === 0) {
      context.fillStyle = "rgba(36, 36, 35, 0.035)";
      context.fillRect(padding.left, y, chartWidth, chartHeight / 4);
    }
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }

  const pointX = (index) => padding.left + (chartWidth * index) / Math.max(points.length - 1, 1);
  const pointY = (value) => padding.top + ((max - value) / range) * chartHeight;
  if (Number.isFinite(index.previousClose)) {
    const previousY = pointY(index.previousClose);
    context.strokeStyle = "rgba(36, 36, 35, 0.38)";
    context.setLineDash([6, 5]);
    context.beginPath();
    context.moveTo(padding.left, previousY);
    context.lineTo(width - padding.right, previousY);
    context.stroke();
    context.setLineDash([]);
  }

  context.strokeStyle = "#0f6df2";
  context.lineWidth = 3.4;
  context.beginPath();
  points.forEach((point, index) => {
    const x = pointX(index);
    const y = pointY(point.close);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  const volumeBase = height - padding.bottom;
  const maxVolume = Math.max(...points.map((point) => point.volume || 0), 1);
  points.forEach((point, index) => {
    const barHeight = ((point.volume || 0) / maxVolume) * Math.min(58, chartHeight * 0.2);
    context.fillStyle = "rgba(255, 48, 62, 0.55)";
    context.fillRect(pointX(index) - 2, volumeBase - barHeight, 3, barHeight);
  });

  const latest = points.at(-1);
  if (latest) {
    const x = pointX(points.length - 1);
    const y = pointY(latest.close);
    context.fillStyle = "#242423";
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = color;
    roundedRect(context, width - padding.right + 8, y - 18, 82, 32, 5);
    context.fill();
    context.fillStyle = "#fff";
    context.font = `${15 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    context.fillText(money(latest.close), width - padding.right + 16, y + 4);
  }

  if (Number.isFinite(index.previousClose)) {
    const y = pointY(index.previousClose);
    context.fillStyle = "#5d6470";
    roundedRect(context, width - padding.right + 8, y - 18, 82, 32, 5);
    context.fill();
    context.fillStyle = "#fff";
    context.font = `${15 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    context.fillText(money(index.previousClose), width - padding.right + 16, y + 4);
  }

  context.fillStyle = "#4d5661";
  context.font = `${13 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  for (let i = 0; i <= 3; i += 1) {
    const value = max - (range / 3) * i;
    const y = pointY(value);
    context.fillText(money(value), width - padding.right + 12, y + 4);
  }
  ["09", "10", "11", "12", "13"].forEach((label, index) => {
    const x = padding.left + (chartWidth / 4) * index;
    context.fillText(label, x, height - 12);
  });
}

function holdingMessage(stock, val, rev, inst, pnlRate) {
  if (!stock) return "目前沒有今日成交資料，先確認股票代號是否正確。";
  if (pnlRate <= -10 && inst?.total < 0) return "目前帳面虧損且法人偏賣超，先確認基本面與停損線，不適合只因跌深就加碼。";
  if (pnlRate <= -10) return "帳面虧損較明顯，先檢查基本面是否變差，不要只因為便宜就加碼。";
  if (rev?.yoy < -10) return "月營收年減幅度較大，適合暫停加碼並追蹤下一期財報。";
  if (pnlRate >= 10 && inst?.total > 0 && rev?.yoy >= 0) return "獲利、法人與營收方向同時偏正面，可續抱觀察，但仍要避免單檔比重過高。";
  if (val?.yieldRate >= 4 && rev?.yoy >= 0) return "殖利率與營收表現相對穩定，適合列入長期領息觀察。";
  if (pnlRate >= 20) return "已有明顯獲利，可以檢查是否超過原本配置比例。";
  return "維持追蹤成本、殖利率與營收趨勢，分批買進比一次押注更穩。";
}

function aiHoldingAdvice(stock, val, rev, inst, pnlRate) {
  if (!stock) return "資料不足，先確認代號是否正確。";
  const notes = [];
  if (Number.isFinite(pnlRate)) notes.push(pnlRate >= 0 ? `目前獲利 ${percent(pnlRate)}` : `目前虧損 ${percent(pnlRate)}`);
  if (Number.isFinite(inst?.total)) notes.push(`法人合計 ${formatShareFlow(inst.total)}`);
  if (Number.isFinite(rev?.yoy)) notes.push(`月營收年增 ${percent(rev.yoy)}`);

  if (pnlRate >= 15 && inst?.total > 0 && rev?.yoy >= 0) {
    return `${notes.join("，")}。整體偏強，可續抱並設定移動停利；若短線急漲，避免追高加碼。`;
  }
  if (pnlRate < 0 && inst?.total < 0 && rev?.yoy < 0) {
    return `${notes.join("，")}。價格、法人與基本面同時偏弱，建議先降低曝險或等待轉強訊號。`;
  }
  if (pnlRate < -8) {
    return `${notes.join("，")}。虧損已擴大，先檢查原始買進理由是否仍成立，並訂出明確停損或減碼條件。`;
  }
  if (inst?.total > 0 && rev?.yoy >= 0) {
    return `${notes.join("，")}。籌碼與營收偏正向，可列入續抱觀察；加碼仍以回檔或突破確認為主。`;
  }
  return `${notes.join("，") || "資料正在整理"}。目前訊號不夠一致，建議先觀察，不把單一資料當作買賣依據。`;
}

function institutionalText(inst) {
  if (!inst) return "尚未取得此股三大法人資料。";
  const leader = [
    ["外資", inst.foreign],
    ["投信", inst.trust],
    ["自營商", inst.dealer]
  ].sort((a, b) => Math.abs(b[1] || 0) - Math.abs(a[1] || 0))[0];
  return `${leader[0]}影響最大：${formatShareFlow(leader[1])}；合計 ${formatShareFlow(inst.total)}。`;
}

function renderHoldings(holdings) {
  els.holdingList.innerHTML = "";
  if (!holdings.length) {
    els.holdingList.innerHTML = '<p class="empty">把分類選成「我的存股」後加入股票，這裡會集中顯示市值、成本、損益與長期持有提醒。</p>';
    return;
  }

  holdings.forEach(({ item, stock, val, rev, signal }) => {
    const inst = getInstitutional(item.code);
    const cost = number(item.cost);
    const shares = number(item.shares);
    const marketValue = stock && shares ? stock.close * shares : null;
    const costValue = cost && shares ? cost * shares : null;
    const pnl = marketValue !== null && costValue ? marketValue - costValue : null;
    const pnlRate = pnl !== null && costValue ? (pnl / costValue) * 100 : null;
    const yearlyDividend = val?.yieldRate && marketValue ? marketValue * (val.yieldRate / 100) : null;
    const card = document.createElement("article");
    card.className = "holding-card";
    card.innerHTML = `
      <div class="holding-top">
        <div class="holding-title">
          <strong>${item.code} ${stock?.name || "查無名稱"}</strong>
          <span>${shares ? `${money(shares)} 股` : "未填股數"} ｜ 成本 ${cost ? money(cost) : "--"}</span>
        </div>
        <button class="delete" type="button" aria-label="刪除">×</button>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>目前市值</span><strong>${marketValue === null ? "--" : compactMoney(marketValue)}</strong></div>
        <div class="metric"><span>投入成本</span><strong>${costValue === null ? "--" : compactMoney(costValue)}</strong></div>
        <div class="metric"><span>帳面損益</span><strong class="${pnl >= 0 ? "price-up" : "price-down"}">${pnl === null ? "--" : compactMoney(pnl)}</strong></div>
        <div class="metric"><span>損益率</span><strong class="${pnlRate >= 0 ? "price-up" : "price-down"}">${pnlRate === null ? "--" : percent(pnlRate)}</strong></div>
        <div class="metric"><span>殖利率</span><strong>${val?.yieldRate ?? "--"}%</strong></div>
        <div class="metric"><span>估年股息</span><strong>${yearlyDividend === null ? "--" : compactMoney(yearlyDividend)}</strong></div>
        <div class="metric"><span>月營收年增</span><strong>${rev ? percent(rev.yoy) : "--"}</strong></div>
        <div class="metric"><span>法人合計</span><strong class="${inst ? inst.total >= 0 ? "price-up" : "price-down" : ""}">${inst ? formatShareFlow(inst.total) : "--"}</strong></div>
        <div class="metric"><span>狀態</span><strong>${signal.level}</strong></div>
      </div>
      <p class="holding-note">${aiHoldingAdvice(stock, val, rev, inst, pnlRate ?? 0)}</p>
    `;
    card.querySelector(".delete").addEventListener("click", () => {
      watchList = watchList.filter((entry) => entry.code !== item.code);
      saveWatchList();
      render();
    });
    card.addEventListener("click", (event) => {
      if (event.target.closest(".delete")) return;
      openStockDetail({ item, stock, val, rev, signal });
    });
    els.holdingList.append(card);
  });
}

function renderNews() {
  const items = (market.news?.length ? market.news : sampleNews).slice(0, 6);
  els.newsList.innerHTML = items.map((item) => `
    <a class="news-card" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.category || "市場")} ｜ ${escapeHtml(formatNewsDate(item.date))}</small>
      </div>
      <span class="pill source-pill">${escapeHtml(item.source || "鉅亨網")}</span>
    </a>
  `).join("");
}

function formatNewsDate(value) {
  if (!value) return "最新";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("zh-TW");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  const text = String(value || "");
  if (!/^https?:\/\//.test(text)) return "https://www.cnyes.com/";
  return escapeHtml(text);
}

function renderWatchList(tracked) {
  els.watchList.innerHTML = "";
  if (!tracked.length) {
    els.watchList.innerHTML = '<p class="empty">把分類選成「觀察名單」後加入股票，這裡會顯示短期觀察訊號。</p>';
    return;
  }

  tracked.forEach(({ item, stock, val, rev, signal }) => {
    const cost = number(item.cost);
    const shares = number(item.shares);
    const pnl = stock && cost && shares ? (stock.close - cost) * shares : null;
    const pnlRate = stock && cost ? ((stock.close - cost) / cost) * 100 : null;
    const card = document.createElement("article");
    card.className = "stock-card";
    card.innerHTML = `
      <div class="stock-top">
        <div class="stock-title">
          <strong>${item.code} ${stock?.name || "查無名稱"}</strong>
          <span class="pill ${signal.tone}">${signal.level}</span>
        </div>
        <button class="delete" type="button" aria-label="刪除">×</button>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>收盤價</span><strong>${stock ? money(stock.close) : "--"}</strong></div>
        <div class="metric"><span>今日漲跌</span><strong class="${stock?.change >= 0 ? "price-up" : "price-down"}">${stock ? money(stock.change) : "--"}</strong></div>
        <div class="metric"><span>持有損益</span><strong class="${pnl >= 0 ? "price-up" : "price-down"}">${pnl === null ? "--" : compactMoney(pnl)}</strong></div>
        <div class="metric"><span>損益率</span><strong class="${pnlRate >= 0 ? "price-up" : "price-down"}">${pnlRate === null ? "--" : percent(pnlRate)}</strong></div>
      </div>
      <p class="signal">${signal.text}</p>
      <p class="card-meta">本益比 ${val?.pe ?? "--"} ｜ 殖利率 ${val?.yieldRate ?? "--"}% ｜ 月營收年增 ${rev?.yoy ?? "--"}%</p>
    `;
    card.querySelector(".delete").addEventListener("click", () => {
      watchList = watchList.filter((entry) => entry.code !== item.code);
      saveWatchList();
      render();
    });
    card.addEventListener("click", (event) => {
      if (event.target.closest(".delete")) return;
      openStockDetail({ item, stock, val, rev, signal });
    });
    els.watchList.append(card);
  });
}

async function openStockDetail(entry) {
  const { item, stock, val, rev, signal } = entry;
  const inst = getInstitutional(item.code);
  const cost = number(item.cost);
  const shares = number(item.shares);
  const marketValue = stock && shares ? stock.close * shares : null;
  const costValue = cost && shares ? cost * shares : null;
  const pnl = marketValue !== null && costValue ? marketValue - costValue : null;
  const pnlRate = pnl !== null && costValue ? (pnl / costValue) * 100 : null;

  els.detailTitle.textContent = `${item.code} ${stock?.name || val?.name || rev?.name || ""}`;
  els.detailPrice.textContent = stock ? money(stock.close) : "--";
  els.detailPe.textContent = val?.pe ?? "--";
  els.detailRevenue.textContent = rev ? percent(rev.yoy) : "--";
  els.detailInstitutional.textContent = inst ? formatShareFlow(inst.total) : "--";
  els.detailInstitutional.className = inst ? inst.total >= 0 ? "price-up" : "price-down" : "";
  els.detailPlainText.textContent = `${signal.level}：${signal.text}`;
  els.detailHoldingText.textContent = cost && shares
    ? `持有 ${money(shares)} 股，投入 ${compactMoney(costValue)}，目前損益 ${pnl === null ? "--" : compactMoney(pnl)}，損益率 ${pnlRate === null ? "--" : percent(pnlRate)}。`
    : "尚未填入買進價與股數，可以先當作觀察標的。";
  els.detailInstitutionalText.textContent = institutionalText(inst);
  els.detailAiAdviceText.textContent = aiHoldingAdvice(stock, val, rev, inst, pnlRate ?? 0);
  els.detailChartStatus.textContent = "線圖讀取中";
  els.detailModal.hidden = false;

  const history = await fetchHistory(item.code);
  const first = history[0]?.close;
  const last = history.at(-1)?.close;
  const monthReturn = first && last ? ((last - first) / first) * 100 : null;
  els.detailMonthReturn.textContent = monthReturn === null ? "--" : percent(monthReturn);
  els.detailChartStatus.textContent = market.source === "TWSE" ? "證交所月成交資料" : "本機範例線圖";
  activeChartHistory = history;
  resizeChartCanvas();
  drawPriceChart(history);
}

function movingAverage(values, days) {
  return values.map((_, index) => {
    if (index + 1 < days) return null;
    const slice = values.slice(index + 1 - days, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / days;
  });
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawPriceChart(history, hoverIndex = null) {
  const canvas = els.priceChart;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 26, right: 72, bottom: 46, left: 68 };
  const prices = history.map((item) => item.close);
  const volumes = history.map((item) => item.volume || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const maxVolume = Math.max(...volumes, 1);
  const pricePad = (maxPrice - minPrice || maxPrice * 0.04 || 1) * 0.12;
  const chartMin = minPrice - pricePad;
  const chartMax = maxPrice + pricePad;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const volumeHeight = 62;
  const priceHeight = chartHeight - volumeHeight - 18;
  const priceRange = chartMax - chartMin || 1;
  const ma5 = movingAverage(prices, 5);
  const ma20 = movingAverage(prices, 20);
  const first = prices[0];
  const last = prices.at(-1);
  const highIndex = prices.indexOf(maxPrice);
  const lowIndex = prices.indexOf(minPrice);

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, width, height);
  context.save();
  roundedRect(context, padding.left, padding.top, chartWidth, chartHeight, 8);
  context.clip();

  context.strokeStyle = "#ece6dc";
  context.lineWidth = 1;
  context.fillStyle = "#6f6a61";
  context.font = "13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (priceHeight / 4) * i;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }

  const pointX = (index) => padding.left + (chartWidth * index) / Math.max(history.length - 1, 1);
  const pointY = (price) => padding.top + ((chartMax - price) / priceRange) * priceHeight;

  context.fillStyle = "#eef2f5";
  history.forEach((item, index) => {
    const barWidth = Math.max(4, chartWidth / history.length - 4);
    const barHeight = ((item.volume || 0) / maxVolume) * volumeHeight;
    const up = index === 0 ? item.close >= first : item.close >= history[index - 1].close;
    context.fillStyle = up ? "rgba(173, 48, 50, 0.22)" : "rgba(23, 107, 85, 0.22)";
    context.fillRect(pointX(index) - barWidth / 2, padding.top + priceHeight + 18 + (volumeHeight - barHeight), barWidth, barHeight);
  });

  function drawLine(values, color, widthSize, dashed = false) {
    context.strokeStyle = color;
    context.lineWidth = widthSize;
    context.setLineDash(dashed ? [6, 5] : []);
    context.beginPath();
    let started = false;
    values.forEach((value, index) => {
      if (!Number.isFinite(value)) return;
      const x = pointX(index);
      const y = pointY(value);
      if (!started) {
        context.moveTo(x, y);
        started = true;
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
    context.setLineDash([]);
  }

  const gradient = context.createLinearGradient(0, padding.top, 0, padding.top + priceHeight);
  gradient.addColorStop(0, last >= first ? "rgba(173, 48, 50, 0.18)" : "rgba(23, 107, 85, 0.16)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.beginPath();
  history.forEach((item, index) => {
    const x = pointX(index);
    const y = pointY(item.close);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.lineTo(pointX(history.length - 1), padding.top + priceHeight);
  context.lineTo(pointX(0), padding.top + priceHeight);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  drawLine(prices, last >= first ? "#ad3032" : "#176b55", 3);
  drawLine(ma5, "#2f5f8f", 2);
  drawLine(ma20, "#b57a22", 2, true);

  context.restore();

  context.strokeStyle = "#d8d0c4";
  context.strokeRect(padding.left, padding.top, chartWidth, chartHeight);
  context.fillStyle = "#6f6a61";
  context.font = "13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (priceHeight / 4) * i;
    const price = chartMax - (priceRange / 4) * i;
    const label = money(price);
    context.fillText(label, width - padding.right + 10, y + 4);
  }

  function drawMarker(index, label, color, above = true) {
    const x = pointX(index);
    const y = pointY(prices[index]);
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
    context.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    const text = `${label} ${money(prices[index])}`;
    const textWidth = context.measureText(text).width + 14;
    const boxX = Math.min(Math.max(x - textWidth / 2, padding.left), width - padding.right - textWidth);
    const boxY = above ? y - 34 : y + 12;
    context.fillStyle = "#242423";
    roundedRect(context, boxX, boxY, textWidth, 24, 6);
    context.fill();
    context.fillStyle = "#fff";
    context.fillText(text, boxX + 7, boxY + 16);
  }

  drawMarker(highIndex, "高", "#ad3032", true);
  drawMarker(lowIndex, "低", "#176b55", false);

  context.fillStyle = "#242423";
  context.font = "13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  const latestLabel = `最新 ${money(last)}`;
  context.fillText(latestLabel, width - padding.right - context.measureText(latestLabel).width, padding.top - 8);

  context.fillStyle = "#2f5f8f";
  context.fillText("MA5", padding.left, padding.top - 8);
  context.fillStyle = "#b57a22";
  context.fillText("MA20", padding.left + 46, padding.top - 8);

  context.fillStyle = "#242423";
  if (history[0]) context.fillText(history[0].date, padding.left, height - 12);
  if (history.at(-1)) {
    const text = history.at(-1).date;
    context.fillText(text, width - padding.right - context.measureText(text).width, height - 12);
  }

  if (hoverIndex !== null && history[hoverIndex]) {
    const item = history[hoverIndex];
    const x = pointX(hoverIndex);
    const y = pointY(item.close);
    context.strokeStyle = "rgba(36, 36, 35, 0.38)";
    context.setLineDash([4, 4]);
    context.beginPath();
    context.moveTo(x, padding.top);
    context.lineTo(x, padding.top + chartHeight);
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.setLineDash([]);

    const tooltip = [
      item.date,
      `收盤 ${money(item.close)}`,
      `成交量 ${compactMoney(item.volume || 0)}`
    ];
    context.font = "13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    const tipWidth = Math.max(...tooltip.map((text) => context.measureText(text).width)) + 22;
    const tipHeight = 70;
    const tipX = x + tipWidth + 16 > width ? x - tipWidth - 12 : x + 12;
    const tipY = Math.max(padding.top + 8, y - tipHeight / 2);
    context.fillStyle = "rgba(36, 36, 35, 0.92)";
    roundedRect(context, tipX, tipY, tipWidth, tipHeight, 8);
    context.fill();
    context.fillStyle = "#fff";
    tooltip.forEach((text, index) => {
      context.fillText(text, tipX + 11, tipY + 20 + index * 20);
    });
  }
}

function updateChartHover(event) {
  if (!activeChartHistory.length) return;
  const rect = els.priceChart.getBoundingClientRect();
  const scaleX = els.priceChart.width / rect.width;
  const x = (event.clientX - rect.left) * scaleX;
  const padding = { left: 68, right: 72 };
  const chartWidth = els.priceChart.width - padding.left - padding.right;
  const ratio = (x - padding.left) / chartWidth;
  const index = Math.round(ratio * (activeChartHistory.length - 1));
  if (index < 0 || index >= activeChartHistory.length) {
    drawPriceChart(activeChartHistory);
    return;
  }
  drawPriceChart(activeChartHistory, index);
}

function clearChartHover() {
  if (activeChartHistory.length) drawPriceChart(activeChartHistory);
}

function resizeChartCanvas() {
  const rect = els.priceChart.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(640, Math.round(rect.width * ratio));
  const height = Math.max(280, Math.round(rect.height * ratio));
  if (els.priceChart.width === width && els.priceChart.height === height) return;
  els.priceChart.width = width;
  els.priceChart.height = height;
}

function redrawChart() {
  if (activeChartHistory.length) {
    resizeChartCanvas();
    drawPriceChart(activeChartHistory);
  }
  if (latestTrendItems.length) drawTrendChart(latestTrendItems);
}

function toggleChartExpanded() {
  chartExpanded = !chartExpanded;
  document.body.classList.toggle("chart-expanded", chartExpanded);
  els.expandChart.textContent = chartExpanded ? "縮小" : "放大";
  window.setTimeout(redrawChart, 80);
}

function handleChartPointer(event) {
  event.preventDefault();
  updateChartHover(event);
}

function renderInsights(tracked, ranking) {
  const items = [];
  const strong = tracked.filter((entry) => entry.signal.tone === "good");
  const weak = tracked.filter((entry) => entry.signal.tone === "bad");

  if (strong.length) items.push(["可優先觀察", `${strong.map((entry) => entry.item.code).join("、")} 的量價與營收訊號相對健康。`]);
  if (weak.length) items.push(["需要小心", `${weak.map((entry) => entry.item.code).join("、")} 有價格或基本面警訊，先確認原因。`]);
  if (ranking[0]) items.push(["市場熱度", `今日成交金額最高是 ${ranking[0].code} ${ranking[0].name}，代表資金注意力集中。`]);
  items.push(["使用提醒", "這套工具只整理資料與風險，不保證獲利；真正下單前仍要看資金配置與停損。"]);

  els.insightList.innerHTML = items.map(([title, text]) => `
    <article class="insight-card">
      <strong>${title}</strong>
      <p class="signal">${text}</p>
    </article>
  `).join("");
}

function renderRanking(ranking) {
  els.rankingList.innerHTML = "";

  ranking.forEach((stock, index) => {
    const val = getValuation(stock.code);
    const rev = getRevenue(stock.code);
    const item = watchList.find((entry) => entry.code === stock.code) || {
      code: stock.code,
      cost: "",
      shares: "",
      type: "watch"
    };
    const signal = scoreStock(stock, val, rev);
    const row = document.createElement("article");
    row.className = "rank-row";
    row.innerHTML = `
      <div>
        <strong>${index + 1}. ${stock.code} ${stock.name}</strong>
        <small>成交金額 ${compactMoney(stock.value)} ｜ 成交量 ${compactMoney(stock.volume)}</small>
      </div>
      <span class="${stock.change >= 0 ? "price-up" : "price-down"}">${money(stock.close)} / ${money(stock.change)}</span>
    `;
    row.addEventListener("click", () => {
      openStockDetail({ item, stock, val, rev, signal });
    });
    els.rankingList.append(row);
  });
}

function renderFinance(tracked) {
  const rows = tracked.filter((entry) => entry.stock || entry.val || entry.rev);
  if (!rows.length) {
    els.financeList.innerHTML = '<p class="empty">加入股票後，這裡會顯示月營收、本益比、殖利率與股價淨值比。</p>';
    return;
  }

  els.financeList.innerHTML = rows.map(({ item, stock, val, rev }) => `
    <article class="finance-card">
      <strong>${item.code} ${stock?.name || val?.name || rev?.name || ""}</strong>
      <p class="signal">月營收 ${rev ? compactMoney(rev.amount * 1000) : "--"}，年增 ${rev ? percent(rev.yoy) : "--"}，月增 ${rev ? percent(rev.mom) : "--"}。</p>
      <small>本益比 ${val?.pe ?? "--"} ｜ 殖利率 ${val?.yieldRate ?? "--"}% ｜ 股價淨值比 ${val?.pb ?? "--"}</small>
    </article>
  `).join("");
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = els.symbol.value.trim();
  if (!/^\d{4,6}$/.test(code)) return;

  const existing = watchList.find((item) => item.code === code);
  if (existing) {
    existing.cost = els.cost.value;
    existing.shares = els.shares.value;
    existing.type = els.type.value;
  } else {
    watchList.push({ code, cost: els.cost.value, shares: els.shares.value, type: els.type.value });
  }

  saveWatchList();
  els.form.reset();
  render();
});

els.refresh.addEventListener("click", fetchMarket);
els.marketTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedMarket = tab.dataset.market;
    selectedGroup = "listed";
    renderMarketIndex();
  });
});
els.groupCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedGroup = card.dataset.group;
    renderMarketIndex();
  });
});
els.sectorThemeCard.addEventListener("click", openSectorDetail);
els.sectorThemeCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openSectorDetail();
  }
});
els.closeDetail.addEventListener("click", () => {
  if (chartExpanded) toggleChartExpanded();
  els.detailModal.hidden = true;
});
els.closeSector.addEventListener("click", () => {
  els.sectorModal.hidden = true;
});
els.detailModal.addEventListener("click", (event) => {
  if (event.target === els.detailModal) {
    if (chartExpanded) toggleChartExpanded();
    els.detailModal.hidden = true;
  }
});
els.sectorModal.addEventListener("click", (event) => {
  if (event.target === els.sectorModal) {
    els.sectorModal.hidden = true;
    return;
  }
  const row = event.target.closest(".sector-stock-row");
  if (!row) return;
  const stock = getStock(row.dataset.code);
  if (!stock) return;
  const item = watchList.find((entry) => entry.code === stock.code) || { code: stock.code, cost: "", shares: "", type: "watch" };
  const val = getValuation(stock.code);
  const rev = getRevenue(stock.code);
  els.sectorModal.hidden = true;
  openStockDetail({ item, stock, val, rev, signal: scoreStock(stock, val, rev) });
});
els.expandChart.addEventListener("click", toggleChartExpanded);
els.priceChart.addEventListener("mousemove", updateChartHover);
els.priceChart.addEventListener("pointermove", handleChartPointer);
els.priceChart.addEventListener("mouseleave", clearChartHover);
els.priceChart.addEventListener("pointerleave", clearChartHover);
window.addEventListener("resize", redrawChart);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (chartExpanded) {
      toggleChartExpanded();
      return;
    }
    els.detailModal.hidden = true;
    els.sectorModal.hidden = true;
  }
});
els.demo.addEventListener("click", () => {
  watchList = [
    { code: "2330", cost: "920", shares: "1000", type: "holding" },
    { code: "0050", cost: "180", shares: "1000", type: "holding" },
    { code: "2317", cost: "190", shares: "1000", type: "watch" }
  ];
  saveWatchList();
  render();
});

fetchMarket();
setInterval(fetchMarket, REFRESH_MS);
