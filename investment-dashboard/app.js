const WATCH_KEY = "plain-stock-dashboard-watchlist-v1";
const SELL_HISTORY_KEY = "plain-stock-dashboard-sell-history-v1";
const MARKET_REFRESH_FAST_MS = 5000;
const MARKET_REFRESH_SLOW_MS = 10 * 60000;
const QUOTE_REFRESH_MS = 5000;
const BROKERAGE_FEE_RATE = 0.001425;
const STOCK_TRANSACTION_TAX_RATE = 0.003;

const endpoints = {
  bundle: getMarketEndpoint()
};

function getMarketEndpoint() {
  const host = window.location.hostname;
  if (!host) return "https://easyinvesttw.web.app/api/dashboard-data";
  if (host === "localhost" || host === "127.0.0.1") return "https://easyinvesttw.web.app/api/dashboard-data";
  if (host.endsWith("web.app") || host.endsWith("firebaseapp.com")) return "/api/dashboard-data";
  return "/.netlify/functions/market";
}

const els = {
  form: document.querySelector("#watchForm"),
  symbol: document.querySelector("#symbolInput"),
  cost: document.querySelector("#costInput"),
  shares: document.querySelector("#sharesInput"),
  type: document.querySelector("#typeInput"),
  refresh: document.querySelector("#refreshButton"),
  demo: document.querySelector("#demoButton"),
  authForm: document.querySelector("#authForm"),
  authName: document.querySelector("#authNameInput"),
  authEmail: document.querySelector("#authEmailInput"),
  authPassword: document.querySelector("#authPasswordInput"),
  authTitle: document.querySelector("#authTitle"),
  authStatus: document.querySelector("#authStatus"),
  authSession: document.querySelector("#authSession"),
  currentAccountName: document.querySelector("#currentAccountName"),
  currentAccountEmail: document.querySelector("#currentAccountEmail"),
  switchUser: document.querySelector("#switchUserButton"),
  register: document.querySelector("#registerButton"),
  logout: document.querySelector("#logoutButton"),
  dataStatus: document.querySelector("#dataStatus"),
  updatedAt: document.querySelector("#updatedAt"),
  watchCount: document.querySelector("#watchCount"),
  holdingValue: document.querySelector("#holdingValue"),
  topHotStock: document.querySelector("#topHotStock"),
  riskCount: document.querySelector("#riskCount"),
  sourceLabel: document.querySelector("#sourceLabel"),
  beginnerMarketTone: document.querySelector("#beginnerMarketTone"),
  beginnerMarketText: document.querySelector("#beginnerMarketText"),
  beginnerTrendText: document.querySelector("#beginnerTrendText"),
  beginnerRiskText: document.querySelector("#beginnerRiskText"),
  beginnerNextText: document.querySelector("#beginnerNextText"),
  beginnerNextNote: document.querySelector("#beginnerNextNote"),
  todayConclusion: document.querySelector("#todayConclusion"),
  marketScoreTitle: document.querySelector("#marketScoreTitle"),
  marketScoreText: document.querySelector("#marketScoreText"),
  marketScoreNumber: document.querySelector("#marketScoreNumber"),
  marketScoreList: document.querySelector("#marketScoreList"),
  dataQualityList: document.querySelector("#dataQualityList"),
  portfolioHealthList: document.querySelector("#portfolioHealthList"),
  preflightList: document.querySelector("#preflightList"),
  disciplineList: document.querySelector("#disciplineList"),
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
  marketChangePoints: document.querySelector("#marketChangePoints"),
  marketChangePercent: document.querySelector("#marketChangePercent"),
  marketRange: document.querySelector("#marketRange"),
  marketAmplitude: document.querySelector("#marketAmplitude"),
  marketGap: document.querySelector("#marketGap"),
  marketIntradayPosition: document.querySelector("#marketIntradayPosition"),
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
  holdingOverview: document.querySelector("#holdingOverview"),
  holdingList: document.querySelector("#holdingList"),
  holdingTradeSummary: document.querySelector("#holdingTradeSummary"),
  realizedOverview: document.querySelector("#realizedOverview"),
  sellHistoryList: document.querySelector("#sellHistoryList"),
  newsList: document.querySelector("#newsList"),
  holdingNewsList: document.querySelector("#holdingNewsList"),
  rankingList: document.querySelector("#rankingList"),
  financeList: document.querySelector("#financeList"),
  insightList: document.querySelector("#insightList"),
  detailModal: document.querySelector("#detailModal"),
  closeDetail: document.querySelector("#closeDetailButton"),
  detailTitle: document.querySelector("#detailTitle"),
  detailPrice: document.querySelector("#detailPrice"),
  detailMonthReturn: document.querySelector("#detailMonthReturn"),
  detailPe: document.querySelector("#detailPe"),
  detailRevenueMonth: document.querySelector("#detailRevenueMonth"),
  detailRevenueAmount: document.querySelector("#detailRevenueAmount"),
  detailRevenueMom: document.querySelector("#detailRevenueMom"),
  detailRevenue: document.querySelector("#detailRevenue"),
  detailInstitutional: document.querySelector("#detailInstitutional"),
  detailChartStatus: document.querySelector("#detailChartStatus"),
  expandChart: document.querySelector("#expandChartButton"),
  priceChart: document.querySelector("#priceChart"),
  detailPlainText: document.querySelector("#detailPlainText"),
  detailHoldingText: document.querySelector("#detailHoldingText"),
  detailInstitutionalText: document.querySelector("#detailInstitutionalText"),
  detailAiAdviceText: document.querySelector("#detailAiAdviceText"),
  detailConclusionList: document.querySelector("#detailConclusionList"),
  sectorModal: document.querySelector("#sectorModal"),
  closeSector: document.querySelector("#closeSectorButton"),
  sectorDetailTitle: document.querySelector("#sectorDetailTitle"),
  sectorDetailSummary: document.querySelector("#sectorDetailSummary"),
  sectorDetailList: document.querySelector("#sectorDetailList"),
  trendChart: document.querySelector("#trendChart"),
  trendChartStats: document.querySelector("#trendChartStats"),
  trendGuide: document.querySelector("#trendGuide"),
  trendSummary: document.querySelector("#trendSummary"),
  trendList: document.querySelector("#trendList"),
  trendAiTitle: document.querySelector("#trendAiTitle"),
  trendAiText: document.querySelector("#trendAiText"),
  trendStatus: document.querySelector("#trendStatus"),
  smallCapList: document.querySelector("#smallCapList"),
  smallCapAiTitle: document.querySelector("#smallCapAiTitle"),
  smallCapAiText: document.querySelector("#smallCapAiText"),
  smallCapStatus: document.querySelector("#smallCapStatus"),
  midCapList: document.querySelector("#midCapList"),
  midCapAiTitle: document.querySelector("#midCapAiTitle"),
  midCapAiText: document.querySelector("#midCapAiText"),
  midCapStatus: document.querySelector("#midCapStatus"),
  largeCapList: document.querySelector("#largeCapList"),
  largeCapAiTitle: document.querySelector("#largeCapAiTitle"),
  largeCapAiText: document.querySelector("#largeCapAiText"),
  largeCapStatus: document.querySelector("#largeCapStatus"),
  tierTabs: document.querySelectorAll(".tier-tab"),
  tierPanels: document.querySelectorAll(".tier-panel"),
  briefCards: document.querySelectorAll(".brief-card"),
  todayPnlCard: document.querySelector(".today-pnl"),
  todayPnlAmount: document.querySelector("#todayPnlAmount"),
  todayPnlPercent: document.querySelector("#todayPnlPercent"),
  todayPnlCount: document.querySelector("#todayPnlCount"),
  todayPnlMarketValue: document.querySelector("#todayPnlMarketValue"),
  todayPnlAccumulated: document.querySelector("#todayPnlAccumulated"),
  todayPnlNote: document.querySelector("#todayPnlNote"),
  todayPnlUpdatedAt: document.querySelector("#todayPnlUpdatedAt"),
  viewModeToggle: document.querySelector("#viewModeToggle"),
  viewModeLabel: document.querySelector("#viewModeLabel"),
  themeToggle: document.querySelector("#themeToggle"),
  themeLabel: document.querySelector("#themeLabel"),
  googleSignIn: document.querySelector("#googleSignInButton"),
  authDivider: document.querySelector(".auth-divider"),
  quickAddForm: document.querySelector("#quickAddForm"),
  quickSymbolInput: document.querySelector("#quickSymbolInput"),
  quickCostInput: document.querySelector("#quickCostInput"),
  quickSharesInput: document.querySelector("#quickSharesInput"),
  quickTypeInput: document.querySelector("#quickTypeInput"),
  searchResults: document.querySelector("#searchResults"),
  searchResultsList: document.querySelector(".search-results-list"),
  quickAddedStocks: document.querySelector("#quickAddedStocks")
};

const VIEW_MODE_KEY = "easyinvest-view-mode";
const THEME_KEY = "easyinvest-theme";
const RANKING_LIMIT = 20;
const TREND_STOCK_LIMIT = 32;
const TREND_HISTORY_DAYS = 6;
const TREND_PERIOD_LABEL = "近一週";
const TREND_DATA_VERSION = "twse-history-v2";

