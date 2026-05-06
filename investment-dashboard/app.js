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
  watchList: document.querySelector("#watchList"),
  holdingList: document.querySelector("#holdingList"),
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
  detailChartStatus: document.querySelector("#detailChartStatus"),
  expandChart: document.querySelector("#expandChartButton"),
  priceChart: document.querySelector("#priceChart"),
  detailPlainText: document.querySelector("#detailPlainText"),
  detailHoldingText: document.querySelector("#detailHoldingText")
};

let watchList = loadWatchList();
let market = {
  daily: [],
  valuation: [],
  revenue: [],
  index: null,
  usIndex: null,
  source: "sample"
};
const historyCache = new Map();
let activeChartHistory = [];
let chartExpanded = false;
let selectedMarket = "tw";
let selectedGroup = "listed";

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
      source: payload.realtimeSource === "Fugle" ? "TWSE + Fugle" : "TWSE"
    };
  } catch {
    market = {
      daily: sampleDaily,
      valuation: sampleValuation,
      revenue: sampleRevenue,
      index: sampleIndex,
      usIndex: sampleUsMarket,
      source: "sample"
    };
  }

  setStatus(market.source === "sample" ? "範例資料" : "已更新", new Date().toLocaleString("zh-TW"));
  render();
}

function normalizeUsMarket(payload) {
  if (!payload?.groups) return null;
  return {
    groups: normalizeIndexGroups(payload.groups),
    source: payload.source || "Yahoo"
  };
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
  const ranking = market.daily.slice().sort((a, b) => b.value - a.value).slice(0, 10);
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
  renderWatchList(watchOnly);
  renderInsights(tracked, ranking);
  renderRanking(ranking);
  renderFinance(tracked);
  renderMarketIndex();
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

function holdingMessage(stock, val, rev, pnlRate) {
  if (!stock) return "目前沒有今日成交資料，先確認股票代號是否正確。";
  if (pnlRate <= -10) return "帳面虧損較明顯，先檢查基本面是否變差，不要只因為便宜就加碼。";
  if (rev?.yoy < -10) return "月營收年減幅度較大，適合暫停加碼並追蹤下一期財報。";
  if (val?.yieldRate >= 4 && rev?.yoy >= 0) return "殖利率與營收表現相對穩定，適合列入長期領息觀察。";
  if (pnlRate >= 20) return "已有明顯獲利，可以檢查是否超過原本配置比例。";
  return "維持追蹤成本、殖利率與營收趨勢，分批買進比一次押注更穩。";
}

function renderHoldings(holdings) {
  els.holdingList.innerHTML = "";
  if (!holdings.length) {
    els.holdingList.innerHTML = '<p class="empty">把分類選成「我的存股」後加入股票，這裡會集中顯示市值、成本、損益與長期持有提醒。</p>';
    return;
  }

  holdings.forEach(({ item, stock, val, rev, signal }) => {
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
        <div class="metric"><span>狀態</span><strong>${signal.level}</strong></div>
      </div>
      <p class="holding-note">${holdingMessage(stock, val, rev, pnlRate ?? 0)}</p>
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
  els.detailPlainText.textContent = `${signal.level}：${signal.text}`;
  els.detailHoldingText.textContent = cost && shares
    ? `持有 ${money(shares)} 股，投入 ${compactMoney(costValue)}，目前損益 ${pnl === null ? "--" : compactMoney(pnl)}，損益率 ${pnlRate === null ? "--" : percent(pnlRate)}。`
    : "尚未填入買進價與股數，可以先當作觀察標的。";
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
  if (!activeChartHistory.length) return;
  resizeChartCanvas();
  drawPriceChart(activeChartHistory);
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
els.closeDetail.addEventListener("click", () => {
  if (chartExpanded) toggleChartExpanded();
  els.detailModal.hidden = true;
});
els.detailModal.addEventListener("click", (event) => {
  if (event.target === els.detailModal) {
    if (chartExpanded) toggleChartExpanded();
    els.detailModal.hidden = true;
  }
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