let watchList = [];
let sellHistory = [];
let cloudAuth = null;
let cloudDb = null;
let currentUser = null;
let cloudEnabled = false;
let loadingCloudData = false;
let market = {
  daily: [],
  valuation: [],
  revenue: [],
  index: null,
  usIndex: null,
  institutional: null,
  news: [],
  source: "sample",
  updatedAt: null
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
let selectedSmallCapCode = "";

const TIER_CONFIG = {
  small: { label: "小型股", min: 0, max: 100, listEl: "smallCapList", titleEl: "smallCapAiTitle", textEl: "smallCapAiText", statusEl: "smallCapStatus", emptyText: "百元以下" },
  mid:   { label: "中型股", min: 100, max: 300, listEl: "midCapList", titleEl: "midCapAiTitle", textEl: "midCapAiText", statusEl: "midCapStatus", emptyText: "100–300 元" },
  large: { label: "大型股", min: 300, max: Infinity, listEl: "largeCapList", titleEl: "largeCapAiTitle", textEl: "largeCapAiText", statusEl: "largeCapStatus", emptyText: "300 元以上" }
};
const tierState = {
  small: { requestKey: "", items: [], selected: "" },
  mid:   { requestKey: "", items: [], selected: "" },
  large: { requestKey: "", items: [], selected: "" }
};
let refreshTimer = null;
let quoteRefreshTimer = null;
let marketFetchInFlight = false;
let quoteFetchInFlight = false;

const sampleDaily = [
  row("2330", "台積電", 108500000, 104800000000, 968, 984, 960, 981, 12, 64000),
  row("2317", "鴻海", 86500000, 17860000000, 206, 210, 203, 208, 3, 42000),
  row("2454", "聯發科", 9300000, 11800000000, 1250, 1280, 1240, 1275, 18, 12000),
  row("2308", "台達電", 17600000, 7200000000, 406, 416, 402, 410, 5, 18000),
  row("2881", "富邦金", 42000000, 3800000000, 90, 91.2, 89.4, 90.8, 0.7, 15000),
  row("0050", "元大台灣50", 22000000, 4200000000, 189.2, 191, 188.8, 190.4, 1.4, 9000),
  row("2382", "廣達", 32800000, 8900000000, 281, 289, 278, 287.5, 6.5, 22500),
  row("3231", "緯創", 41200000, 6200000000, 148, 153.5, 146.5, 151, 4, 31800),
  row("2303", "聯電", 76500000, 4100000000, 53.1, 54.2, 52.7, 53.8, 0.6, 28600),
  row("2412", "中華電", 18200000, 2350000000, 128, 129, 127.5, 128.5, 0.5, 8200),
  row("2891", "中信金", 68000000, 2760000000, 40.1, 41.2, 39.9, 40.7, 0.55, 24400),
  row("2882", "國泰金", 35600000, 2480000000, 68.2, 70.1, 67.8, 69.7, 1.4, 17200),
  row("3711", "日月光投控", 14600000, 2260000000, 153, 156.5, 151.5, 155, 2.5, 9800),
  row("6669", "緯穎", 980000, 2180000000, 2190, 2265, 2160, 2240, 55, 3200),
  row("3017", "奇鋐", 3100000, 2100000000, 665, 690, 658, 682, 22, 7600),
  row("3661", "世芯-KY", 620000, 2050000000, 3270, 3355, 3220, 3315, 75, 4100),
  row("2357", "華碩", 3200000, 1680000000, 520, 531, 516, 526, 8, 5300),
  row("2603", "長榮", 9600000, 1620000000, 166, 170, 164, 168.5, 2, 9100),
  row("2618", "長榮航", 39200000, 1380000000, 34.6, 35.7, 34.2, 35.2, 0.55, 18500),
  row("1303", "南亞", 15800000, 1120000000, 70.1, 71.5, 69.8, 70.9, 0.7, 7400)
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

function loadSellHistory() {
  try {
    return JSON.parse(localStorage.getItem(SELL_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

async function saveWatchList() {
  if (cloudEnabled && currentUser) {
    try {
      await cloudDb
        .collection("watchlists")
        .doc(currentUser.uid)
        .set({
          email: currentUser.email,
          items: watchList,
          sellHistory,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      setAuthStatus(`已登入：${currentUser.email}，持股資料已同步 Firebase。`);
    } catch (error) {
      setAuthStatus(`雲端同步失敗：${error.message}`, true);
    }
    return;
  }
  localStorage.setItem(WATCH_KEY, JSON.stringify(watchList));
  localStorage.setItem(SELL_HISTORY_KEY, JSON.stringify(sellHistory));
}

function getCloudConfig() {
  const config = window.EASYINVEST_FIREBASE_CONFIG || {};
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  const ready = required.every((key) => config[key] && !String(config[key]).includes("PASTE_"));
  return { config, ready };
}

function setAuthStatus(message, isError = false) {
  if (!els.authStatus) return;
  els.authStatus.textContent = message;
  els.authStatus.className = isError ? "auth-error" : "";
}

function updateAuthUi() {
  if (!els.authTitle) return;
  if (!cloudEnabled) {
    els.authTitle.textContent = "尚未啟用跨裝置同步";
    setAuthStatus("請先設定 Firebase config，完成後即可跨手機/電腦登入同步。", true);
    if (els.authSession) els.authSession.hidden = true;
    if (els.googleSignIn) els.googleSignIn.hidden = false;
    if (els.authDivider) els.authDivider.hidden = false;
    if (els.authForm) els.authForm.hidden = false;
    return;
  }
  if (currentUser) {
    els.authTitle.textContent = `已登入：${currentUser.displayName || currentUser.email}`;
    setAuthStatus("雲端同步已啟用。新增、刪除或修改持股後會同步到你的帳號。");
    if (els.authSession) els.authSession.hidden = false;
    if (els.currentAccountName) els.currentAccountName.textContent = currentUser.displayName || "未命名使用者";
    if (els.currentAccountEmail) els.currentAccountEmail.textContent = currentUser.email || "沒有 Email";
    if (els.googleSignIn) els.googleSignIn.hidden = true;
    if (els.authDivider) els.authDivider.hidden = true;
    if (els.authForm) els.authForm.hidden = true;
  } else {
    els.authTitle.textContent = "雲端帳號登入";
    setAuthStatus("請註冊或登入，同一帳號可在手機與電腦查詢同一份資料。");
    if (els.authSession) els.authSession.hidden = true;
    if (els.currentAccountName) els.currentAccountName.textContent = "--";
    if (els.currentAccountEmail) els.currentAccountEmail.textContent = "--";
    if (els.googleSignIn) els.googleSignIn.hidden = false;
    if (els.authDivider) els.authDivider.hidden = false;
    if (els.authForm) els.authForm.hidden = false;
  }
}

async function loadCloudWatchList() {
  if (!cloudEnabled || !currentUser) {
    watchList = loadWatchList();
    sellHistory = loadSellHistory();
    render();
    return;
  }
  loadingCloudData = true;
  try {
    const snapshot = await cloudDb.collection("watchlists").doc(currentUser.uid).get();
    const data = snapshot.data();
    if (snapshot.exists) {
      watchList = Array.isArray(data?.items) ? data.items : [];
      sellHistory = Array.isArray(data?.sellHistory) ? data.sellHistory : [];
    } else {
      watchList = loadWatchList();
      sellHistory = loadSellHistory();
      await saveWatchList();
    }
    setAuthStatus(`已登入：${currentUser.email}，已讀取 Firebase 雲端持股資料。`);
  } catch (error) {
    setAuthStatus(`讀取雲端資料失敗：${error.message}`, true);
    watchList = [];
    sellHistory = [];
  }
  loadingCloudData = false;
  render();
  fetchMarket();
}

async function initCloudAuth() {
  const config = getCloudConfig();
  if (!config.ready || !window.firebase) {
    cloudEnabled = false;
    watchList = loadWatchList();
    sellHistory = loadSellHistory();
    updateAuthUi();
    return;
  }
  cloudEnabled = true;
  if (!firebase.apps.length) firebase.initializeApp(config.config);
  cloudAuth = firebase.auth();
  cloudDb = firebase.firestore();
  try {
    await cloudAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  } catch (error) {
    setAuthStatus(`登入狀態保存設定失敗：${error.message}`, true);
  }
  await new Promise((resolve) => {
    let firstRun = true;
    cloudAuth.onAuthStateChanged(async (user) => {
      currentUser = user || null;
      updateAuthUi();
      if (!loadingCloudData) await loadCloudWatchList();
      if (firstRun) {
        firstRun = false;
        resolve();
      }
    });
  });
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

function signedMoney(value) {
  if (!Number.isFinite(value)) return "--";
  return `${value > 0 ? "+" : ""}${money(value)}`;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "--";
  return `${signedMoney(value)} 元`;
}

function transactionFee(value) {
  return Number.isFinite(value) && value > 0 ? value * BROKERAGE_FEE_RATE : 0;
}

function stockTransactionTax(value) {
  return Number.isFinite(value) && value > 0 ? value * STOCK_TRANSACTION_TAX_RATE : 0;
}

function tradeCostBreakdown({ buyValue = 0, sellValue = 0 } = {}) {
  const buyFee = transactionFee(buyValue);
  const sellFee = transactionFee(sellValue);
  const securitiesTax = stockTransactionTax(sellValue);
  return {
    buyFee,
    sellFee,
    securitiesTax,
    total: buyFee + sellFee + securitiesTax
  };
}

function netTradeMetrics({ buyValue, sellValue, grossProfit }) {
  const costs = tradeCostBreakdown({ buyValue, sellValue });
  const netProfit = Number.isFinite(grossProfit) ? grossProfit - costs.total : null;
  const cashCost = Number.isFinite(buyValue) && buyValue > 0 ? buyValue + costs.buyFee : null;
  const netProfitRate = netProfit !== null && cashCost ? (netProfit / cashCost) * 100 : null;
  return {
    ...costs,
    netProfit,
    netProfitRate
  };
}

function tradingCostNote() {
  return `稅後純盈虧以手續費 0.1425%、股票賣出證交稅 0.3%估算，未含券商折扣與最低手續費。`;
}

function stockPriceLabel(stock) {
  return stock?.realtime ? "即時價" : "收盤";
}

function stockQuoteStamp(stock) {
  if (!stock) return "資料未連線";
  const source = stock.source ? String(stock.source) : stock.realtime ? "即時資料" : "收盤資料";
  const timestamp = timestampMs(stock.quoteTime);
  const time = timestamp ? formatUpdateTime(timestamp) : "";
  const lagMs = timestamp ? Date.now() - timestamp : null;
  const lagText = isTwMarketOpen() && Number.isFinite(lagMs) && lagMs > 120000
    ? `（延遲 ${Math.max(1, Math.round(lagMs / 60000))} 分）`
    : "";
  return time ? `${source} ｜ ${time}${lagText}` : source;
}

function timestampMs(value) {
  if (!value) return null;
  if (typeof value === "number") return value > 10000000000000 ? value / 1000 : value;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function stockTodayChange(stock) {
  if (!stock) return null;
  const close = number(stock.close);
  const previousClose = number(stock.previousClose);
  const change = number(stock.change);
  if (stock.realtime && Number.isFinite(change)) return change;
  if (Number.isFinite(close) && Number.isFinite(previousClose)) return close - previousClose;
  return Number.isFinite(change) ? change : null;
}

function stockTodayChangePercent(stock) {
  if (!stock) return null;
  const close = number(stock.close);
  const previousClose = number(stock.previousClose);
  const changePercent = number(stock.changePercent);
  if (stock.realtime && Number.isFinite(changePercent)) return changePercent;
  if (Number.isFinite(close) && Number.isFinite(previousClose) && previousClose !== 0) {
    return ((close - previousClose) / previousClose) * 100;
  }
  return Number.isFinite(changePercent) ? changePercent : null;
}

function priceTone(value) {
  return value > 0 ? "price-up" : value < 0 ? "price-down" : "";
}

function pnlText(value, positiveLabel, negativeLabel, flatLabel, formatter = money) {
  if (!Number.isFinite(value)) return "--";
  const label = value > 0 ? positiveLabel : value < 0 ? negativeLabel : flatLabel;
  const sign = value > 0 ? "+" : "";
  return `${label} ${sign}${formatter(value)}`;
}

function stockDisplayName(item) {
  const stock = getStock(item.code);
  return stock?.name ? `${stock.name} ${item.code}` : item.name ? `${item.name} ${item.code}` : item.code;
}

function roundPrice(value) {
  return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : "";
}

function normalizeLot(lot, fallback = {}) {
  const cost = number(lot?.cost ?? fallback.cost);
  const shares = number(lot?.shares ?? fallback.shares);
  if (!Number.isFinite(cost) || cost <= 0 || !Number.isFinite(shares) || shares <= 0) return null;
  return {
    id: lot?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cost,
    shares,
    boughtAt: lot?.boughtAt || fallback.boughtAt || new Date().toISOString()
  };
}

function holdingLots(item) {
  const storedLots = Array.isArray(item?.lots)
    ? item.lots.map((lot) => normalizeLot(lot)).filter(Boolean)
    : [];
  if (storedLots.length) return storedLots;
  const legacyLot = normalizeLot(item, { boughtAt: item?.boughtAt || item?.updatedAt || item?.createdAt });
  return legacyLot ? [legacyLot] : [];
}

function holdingShares(item) {
  const lots = holdingLots(item);
  if (lots.length) return lots.reduce((sum, lot) => sum + lot.shares, 0);
  return number(item?.shares);
}

function holdingCostValue(item) {
  const lots = holdingLots(item);
  if (lots.length) return lots.reduce((sum, lot) => sum + lot.cost * lot.shares, 0);
  const cost = number(item?.cost);
  const shares = number(item?.shares);
  return Number.isFinite(cost) && Number.isFinite(shares) ? cost * shares : null;
}

function averageHoldingCost(item) {
  const shares = holdingShares(item);
  const costValue = holdingCostValue(item);
  return Number.isFinite(shares) && shares > 0 && Number.isFinite(costValue) ? costValue / shares : number(item?.cost);
}

function syncHoldingTotals(item) {
  const lots = holdingLots(item);
  if (!lots.length) return item;
  const shares = lots.reduce((sum, lot) => sum + lot.shares, 0);
  const costValue = lots.reduce((sum, lot) => sum + lot.cost * lot.shares, 0);
  item.lots = lots;
  item.shares = shares ? String(roundPrice(shares)) : "";
  item.cost = shares ? String(roundPrice(costValue / shares)) : "";
  return item;
}

function createBuyLot(cost, shares) {
  return normalizeLot({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cost,
    shares,
    boughtAt: new Date().toISOString()
  });
}

function upsertWatchItem({ code, cost, shares, type }) {
  const cleanType = type || "holding";
  const buyCost = number(cost);
  const buyShares = number(shares);
  const existing = watchList.find((item) => item.code === code);
  const canCreateLot = cleanType === "holding"
    && Number.isFinite(buyCost) && buyCost > 0
    && Number.isFinite(buyShares) && buyShares > 0;

  if (existing) {
    existing.type = cleanType;
    if (canCreateLot) {
      existing.lots = holdingLots(existing);
      existing.lots.push(createBuyLot(buyCost, buyShares));
      syncHoldingTotals(existing);
    } else {
      existing.cost = cost;
      existing.shares = shares;
      if (cleanType !== "holding") delete existing.lots;
    }
    return existing;
  }

  const item = { code, cost, shares, type: cleanType };
  if (canCreateLot) {
    item.lots = [createBuyLot(buyCost, buyShares)];
    syncHoldingTotals(item);
  }
  watchList.push(item);
  return item;
}

function revenueAmountText(rev) {
  return Number.isFinite(rev?.amount) ? compactMoney(rev.amount * 1000) : "--";
}

function revenueMonthText(rev) {
  const value = rev?.month;
  if (!value) return "--";
  const text = String(value).trim();
  const compactRoc = text.match(/^(\d{3})(\d{2})$/);
  if (compactRoc) return `${Number(compactRoc[1]) + 1911}/${compactRoc[2]}`;
  const compact = text.match(/^(\d{4})(\d{2})$/);
  if (compact) return `${compact[1]}/${compact[2]}`;
  const roc = text.match(/^(\d{2,3})[/-](\d{1,2})/);
  if (roc) return `${Number(roc[1]) + 1911}/${String(Number(roc[2])).padStart(2, "0")}`;
  const western = text.match(/^(\d{4})[/-](\d{1,2})/);
  if (western) return `${western[1]}/${String(Number(western[2])).padStart(2, "0")}`;
  return text;
}

function revenueSummaryText(rev) {
  if (!rev) return "月營收資料尚未取得。";
  return `${revenueMonthText(rev)} 月營收 ${revenueAmountText(rev)}，月增 ${percent(rev.mom)}，年增 ${percent(rev.yoy)}。`;
}

function rocDateToText(value) {
  const parts = String(value).split("/");
  if (parts.length !== 3) return String(value);
  return `${Number(parts[0]) + 1911}/${parts[1]}/${parts[2]}`;
}

function normalizeDaily(raw) {
  return raw.map((item) => {
    const close = number(item.ClosingPrice ?? item["收盤價"] ?? item.close ?? item.closePrice ?? item.lastPrice);
    const rawChange = number(item.Change ?? item["漲跌價差"] ?? item.change);
    const previousClose = number(item.PreviousClose ?? item.previousClose ?? item.referencePrice ?? item.previousPrice)
      ?? (Number.isFinite(close) && Number.isFinite(rawChange) ? close - rawChange : null);
    const change = rawChange ?? (Number.isFinite(close) && Number.isFinite(previousClose) ? close - previousClose : null);
    const changePercent = number(item.ChangePercent ?? item.changePercent) ?? (Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null);
    return {
      code: item.Code || item["證券代號"] || item.code || item.symbol,
      name: item.Name || item["證券名稱"] || item.name || item.companyName,
      volume: number(item.TradeVolume ?? item["成交股數"] ?? item.volume ?? item.tradeVolume),
      value: number(item.TradeValue ?? item["成交金額"] ?? item.value ?? item.tradeValue ?? item.turnover),
      open: number(item.OpeningPrice ?? item["開盤價"] ?? item.open ?? item.openPrice),
      high: number(item.HighestPrice ?? item["最高價"] ?? item.high ?? item.highPrice),
      low: number(item.LowestPrice ?? item["最低價"] ?? item.low ?? item.lowPrice),
      close,
      previousClose,
      change,
      changePercent,
      trades: number(item.Transaction ?? item["成交筆數"] ?? item.trades ?? item.transaction),
      source: item.Source || item.source,
      realtime: item.realtime || item.Source === "Fugle" || item.Source === "TWSE_REALTIME" || item.source === "Fugle" || item.source === "TWSE_REALTIME"
    };
  }).filter((item) => item.code && item.name && Number.isFinite(item.close));
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
    month: item["資料年月"] || item.revenue_month || item.month || item["出表日期"],
    amount: number(item["營業收入-當月營收"] || item.revenue_current_month || item.amount),
    yoy: number(item["營業收入-去年同月增減(%)"] || item["去年同月增減(%)"] || item.yoy),
    mom: number(item["營業收入-上月比較增減(%)"] || item["上月比較增減(%)"] || item.mom)
  })).filter((item) => item.code);
}

function normalizeRealtimeQuotes(raw) {
  return raw.map((item) => {
    const close = number(item.lastPrice ?? item.closePrice);
    const previousClose = number(item.previousClose);
    return {
      code: item.symbol || item.code,
      name: item.name,
      open: number(item.openPrice),
      high: number(item.highPrice),
      low: number(item.lowPrice),
      close,
      previousClose,
      change: number(item.change) ?? (Number.isFinite(close) && Number.isFinite(previousClose) ? close - previousClose : null),
      changePercent: number(item.changePercent) ?? (Number.isFinite(close) && Number.isFinite(previousClose) && previousClose ? ((close - previousClose) / previousClose) * 100 : null),
      volume: number(item.total?.tradeVolume || item.tradeVolume),
      value: number(item.total?.tradeValue || item.tradeValue),
      trades: number(item.total?.transaction || item.transaction),
      realtime: true,
      source: item.source || "Fugle",
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

function isValidMarketIndex(index) {
  return ["Fugle", "TWSE", "Yahoo", "TWSE + Yahoo", "Yahoo + TWSE"].includes(index?.source) && Number.isFinite(index.index);
}

function marketIndexSourceText(source) {
  if (source === "Fugle") return "Fugle 即時指數資料";
  if (source === "TWSE + Yahoo") return "TWSE 即時指數 + Yahoo 盤中線圖";
  if (source === "Yahoo + TWSE") return "Yahoo 盤中指數 + TWSE 分類資料";
  if (source === "Yahoo") return "Yahoo 公開行情";
  if (source === "TWSE") return "TWSE 即時指數資料";
  return "非即時或範例資料";
}

function quoteSourceText(source = "") {
  if (source.includes("Fugle")) return "個股：Fugle 即時報價";
  if (source.includes("Yahoo")) return "個股：Yahoo 盤中報價，Fugle 目前未回傳";
  if (source.includes("TWSE")) return "個股：TWSE 公開資料，非逐筆即時";
  return "個股：等待公開資料或即時報價";
}

function preferLocalStockName(currentName, quoteName, code) {
  if (/[\u4e00-\u9fff]/.test(String(currentName || ""))) return currentName;
  if (/[\u4e00-\u9fff]/.test(String(quoteName || ""))) return quoteName;
  return currentName || quoteName || code;
}

function mergeRealtimeQuotes(daily, realtime) {
  if (!realtime.length) return daily;
  const map = new Map(daily.map((item) => [item.code, item]));

  realtime.forEach((quote) => {
    const current = map.get(quote.code) || {};
    map.set(quote.code, {
      ...current,
      ...quote,
      name: preferLocalStockName(current.name, quote.name, quote.code),
      volume: quote.volume || current.volume,
      value: quote.value || current.value,
      trades: quote.trades || current.trades
    });
  });

  return Array.from(map.values());
}

function isTwMarketOpen(date = new Date()) {
  const taipeiParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const get = (type) => taipeiParts.find((part) => part.type === type)?.value;
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const minutes = hour * 60 + minute;
  return minutes >= 9 * 60 && minutes <= 13 * 60 + 35;
}

function currentRefreshInterval() {
  return isTwMarketOpen() ? MARKET_REFRESH_FAST_MS : MARKET_REFRESH_SLOW_MS;
}

function scheduleMarketRefresh() {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(fetchMarket, currentRefreshInterval());
}

function scheduleQuoteRefresh() {
  window.clearTimeout(quoteRefreshTimer);
  if (!isTwMarketOpen() || !watchList.length) return;
  quoteRefreshTimer = window.setTimeout(fetchRealtimeQuotes, QUOTE_REFRESH_MS);
}

async function fetchRealtimeQuotes() {
  if (document.hidden || quoteFetchInFlight || !watchList.length) return;
  quoteFetchInFlight = true;
  try {
    const symbols = watchList.map((item) => item.code).join(",");
    const response = await fetch(`${endpoints.bundle}?fast=quotes&symbols=${encodeURIComponent(symbols)}&_=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Realtime quotes unavailable");
    const payload = await response.json();
    const realtime = normalizeRealtimeQuotes(payload.realtime || []);
    if (realtime.length) {
      market.daily = mergeRealtimeQuotes(market.daily || [], realtime);
      if (payload.realtimeSource) {
        const sourceParts = [market.source, payload.realtimeSource].filter(Boolean).join(" + ");
        market.source = [...new Set(sourceParts.split(" + ").filter(Boolean))].join(" + ");
      }
      render();
      setStatus("已更新", new Date().toLocaleString("zh-TW"));
    }
  } catch {
    // Keep the last known market data on screen; the full refresh will retry later.
  } finally {
    quoteFetchInFlight = false;
    scheduleQuoteRefresh();
  }
}

async function fetchMarket() {
  if (document.hidden) {
    setStatus("暫停更新", "分頁在背景，回到畫面後會自動更新");
    return;
  }
  if (marketFetchInFlight) return;
  marketFetchInFlight = true;
  setStatus("更新中", "正在讀取證交所公開資料");
  fetchRealtimeQuotes();

  try {
    const symbols = watchList.map((item) => item.code).join(",");
    const params = new URLSearchParams();
    if (symbols) params.set("symbols", symbols);
    params.set("_", String(Date.now()));
    const separator = endpoints.bundle.includes("?") ? "&" : "?";
    const url = `${endpoints.bundle}${separator}${params.toString()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Netlify function unavailable");
    const payload = await response.json();
    const daily = normalizeDaily(payload.daily || []);
    const realtime = normalizeRealtimeQuotes(payload.realtime || []);
    const sources = [payload.dailySource, payload.realtimeSource].filter(Boolean);

    market = {
      daily: mergeRealtimeQuotes(daily, realtime),
      valuation: normalizeValuation(payload.valuation || []),
      revenue: normalizeRevenue(payload.revenue || []),
      index: normalizeIndex(payload.index) || sampleIndex,
      usIndex: normalizeUsMarket(payload.usIndex) || sampleUsMarket,
      institutional: normalizeInstitutional(payload.institutional),
      news: normalizeNews(payload.news || []),
      source: sources.length ? [...new Set(sources)].join(" + ") : daily.length ? "TWSE" : "資料不足",
      updatedAt: payload.updatedAt || new Date().toISOString()
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
      source: "sample",
      updatedAt: new Date().toISOString()
    };
  }

  const hasUsableMarketData = market.daily.length || Number.isFinite(number(market.index?.index));
  setStatus(market.source === "sample" ? "範例資料" : hasUsableMarketData ? "已更新" : "資料不足", new Date().toLocaleString("zh-TW"));
  render();
  marketFetchInFlight = false;
  scheduleMarketRefresh();
  scheduleQuoteRefresh();
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
  if (els.todayPnlUpdatedAt) {
    els.todayPnlUpdatedAt.textContent = `資料更新時間：${time || "尚未同步"}`;
  }
}

function openBriefTarget(card) {
  const target = document.querySelector(card.dataset.target);
  if (!target) return;
  if (target.classList.contains("advanced-section") && document.body.dataset.viewMode === "simple") {
    applyViewMode("full");
  }
  target.classList.remove("target-highlight");
  void target.offsetWidth;
  target.classList.add("target-highlight");
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => target.classList.remove("target-highlight"), 1800);
  if (card.dataset.target === "#watchForm") {
    window.setTimeout(() => els.symbol?.focus(), 450);
  }
}

function scrollToDashboardTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  if (target.classList.contains("advanced-section") && document.body.dataset.viewMode === "simple") {
    applyViewMode("full");
  }
  document.querySelectorAll(".mobile-section-nav button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === selector);
  });
  target.classList.remove("target-highlight");
  void target.offsetWidth;
  target.classList.add("target-highlight");
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => target.classList.remove("target-highlight"), 1800);
  if (selector === "#managePanel") {
    window.setTimeout(() => els.symbol?.focus(), 450);
  }
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
  const valueRanking = market.daily.slice().sort((a, b) => b.value - a.value);
  const ranking = valueRanking.slice(0, RANKING_LIMIT);
  const trendRanking = valueRanking.slice(0, TREND_STOCK_LIMIT);
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
    const shares = holdingShares(entry.item);
    if (!entry.stock || !shares) return total;
    return total + entry.stock.close * shares;
  }, 0);

  els.watchCount.textContent = watchList.length;
  els.holdingValue.textContent = holdingValue ? compactMoney(holdingValue) : "--";
  els.topHotStock.textContent = ranking[0] ? `${ranking[0].code} ${ranking[0].name}` : "--";
  els.riskCount.textContent = tracked.filter((item) => item.signal.tone === "bad").length;
  els.sourceLabel.textContent = market.source === "sample" ? "範例" : market.source;

  renderTodayPnl(holdings);
  renderQuickAddedStocks();
  renderBeginnerBrief(ranking, tracked);
  renderMarketScore(ranking, tracked);
  renderDataQuality();
  renderPortfolioHealth(holdings, tracked, holdingValue);
  renderPreflightChecklist(tracked, ranking);
  renderDisciplineList(holdings, tracked, holdingValue);
  renderHoldingOverview(holdings);
  renderHoldings(holdings);
  renderHoldingTradeSummary(holdings);
  renderSellHistory();
  renderNews();
  renderHoldingNews(tracked);
  renderWatchList(watchOnly);
  renderInsights(tracked, ranking);
  renderRanking(ranking);
  renderFinance(tracked);
  renderMarketIndex();
  renderInstitutional();
  renderMarketThemes(ranking);
  renderTrendPanel(trendRanking);
  renderSmallCapGuide();
}

function renderBeginnerBrief(ranking, tracked) {
  const index = selectedMarket === "us"
    ? market.usIndex?.groups?.listed
    : market.index;
  const changePercent = number(index?.changePercent);
  const totalFlow = number(market.institutional?.total);
  const sectors = summarizeSectors(ranking);
  const beginnerCandidate = pickBeginnerCandidate(ranking);
  const riskTracked = tracked.filter((entry) => entry.signal.tone === "bad");

  if (Number.isFinite(changePercent)) {
    if (changePercent > 0.7) {
      els.beginnerMarketTone.textContent = "今天偏強";
      els.beginnerMarketTone.className = "price-up";
      els.beginnerMarketText.textContent = `大盤上漲 ${percent(changePercent)}，可看資金集中在哪些族群，但避免追太急。`;
    } else if (changePercent < -0.7) {
      els.beginnerMarketTone.textContent = "今天偏弱";
      els.beginnerMarketTone.className = "price-down";
      els.beginnerMarketText.textContent = `大盤下跌 ${percent(changePercent)}，先保守觀察，等止跌訊號比急著進場重要。`;
    } else {
      els.beginnerMarketTone.textContent = "今天震盪";
      els.beginnerMarketTone.className = "";
      els.beginnerMarketText.textContent = `大盤約 ${percent(changePercent)}，方向還不明確，適合看族群輪動和個股強弱。`;
    }
  } else {
    els.beginnerMarketTone.textContent = "等待資料";
    els.beginnerMarketTone.className = "";
    els.beginnerMarketText.textContent = "更新後會判斷今天偏強、震盪或偏弱。";
  }

  els.beginnerTrendText.textContent = sectors.length
    ? sectors.map((sector) => `${sector.name} ${sector.count} 檔`).join("、")
    : "等待族群";

  if (riskTracked.length) {
    els.beginnerRiskText.textContent = `${riskTracked.length} 檔需小心`;
    els.beginnerRiskText.className = "price-down";
  } else if (Number.isFinite(totalFlow) && totalFlow < 0) {
    els.beginnerRiskText.textContent = "法人偏賣超";
    els.beginnerRiskText.className = "price-down";
  } else {
    els.beginnerRiskText.textContent = "暫無明顯警訊";
    els.beginnerRiskText.className = "";
  }

  if (watchList.length) {
    els.beginnerNextText.textContent = `先看你的 ${watchList.length} 檔股票`;
    if (els.beginnerNextNote) {
      els.beginnerNextNote.textContent = "你已經有追蹤股票，優先看自己的損益、風險與白話提醒。";
    }
  } else if (beginnerCandidate.stock) {
    els.beginnerNextText.textContent = `可先觀察 ${formatStockLabel(beginnerCandidate.stock)}`;
    if (els.beginnerNextNote) {
      els.beginnerNextNote.textContent = beginnerCandidate.reason;
    }
  } else {
    els.beginnerNextText.textContent = "加入你的股票";
    if (els.beginnerNextNote) {
      els.beginnerNextNote.textContent = "輸入持股或觀察股，系統會幫你整理損益與白話提醒。";
    }
  }

  const sectorText = sectors[0] ? `${sectors[0].name}` : "資金方向未明";
  const riskText = riskTracked.length ? `${riskTracked.length} 檔持股需小心` : els.beginnerRiskText.textContent;
  const tone = els.beginnerMarketTone.textContent;
  els.todayConclusion.textContent = `今日結論：${tone}，資金主要看 ${sectorText}；${riskText}。先觀察族群是否延續，再決定是否分批。`;
}

function formatStockLabel(stock) {
  if (!stock) return "";
  return `${stock.code} ${stock.name}`;
}

function pickBeginnerCandidate(ranking) {
  const trendCandidates = latestTrendItems
    .filter((item) => Number.isFinite(item.recentReturn))
    .filter((item) => item.recentReturn > -1 && item.monthReturn > -5)
    .map((item) => {
      const score = (number(item.trendScore) || 0)
        + Math.min(Math.max(number(item.value) || 0, 0) / 1_000_000_000, 8) * 0.08
        - (item.monthReturn > 18 ? 8 : 0)
        - (item.recentReturn > 9 ? 4 : 0);
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((entry) => entry.item);

  if (trendCandidates.length) {
    // 用日期 + 分鐘輪替前 5 名候選，每分鐘會換一檔，當日不會跳太遠
    const now = new Date();
    const seed = now.getDate() * 13 + now.getHours() * 7 + now.getMinutes();
    const trendCandidate = trendCandidates[seed % trendCandidates.length];
    return {
      stock: trendCandidate,
      reason: `每分鐘從前 ${trendCandidates.length} 檔候選中輪替顯示一檔。依近一週趨勢、今天強弱與成交熱度排序，先觀察是否延續，這不是買進建議。`
    };
  }

  const rankingCandidates = ranking
    .slice(0, 10)
    .filter((stock) => stock.changePercent > 0 && stock.changePercent <= 8);
  const fallbackPool = rankingCandidates.length ? rankingCandidates.slice(0, 5) : ranking.slice(0, 5);

  if (fallbackPool.length) {
    const seed = new Date().getMinutes();
    const rankingCandidate = fallbackPool[seed % fallbackPool.length];
    return {
      stock: rankingCandidate,
      reason: "目前先用成交熱度挑觀察股；趨勢資料算完後，這裡會自動換成近一週走勢挑選。"
    };
  }

  return { stock: null, reason: "" };
}

function dataBadge(label, level, text) {
  return `
    <article class="quality-card">
      <span class="data-badge ${level}">${label}</span>
      <p>${text}</p>
    </article>
  `;
}

function renderMarketScore(ranking, tracked) {
  const index = selectedMarket === "us" ? market.usIndex?.groups?.listed : market.index;
  const changePercent = number(index?.changePercent);
  const hotCount = ranking.filter((stock) => stock.changePercent > 3).length;
  const dropCount = ranking.filter((stock) => stock.changePercent < -3).length;
  const weakTracked = tracked.filter((entry) => entry.signal.tone === "bad").length;
  const totalFlow = number(market.institutional?.total);
  let score = 50;
  if (Number.isFinite(changePercent)) score += Math.max(-18, Math.min(18, changePercent * 8));
  score += Math.min(12, hotCount * 2);
  score -= Math.min(12, dropCount * 2);
  if (Number.isFinite(totalFlow)) score += totalFlow > 0 ? 8 : totalFlow < 0 ? -8 : 0;
  score -= Math.min(15, weakTracked * 5);
  score = Math.round(Math.max(0, Math.min(100, score)));

  const temperature = score >= 70 ? "偏熱" : score <= 42 ? "偏冷" : "正常";
  const chaseRisk = hotCount >= 5 || score >= 78 ? "高" : hotCount >= 2 ? "中" : "低";
  const action = score >= 72 ? "等回檔" : score >= 55 ? "分批觀察" : score >= 42 ? "觀察" : "保守";

  els.marketScoreNumber.textContent = score;
  els.marketScoreNumber.className = `score-ring ${score >= 70 ? "hot" : score <= 42 ? "cold" : ""}`;
  els.marketScoreTitle.textContent = `市場溫度 ${temperature}`;
  els.marketScoreText.textContent = `今天較適合：${action}。追高風險 ${chaseRisk}，熱門股 ${hotCount} 檔，轉弱股 ${dropCount} 檔。`;
  els.marketScoreList.innerHTML = [
    ["市場溫度", temperature],
    ["追高風險", chaseRisk],
    ["適合操作", action],
    ["持股警訊", `${weakTracked} 檔`]
  ].map(([label, value]) => `
    <article>
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderDataQuality() {
  const hasFugle = market.source.includes("Fugle");
  const hasYahooQuotes = market.source.includes("Yahoo");
  const hasRealMarket = market.source !== "sample" && market.source !== "資料不足" && (market.daily.length || Number.isFinite(number(market.index?.index)));
  const institutionalSource = String(market.institutional?.source || "");
  const hasInstitutional = institutionalSource.includes("TWSE") || institutionalSource.includes("TPEx");
  const quoteBadge = hasFugle
    ? dataBadge("即時", "good", "個股報價使用 Fugle 即時行情。")
    : hasYahooQuotes
      ? dataBadge("盤中", "good", "Fugle 目前受限時，個股報價改用 Yahoo 盤中行情。")
      : dataBadge("延遲", "warn", "個股多為 TWSE 公開資料或盤後資料，非逐筆即時。");
  els.dataQualityList.innerHTML = [
    dataBadge(hasRealMarket ? "即時/公開" : market.source === "sample" ? "範例" : "資料不足", hasRealMarket ? "good" : "bad", hasRealMarket ? "大盤與成交資料已連接公開資料來源。" : "主要市場資料目前沒有成功回傳，先不要用這個畫面做判斷。"),
    quoteBadge,
    dataBadge(hasInstitutional ? "盤後" : "估算", hasInstitutional ? "warn" : "bad", hasInstitutional ? "法人資料為 TWSE / TPEx 盤後統計，適合看方向，不是即時籌碼。" : "法人資料尚未完整連接，先當參考。"),
    dataBadge("非建議", "warn", "AI 只整理訊號與風險，不保證獲利；下單前仍要檢查部位與停損。")
  ].join("");
}

function stockDecision(signal, stock, val, rev, inst) {
  if (!stock) return { label: "資料不足", tone: "warn", text: "先確認股票代號與資料來源。" };
  if (!val && !rev && !inst) return { label: "資料不足", tone: "warn", text: "缺少估值、營收與法人資料，不建議只用價格判斷。" };
  if (signal.tone === "bad" || rev?.yoy < -10 || inst?.total < 0 && stock.change < 0) {
    return { label: "風險偏高", tone: "bad", text: "價格、法人或基本面偏弱，先等轉強。" };
  }
  if (signal.tone === "good" && rev?.yoy >= 0 && (!inst || inst.total >= 0)) {
    return { label: "可觀察", tone: "good", text: "訊號偏正面，但仍建議等回檔或突破確認。" };
  }
  if (val?.pe > 35 || stock.changePercent > 6) {
    return { label: "等回檔", tone: "warn", text: "短線或估值偏熱，不適合急追。" };
  }
  return { label: "等待確認", tone: "warn", text: "訊號還不一致，先放觀察名單。" };
}

function operationScenario(item, stock, val, rev, inst, pnlRate = null) {
  const decision = stockDecision(scoreStock(stock, val, rev), stock, val, rev, inst);
  if (!stock) return "資料不足：先確認代號，不要下單。";
  if ((item?.type || "watch") === "holding") {
    if (pnlRate >= 15) return "若已持有：可續抱，但設定移動停利，不建議獲利後再重押加碼。";
    if (pnlRate <= -8) return "若已持有：先檢查買進理由是否還成立，必要時設停損或減碼。";
    if (decision.label === "可觀察") return "若已持有：續抱觀察，等營收與法人方向確認後再加碼。";
    if (decision.label === "風險偏高") return "若已持有：避免攤平，先降低曝險或等待轉強。";
    return "若已持有：維持追蹤，不急著加碼。";
  }
  if (decision.label === "可觀察") return "若還沒買：等回檔不破支撐，或突破後量價健康再小部位測試。";
  if (decision.label === "等回檔") return "若還沒買：先等拉回或整理，避免看到強勢就追。";
  if (decision.label === "風險偏高") return "若還沒買：暫不追，等法人、營收或價格結構轉強。";
  return "若還沒買：先放觀察名單，等訊號一致。";
}

function dataWarning(val, rev, inst) {
  const missing = [];
  if (!val) missing.push("估值");
  if (!rev) missing.push("營收");
  if (!inst) missing.push("法人");
  if (!missing.length) return "";
  return `資料不足：缺少${missing.join("、")}，不建議只用價格或排名判斷。`;
}

function riskLevel(stock, val, rev, inst, pnlRate = null) {
  let score = 0;
  const notes = [];
  if (stock?.changePercent > 6) {
    score += 2;
    notes.push("追高風險");
  }
  if (stock?.changePercent < -4) {
    score += 1;
    notes.push("波動風險");
  }
  if (inst?.total < 0) {
    score += 1;
    notes.push("法人賣超");
  }
  if (rev?.yoy < -10) {
    score += 2;
    notes.push("基本面轉弱");
  }
  if (val?.pe > 35 || val?.pb > 6) {
    score += 1;
    notes.push("估值偏高");
  }
  if (pnlRate !== null && pnlRate < -8) {
    score += 1;
    notes.push("虧損擴大");
  }
  if (score >= 3) return { label: "高", tone: "bad", text: notes.join("、") || "風險偏高" };
  if (score >= 1) return { label: "中", tone: "warn", text: notes.join("、") || "有部分風險" };
  return { label: "低", tone: "good", text: "暫無明顯風險" };
}

function renderPortfolioHealth(holdings, tracked, holdingValue) {
  const sectorMap = new Map();
  holdings.forEach(({ stock, item }) => {
    if (!stock) return;
    const shares = holdingShares(item);
    const value = shares ? stock.close * shares : 0;
    const sector = inferSector(stock);
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
  });
  const largestSector = Array.from(sectorMap.entries()).sort((a, b) => b[1] - a[1])[0];
  const weakCount = tracked.filter((entry) => entry.signal.tone === "bad").length;
  const noCostCount = watchList.filter((item) => !averageHoldingCost(item) || !holdingShares(item)).length;
  const concentration = largestSector && holdingValue ? (largestSector[1] / holdingValue) * 100 : 0;
  const cards = [
    ["持股數量", holdings.length ? `${holdings.length} 檔` : "尚未建立", holdings.length >= 3 ? "good" : "warn", holdings.length >= 3 ? "分散度開始建立。" : "可逐步建立 3 檔以上，不要只看單一股票。"],
    ["最大族群", largestSector ? `${largestSector[0]} ${percent(concentration)}` : "--", concentration > 55 ? "bad" : "warn", largestSector ? "同族群過高時，容易一起漲跌。" : "輸入持股後會計算族群集中度。"],
    ["風險持股", `${weakCount} 檔`, weakCount ? "bad" : "good", weakCount ? "先檢查買進理由、停損與是否需要減碼。" : "目前追蹤股沒有明顯弱訊號。"],
    ["資料完整度", noCostCount ? `${noCostCount} 檔未填成本` : "完整", noCostCount ? "warn" : "good", noCostCount ? "填入買進價與股數，系統才能判讀損益。" : "可正常計算持股狀況。"]
  ];
  els.portfolioHealthList.innerHTML = cards.map(([title, value, tone, text]) => `
    <article class="health-card">
      <span>${title}</span>
      <strong class="${tone === "bad" ? "price-down" : tone === "good" ? "price-up" : ""}">${value}</strong>
      <p>${text}</p>
    </article>
  `).join("");
}

function renderPreflightChecklist(tracked, ranking) {
  const hot = ranking[0] ? `${ranking[0].code} ${ranking[0].name}` : "今日熱門股";
  const checks = [
    ["知道為什麼漲嗎？", `先看成交族群、新聞與法人，避免只因 ${hot} 很熱門就追。`],
    ["有設定停損嗎？", "進場前先寫下跌多少要減碼，不要等虧損後才想。"],
    ["單檔會不會太重？", "新手單檔部位盡量不要過度集中，尤其小型股更要小部位。"],
    ["資料是否即時？", "確認該區塊標示是即時、盤後還是範例，避免用延遲資料做短線決策。"]
  ];
  els.preflightList.innerHTML = checks.map(([title, text], index) => `
    <article class="preflight-card">
      <span>${index + 1}</span>
      <div>
        <strong>${title}</strong>
        <p>${text}</p>
      </div>
    </article>
  `).join("");
}

function renderDisciplineList(holdings, tracked, holdingValue) {
  const sectorValue = new Map();
  holdings.forEach(({ item, stock }) => {
    const shares = holdingShares(item);
    if (!stock || !shares) return;
    const sector = inferSector(stock);
    sectorValue.set(sector, (sectorValue.get(sector) || 0) + stock.close * shares);
  });
  const largestHolding = holdings.map(({ item, stock }) => {
    const shares = holdingShares(item);
    return { item, stock, value: stock && shares ? stock.close * shares : 0 };
  }).sort((a, b) => b.value - a.value)[0];
  const largestSector = Array.from(sectorValue.entries()).sort((a, b) => b[1] - a[1])[0];
  const singleRatio = holdingValue && largestHolding?.value ? (largestHolding.value / holdingValue) * 100 : 0;
  const sectorRatio = holdingValue && largestSector ? (largestSector[1] / holdingValue) * 100 : 0;
  const noCost = watchList.filter((item) => !averageHoldingCost(item) || !holdingShares(item)).length;
  const weak = tracked.filter((entry) => entry.signal.tone === "bad").length;
  const checks = [
    ["單檔集中", singleRatio > 20 ? "需調整" : "可接受", singleRatio > 20 ? "bad" : "good", largestHolding?.stock ? `${largestHolding.item.code} 約占 ${percent(singleRatio)}，新手單檔過高容易情緒化。` : "輸入持股後會檢查單檔比重。"],
    ["族群集中", sectorRatio > 45 ? "偏高" : "正常", sectorRatio > 45 ? "bad" : "good", largestSector ? `${largestSector[0]} 約占 ${percent(sectorRatio)}，同族群會一起受消息影響。` : "輸入持股後會檢查族群集中度。"],
    ["成本紀律", noCost ? "不完整" : "完整", noCost ? "warn" : "good", noCost ? `${noCost} 檔未填成本或股數，系統無法判斷損益與停損。` : "成本資料完整，可判讀損益。"],
    ["追高紀律", weak ? "需檢查" : "正常", weak ? "bad" : "good", weak ? `${weak} 檔有弱訊號，避免因虧損而攤平。` : "目前沒有明顯追高或弱勢警訊。"]
  ];
  els.disciplineList.innerHTML = checks.map(([title, value, tone, text]) => `
    <article class="discipline-card">
      <span>${title}</span>
      <strong class="${tone === "bad" ? "price-down" : tone === "good" ? "price-up" : ""}">${value}</strong>
      <p>${text}</p>
    </article>
  `).join("");
}

function holdingMetrics(entry) {
  const { item, stock, val } = entry;
  const cost = averageHoldingCost(item);
  const shares = holdingShares(item);
  const marketValue = stock && shares ? stock.close * shares : null;
  const costValue = holdingCostValue(item);
  const pnl = marketValue !== null && costValue ? marketValue - costValue : null;
  const pnlRate = pnl !== null && costValue ? (pnl / costValue) * 100 : null;
  const net = netTradeMetrics({ buyValue: costValue, sellValue: marketValue, grossProfit: pnl });
  const todayChange = stockTodayChange(stock);
  const todayChangePercent = stockTodayChangePercent(stock);
  const todayPnl = Number.isFinite(todayChange) && Number.isFinite(shares) && shares > 0 ? todayChange * shares : null;
  const yearlyDividend = val?.yieldRate && marketValue ? marketValue * (val.yieldRate / 100) : null;
  return {
    cost,
    shares,
    marketValue,
    costValue,
    pnl,
    pnlRate,
    netPnl: net.netProfit,
    netPnlRate: net.netProfitRate,
    tradingCost: net.total,
    todayChange,
    todayChangePercent,
    todayPnl,
    yearlyDividend
  };
}

function renderTodayPnl(holdings) {
  if (!els.todayPnlAmount) return;

  const valid = holdings
    .map((entry) => ({ entry, m: holdingMetrics(entry) }))
    .filter(({ entry, m }) => entry.stock && Number.isFinite(m.shares) && m.shares > 0);

  // 今日波動 = sum((即時價 - 昨收) × shares)，和持股卡片共用同一組欄位。
  let todayPnl = null;
  let priorMarketValue = 0;
  let totalMarketValue = 0;
  let cumulativePnl = 0;
  let hasPriorPrice = false;

  valid.forEach(({ entry, m }) => {
    const shares = m.shares;
    const close = entry.stock.close;
    const change = m.todayChange;
    if (Number.isFinite(close)) totalMarketValue += close * shares;
    if (Number.isFinite(change)) {
      todayPnl = (todayPnl || 0) + m.todayPnl;
      const prior = (close - change) * shares;
      if (Number.isFinite(prior)) {
        priorMarketValue += prior;
        hasPriorPrice = true;
      }
    }
    if (Number.isFinite(m.pnl)) cumulativePnl += m.pnl;
  });

  const todayPct = (todayPnl !== null && hasPriorPrice && priorMarketValue > 0)
    ? (todayPnl / priorMarketValue) * 100
    : null;

  // 顯示金額
  if (todayPnl === null) {
    els.todayPnlAmount.textContent = valid.length ? "今日資料尚未公布" : "尚未新增持股";
    els.todayPnlAmount.className = "today-pnl-amount";
    els.todayPnlPercent.textContent = "--";
    els.todayPnlPercent.className = "today-pnl-percent";
    if (els.todayPnlCard) els.todayPnlCard.removeAttribute("data-pnl");
  } else {
    els.todayPnlAmount.textContent = `${pnlText(todayPnl, "今日財產增加", "今日財產減少", "今日財產持平")} 元`;
    els.todayPnlAmount.className = `today-pnl-amount ${todayPnl > 0 ? "price-up" : todayPnl < 0 ? "price-down" : ""}`;
    if (todayPct !== null) {
      els.todayPnlPercent.textContent = `(${todayPct > 0 ? "+" : ""}${money(todayPct)}%)`;
      els.todayPnlPercent.className = `today-pnl-percent ${todayPct > 0 ? "price-up" : todayPct < 0 ? "price-down" : ""}`;
    } else {
      els.todayPnlPercent.textContent = "";
    }
    if (els.todayPnlCard) {
      els.todayPnlCard.setAttribute("data-pnl", todayPnl > 0 ? "up" : todayPnl < 0 ? "down" : "flat");
    }
  }

  // Meta 區
  els.todayPnlCount.textContent = valid.length ? `${valid.length} 檔` : "--";
  els.todayPnlMarketValue.textContent = totalMarketValue ? compactMoney(totalMarketValue) : "--";

  if (cumulativePnl !== 0) {
    els.todayPnlAccumulated.textContent = pnlText(cumulativePnl, "帳面增加", "帳面減少", "帳面持平", compactMoney);
    els.todayPnlAccumulated.className = cumulativePnl > 0 ? "price-up" : "price-down";
  } else {
    els.todayPnlAccumulated.textContent = valid.length ? "帳面持平 0" : "--";
    els.todayPnlAccumulated.className = "";
  }

  // 提示文字
  if (!holdings.length) {
    els.todayPnlNote.textContent = "尚未新增持股，到下方「加入追蹤」輸入股票代號和股數即可。";
  } else if (!valid.length) {
    els.todayPnlNote.textContent = "持股還沒填股數，補上後就能算出每天的損益。";
  } else if (todayPnl === null) {
    els.todayPnlNote.textContent = "等收盤資料更新後，這裡會顯示今天賺多少 / 賠多少。";
  } else if (todayPnl > 0) {
    els.todayPnlNote.textContent = "今天整體上漲，記得不要追高，可以順手檢查一下停利點。";
  } else if (todayPnl < 0) {
    els.todayPnlNote.textContent = "今天整體下跌屬正常，先看是大盤拖累還是個股問題，再決定動作。";
  } else {
    els.todayPnlNote.textContent = "今天整體持平，慢慢等資料更新即可。";
  }
}

function renderHoldingOverview(holdings) {
  if (!els.holdingOverview) return;
  const realizedPnl = realizedProfitTotal();
  if (!holdings.length) {
    els.holdingOverview.innerHTML = `
      <p class="empty">新增「我的存股」後，這裡會自動計算總市值、總成本、總損益與預估股息。</p>
      ${sellHistory.length ? `<p class="holding-overview-note">歷史累積已實現獲利：<strong class="${priceTone(realizedPnl)}">${formatCurrency(realizedPnl)}</strong></p>` : ""}
    `;
    return;
  }

  const rows = holdings.map((entry) => ({ ...entry, metrics: holdingMetrics(entry) }));
  const totalMarketValue = rows.reduce((sum, row) => sum + (row.metrics.marketValue || 0), 0);
  const totalCost = rows.reduce((sum, row) => sum + (row.metrics.costValue || 0), 0);
  const realizedNetPnl = realizedNetProfitTotal();
  const realizedTradingCost = realizedTradingCostTotal();
  const recoveredPrincipal = sellHistory.reduce((sum, item) => {
    const costValue = number(item.costValue);
    const buyCost = number(item.buyCost);
    const shares = number(item.shares);
    if (Number.isFinite(costValue)) return sum + costValue;
    return sum + (Number.isFinite(buyCost) && Number.isFinite(shares) ? buyCost * shares : 0);
  }, 0);
  const totalSoldValue = sellHistory.reduce((sum, item) => {
    const soldValue = number(item.soldValue);
    const sellPrice = number(item.sellPrice);
    const shares = number(item.shares);
    if (Number.isFinite(soldValue)) return sum + soldValue;
    return sum + (Number.isFinite(sellPrice) && Number.isFinite(shares) ? sellPrice * shares : 0);
  }, 0);
  const lifetimeInvested = totalCost + recoveredPrincipal;
  const totalPnl = totalMarketValue && totalCost ? totalMarketValue - totalCost : null;
  const totalPnlRate = totalPnl !== null && totalCost ? (totalPnl / totalCost) * 100 : null;
  const cumulativePnl = (totalPnl || 0) + realizedPnl;
  const currentNetPnl = rows.reduce((sum, row) => sum + (Number.isFinite(row.metrics.netPnl) ? row.metrics.netPnl : 0), 0);
  const currentTradingCost = rows.reduce((sum, row) => sum + (Number.isFinite(row.metrics.netPnl) ? row.metrics.tradingCost || 0 : 0), 0);
  const totalNetPnl = currentNetPnl + realizedNetPnl;
  const totalTradingCost = currentTradingCost + realizedTradingCost;
  const hasNetPnl = rows.some((row) => Number.isFinite(row.metrics.netPnl)) || sellHistory.length;
  const totalDividend = rows.reduce((sum, row) => sum + (row.metrics.yearlyDividend || 0), 0);
  const averageYield = totalMarketValue ? (totalDividend / totalMarketValue) * 100 : null;
  const profitable = rows.filter((row) => row.metrics.pnl > 0);
  const losing = rows.filter((row) => row.metrics.pnl < 0);
  const best = rows.filter((row) => row.metrics.pnl !== null).sort((a, b) => b.metrics.pnl - a.metrics.pnl)[0];
  const worst = rows.filter((row) => row.metrics.pnl !== null).sort((a, b) => a.metrics.pnl - b.metrics.pnl)[0];
  const holdingSummaryLabel = (row) => {
    if (!row) return "--";
    const name = row.stock?.name || getStock(row.item.code)?.name || "";
    const label = name ? `${name} ${row.item.code}` : row.item.code;
    return `${escapeHtml(label)} ${compactMoney(row.metrics.pnl)}`;
  };
  const aiTone = totalPnlRate === null
    ? "請先補齊買進價與股數，才能判讀總損益。"
    : totalPnlRate >= 10
      ? "整體獲利不錯，重點是守住停利與避免單檔過度集中。"
      : totalPnlRate <= -8
        ? "整體虧損偏大，先檢查弱勢股原因，不建議盲目攤平。"
        : "整體仍在可控範圍，持續追蹤營收、法人與族群集中度。";

  const cards = [
    ["總市值", totalMarketValue ? compactMoney(totalMarketValue) : "--", ""],
    ["目前投入成本", totalCost ? compactMoney(totalCost) : "--", ""],
    ["已回收本金", recoveredPrincipal ? compactMoney(recoveredPrincipal) : "--", ""],
    ["累計投入本金", lifetimeInvested ? compactMoney(lifetimeInvested) : "--", ""],
    ["已賣出金額", totalSoldValue ? compactMoney(totalSoldValue) : "--", ""],
    ["總帳面損益", totalPnl === null ? "--" : compactMoney(totalPnl), totalPnl >= 0 ? "price-up" : "price-down"],
    ["總損益率", totalPnlRate === null ? "--" : percent(totalPnlRate), totalPnlRate >= 0 ? "price-up" : "price-down"],
    ["估計交易成本", totalTradingCost ? compactMoney(totalTradingCost) : "--", ""],
    ["稅後純盈虧", hasNetPnl ? formatCurrency(totalNetPnl) : "--", priceTone(totalNetPnl)],
    ["預估年股息", totalDividend ? compactMoney(totalDividend) : "--", ""],
    ["平均殖利率", averageYield === null ? "--" : percent(averageYield), ""],
    ["獲利 / 虧損", `${profitable.length} / ${losing.length} 檔`, ""],
    ["最大獲利股", best ? holdingSummaryLabel(best) : "--", "price-up"],
    ["最大虧損股", worst ? holdingSummaryLabel(worst) : "--", worst?.metrics.pnl < 0 ? "price-down" : ""],
    ["已實現獲利", sellHistory.length ? formatCurrency(realizedPnl) : "--", priceTone(realizedPnl)],
    ["已實現稅後", sellHistory.length ? formatCurrency(realizedNetPnl) : "--", priceTone(realizedNetPnl)],
    ["累積總獲利", totalPnl === null && !sellHistory.length ? "--" : formatCurrency(cumulativePnl), priceTone(cumulativePnl)]
  ];

  els.holdingOverview.innerHTML = `
    <div class="holding-overview-grid">
      ${cards.map(([label, value, tone]) => `
        <article>
          <span>${escapeHtml(label)}</span>
          <strong class="${escapeHtml(tone)}">${value}</strong>
        </article>
      `).join("")}
    </div>
    <p class="holding-overview-note">${escapeHtml(aiTone)} ${escapeHtml(tradingCostNote())}</p>
  `;
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
  const data = market.institutional;
  const source = String(data?.source || "");
  const hasPublicInstitutional = source.includes("TWSE") || source.includes("TPEx");
  if (!data || !hasPublicInstitutional) {
    [els.foreignNet, els.trustNet, els.dealerNet, els.institutionTotalNet].forEach((element) => {
      element.textContent = "--";
      element.className = "";
    });
    els.institutionDate.textContent = "資料日期：尚未公布";
    els.institutionStatus.textContent = "法人：TWSE 通常盤後公布，目前尚未回傳今日資料";
    return;
  }

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

  els.institutionDate.textContent = `資料日期：${formatDateOnly(data.date)}`;
  els.institutionStatus.textContent = `法人：${source} 盤後統計，非逐筆即時`;
}

function renderMarketThemes(ranking) {
  const data = market.institutional;
  if (!data || data.source !== "TWSE") {
    els.chipThemeTitle.textContent = "等待法人盤後";
    els.chipThemeTitle.className = "";
    els.chipThemeText.textContent = "三大法人買賣超通常盤後公布，公布前不以範例資料代替。";
  }
  const flows = [
    ["外資", number(data?.foreign)],
    ["投信", number(data?.trust)],
    ["自營商", number(data?.dealer)]
  ].filter(([, value]) => Number.isFinite(value));
  const leader = flows.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  const total = number(data?.total);

  if (data?.source === "TWSE") {
    els.chipThemeTitle.textContent = Number.isFinite(total)
      ? total > 0 ? "法人偏買超" : total < 0 ? "法人偏賣超" : "法人中性"
      : "--";
    els.chipThemeTitle.className = Number.isFinite(total) ? total >= 0 ? "price-up" : "price-down" : "";
    els.chipThemeText.textContent = leader
      ? `${leader[0]}影響最大，${formatShareFlow(leader[1])}；三大法人合計 ${formatShareFlow(total)}。`
      : "等待三大法人盤後資料。";
  }

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
  const candidates = ranking.slice(0, TREND_STOCK_LIMIT);
  const key = `${TREND_DATA_VERSION}:${candidates.map((stock) => stock.code).join(",")}`;
  if (!key) {
    latestTrendItems = [];
    els.trendList.innerHTML = '<p class="empty">等待成交排行更新後，這裡會計算近一週漲勢。</p>';
    updateTrendGuide([]);
    renderTrendSummary([]);
    els.trendAiTitle.textContent = "等待資料";
    els.trendAiText.textContent = "目前沒有足夠股票可分析。";
    els.trendStatus.textContent = "趨勢：等待近一週資料";
    drawTrendChart([]);
    return;
  }

  if (market.source === "sample") {
    els.trendGuide.innerHTML = `
      <strong>目前是範例資料</strong>
      <p>這欄需要市場資料 API 才能計算真實的近一週漲勢。若看到多檔股票數字一樣，代表網站目前沒有抓到即時資料，不能拿來判斷投資方向。</p>
    `;
    els.trendStatus.textContent = "趨勢：目前使用範例資料，等待市場 API 連線";
  }

  if (trendRequestKey === key && latestTrendItems.length) {
    drawTrendChart(latestTrendItems);
    return;
  }

  trendRequestKey = key;
  els.trendStatus.textContent = "趨勢：正在抓取近一週資料";
  els.trendList.innerHTML = '<p class="empty">正在依每日漲幅計算近期漲勢...</p>';

  const items = await Promise.all(candidates.map(async (stock) => {
    const history = await fetchHistory(stock.code);
    return buildTrendItem(stock, history);
  }));
  if (trendRequestKey !== key) return;

  latestTrendItems = items.filter(Boolean).sort((a, b) => b.recentReturn - a.recentReturn).slice(0, TREND_STOCK_LIMIT);
  renderTrendResults(latestTrendItems);
}

function buildTrendItem(stock, history) {
  const recent = history.filter((item) => Number.isFinite(item.close)).slice(-TREND_HISTORY_DAYS);
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
    els.trendList.innerHTML = '<p class="empty">近一週資料不足，稍後再更新。</p>';
    updateTrendGuide([]);
    renderTrendSummary([]);
    els.trendAiTitle.textContent = "資料不足";
    els.trendAiText.textContent = "目前無法形成趨勢判讀。";
    els.trendStatus.textContent = "趨勢：資料不足";
    drawTrendChart([]);
    return;
  }

  const displayed = items.slice(0, TREND_STOCK_LIMIT);
  els.trendList.innerHTML = displayed.map((item, index) => {
    const todayChange = stockTodayChange(item);
    const todayChangePercent = stockTodayChangePercent(item);
    const weekTone = priceTone(item.monthReturn);
    const dayTone = priceTone(item.recentReturn);
    return `
      <article class="trend-row">
        <div>
          <strong>${index + 1}. ${escapeHtml(item.code)} ${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.sector)} ｜ ${TREND_PERIOD_LABEL} <span class="${weekTone}">${percent(item.monthReturn)}</span> ｜ 1 日 <span class="${dayTone}">${percent(item.recentReturn)}</span> ｜ 3 日區段上漲 ${item.positiveSegments}/${item.segmentCount}</small>
          <small>成交金額 ${compactMoney(item.value)} ｜ 成交量 ${money(item.volume)} 股</small>
        </div>
        <div class="trend-quote">
          <span>${stockPriceLabel(item)}</span>
          <strong>${money(item.close)}</strong>
          <small class="trend-change ${priceTone(todayChange)}">
            <span>今日 ${signedMoney(todayChange)} /</span>
            <span>${percent(todayChangePercent)}</span>
          </small>
        </div>
      </article>
    `;
  }).join("");

  const sectors = summarizeTrendSectors(items);
  updateTrendGuide(items, sectors);
  renderTrendSummary(displayed, sectors);
  const leader = items[0];
  const sectorLeader = sectors[0];
  els.trendAiTitle.textContent = sectorLeader ? `${sectorLeader.name} 較強` : `${leader.code} 領先`;
  els.trendAiText.textContent = buildTrendAiText(leader, sectorLeader, items);
  els.trendStatus.textContent = `趨勢：已分析 ${items.length} 檔，最後更新 ${new Date().toLocaleString("zh-TW")}`;
  renderTrendChartStats(items, sectors);
  drawTrendChart(items);
  renderBeginnerBrief(latestRanking, watchList.map((item) => {
    const stock = getStock(item.code);
    const val = getValuation(item.code);
    const rev = getRevenue(item.code);
    return { item, stock, val, rev, signal: scoreStock(stock, val, rev) };
  }));
}

function renderTrendSummary(items, sectors = summarizeTrendSectors(items)) {
  if (!els.trendSummary) return;
  if (!items.length) {
    els.trendSummary.innerHTML = `
      <span>${TREND_STOCK_LIMIT} 檔榜單</span>
      <strong>等待資料</strong>
      <p>會列出成交排行前 ${TREND_STOCK_LIMIT} 檔的近一週、1 日、3 日與成交金額。</p>
    `;
    return;
  }
  const upCount = items.filter((item) => item.recentReturn > 0).length;
  const topSector = sectors[0];
  const avgRecent = items.reduce((sum, item) => sum + (item.recentReturn || 0), 0) / items.length;
  const avgMonth = items.reduce((sum, item) => sum + (item.monthReturn || 0), 0) / items.length;
  els.trendSummary.innerHTML = `
    <span>${TREND_STOCK_LIMIT} 檔榜單</span>
    <strong>目前顯示 ${items.length} 檔，${upCount} 檔 1 日上漲</strong>
    <p>平均 1 日 ${percent(avgRecent)}，平均近一週 ${percent(avgMonth)}。${topSector ? `最集中族群是 ${escapeHtml(topSector.name)}，共 ${topSector.count} 檔。` : ""}</p>
  `;
}

function updateTrendGuide(items, sectors = summarizeTrendSectors(items)) {
  if (!els.trendGuide) return;
  if (!items.length) {
    els.trendGuide.innerHTML = `
      <strong>這張圖怎麼看</strong>
      <p>資料更新後，這裡會整理強勢股、風險提醒與資金集中方向。</p>
    `;
    return;
  }

  const strongStocks = items.filter((item) => item.recentReturn > 0).slice(0, 5);
  const riskStocks = items
    .filter((item) => item.monthReturn >= 8 && item.recentReturn < 0)
    .slice(0, 3);
  const sectorNames = sectors
    .filter((sector) => sector.count >= 2)
    .slice(0, 3);

  els.trendGuide.innerHTML = `
    <strong>這張圖怎麼看</strong>
    <ul>
      <li><b>紅色代表今天強：</b>紅色條越長，表示最近 1 日漲幅越大。先看前 5 名${strongStocks.length ? `：${strongStocks.map((item) => `${escapeHtml(item.code)} ${escapeHtml(item.name)}`).join("、")}。` : "。"}</li>
      <li><b>綠色不是一定壞：</b>綠色代表今天回檔。若近一週仍大漲，通常是「漲多整理」，不急著追，等回穩再觀察。</li>
      <li><b>避開風險：</b>${riskStocks.length ? `近一週大漲但今天轉綠的 ${riskStocks.map((item) => `${escapeHtml(item.code)} ${escapeHtml(item.name)}`).join("、")}，先等量縮或止跌。` : "目前沒有明顯「近一週大漲、今日轉弱」的高風險名單。"}</li>
      <li><b>找方向：</b>${sectorNames.length ? `同族群多檔上榜，代表資金可能集中在 ${sectorNames.map((sector) => `<button class="inline-link" type="button" data-trend-sector="${escapeHtml(sector.name)}">${escapeHtml(sector.name)} ${sector.count} 檔</button>`).join("、")}。` : "若同一族群有多檔一起上榜，代表資金可能正在集中。"}</li>
      <li><b>不要只看名次：</b>還要看近一週漲幅、3 日區段上漲次數與成交金額。連續很強但漲幅過大，通常要等拉回。</li>
    </ul>
    <div id="trendSectorDetail" class="trend-sector-detail"></div>
  `;
  els.trendGuide.querySelectorAll("[data-trend-sector]").forEach((button) => {
    button.addEventListener("click", () => renderTrendSectorDetail(button.dataset.trendSector, items, sectors));
  });
  if (sectorNames[0]) renderTrendSectorDetail(sectorNames[0].name, items, sectors);
}

function renderTrendChartStats(items, sectors) {
  if (!els.trendChartStats) return;
  const upCount = items.filter((item) => item.recentReturn > 0).length;
  const downCount = items.filter((item) => item.recentReturn < 0).length;
  const topSector = sectors[0];
  const hottest = items[0];
  const riskCount = items.filter((item) => item.monthReturn > 12 && item.recentReturn < 0).length;
  els.trendChartStats.innerHTML = [
    ["上漲檔數", `${upCount} 檔`],
    ["下跌檔數", `${downCount} 檔`],
    ["最集中族群", topSector ? `${topSector.name} ${topSector.count} 檔` : "--"],
    ["領漲股", hottest ? `${hottest.code} ${hottest.name}` : "--"],
    ["漲多回檔", `${riskCount} 檔`]
  ].map(([label, value]) => `
    <article>
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderTrendSectorDetail(name, items, sectors) {
  const box = els.trendGuide?.querySelector("#trendSectorDetail");
  if (!box) return;
  const sector = sectors.find((item) => item.name === name);
  const stocks = items
    .filter((item) => item.sector === name)
    .sort((a, b) => b.recentReturn - a.recentReturn)
    .slice(0, 8);
  if (!sector || !stocks.length) {
    box.innerHTML = "";
    return;
  }
  const strong = stocks.filter((item) => item.recentReturn > 0).length;
  const risk = stocks.filter((item) => item.monthReturn > 12 && item.recentReturn < 0).length;
  box.innerHTML = `
    <strong>${escapeHtml(name)} 族群明細</strong>
    <p>${escapeHtml(name)} 有 ${sector.count} 檔上榜，最近 1 日平均 ${percent(sector.avgRecent)}，近一週平均 ${percent(sector.avgMonth)}。${strong >= 2 ? "多檔同時轉強，代表資金集中度較高。" : "目前強度偏分散，先觀察是否擴散。"}${risk ? ` 其中 ${risk} 檔有漲多回檔跡象。` : ""}</p>
    <div class="sector-chip-list">
      ${stocks.map((item) => `
        <button type="button" data-stock-code="${escapeHtml(item.code)}">
          ${escapeHtml(item.code)} ${escapeHtml(item.name)}
          <small>1 日 ${percent(item.recentReturn)}｜近一週 ${percent(item.monthReturn)}</small>
        </button>
      `).join("")}
    </div>
  `;
  box.querySelectorAll("[data-stock-code]").forEach((button) => {
    button.addEventListener("click", () => {
      const stock = items.find((item) => item.code === button.dataset.stockCode);
      if (!stock) return;
      const val = getValuation(stock.code);
      const rev = getRevenue(stock.code);
      const item = watchList.find((entry) => entry.code === stock.code) || { code: stock.code, cost: "", shares: "", type: "watch" };
      openStockDetail({ item, stock, val, rev, signal: scoreStock(stock, val, rev) });
    });
  });
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
  const top = items.slice(0, TREND_STOCK_LIMIT);
  const desiredHeight = Math.max(560, top.length * 28);
  canvas.style.height = `${desiredHeight}px`;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(640, Math.round(rect.width * ratio));
  const height = Math.max(desiredHeight * ratio, Math.round(rect.height * ratio));
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
    context.fillText("等待近一週漲勢資料", 24 * ratio, 44 * ratio);
    return;
  }

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
  await Promise.all([
    renderTierGuide("small"),
    renderTierGuide("mid"),
    renderTierGuide("large")
  ]);
}

async function renderTierGuide(tier) {
  const cfg = TIER_CONFIG[tier];
  const state = tierState[tier];
  const listEl = els[cfg.listEl];
  const titleEl = els[cfg.titleEl];
  const textEl = els[cfg.textEl];
  const statusEl = els[cfg.statusEl];
  if (!listEl) return;

  const baseCandidates = market.daily
    .filter((stock) => stock.close >= cfg.min && stock.close < cfg.max && /^\d{4}$/.test(stock.code) && inferSector(stock) !== "ETF")
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
    state.items = [];
    state.selected = "";
    listEl.innerHTML = `<p class="empty">目前沒有找到 ${cfg.emptyText}且資料足夠的候選股。</p>`;
    titleEl.textContent = "等待資料";
    textEl.textContent = `${cfg.label}需要重視流動性與停損，等待資料更新後再判讀。`;
    statusEl.textContent = `${cfg.label}：等待資料`;
    return;
  }
  if (state.requestKey === key && state.items.length) return;

  state.requestKey = key;
  statusEl.textContent = `${cfg.label}：正在分析近月表現`;
  listEl.innerHTML = `<p class="empty">正在篩選 ${cfg.emptyText}、營收與價格表現較佳的股票...</p>`;

  const items = await Promise.all(baseCandidates.map(async ({ stock, val, rev, inst, qualityScore }) => {
    const history = await fetchHistory(stock.code);
    return buildSmallCapItem(stock, val, rev, inst, qualityScore, history);
  }));
  if (state.requestKey !== key) return;

  state.items = items.filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  // 同步舊變數（小型股保留向後相容）
  if (tier === "small") {
    smallCapRequestKey = key;
    latestSmallCapItems = state.items;
    selectedSmallCapCode = state.selected;
  }
  renderTierResults(tier, state.items);
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

function renderTierResults(tier, items) {
  const cfg = TIER_CONFIG[tier];
  const state = tierState[tier];
  const listEl = els[cfg.listEl];
  const titleEl = els[cfg.titleEl];
  const textEl = els[cfg.textEl];
  const statusEl = els[cfg.statusEl];

  if (!items.length) {
    listEl.innerHTML = `<p class="empty">沒有符合「營收與價格表現都偏好」的 ${cfg.emptyText}候選。</p>`;
    titleEl.textContent = "暫無候選";
    textEl.textContent = `${cfg.label}沒有好訊號時寧可等待。`;
    statusEl.textContent = `${cfg.label}：沒有足夠候選`;
    return;
  }

  listEl.innerHTML = items.map((item, index) => `
    <article class="small-cap-card" data-code="${escapeHtml(item.stock.code)}" tabindex="0" role="button" aria-label="查看 ${escapeHtml(item.stock.code)} ${escapeHtml(item.stock.name)} 觀察建議">
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

  listEl.querySelectorAll(".small-cap-card").forEach((card) => {
    const select = () => {
      state.selected = card.dataset.code;
      if (tier === "small") selectedSmallCapCode = state.selected;
      const selected = items.find((item) => item.stock.code === state.selected);
      if (selected) renderTierSelection(tier, selected, items.indexOf(selected) + 1);
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  });

  const selected = items.find((item) => item.stock.code === state.selected) || items[0];
  state.selected = selected.stock.code;
  if (tier === "small") selectedSmallCapCode = state.selected;
  renderTierSelection(tier, selected, items.indexOf(selected) + 1);
  statusEl.textContent = `${cfg.label}：已篩選 ${items.length} 檔，最後更新 ${new Date().toLocaleString("zh-TW")}`;
}

function renderTierSelection(tier, item, rank) {
  const cfg = TIER_CONFIG[tier];
  const listEl = els[cfg.listEl];
  const titleEl = els[cfg.titleEl];
  const textEl = els[cfg.textEl];

  listEl.querySelectorAll(".small-cap-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.code === item.stock.code);
  });

  const signal = scoreStock(item.stock, item.val, item.rev);
  const decision = stockDecision(signal, item.stock, item.val, item.rev, item.inst);
  const risk = riskLevel(item.stock, item.val, item.rev, item.inst);
  const liquidity = item.stock.value >= 300000000 ? "足夠" : item.stock.value >= 80000000 ? "普通" : "偏低";
  const volumeProtection = liquidity === "偏低" ? "成交金額偏低，進出場可能滑價，部位要更小。" : "成交金額尚可，但仍要避免一次重押。";
  const surgeProtection = item.recentReturn > 8 ? "短線急漲，等待回檔或整理比追高安全。" : "短線沒有過度急漲，可觀察是否緩步轉強。";
  const revenueProtection = item.rev?.yoy > 0 ? "營收年增為正，基本面有初步支撐。" : "營收支撐不足，不能只看價格。";
  const institutionProtection = item.inst?.total > 0 ? "法人偏買超，籌碼有加分。" : item.inst?.total < 0 ? "法人偏賣超，籌碼要保守。" : "法人資料不足，籌碼方向不明。";
  const positionSize = risk.label === "高" || liquidity === "偏低" ? "很小" : risk.label === "中" ? "小" : "小到中";
  const strengths = [];
  const cautions = [];

  if (item.monthReturn > 0) strengths.push(`近月 ${percent(item.monthReturn)}，價格有轉強跡象`);
  if (item.recentReturn > 0) strengths.push(`近 3 日 ${percent(item.recentReturn)}，短線仍有買盤`);
  if (item.rev?.yoy > 0) strengths.push(`月營收年增 ${percent(item.rev.yoy)}，基本面沒有明顯轉弱`);
  if (item.val?.pe > 0 && item.val.pe < 25) strengths.push(`本益比 ${item.val.pe}，估值相對沒有過熱`);
  if (item.inst?.total > 0) strengths.push(`法人合計 ${formatShareFlow(item.inst.total)}，籌碼偏買超`);

  if (item.recentReturn > 8) cautions.push("近 3 日漲幅偏大，追高容易遇到回檔");
  if (item.monthReturn > 25) cautions.push("近月已大漲，進場要等拉回或突破確認");
  if (!item.rev || !Number.isFinite(item.rev.yoy)) cautions.push("營收資料不足，不能只看股價表現");
  if (item.rev?.yoy < 0) cautions.push(`月營收年減 ${percent(item.rev.yoy)}，要確認衰退原因`);
  if (item.val?.pe > 30) cautions.push(`本益比 ${item.val.pe} 偏高，估值風險較大`);
  if (item.inst?.total < 0) cautions.push(`法人合計 ${formatShareFlow(item.inst.total)}，籌碼偏賣超`);
  if (!item.inst) cautions.push("法人資料不足，籌碼方向不明");

  const entryRules = [
    "不要看到上榜就直接買，先等回檔沒有跌破前一段支撐。",
    "如果是突破型進場，要確認成交量放大但沒有爆量失控。",
    "第一次只適合小部位測試，後續再用營收與價格是否續強來加減碼。"
  ];
  const avoidRules = [
    "連續急漲、開高走低或量放太大時，不適合追。",
    "如果下一期營收轉弱、法人連續賣超，先移出優先名單。",
    "若買進理由只是「便宜」或「排名很前面」，風險不夠清楚。"
  ];

  if (item.stock.close >= cfg.min && (cfg.max === Infinity || item.stock.close < cfg.max)) {
    const range = cfg.max === Infinity ? `${cfg.min} 元以上` : `${cfg.min}–${cfg.max} 元`;
    if (cfg.min === 0) strengths.push(`股價 ${money(item.stock.close)} 元，符合${cfg.emptyText}候選`);
    else strengths.push(`股價 ${money(item.stock.close)} 元，符合 ${range} ${cfg.label}範圍`);
  }

  titleEl.textContent = `${rank}. ${item.stock.code} ${item.stock.name}：${decision.label}，風險 ${risk.label}`;
  textEl.innerHTML = `
    <section>
      <strong>為什麼會上榜</strong>
      <ul>${(strengths.length ? strengths : ["目前主要靠價格與成交熱度入榜，基本面訊號還需要更多資料確認。"]).map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul>
    </section>
    <section>
      <strong>需要小心</strong>
      <ul>${(cautions.length ? cautions : [`暫無明顯警訊，但${cfg.label}仍要注意流動性與波動。`]).map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul>
    </section>
    <section>
      <strong>觀察建議</strong>
      <p>${escapeHtml(decision.text)} ${escapeHtml(risk.text)}。${escapeHtml(smallCapAdvice(item))}</p>
    </section>
    <section>
      <strong>${cfg.label}保護指標</strong>
      <ul>
        <li>流動性：${escapeHtml(liquidity)}。${escapeHtml(volumeProtection)}</li>
        <li>急漲檢查：${escapeHtml(surgeProtection)}</li>
        <li>營收支撐：${escapeHtml(revenueProtection)}</li>
        <li>法人方向：${escapeHtml(institutionProtection)}</li>
        <li>單檔部位：建議 ${escapeHtml(positionSize)} 部位，不適合一次重押。</li>
      </ul>
    </section>
    <section>
      <strong>比較適合的做法</strong>
      <ul>${entryRules.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul>
    </section>
    <section>
      <strong>先不要碰的情況</strong>
      <ul>${avoidRules.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul>
    </section>
  `;
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
  return date.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

function formatDateOnly(value) {
  const key = marketDateKey(value);
  return key ? key.replaceAll("-", "/") : String(value || "尚未同步");
}

function taipeiDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function taipeiTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    weekday: get("weekday"),
    minutes: Number(get("hour")) * 60 + Number(get("minute"))
  };
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function latestTaiwanTradingDateKey(date = new Date()) {
  const { weekday, minutes } = taipeiTimeParts(date);
  let offset = 0;

  if (weekday === "Sat") offset = -1;
  if (weekday === "Sun") offset = -2;
  if (weekday === "Mon" && minutes < 9 * 60) offset = -3;

  return taipeiDateKey(addDays(date, offset));
}

function marketDateKey(value) {
  if (!value) return "";
  if (typeof value === "number") {
    const date = new Date(value / (value > 10000000000000 ? 1000 : 1));
    return Number.isNaN(date.getTime()) ? "" : taipeiDateKey(date);
  }
  const text = String(value);
  const compact = text.match(/(\d{4})(\d{2})(\d{2})/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  const roc = text.match(/^(\d{2,3})\/(\d{1,2})\/(\d{1,2})/);
  if (roc) {
    const year = String(Number(roc[1]) + 1911);
    const month = String(Number(roc[2])).padStart(2, "0");
    const day = String(Number(roc[3])).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? "" : taipeiDateKey(date);
}

function isCurrentMarketData(value) {
  return marketDateKey(value) === latestTaiwanTradingDateKey();
}

function renderMarketIndex() {
  const marketData = selectedMarket === "us" ? (market.usIndex || sampleUsMarket) : { groups: (market.index?.groups || sampleIndex.groups), source: market.index?.source };
  const groups = selectedMarket === "us" ? marketData.groups : {
    listed: market.index,
    ...(market.index?.groups || {})
  };
  const fallbackGroups = selectedMarket === "us" ? sampleUsMarket.groups : {
    listed: null,
    otc: null,
    electronic: null,
    finance: null
  };
  const index = groups[selectedGroup] || fallbackGroups[selectedGroup] || {};
  const change = number(index.change);
  const changePercent = number(index.changePercent);
  const isUp = change >= 0;
  const hasMarketIndex = isValidMarketIndex(index);
  const quoteSource = String(market.source || "");
  if (!hasMarketIndex) {
    renderMarketIndexUnavailable("資料未連線");
    return;
  }
  const isStaleTaiwanIndex = selectedMarket === "tw" && index.lastUpdated && !isCurrentMarketData(index.lastUpdated);

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
  renderMarketNumberDetails(index, change, changePercent);
  els.marketRealtimeStatus.textContent = hasMarketIndex
    ? `大盤：${marketIndexSourceText(index.source)}${isStaleTaiwanIndex ? "，時間可能不是最近交易日" : ""}`
    : "大盤：非即時或範例資料";
  els.quoteRealtimeStatus.textContent = quoteSourceText(quoteSource);
  const fetchedAt = market.updatedAt || new Date();
  const quoteAt = index.lastUpdated;
  els.marketLastUpdated.textContent = quoteAt
    ? `資料更新：${formatUpdateTime(fetchedAt)}｜行情時間：${formatUpdateTime(quoteAt)}`
    : `資料更新：${formatUpdateTime(fetchedAt)}`;
  if (index.candles?.length >= 2) {
    drawMarketBoardChart(index.candles, index, isUp);
  } else {
    drawMarketSnapshotChart(index, isUp);
  }
}

function renderMarketIndexUnavailable(message = "資料未連線") {
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
    labelEls[key].textContent = labels[key];
    priceEls[key].textContent = "--";
    metaEls[key].textContent = "資料未連線";
  });
  els.groupCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.group === selectedGroup);
  });
  els.marketTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.market === selectedMarket);
  });
  els.marketIndexName.textContent = selectedMarket === "us" ? "美股指數資料未連線" : "台股大盤資料未連線";
  els.marketIndexPrice.textContent = "--";
  els.marketIndexChange.textContent = message;
  els.marketIndexChange.className = "";
  els.marketTurnover.textContent = "--";
  els.marketOpen.textContent = "--";
  els.marketHigh.textContent = "--";
  els.marketLow.textContent = "--";
  els.marketPreviousClose.textContent = "--";
  els.marketChangePoints.textContent = "--";
  els.marketChangePoints.className = "";
  els.marketChangePercent.textContent = "--";
  els.marketChangePercent.className = "";
  els.marketRange.textContent = "--";
  els.marketAmplitude.textContent = "振幅 --";
  els.marketGap.textContent = "--";
  els.marketGap.className = "";
  els.marketIntradayPosition.textContent = "--";
  els.marketRealtimeStatus.textContent = `大盤：${message}，不顯示範例漲跌`;
  els.quoteRealtimeStatus.textContent = "個股：等待公開資料或即時報價";
  els.marketLastUpdated.textContent = "最後更新：尚未取得有效市場資料";
  drawEmptyMarketBoardChart(message);
}

function drawEmptyMarketBoardChart(message) {
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
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#6f6a61";
  context.font = `${16 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  context.fillText(message, 24 * ratio, 48 * ratio);
}

function drawMarketSnapshotChart(index, isUp) {
  const latest = number(index.index);
  const open = number(index.open);
  const high = number(index.high);
  const low = number(index.low);
  if (!Number.isFinite(latest) || !Number.isFinite(open)) {
    drawEmptyMarketBoardChart("目前沒有可用的大盤圖表資料");
    return;
  }

  const latestMinute = clampMarketMinute(taipeiMinutes(index.lastUpdated), 9 * 60 + 1);
  const highMinute = Math.max(9 * 60, Math.min(latestMinute, 9 * 60 + Math.round((latestMinute - 9 * 60) * 0.35)));
  const lowMinute = Math.max(9 * 60, Math.min(latestMinute, 9 * 60 + Math.round((latestMinute - 9 * 60) * 0.7)));
  const points = [{ sessionMinutes: 9 * 60, close: open, volume: 0 }];

  if (Number.isFinite(high) && Math.abs(high - open) >= 0.01) {
    points.push({ sessionMinutes: highMinute, close: high, volume: 0 });
  }
  if (Number.isFinite(low) && Math.abs(low - high) >= 0.01 && Math.abs(low - open) >= 0.01) {
    points.push({ sessionMinutes: lowMinute, close: low, volume: 0 });
  }
  if (Math.abs(latest - points.at(-1).close) >= 0.01 || points.length === 1) {
    points.push({ sessionMinutes: latestMinute, close: latest, volume: 0 });
  }

  drawMarketBoardChart(points, index, isUp);
}

function renderMarketNumberDetails(index, change, changePercent) {
  const open = number(index.open);
  const high = number(index.high);
  const low = number(index.low);
  const latest = number(index.index);
  const previousClose = number(index.previousClose);
  const range = Number.isFinite(high) && Number.isFinite(low) ? high - low : null;
  const amplitude = Number.isFinite(range) && previousClose ? (range / previousClose) * 100 : null;
  const gap = Number.isFinite(open) && previousClose ? ((open - previousClose) / previousClose) * 100 : null;
  const intradayPosition = Number.isFinite(latest) && Number.isFinite(low) && Number.isFinite(range) && range > 0
    ? ((latest - low) / range) * 100
    : null;

  els.marketChangePoints.textContent = signedMoney(change);
  els.marketChangePoints.className = Number.isFinite(change) ? change >= 0 ? "price-up" : "price-down" : "";
  els.marketChangePercent.textContent = percent(changePercent);
  els.marketChangePercent.className = Number.isFinite(changePercent) ? changePercent >= 0 ? "price-up" : "price-down" : "";
  els.marketRange.textContent = Number.isFinite(range) ? money(range) : "--";
  els.marketAmplitude.textContent = Number.isFinite(amplitude) ? `振幅 ${percent(amplitude)}` : "振幅 --";
  els.marketGap.textContent = percent(gap);
  els.marketGap.className = Number.isFinite(gap) ? gap >= 0 ? "price-up" : "price-down" : "";
  els.marketIntradayPosition.textContent = Number.isFinite(intradayPosition) ? `${money(intradayPosition)}%` : "--";
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
    const group = groups[key] || fallbackGroups[key] || {};
    const groupChange = number(group?.change);
    const groupChangePercent = number(group?.changePercent);
    labelEls[key].textContent = labels[key];
    priceEls[key].textContent = Number.isFinite(group?.index) ? money(group.index) : "--";
    metaEls[key].textContent = Number.isFinite(groupChange)
      ? `${groupChange >= 0 ? "▲" : "▼"} ${money(Math.abs(groupChange))} ｜ ${percent(groupChangePercent)}`
      : "資料不足";
  });

  els.groupCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.group === selectedGroup);
  });
  els.marketTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.market === selectedMarket);
  });
}

function taipeiMinutes(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : null;
}

function clampMarketMinute(value, fallback = 9 * 60) {
  const minute = Number.isFinite(value) ? value : fallback;
  return Math.min(13 * 60 + 30, Math.max(9 * 60, minute));
}

function marketMinuteRatio(minutes) {
  return (clampMarketMinute(minutes) - 9 * 60) / (4.5 * 60);
}

function marketPointRatio(point, index, total) {
  if (Number.isFinite(point?.sessionMinutes)) return marketMinuteRatio(point.sessionMinutes);
  const minutes = taipeiMinutes(point?.date);
  if (Number.isFinite(minutes)) return marketMinuteRatio(minutes);
  return total > 1 ? index / (total - 1) : 0;
}

function formatMarketMinute(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = String(minutes % 60).padStart(2, "0");
  return minute === "00" ? String(hour).padStart(2, "0") : `${String(hour).padStart(2, "0")}:${minute}`;
}

function marketChartPoints(points, index) {
  const cleanPoints = (points || [])
    .map((point) => ({
      ...point,
      close: number(point.close),
      volume: number(point.volume)
    }))
    .filter((point) => Number.isFinite(point.close));
  const open = number(index.open);
  if (!cleanPoints.length || !Number.isFinite(open) || Math.abs(cleanPoints[0].close - open) < 0.01) {
    return cleanPoints;
  }

  const firstDate = new Date(cleanPoints[0].date);
  const openDate = Number.isNaN(firstDate.getTime())
    ? cleanPoints[0].date
    : new Date(firstDate.getTime() - 60 * 1000).toISOString();
  return [{ ...cleanPoints[0], date: openDate, close: open, volume: 0 }, ...cleanPoints];
}

function formatMarketChartTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("zh-TW", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Taipei"
  });
}

function marketAxisStep(range) {
  if (!Number.isFinite(range) || range <= 0) return 100;
  const roughStep = range / 8;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return multiplier * magnitude;
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

  const chartPoints = marketChartPoints(points, index);
  if (chartPoints.length < 2) {
    drawEmptyMarketBoardChart("目前沒有足夠的大盤線圖資料");
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 16 * ratio, right: 118 * ratio, bottom: 48 * ratio, left: 20 * ratio };
  const values = chartPoints.map((item) => item.close).filter(Number.isFinite);
  if (Number.isFinite(index.previousClose)) values.push(index.previousClose);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const rawRange = rawMax - rawMin || 1;
  const step = marketAxisStep(rawRange);
  const min = Math.floor((rawMin - step * 0.4) / step) * step;
  const max = Math.ceil((rawMax + step * 0.25) / step) * step;
  const range = max - min || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const color = isUp ? "#ad3032" : "#176b55";

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#cfd6dc";
  context.lineWidth = 1 * ratio;
  const axisValues = [];
  for (let value = min; value <= max + step * 0.1; value += step) {
    axisValues.push(value);
  }
  axisValues.forEach((value) => {
    const y = padding.top + ((max - value) / range) * chartHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right + 4 * ratio, y);
    context.stroke();
  });

  const timeTicks = [9 * 60, 10 * 60, 11 * 60, 12 * 60, 13 * 60, 13 * 60 + 30];
  const minuteX = (minutes) => padding.left + chartWidth * marketMinuteRatio(minutes);
  const pointX = (point, index) => padding.left + chartWidth * marketPointRatio(point, index, chartPoints.length);
  const pointY = (value) => padding.top + ((max - value) / range) * chartHeight;
  timeTicks.forEach((minutes) => {
    const x = minuteX(minutes);
    context.beginPath();
    context.moveTo(x, padding.top);
    context.lineTo(x, height - padding.bottom);
    context.stroke();
  });

  if (Number.isFinite(index.previousClose)) {
    const previousY = pointY(index.previousClose);
    context.strokeStyle = "rgba(36, 36, 35, 0.55)";
    context.setLineDash([5 * ratio, 5 * ratio]);
    context.beginPath();
    context.moveTo(padding.left, previousY);
    context.lineTo(width - padding.right, previousY);
    context.stroke();
    context.setLineDash([]);
  }

  const fillGradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  fillGradient.addColorStop(0, isUp ? "rgba(173, 48, 50, 0.16)" : "rgba(23, 107, 85, 0.18)");
  fillGradient.addColorStop(1, isUp ? "rgba(173, 48, 50, 0.03)" : "rgba(23, 107, 85, 0.03)");
  context.fillStyle = fillGradient;
  context.beginPath();
  chartPoints.forEach((point, index) => {
    const x = pointX(point, index);
    const y = pointY(point.close);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.lineTo(pointX(chartPoints.at(-1), chartPoints.length - 1), height - padding.bottom);
  context.lineTo(pointX(chartPoints[0], 0), height - padding.bottom);
  context.closePath();
  context.fill();

  context.strokeStyle = color;
  context.lineWidth = 3 * ratio;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.beginPath();
  chartPoints.forEach((point, index) => {
    const x = pointX(point, index);
    const y = pointY(point.close);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
  context.lineCap = "butt";

  const volumeBase = height - padding.bottom;
  const maxVolume = Math.max(...chartPoints.map((point) => point.volume || 0), 0);
  if (maxVolume > 0) {
    chartPoints.forEach((point, index) => {
      const barHeight = ((point.volume || 0) / maxVolume) * Math.min(44 * ratio, chartHeight * 0.16);
      context.fillStyle = "rgba(47, 111, 211, 0.52)";
      context.fillRect(pointX(point, index) - 2 * ratio, volumeBase - barHeight, 3 * ratio, barHeight);
    });
  }

  const latest = chartPoints.at(-1);
  const latestY = latest ? pointY(latest.close) : null;
  const previousY = Number.isFinite(index.previousClose) ? pointY(index.previousClose) : null;
  const floatingLabelYs = [];
  const rightLabelX = width - padding.right + 14 * ratio;
  if (latest) {
    const x = pointX(latest, chartPoints.length - 1);
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, latestY, 5 * ratio, 0, Math.PI * 2);
    context.fill();
    const latestLabelY = previousY !== null && Math.abs(previousY - latestY) < 34 * ratio
      ? latestY + (latestY < chartHeight / 2 ? -14 * ratio : 14 * ratio)
      : latestY;
    floatingLabelYs.push(latestLabelY);
    drawCanvasPill(context, money(latest.close), rightLabelX, latestLabelY, {
      ratio,
      align: "left",
      background: color,
      fontSize: 13,
      height: 27,
      maxX: width - 4 * ratio,
      minY: padding.top + 4 * ratio,
      maxY: height - padding.bottom - 6 * ratio
    });
  }

  if (previousY !== null) {
    const previousLabelY = latestY !== null && Math.abs(previousY - latestY) < 34 * ratio
      ? previousY + (previousY < chartHeight / 2 ? 18 * ratio : -18 * ratio)
      : previousY;
    floatingLabelYs.push(previousLabelY);
    drawCanvasPill(context, money(index.previousClose), rightLabelX, previousLabelY, {
      ratio,
      align: "left",
      background: "#5d6470",
      fontSize: 13,
      height: 27,
      maxX: width - 4 * ratio,
      minY: padding.top + 4 * ratio,
      maxY: height - padding.bottom - 6 * ratio
    });
  }

  context.fillStyle = "#4d5661";
  context.font = `${13 * ratio}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  axisValues.slice().reverse().forEach((value) => {
    const y = pointY(value);
    if (floatingLabelYs.some((labelY) => Math.abs(labelY - y) < 24 * ratio)) return;
    context.textAlign = "left";
    context.fillText(money(value), rightLabelX, y + 4 * ratio);
  });
  timeTicks.forEach((minutes, labelIndex) => {
    const label = formatMarketMinute(minutes);
    const x = minuteX(minutes);
    context.textAlign = labelIndex === timeTicks.length - 1 ? "right" : labelIndex === 0 ? "left" : "center";
    context.fillText(label, x, height - 14 * ratio);
  });
  context.textAlign = "left";
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

function realizedProfitTotal() {
  return sellHistory.reduce((sum, item) => sum + (number(item.profit) || 0), 0);
}

function realizedNetMetrics(item) {
  const shares = number(item?.shares);
  const costValue = number(item?.costValue) ?? (
    Number.isFinite(number(item?.buyCost)) && Number.isFinite(shares)
      ? number(item.buyCost) * shares
      : null
  );
  const soldValue = number(item?.soldValue) ?? (
    Number.isFinite(number(item?.sellPrice)) && Number.isFinite(shares)
      ? number(item.sellPrice) * shares
      : null
  );
  const grossProfit = number(item?.profit) ?? (
    Number.isFinite(soldValue) && Number.isFinite(costValue) ? soldValue - costValue : null
  );
  const estimated = netTradeMetrics({ buyValue: costValue, sellValue: soldValue, grossProfit });
  const storedFees = number(item?.fees);
  const storedTax = number(item?.tax);
  const tradingCost = Number.isFinite(storedFees) || Number.isFinite(storedTax)
    ? (storedFees || 0) + (storedTax || 0)
    : estimated.total;
  const netProfit = number(item?.netProfit) ?? (
    Number.isFinite(grossProfit) ? grossProfit - tradingCost : null
  );
  const cashCost = Number.isFinite(costValue) && costValue > 0 ? costValue + estimated.buyFee : null;
  return {
    ...estimated,
    grossProfit,
    tradingCost,
    netProfit,
    netProfitRate: number(item?.netProfitRate) ?? (netProfit !== null && cashCost ? (netProfit / cashCost) * 100 : null)
  };
}

function realizedNetProfitTotal() {
  return sellHistory.reduce((sum, item) => {
    const netProfit = realizedNetMetrics(item).netProfit;
    return sum + (Number.isFinite(netProfit) ? netProfit : 0);
  }, 0);
}

function realizedTradingCostTotal() {
  return sellHistory.reduce((sum, item) => sum + (realizedNetMetrics(item).tradingCost || 0), 0);
}

function consumeLots(item, sellShares) {
  const lots = holdingLots(item);
  let remainingToSell = sellShares;
  const soldLots = [];
  const remainingLots = [];

  lots.forEach((lot) => {
    if (remainingToSell <= 0) {
      remainingLots.push(lot);
      return;
    }
    const soldShares = Math.min(lot.shares, remainingToSell);
    soldLots.push({ ...lot, shares: soldShares });
    remainingToSell -= soldShares;
    const leftoverShares = lot.shares - soldShares;
    if (leftoverShares > 0) remainingLots.push({ ...lot, shares: roundPrice(leftoverShares) });
  });

  return { soldLots, remainingLots, unsoldShares: remainingToSell };
}

function sellHolding(item, stock) {
  const shares = holdingShares(item);
  const cost = averageHoldingCost(item);
  if (!Number.isFinite(shares) || shares <= 0) {
    alert("這檔持股沒有股數，先補上股數後才能記錄賣出。");
    return;
  }
  if (!Number.isFinite(cost) || cost <= 0) {
    alert("這檔持股沒有買進成本，先補上成本後才能計算已實現獲利。");
    return;
  }

  const defaultPrice = stock?.close ? money(stock.close) : "";
  const priceInput = prompt(`賣出 ${stockDisplayName(item)} 的成交價？`, defaultPrice);
  if (priceInput === null) return;
  const sellPrice = number(priceInput);
  if (!Number.isFinite(sellPrice) || sellPrice <= 0) {
    alert("請輸入正確的賣出成交價。");
    return;
  }

  const sharesInput = prompt(`賣出股數？目前持有 ${money(shares)} 股`, String(shares));
  if (sharesInput === null) return;
  const sellShares = number(sharesInput);
  if (!Number.isFinite(sellShares) || sellShares <= 0 || sellShares > shares) {
    alert("賣出股數必須大於 0，且不能超過目前持有股數。");
    return;
  }

  const { soldLots, remainingLots, unsoldShares } = consumeLots(item, sellShares);
  if (unsoldShares > 0.0001 || !soldLots.length) {
    alert("賣出股數超過目前可用持股，請重新確認。");
    return;
  }
  const soldCostValue = soldLots.reduce((sum, lot) => sum + lot.cost * lot.shares, 0);
  const averageBuyCost = soldCostValue / sellShares;
  const soldValue = sellPrice * sellShares;
  const profit = soldValue - soldCostValue;
  const net = netTradeMetrics({ buyValue: soldCostValue, sellValue: soldValue, grossProfit: profit });
  const remainingShares = shares - sellShares;
  sellHistory.unshift({
    id: `${Date.now()}-${item.code}`,
    code: item.code,
    name: stock?.name || item.name || "",
    buyCost: averageBuyCost,
    sellPrice,
    shares: sellShares,
    costValue: soldCostValue,
    soldValue,
    profit,
    profitRate: soldCostValue ? (profit / soldCostValue) * 100 : null,
    fees: net.buyFee + net.sellFee,
    tax: net.securitiesTax,
    tradingCost: net.total,
    netProfit: net.netProfit,
    netProfitRate: net.netProfitRate,
    lots: soldLots,
    soldAt: new Date().toISOString()
  });

  if (remainingShares > 0) {
    item.lots = remainingLots;
    syncHoldingTotals(item);
  } else {
    watchList = watchList.filter((entry) => entry.code !== item.code);
  }

  saveWatchList();
  render();
}

function deleteSellRecord(recordId) {
  if (!confirm("確定要刪除這筆賣出歷史紀錄嗎？這不會自動還原目前持股。")) return;
  sellHistory = sellHistory.filter((item) => item.id !== recordId);
  saveWatchList();
  render();
}

function historyStockLabel(item) {
  return item.name ? `${item.name} ${item.code}` : item.code;
}

function realizedProfitByCode(code) {
  return sellHistory
    .filter((item) => item.code === code)
    .reduce((sum, item) => sum + (number(item.profit) || 0), 0);
}

function realizedNetProfitByCode(code) {
  return sellHistory
    .filter((item) => item.code === code)
    .reduce((sum, item) => {
      const netProfit = realizedNetMetrics(item).netProfit;
      return sum + (Number.isFinite(netProfit) ? netProfit : 0);
    }, 0);
}

function tradeDateListText(values, label) {
  const dates = [...new Set(values
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => formatDateOnly(date)))];
  if (!dates.length) return `${label} --`;
  return `${label} ${dates.join("、")}`;
}

function renderHoldingTradeSummary(holdings) {
  if (!els.holdingTradeSummary) return;
  const holdingMap = new Map(holdings.map((entry) => [entry.item.code, entry]));
  const codes = Array.from(new Set([
    ...holdings.map((entry) => entry.item.code),
    ...sellHistory.map((item) => item.code)
  ])).filter(Boolean);

  if (!codes.length) {
    els.holdingTradeSummary.innerHTML = '<p class="empty">新增持股或賣出後，這裡會用表格彙總現價、目前持股數與累計虧損。</p>';
    return;
  }

  const rows = codes.map((code) => {
    const entry = holdingMap.get(code);
    const stock = entry?.stock || getStock(code);
    const item = entry?.item || sellHistory.find((history) => history.code === code) || { code };
    const metrics = entry ? holdingMetrics(entry) : {};
    const buyLots = entry ? holdingLots(entry.item) : [];
    const sales = sellHistory.filter((history) => history.code === code);
    const buyCount = buyLots.length;
    const sellCount = sales.length;
    const realizedPnl = realizedProfitByCode(code);
    const realizedNetPnl = realizedNetProfitByCode(code);
    const currentPnl = Number.isFinite(metrics.pnl) ? metrics.pnl : 0;
    const currentNetPnl = Number.isFinite(metrics.netPnl) ? metrics.netPnl : 0;
    const todayPnl = Number.isFinite(metrics.todayPnl) ? metrics.todayPnl : 0;
    const cumulativePnl = currentPnl + realizedPnl;
    const netCumulativePnl = currentNetPnl + realizedNetPnl;
    const tradeDateLines = [
      tradeDateListText(buyLots.map((lot) => lot.boughtAt), "買"),
      tradeDateListText(sales.map((history) => history.soldAt), "賣")
    ];
    return {
      code,
      label: historyStockLabel({ code, name: stock?.name || item.name || "" }),
      tradeDateLines,
      currentPrice: number(stock?.close),
      currentShares: entry ? holdingShares(entry.item) : 0,
      buyCount,
      sellCount,
      todayPnl,
      currentPnl,
      realizedPnl,
      cumulativePnl,
      netCumulativePnl
    };
  }).sort((a, b) => a.cumulativePnl - b.cumulativePnl || a.code.localeCompare(b.code));

  const todayUpsideTotal = rows.reduce((sum, row) => sum + Math.max(row.todayPnl, 0), 0);
  const todayDownsideTotal = rows.reduce((sum, row) => sum + Math.min(row.todayPnl, 0), 0);
  const todayNetPnl = rows.reduce((sum, row) => sum + row.todayPnl, 0);
  const totalPnl = rows.reduce((sum, row) => sum + row.cumulativePnl, 0);
  const totalNetPnl = rows.reduce((sum, row) => sum + row.netCumulativePnl, 0);

  els.holdingTradeSummary.innerHTML = `
    <div class="trade-summary-table" role="table" aria-label="歷史買賣紀錄彙總">
      <div class="trade-summary-row trade-summary-head" role="row">
        <span role="columnheader">股票</span>
        <span role="columnheader">買賣日期</span>
        <span role="columnheader">現價</span>
        <span role="columnheader">目前持股數</span>
        <span role="columnheader">買 / 賣</span>
        <span role="columnheader">買賣至今損益</span>
      </div>
      ${rows.map((row) => `
        <div class="trade-summary-row" role="row">
          <strong role="cell" data-label="股票">${escapeHtml(row.label)}</strong>
          <span role="cell" class="trade-summary-date" data-label="買賣日期">
            <span class="trade-date-lines">${row.tradeDateLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</span>
          </span>
          <span role="cell" data-label="現價">${Number.isFinite(row.currentPrice) ? money(row.currentPrice) : "--"}</span>
          <span role="cell" data-label="目前持股數">${row.currentShares ? `${money(row.currentShares)} 股` : "0 股"}</span>
          <span role="cell" data-label="買 / 賣">${row.buyCount} / ${row.sellCount} 筆</span>
          <strong role="cell" data-label="買賣至今損益" class="${priceTone(row.cumulativePnl)}">
            ${formatCurrency(row.cumulativePnl)}
            <small class="${priceTone(row.netCumulativePnl)}">稅後 ${formatCurrency(row.netCumulativePnl)}</small>
          </strong>
        </div>
      `).join("")}
      <div class="trade-summary-total">
        <div class="trade-total-item">
          <span>今日上漲股合計</span>
          <strong class="${priceTone(todayUpsideTotal)}">${formatCurrency(todayUpsideTotal)}</strong>
        </div>
        <div class="trade-total-item">
          <span>今日下跌股合計</span>
          <strong class="${priceTone(todayDownsideTotal)}">${formatCurrency(todayDownsideTotal)}</strong>
        </div>
        <div class="trade-total-item">
          <span>全部股票今日淨損益</span>
          <strong class="${priceTone(todayNetPnl)}">${formatCurrency(todayNetPnl)}</strong>
        </div>
        <div class="trade-total-item">
          <span>買賣至今總損益</span>
          <strong class="${priceTone(totalPnl)}">${formatCurrency(totalPnl)}</strong>
        </div>
        <div class="trade-total-item">
          <span>稅後純盈虧</span>
          <strong class="${priceTone(totalNetPnl)}">${formatCurrency(totalNetPnl)}</strong>
        </div>
      </div>
    </div>
  `;
}

function buyLotRows() {
  return watchList
    .filter((item) => (item.type || "holding") === "holding")
    .flatMap((item) => {
      const stock = getStock(item.code);
      return holdingLots(item).map((lot) => {
        const currentPrice = number(stock?.close);
        const marketValue = Number.isFinite(currentPrice) ? currentPrice * lot.shares : null;
        const costValue = lot.cost * lot.shares;
        const profit = marketValue === null ? null : marketValue - costValue;
        const profitRate = profit === null || !costValue ? null : (profit / costValue) * 100;
        const net = netTradeMetrics({ buyValue: costValue, sellValue: marketValue, grossProfit: profit });
        return {
          id: lot.id,
          type: "buy",
          code: item.code,
          name: stock?.name || item.name || "",
          date: lot.boughtAt,
          shares: lot.shares,
          buyCost: lot.cost,
          currentPrice,
          profit,
          profitRate,
          tradingCost: net.total,
          netProfit: net.netProfit,
          netProfitRate: net.netProfitRate
        };
      });
    });
}

function tradeHistoryRows() {
  const sells = sellHistory.map((item) => ({
    ...item,
    type: "sell",
    date: item.soldAt
  }));
  return [...sells, ...buyLotRows()]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function renderSellHistory() {
  if (!els.sellHistoryList) return;
  const totalProfit = realizedProfitTotal();
  const totalNetProfit = realizedNetProfitTotal();
  const totalTradingCost = realizedTradingCostTotal();
  const buyRows = buyLotRows();
  const unrealizedProfit = buyRows.reduce((sum, item) => sum + (number(item.profit) || 0), 0);
  const unrealizedNetProfit = buyRows.reduce((sum, item) => sum + (number(item.netProfit) || 0), 0);
  const rows = tradeHistoryRows();
  const latest = rows[0];

  if (els.realizedOverview) {
    els.realizedOverview.innerHTML = `
    <div class="realized-overview-grid">
      <article>
        <span>已實現損益</span>
        <strong class="${priceTone(totalProfit)}">${sellHistory.length ? formatCurrency(totalProfit) : "--"}</strong>
      </article>
      <article>
        <span>已實現稅後</span>
        <strong class="${priceTone(totalNetProfit)}">${sellHistory.length ? formatCurrency(totalNetProfit) : "--"}</strong>
      </article>
      <article>
        <span>未實現損益</span>
        <strong class="${priceTone(unrealizedProfit)}">${buyRows.length ? formatCurrency(unrealizedProfit) : "--"}</strong>
      </article>
      <article>
        <span>未實現稅後</span>
        <strong class="${priceTone(unrealizedNetProfit)}">${buyRows.length ? formatCurrency(unrealizedNetProfit) : "--"}</strong>
      </article>
      <article>
        <span>已賣出交易成本</span>
        <strong>${sellHistory.length ? `${money(totalTradingCost)} 元` : "--"}</strong>
      </article>
      <article>
        <span>買進紀錄</span>
        <strong>${buyRows.length ? `${buyRows.length} 筆` : "--"}</strong>
      </article>
      <article>
        <span>賣出紀錄</span>
        <strong>${sellHistory.length ? `${sellHistory.length} 筆` : "--"}</strong>
      </article>
      <article>
        <span>最近交易</span>
        <strong>${latest ? escapeHtml(historyStockLabel(latest)) : "--"}</strong>
      </article>
    </div>
  `;
  }

  if (!rows.length) {
    els.sellHistoryList.innerHTML = '<p class="empty">新增持股後會列出每次買進；在我的存股卡片按「賣出」後，這裡會保留賣出價位與損益。</p>';
    return;
  }

  els.sellHistoryList.innerHTML = "";
  rows.forEach((item) => {
    const profit = number(item.profit);
    const net = item.type === "sell" ? realizedNetMetrics(item) : { netProfit: number(item.netProfit), netProfitRate: number(item.netProfitRate), tradingCost: number(item.tradingCost) };
    const netProfit = number(net.netProfit);
    const row = document.createElement("article");
    row.className = `sell-history-row ${item.type === "buy" ? "buy-history-row" : ""}`;
    const profitRate = number(item.profitRate);
    if (item.type === "buy") {
      row.innerHTML = `
        <div class="sell-history-main">
          <strong>${escapeHtml(historyStockLabel(item))}</strong>
          <span>${escapeHtml(formatDateOnly(item.date))} ｜ 買進 ${money(item.shares)} 股 ｜ 買進價 ${money(item.buyCost)} ｜ 現價 ${Number.isFinite(item.currentPrice) ? money(item.currentPrice) : "--"}</span>
        </div>
        <div class="sell-history-profit">
          <span>未實現</span>
          <strong class="${priceTone(profit)}">${Number.isFinite(profit) ? formatCurrency(profit) : "--"}</strong>
          <small>${Number.isFinite(netProfit) ? `稅後 ${formatCurrency(netProfit)}` : "--"} ｜ ${Number.isFinite(profitRate) ? percent(profitRate) : "--"}</small>
        </div>
        <span class="trade-badge buy">買進</span>
      `;
    } else {
      row.innerHTML = `
        <div class="sell-history-main">
          <strong>${escapeHtml(historyStockLabel(item))}</strong>
          <span>${escapeHtml(formatDateOnly(item.soldAt))} ｜ 賣出 ${money(item.shares)} 股 ｜ 均買 ${money(item.buyCost)} ｜ 賣出 ${money(item.sellPrice)} ｜ 金額 ${compactMoney(number(item.soldValue) || number(item.sellPrice) * number(item.shares))}</span>
        </div>
        <div class="sell-history-profit">
          <span>已實現</span>
          <strong class="${priceTone(profit)}">${formatCurrency(profit)}</strong>
          <small>${Number.isFinite(netProfit) ? `稅後 ${formatCurrency(netProfit)}` : "--"} ｜ ${Number.isFinite(profitRate) ? percent(profitRate) : "--"}</small>
        </div>
        <button class="history-delete" type="button" aria-label="刪除歷史紀錄">刪除</button>
      `;
      row.querySelector(".history-delete").addEventListener("click", () => deleteSellRecord(item.id));
    }
    els.sellHistoryList.append(row);
  });
}

function renderHoldings(holdings) {
  els.holdingList.innerHTML = "";
  if (!holdings.length) {
    els.holdingList.innerHTML = '<p class="empty">把分類選成「我的存股」後加入股票，這裡會集中顯示市值、成本、損益與長期持有提醒。</p>';
    return;
  }

  holdings.forEach(({ item, stock, val, rev, signal }) => {
    const inst = getInstitutional(item.code);
    const { cost, shares, marketValue, costValue, pnl, pnlRate, netPnl, tradingCost, todayChange, todayChangePercent, todayPnl, yearlyDividend } = holdingMetrics({ item, stock, val });
    const lots = holdingLots(item);
    const dayHigh = number(stock?.high);
    const dayLow = number(stock?.low);
    const decision = stockDecision(signal, stock, val, rev, inst);
    const risk = riskLevel(stock, val, rev, inst, pnlRate);
    const warning = dataWarning(val, rev, inst);
    const card = document.createElement("article");
    card.className = "holding-card";
    card.innerHTML = `
      <div class="holding-top">
        <div class="holding-title">
          <strong>${item.code} ${stock?.name || "查無名稱"}</strong>
          <span>${shares ? `${money(shares)} 股` : "未填股數"} ｜ 均價 ${cost ? money(cost) : "--"}${lots.length > 1 ? ` ｜ ${lots.length} 筆買進` : ""}</span>
        </div>
        <div class="holding-live-quote">
          <span>${stockPriceLabel(stock)}</span>
          <strong>${stock ? money(stock.close) : "--"}</strong>
          <small class="${priceTone(todayChange)}">今日 ${signedMoney(todayChange)} / ${percent(todayChangePercent)}</small>
          <small class="quote-stamp">${escapeHtml(stockQuoteStamp(stock))}</small>
        </div>
        <div class="holding-actions">
          <button class="sell" type="button">賣出</button>
          <button class="delete" type="button" aria-label="刪除">×</button>
        </div>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>目前市值</span><strong>${marketValue === null ? "--" : compactMoney(marketValue)}</strong></div>
        <div class="metric"><span>投入成本</span><strong>${costValue === null ? "--" : compactMoney(costValue)}</strong></div>
        <div class="metric"><span>今日最高</span><strong>${Number.isFinite(dayHigh) ? money(dayHigh) : "--"}</strong></div>
        <div class="metric"><span>今日最低</span><strong>${Number.isFinite(dayLow) ? money(dayLow) : "--"}</strong></div>
        <div class="metric"><span>今日波動</span><strong class="${priceTone(todayPnl)}">${todayPnl === null ? "--" : compactMoney(todayPnl)}</strong></div>
        <div class="metric"><span>帳面損益</span><strong class="${pnl >= 0 ? "price-up" : "price-down"}">${pnl === null ? "--" : compactMoney(pnl)}</strong></div>
        <div class="metric"><span>估計交易成本</span><strong>${Number.isFinite(netPnl) ? compactMoney(tradingCost) : "--"}</strong></div>
        <div class="metric"><span>稅後純盈虧</span><strong class="${priceTone(netPnl)}">${netPnl === null ? "--" : compactMoney(netPnl)}</strong></div>
        <div class="metric"><span>損益率</span><strong class="${pnlRate >= 0 ? "price-up" : "price-down"}">${pnlRate === null ? "--" : percent(pnlRate)}</strong></div>
        <div class="metric"><span>殖利率</span><strong>${val?.yieldRate ?? "--"}%</strong></div>
        <div class="metric"><span>估年股息</span><strong>${yearlyDividend === null ? "--" : compactMoney(yearlyDividend)}</strong></div>
        <div class="metric"><span>營收月份</span><strong>${revenueMonthText(rev)}</strong></div>
        <div class="metric"><span>月營收</span><strong>${revenueAmountText(rev)}</strong></div>
        <div class="metric"><span>月營收月增</span><strong class="${priceTone(rev?.mom)}">${rev ? percent(rev.mom) : "--"}</strong></div>
        <div class="metric"><span>月營收年增</span><strong class="${priceTone(rev?.yoy)}">${rev ? percent(rev.yoy) : "--"}</strong></div>
        <div class="metric"><span>法人合計</span><strong class="${inst ? inst.total >= 0 ? "price-up" : "price-down" : ""}">${inst ? formatShareFlow(inst.total) : "--"}</strong></div>
        <div class="metric"><span>狀態</span><strong><span class="pill ${decision.tone}">${decision.label}</span></strong></div>
        <div class="metric"><span>風險等級</span><strong><span class="pill ${risk.tone}">${risk.label}</span></strong></div>
      </div>
      ${lots.length ? `
        <div class="holding-lot-list" aria-label="買進批次">
          <div class="holding-lot-head">
            <strong>買進紀錄</strong>
            <span>均價 ${cost ? money(cost) : "--"}，總成本 ${costValue === null ? "--" : compactMoney(costValue)}</span>
          </div>
          ${lots.map((lot) => {
            const lotPnl = stock && Number.isFinite(stock.close) ? (stock.close - lot.cost) * lot.shares : null;
            return `
              <div class="holding-lot-row">
                <span>${escapeHtml(formatDateOnly(lot.boughtAt))}</span>
                <strong>${money(lot.shares)} 股 @ ${money(lot.cost)}</strong>
                <small class="${priceTone(lotPnl)}">${Number.isFinite(lotPnl) ? formatCurrency(lotPnl) : "--"}</small>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}
      <p class="holding-note">${revenueSummaryText(rev)} ${decision.text} ${risk.text}。${operationScenario(item, stock, val, rev, inst, pnlRate)} ${warning ? `${warning} ` : ""}${aiHoldingAdvice(stock, val, rev, inst, pnlRate ?? 0)}</p>
    `;
    card.querySelector(".delete").addEventListener("click", () => {
      watchList = watchList.filter((entry) => entry.code !== item.code);
      saveWatchList();
      render();
    });
    card.querySelector(".sell").addEventListener("click", () => {
      sellHolding(item, stock);
    });
    card.addEventListener("click", (event) => {
      if (event.target.closest(".delete") || event.target.closest(".sell")) return;
      openStockDetail({ item, stock, val, rev, signal });
    });
    els.holdingList.append(card);
  });
}

function renderNews() {
  const source = market.news?.length ? market.news : sampleNews;
  const strongSectors = summarizeSectors(latestRanking.length ? latestRanking : market.daily).map((item) => item.name);
  const items = source.map((item) => {
    const title = item.title || "";
    const relatedHolding = watchList.some((entry) => title.includes(entry.code));
    const relatedSector = strongSectors.some((sector) => title.includes(sector));
    const warning = /跌|賣超|衰退|下修|風險|警訊/.test(title);
    return {
      ...item,
      category: relatedHolding ? "我的持股" : relatedSector ? "強勢族群" : warning ? "風險警訊" : item.category || "大盤新聞"
    };
  }).slice(0, 8);
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

function renderHoldingNews(tracked) {
  const keywords = tracked
    .flatMap((entry) => [entry.item.code, entry.stock?.name])
    .filter(Boolean);
  const news = market.news?.length ? market.news : sampleNews;
  const isSimple = document.body?.dataset?.viewMode === "simple";
  const limit = isSimple ? 3 : 6;
  const matched = news.filter((item) => keywords.some((keyword) => item.title.includes(keyword))).slice(0, limit);
  const fallback = tracked.slice(0, isSimple ? 2 : 4).map((entry) => {
    const stock = entry.stock;
    const inst = getInstitutional(entry.item.code);
    return {
      title: `${entry.item.code} ${stock?.name || "追蹤股票"}：${entry.signal.level}，${inst ? `法人合計 ${formatShareFlow(inst.total)}` : "等待法人資料"}`,
      category: "持股提醒",
      date: new Date(),
      source: "系統整理",
      url: "https://www.cnyes.com/"
    };
  });
  const items = matched.length ? matched : fallback;
  els.holdingNewsList.innerHTML = items.length ? items.map((item) => `
    <a class="news-card" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.category || "持股")} ｜ ${escapeHtml(formatNewsDate(item.date))}</small>
      </div>
      <span class="pill source-pill">${escapeHtml(item.source || "系統整理")}</span>
    </a>
  `).join("") : '<p class="empty">加入持股或觀察名單後，這裡會整理和你股票相關的新聞與提醒。</p>';
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
    const inst = getInstitutional(item.code);
    const todayChange = stockTodayChange(stock);
    const todayChangePercent = stockTodayChangePercent(stock);
    const decision = stockDecision(signal, stock, val, rev, inst);
    const risk = riskLevel(stock, val, rev, inst, pnlRate);
    const warning = dataWarning(val, rev, inst);
    const card = document.createElement("article");
    card.className = "stock-card";
    card.innerHTML = `
      <div class="stock-top">
        <div class="stock-title">
          <strong>${item.code} ${stock?.name || "查無名稱"}</strong>
          <span class="pill ${decision.tone}">${decision.label}</span>
          <span class="pill ${risk.tone}">風險 ${risk.label}</span>
        </div>
        <button class="delete" type="button" aria-label="刪除">×</button>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>${stockPriceLabel(stock)}</span><strong>${stock ? money(stock.close) : "--"}</strong></div>
        <div class="metric"><span>今日漲跌</span><strong class="${priceTone(todayChange)}">${stock ? `${signedMoney(todayChange)} / ${percent(todayChangePercent)}` : "--"}</strong></div>
        <div class="metric"><span>持有損益</span><strong class="${pnl >= 0 ? "price-up" : "price-down"}">${pnl === null ? "--" : compactMoney(pnl)}</strong></div>
        <div class="metric"><span>損益率</span><strong class="${pnlRate >= 0 ? "price-up" : "price-down"}">${pnlRate === null ? "--" : percent(pnlRate)}</strong></div>
      </div>
      <p class="signal">${decision.text} ${risk.text}。${operationScenario(item, stock, val, rev, inst, pnlRate)} ${warning}</p>
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
  const decision = stockDecision(signal, stock, val, rev, inst);
  const risk = riskLevel(stock, val, rev, inst, pnlRate);
  const warning = dataWarning(val, rev, inst);

  els.detailTitle.textContent = `${item.code} ${stock?.name || val?.name || rev?.name || ""}`;
  els.detailPrice.textContent = stock ? money(stock.close) : "--";
  els.detailPe.textContent = val?.pe ?? "--";
  els.detailRevenueMonth.textContent = revenueMonthText(rev);
  els.detailRevenueAmount.textContent = revenueAmountText(rev);
  els.detailRevenueMom.textContent = rev ? percent(rev.mom) : "--";
  els.detailRevenueMom.className = priceTone(rev?.mom);
  els.detailRevenue.textContent = rev ? percent(rev.yoy) : "--";
  els.detailRevenue.className = priceTone(rev?.yoy);
  els.detailInstitutional.textContent = inst ? formatShareFlow(inst.total) : "--";
  els.detailInstitutional.className = inst ? inst.total >= 0 ? "price-up" : "price-down" : "";
  els.detailPlainText.textContent = `${decision.label}，風險 ${risk.label}：${decision.text} ${risk.text}。`;
  els.detailHoldingText.textContent = cost && shares
    ? `持有 ${money(shares)} 股，投入 ${compactMoney(costValue)}，目前損益 ${pnl === null ? "--" : compactMoney(pnl)}，損益率 ${pnlRate === null ? "--" : percent(pnlRate)}。`
    : "尚未填入買進價與股數，可以先當作觀察標的。";
  els.detailInstitutionalText.textContent = institutionalText(inst);
  els.detailAiAdviceText.textContent = `${revenueSummaryText(rev)} ${operationScenario(item, stock, val, rev, inst, pnlRate)} ${warning ? `${warning} ` : ""}${aiHoldingAdvice(stock, val, rev, inst, pnlRate ?? 0)} 下單前請確認：買進理由、停損線、單檔部位與資料是否即時。`;
  renderDetailConclusions({ item, stock, val, rev, inst, decision, risk, pnlRate, warning });
  els.detailChartStatus.textContent = "線圖讀取中";
  els.detailModal.hidden = false;

  const history = await fetchHistory(item.code);
  const first = history[0]?.close;
  const last = history.at(-1)?.close;
  const monthReturn = first && last ? ((last - first) / first) * 100 : null;
  els.detailMonthReturn.textContent = monthReturn === null ? "--" : percent(monthReturn);
  els.detailChartStatus.textContent = history.length ? "近月歷史成交資料" : "歷史資料不足";
  activeChartHistory = history;
  resizeChartCanvas();
  drawPriceChart(history);
}

function renderDetailConclusions({ stock, val, rev, inst, decision, risk, pnlRate, warning }) {
  const strengths = [];
  const cautions = [];
  if (rev?.yoy > 0) strengths.push(`營收年增 ${percent(rev.yoy)}`);
  if (inst?.total > 0) strengths.push(`法人買超 ${formatShareFlow(inst.total)}`);
  if (stock?.changePercent > 0) strengths.push(`今日上漲 ${percent(stock.changePercent)}`);
  if (val?.yieldRate >= 3) strengths.push(`殖利率 ${val.yieldRate}%`);
  if (stock?.changePercent > 6) cautions.push("短線漲幅偏大");
  if (rev?.yoy < 0) cautions.push(`營收年減 ${percent(rev.yoy)}`);
  if (inst?.total < 0) cautions.push(`法人賣超 ${formatShareFlow(inst.total)}`);
  if (val?.pe > 35) cautions.push(`本益比 ${val.pe} 偏高`);
  if (pnlRate < -8) cautions.push(`持有虧損 ${percent(pnlRate)}`);
  if (warning) cautions.push(warning);

  const rows = [
    ["目前狀態", `${decision.label}，風險 ${risk.label}`, decision.tone],
    ["最大優點", strengths[0] || "尚未看到明確優勢", strengths.length ? "good" : "warn"],
    ["最大風險", cautions[0] || "暫無明顯警訊", cautions.length ? "bad" : "good"]
  ];
  els.detailConclusionList.innerHTML = rows.map(([title, text, tone]) => `
    <article class="detail-conclusion-card">
      <span>${title}</span>
      <strong class="${tone === "bad" ? "price-down" : tone === "good" ? "price-up" : ""}">${text}</strong>
    </article>
  `).join("");
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

function drawCanvasPill(context, text, anchorX, anchorY, options = {}) {
  const ratio = options.ratio || 1;
  const paddingX = (options.paddingX ?? 8) * ratio;
  const height = (options.height ?? 28) * ratio;
  const radius = (options.radius ?? 5) * ratio;
  const margin = (options.margin ?? 8) * ratio;
  const fontSize = (options.fontSize ?? 13) * ratio;
  const minX = options.minX ?? margin;
  const maxX = options.maxX ?? context.canvas.width - margin;
  const minY = options.minY ?? margin;
  const maxY = options.maxY ?? context.canvas.height - margin;

  context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  const width = Math.ceil(context.measureText(text).width + paddingX * 2);
  const preferredX = options.align === "left"
    ? anchorX
    : options.align === "center"
      ? anchorX - width / 2
      : anchorX - width;
  const x = Math.min(Math.max(preferredX, minX), maxX - width);
  const y = Math.min(Math.max(anchorY - height / 2, minY), maxY - height);

  context.fillStyle = options.background || "#5d6470";
  roundedRect(context, x, y, width, height, radius);
  context.fill();
  context.fillStyle = options.color || "#fff";
  context.fillText(text, x + paddingX, y + height / 2 + fontSize * 0.36);
  return { x, y, width, height };
}

function drawPriceChart(history, hoverIndex = null) {
  const canvas = els.priceChart;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 26, right: 72, bottom: 46, left: 68 };
  if (!history.length) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#6f6a61";
    context.font = "18px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.fillText("目前沒有取得可靠的近月歷史資料", padding.left, height / 2);
    return;
  }
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
    const inst = getInstitutional(stock.code);
    const decision = stockDecision(signal, stock, val, rev, inst);
    const risk = riskLevel(stock, val, rev, inst);
    const row = document.createElement("article");
    row.className = "rank-row";
    row.innerHTML = `
      <div>
        <strong>${index + 1}. ${stock.code} ${stock.name}</strong>
        <small>成交金額 ${compactMoney(stock.value)} ｜ 成交量 ${compactMoney(stock.volume)} ｜ ${decision.label} ｜ 風險 ${risk.label}</small>
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

  els.financeList.innerHTML = rows.map(({ item, stock, val, rev, signal }) => {
    const inst = getInstitutional(item.code);
    const decision = stockDecision(signal, stock, val, rev, inst);
    const risk = riskLevel(stock, val, rev, inst);
    const warning = dataWarning(val, rev, inst);
    return `
    <article class="finance-card">
      <strong>${item.code} ${stock?.name || val?.name || rev?.name || ""}</strong>
      <p class="signal">${decision.label}，風險 ${risk.label}：${decision.text}</p>
      <p class="signal">${revenueSummaryText(rev)}</p>
      ${warning ? `<p class="signal">${warning}</p>` : ""}
      <small>本益比 ${val?.pe ?? "--"} ｜ 殖利率 ${val?.yieldRate ?? "--"}% ｜ 股價淨值比 ${val?.pb ?? "--"}</small>
    </article>
  `;
  }).join("");
}

// ===== 快速加入股票搜尋功能 =====
const stockNameMap = {
  "0050": "元大台灣50", "0056": "元大高股息", "2330": "台積電", "2317": "鴻海",
  "2412": "中華電", "1216": "統一", "1301": "國建", "1303": "南亞", "1326": "麗寶",
  "1402": "中華紙", "1435": "中磊", "1476": "儒鴻", "1477": "聚陽", "1590": "亞德客",
  "1603": "華電", "1722": "技嘉", "1723": "中碩", "1795": "美食KY", "1909": "榮剛",
  "2002": "中鋼", "2014": "中華電", "2015": "豐興", "2016": "南亞科", "2018": "第一銅",
  "2022": "聯鈺", "2023": "燿華", "2024": "志聯", "2025": "千晶", "2026": "銘異",
  "2027": "三大", "2028": "威健", "2029": "盛智", "2030": "光寶科", "2031": "晶碩",
  "2032": "新麥", "2033": "佳大", "2034": "允德", "2035": "光磊", "2036": "智易",
  "2037": "微星", "2038": "海光", "2039": "欣天然", "2040": "愛德利", "2308": "台達電",
  "2454": "聯發科", "2881": "富邦金"
};

let allStocksCache = null;

async function getAvailableStocks() {
  if (allStocksCache) return allStocksCache;
  try {
    const response = await fetch(endpoints.bundle);
    const data = await response.json();
    if (data && data.daily && data.daily.length > 0) {
      allStocksCache = data.daily.map(q => ({
        code: q.code,
        name: q.name || stockNameMap[q.code] || "",
        price: q.close || q.price || "--"
      }));
      return allStocksCache;
    }
  } catch (err) {
    console.error("無法載入股票清單:", err);
  }
  return Object.entries(stockNameMap).map(([code, name]) => ({
    code, name, price: "--"
  }));
}

async function searchStocks(query) {
  if (!query || query.length < 1) return [];
  const stocks = await getAvailableStocks();
  const lowerQuery = query.toLowerCase();
  return stocks.filter(stock =>
    stock.code.includes(query) || stock.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 8);
}

function renderSearchResults(results) {
  const list = els.searchResultsList;
  if (!list) return;
  list.innerHTML = "";
  if (results.length === 0) {
    const noResult = document.createElement("div");
    noResult.className = "search-result-item";
    noResult.textContent = "沒有找到相符的股票";
    noResult.style.pointerEvents = "none";
    noResult.style.color = "var(--muted)";
    list.appendChild(noResult);
    return;
  }
  results.forEach(stock => {
    const item = document.createElement("div");
    item.className = "search-result-item";
    const info = document.createElement("div");
    info.className = "search-result-info";
    const code = document.createElement("div");
    code.className = "search-result-code";
    code.textContent = `${stock.code} ${stock.name}`;
    info.appendChild(code);
    const price = document.createElement("div");
    price.className = "search-result-price";
    price.textContent = stock.price !== "--" ? `$${stock.price}` : "查詢中...";
    item.appendChild(info);
    item.appendChild(price);
    item.addEventListener("click", () => {
      els.quickSymbolInput.value = stock.code;
      els.searchResults.hidden = true;
      els.quickCostInput.focus();
    });
    list.appendChild(item);
  });
}

if (els.quickSymbolInput && els.searchResults) {
  els.quickSymbolInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (query.length === 0) {
      els.searchResults.hidden = true;
      return;
    }
    const results = await searchStocks(query);
    if (results.length > 0) {
      renderSearchResults(results);
      els.searchResults.hidden = false;
    } else {
      els.searchResults.hidden = true;
    }
  });
}

document.addEventListener("click", (e) => {
  if (els.searchResults && !e.target.closest(".search-wrapper")) {
    els.searchResults.hidden = true;
  }
});

function renderQuickAddedStocks() {
  const container = els.quickAddedStocks;
  if (!container) return;
  const addedStocks = watchList;
  if (addedStocks.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `<p class="quick-added-title">已加入的股票：共 ${addedStocks.length} 檔</p>`;
  addedStocks.forEach((item) => {
    const card = document.createElement("div");
    card.className = "quick-stock-item";
    const info = document.createElement("div");
    info.className = "quick-stock-info";
    const codeEl = document.createElement("div");
    codeEl.className = "quick-stock-code";
    codeEl.textContent = stockDisplayName(item);
    info.appendChild(codeEl);
    let details = "";
    const avgCost = averageHoldingCost(item);
    const shares = holdingShares(item);
    const lots = holdingLots(item);
    if (avgCost) details += `均價：$${money(avgCost)}`;
    if (shares) details += (details ? " | " : "") + `股數：${money(shares)}`;
    if (lots.length > 1) details += ` | ${lots.length} 筆買進`;
    if (!details) details = item.type === "holding" ? "我的存股" : "觀察名單";
    const detailEl = document.createElement("div");
    detailEl.className = "quick-stock-details";
    detailEl.textContent = details;
    info.appendChild(detailEl);
    const actions = document.createElement("div");
    actions.className = "quick-stock-actions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "quick-stock-edit";
    editBtn.textContent = "編輯";
    editBtn.addEventListener("click", () => {
      els.quickSymbolInput.value = item.code;
      els.quickCostInput.value = item.cost;
      els.quickSharesInput.value = item.shares;
      els.quickTypeInput.value = item.type;
      els.quickSymbolInput.focus();
      els.quickSymbolInput.scrollIntoView({ behavior: "smooth" });
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "quick-stock-delete";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`確定要刪除 ${stockDisplayName(item)} 嗎？`)) {
        watchList = watchList.filter((entry) => entry.code !== item.code);
        saveWatchList();
        renderQuickAddedStocks();
        render();
      }
    });
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(info);
    card.appendChild(actions);
    container.appendChild(card);
  });
}

if (els.quickAddForm) {
  els.quickAddForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (cloudEnabled && !currentUser) {
      setAuthStatus("請先登入，持股資料才會同步到你的雲端帳號。", true);
      return;
    }
    const code = els.quickSymbolInput.value.trim();
    if (!/^\d{4,6}$/.test(code)) {
      alert("請輸入正確的股票代號（4-6 碼數字）");
      return;
    }
    upsertWatchItem({
      code,
      cost: els.quickCostInput.value,
      shares: els.quickSharesInput.value,
      type: els.quickTypeInput.value
    });
    saveWatchList();
    els.quickAddForm.reset();
    if (els.searchResults) els.searchResults.hidden = true;
    renderQuickAddedStocks();
    render();
  });
}

renderQuickAddedStocks();

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cloudEnabled && !currentUser) {
    setAuthStatus("請先登入，持股資料才會同步到你的雲端帳號。", true);
    return;
  }
  const code = els.symbol.value.trim();
  if (!/^\d{4,6}$/.test(code)) return;

  upsertWatchItem({
    code,
    cost: els.cost.value,
    shares: els.shares.value,
    type: els.type.value
  });

  saveWatchList();
  els.form.reset();
  render();
});

els.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!cloudEnabled) {
    setAuthStatus("尚未設定 Firebase，無法跨裝置登入。", true);
    return;
  }
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;
  try {
    const credential = await cloudAuth.signInWithEmailAndPassword(email, password);
    currentUser = credential.user;
  } catch (error) {
    setAuthStatus(`登入失敗：${error.message}`, true);
    return;
  }
  els.authPassword.value = "";
  updateAuthUi();
  await loadCloudWatchList();
});

els.register.addEventListener("click", async () => {
  if (!cloudEnabled) {
    setAuthStatus("尚未設定 Firebase，無法註冊雲端帳號。", true);
    return;
  }
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;
  const name = els.authName.value.trim();
  if (!email || password.length < 8) {
    setAuthStatus("請輸入 Email，密碼至少 8 碼。", true);
    return;
  }
  try {
    const credential = await cloudAuth.createUserWithEmailAndPassword(email, password);
    currentUser = credential.user;
    if (name) await currentUser.updateProfile({ displayName: name });
  } catch (error) {
    setAuthStatus(`註冊失敗：${error.message}`, true);
    return;
  }
  els.authPassword.value = "";
  setAuthStatus("註冊完成，已登入並啟用 Firebase 雲端同步。");
  updateAuthUi();
  if (currentUser) await loadCloudWatchList();
});

els.logout.addEventListener("click", async () => {
  if (cloudEnabled && cloudAuth) await cloudAuth.signOut();
  currentUser = null;
  watchList = [];
  sellHistory = [];
  updateAuthUi();
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
els.briefCards.forEach((card) => {
  card.addEventListener("click", () => openBriefTarget(card));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openBriefTarget(card);
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
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearTimeout(refreshTimer);
    window.clearTimeout(quoteRefreshTimer);
    setStatus("暫停更新", "分頁在背景，回到畫面後會自動更新");
    return;
  }
  fetchMarket();
});
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
  if (cloudEnabled && !currentUser) {
    setAuthStatus("請先登入，範例資料才會存到你的雲端帳號。", true);
    return;
  }
  watchList = [
    {
      code: "2330",
      cost: "936.67",
      shares: "1500",
      type: "holding",
      lots: [
        { id: "demo-2330-1", cost: 920, shares: 1000, boughtAt: "2026-04-15T00:00:00.000Z" },
        { id: "demo-2330-2", cost: 970, shares: 500, boughtAt: "2026-05-10T00:00:00.000Z" }
      ]
    },
    { code: "0050", cost: "180", shares: "1000", type: "holding" },
    { code: "2317", cost: "190", shares: "1000", type: "watch" }
  ];
  saveWatchList();
  render();
});

// ===== 檢視模式切換（簡化 / 完整） =====
function applyViewMode(mode) {
  const next = mode === "full" ? "full" : "simple";
  document.body.dataset.viewMode = next;
  if (els.viewModeLabel) {
    els.viewModeLabel.textContent = next === "simple" ? "簡化" : "完整";
  }
  if (els.viewModeToggle) {
    els.viewModeToggle.setAttribute("aria-pressed", next === "simple" ? "true" : "false");
  }
  try { localStorage.setItem(VIEW_MODE_KEY, next); } catch {}
}

function initViewMode() {
  let saved = "full";
  const prefersCompact = window.matchMedia?.("(max-width: 880px)")?.matches;
  try { saved = localStorage.getItem(VIEW_MODE_KEY) || (prefersCompact ? "simple" : "full"); } catch {
    saved = prefersCompact ? "simple" : "full";
  }
  applyViewMode(saved);
  if (els.viewModeToggle) {
    els.viewModeToggle.addEventListener("click", () => {
      const current = document.body.dataset.viewMode || "simple";
      applyViewMode(current === "simple" ? "full" : "simple");
    });
  }
  document.querySelectorAll(".mobile-section-nav button").forEach((button) => {
    button.addEventListener("click", () => scrollToDashboardTarget(button.dataset.target));
  });
}

// ===== 主題切換（日間 / 夜間） =====
function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = next;
  document.documentElement.dataset.theme = next;
  if (els.themeLabel) {
    els.themeLabel.textContent = next === "dark" ? "夜間" : "日間";
  }
  if (els.themeToggle) {
    els.themeToggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
  }
  try { localStorage.setItem(THEME_KEY, next); } catch {}
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch {}
  // 沒儲存過就跟隨系統設定
  if (!saved && window.matchMedia) {
    saved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(saved || "light");
  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      const current = document.body.dataset.theme || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
}

async function signInWithGoogle() {
  if (!cloudEnabled || !cloudAuth) {
    setAuthStatus("尚未設定 Firebase，無法使用 Google 登入。", true);
    return;
  }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await cloudAuth.signInWithPopup(provider);
    currentUser = credential.user;
    setAuthStatus(`已用 Google 登入：${currentUser.email || currentUser.displayName || ""}`);
    updateAuthUi();
    await loadCloudWatchList();
  } catch (error) {
    // 行動裝置 popup 被擋時改用 redirect
    if (error?.code === "auth/popup-blocked" || error?.code === "auth/operation-not-supported-in-this-environment") {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await cloudAuth.signInWithRedirect(provider);
        return;
      } catch (redirectError) {
        setAuthStatus(`Google 登入失敗：${redirectError.message}`, true);
        return;
      }
    }
    setAuthStatus(`Google 登入失敗：${error.message}`, true);
  }
}

async function switchUser() {
  if (!cloudEnabled || !cloudAuth) {
    setAuthStatus("尚未設定 Firebase，無法切換使用者。", true);
    return;
  }
  await cloudAuth.signOut();
  currentUser = null;
  watchList = [];
  sellHistory = [];
  updateAuthUi();
  render();
  await signInWithGoogle();
}

// ===== Google 登入 =====
function initGoogleSignIn() {
  if (els.googleSignIn) {
    els.googleSignIn.addEventListener("click", signInWithGoogle);
  }
  if (els.switchUser) {
    els.switchUser.addEventListener("click", switchUser);
  }
}

function initTierTabs() {
  if (!els.tierTabs?.length) return;
  els.tierTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tier;
      els.tierTabs.forEach((t) => {
        const active = t.dataset.tier === target;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      els.tierPanels.forEach((panel) => {
        panel.hidden = panel.dataset.tier !== target;
      });
    });
  });
}

async function initApp() {
  initViewMode();
  initTheme();
  initGoogleSignIn();
  initTierTabs();
  await initCloudAuth();
  if (!cloudEnabled || !currentUser) {
    watchList = loadWatchList();
    sellHistory = loadSellHistory();
    render();
  }
  fetchMarket();
}

initApp();
