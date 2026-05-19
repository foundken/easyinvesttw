const { onRequest } = require("firebase-functions/v2/https");

const BASE = "https://openapi.twse.com.tw/v1";

const endpoints = {
  daily: "/exchangeReport/STOCK_DAY_ALL",
  valuation: "/exchangeReport/BWIBBU_ALL",
  revenue: "/opendata/t187ap05_L"
};

const FUGLE_BASE = "https://api.fugle.tw/marketdata/v1.0/stock";
const MOPS_API_BASE = "https://mops.twse.com.tw/mops/api";
const DASHBOARD_CACHE_TTL_MS = 5000;
const DASHBOARD_STALE_TTL_MS = 120000;
const MONTHLY_REVENUE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
let dashboardCache = null;
let quoteCache = null;
let monthlyRevenueCache = null;

exports.market = onRequest({
  region: "asia-east1",
  timeoutSeconds: 60,
  memory: "512MiB",
  cors: true
}, async (req, res) => {
  const code = req.query && req.query.code;
  const symbols = parseSymbols(req.query && req.query.symbols);

  try {
    if (code) {
      return sendJson(res, 200, {
        ok: true,
        code,
        history: await fetchHistory(code)
      });
    }

    if (req.query && req.query.fast === "quotes") {
      const cacheKey = symbols.slice().sort().join(",");
      const now = Date.now();
      if (quoteCache && quoteCache.key === cacheKey && now - quoteCache.createdAt < 3000) {
        return sendJson(res, 200, {
          ...quoteCache.payload,
          cache: "fresh"
        });
      }
      const [fugleRealtime, twseRealtime] = await Promise.all([
        safeFetchFugleQuotes(symbols),
        safeFetchTwseRealtimeQuotes(symbols, 1800)
      ]);
      const payload = {
        ok: true,
        updatedAt: new Date().toISOString(),
        realtime: compactRealtimeRows(mergeRealtimePayloads(twseRealtime, fugleRealtime)),
        realtimeSource: fugleRealtime.length ? "Fugle" : twseRealtime.length ? "TWSE" : null
      };
      quoteCache = { key: cacheKey, createdAt: now, payload };
      return sendJson(res, 200, payload);
    }

    const cacheKey = symbols.slice().sort().join(",");
    const now = Date.now();
    if (dashboardCache && dashboardCache.key === cacheKey && now - dashboardCache.createdAt < DASHBOARD_CACHE_TTL_MS) {
      return sendJson(res, 200, {
        ...dashboardCache.payload,
        cache: "fresh"
      });
    }

    const [twseDaily, twseValuation, tpexValuation, listedRevenue, publicRevenue, mopsRevenue, fugleActiveRanking, index, usIndex, institutional, news] = await Promise.all([
      safeFetchJson(endpoints.daily),
      safeFetchJson(endpoints.valuation),
      safeFetchTpexValuation(),
      safeFetchJson(endpoints.revenue),
      safeFetchJson("/opendata/t187ap05_P"),
      safeFetchMopsRevenue(),
      safeFetchFugleActiveRanking(),
      safeFetchTwseIndex(),
      safeFetchUsMarket(),
      safeFetchInstitutional(),
      safeFetchMarketNews()
    ]);
    const daily = mergeMarketRows(twseDaily, fugleActiveRanking);
    const realtimeSymbols = uniqueSymbols([
      ...symbols,
      ...topMarketSymbols(daily, 40)
    ]);
    const [fugleRealtime, twseRealtime] = await Promise.all([
      safeFetchFugleQuotes(realtimeSymbols),
      safeFetchTwseRealtimeQuotes(realtimeSymbols)
    ]);
    const realtime = mergeRealtimePayloads(twseRealtime, fugleRealtime);
    const relevantCodes = new Set(uniqueSymbols([
      ...symbols,
      ...topMarketSymbols(daily, 120)
    ]));

    const payload = {
      ok: true,
      updatedAt: new Date().toISOString(),
      daily: compactDailyRows(filterRowsByCodes(daily, relevantCodes)),
      valuation: compactValuationRows(filterRowsByCodes(mergeByCode(twseValuation, tpexValuation), relevantCodes)),
      revenue: compactRevenueRows(filterRowsByCodes(mergeByCode(mergeByCode(listedRevenue, publicRevenue), mopsRevenue), relevantCodes)),
      realtime: compactRealtimeRows(realtime),
      index,
      usIndex,
      institutional: compactInstitutional(institutional, relevantCodes),
      news,
      dailySource: fugleActiveRanking.length ? "Fugle" : twseDaily.length ? "TWSE" : null,
      realtimeSource: fugleRealtime.length ? "Fugle" : twseRealtime.length ? "TWSE" : null
    };
    dashboardCache = { key: cacheKey, createdAt: now, payload };
    return sendJson(res, 200, payload);
  } catch (error) {
    if (dashboardCache && Date.now() - dashboardCache.createdAt < DASHBOARD_STALE_TTL_MS) {
      return sendJson(res, 200, {
        ...dashboardCache.payload,
        cache: "stale",
        warning: error.message
      });
    }
    return sendJson(res, 502, {
      ok: false,
      error: error.message
    });
  }
});

function parseSymbols(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((symbol) => symbol.trim())
    .filter((symbol) => /^\d{4,6}$/.test(symbol))
    .slice(0, 30);
}

function uniqueSymbols(symbols) {
  return [...new Set((symbols || [])
    .map((symbol) => String(symbol || "").trim())
    .filter((symbol) => /^\d{4,6}$/.test(symbol)))];
}

function topMarketSymbols(rows, limit) {
  return (rows || [])
    .slice()
    .sort((a, b) => toNumber(b.TradeValue ?? b.value ?? b.tradeValue) - toNumber(a.TradeValue ?? a.value ?? a.tradeValue))
    .map((row) => row.Code || row["證券代號"] || row.code || row.symbol)
    .filter(Boolean)
    .slice(0, limit);
}

async function fetchFugleQuotes(symbols) {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey || !symbols.length) return [];

  const quotes = await Promise.all(symbols.map(async (symbol) => {
    try {
      const response = await fetchWithTimeout(`${FUGLE_BASE}/intraday/quote/${encodeURIComponent(symbol)}`, {
        headers: {
          accept: "application/json",
          "X-API-KEY": apiKey
        }
      }, 2200);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }));

  return quotes.filter(Boolean);
}

async function fetchTwseRealtimeQuotes(symbols, timeoutMs = 4500) {
  if (!symbols.length) return [];
  const chunks = [];
  for (let index = 0; index < symbols.length; index += 12) {
    chunks.push(symbols.slice(index, index + 12));
  }

  const batches = await Promise.all(chunks.map(async (chunk) => {
    const channels = chunk.flatMap((symbol) => [`tse_${symbol}.tw`, `otc_${symbol}.tw`]);
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${channels.join("|")}&json=1&delay=0&_=${Date.now()}`;
    const response = await fetchWithTimeout(url, {
      headers: {
        ...twseHeaders(),
        referer: "https://mis.twse.com.tw/stock/index.jsp"
      }
    }, timeoutMs).catch(() => null);
    if (!response?.ok) return [];
    const payload = await response.json().catch(() => ({}));
    return (payload.msgArray || []).map(normalizeTwseRealtimeRow).filter(Boolean);
  }));

  return batches.flat();
}

function normalizeTwseRealtimeRow(row) {
  const symbol = String(row.c || "").trim();
  if (!/^\d{4,6}$/.test(symbol)) return null;
  const previousClose = toNumber(row.y);
  const sourcePrice = twseQuotePrice(row);
  const close = sourcePrice ?? previousClose;
  if (!Number.isFinite(close) || close <= 0) return null;
  const change = Number.isFinite(previousClose) ? close - previousClose : null;
  const changePercent = Number.isFinite(change) && Number.isFinite(previousClose) && previousClose
    ? (change / previousClose) * 100
    : null;
  return {
    symbol,
    name: row.n || symbol,
    openPrice: toNumber(row.o),
    highPrice: toNumber(row.h),
    lowPrice: toNumber(row.l),
    lastPrice: close,
    closePrice: close,
    previousClose,
    change,
    changePercent,
    tradeVolume: toNumber(row.v),
    transaction: toNumber(row.t),
    lastUpdated: row.tlong ? Number(row.tlong) : `${row.d || ""} ${row.t || ""}`,
    source: sourcePrice === null ? "TWSE_PREVIOUS" : "TWSE"
  };
}

function twseQuotePrice(row) {
  const last = toNumber(row.z);
  if (Number.isFinite(last) && last > 0) return last;
  const lastMatched = toNumber(row.pz);
  if (Number.isFinite(lastMatched) && lastMatched > 0) return lastMatched;
  const bestAsk = firstTwseLevel(row.a);
  const bestBid = firstTwseLevel(row.b);
  if (Number.isFinite(bestAsk) && Number.isFinite(bestBid)) return (bestAsk + bestBid) / 2;
  if (Number.isFinite(bestBid)) return bestBid;
  if (Number.isFinite(bestAsk)) return bestAsk;
  return null;
}

function firstTwseLevel(value) {
  const first = String(value || "").split("_").find((item) => item && item !== "-");
  return toNumber(first);
}

function mergeRealtimePayloads(primary, preferred) {
  const map = new Map();
  [...(primary || []), ...(preferred || [])].forEach((quote) => {
    const symbol = String(quote.symbol || quote.code || "").trim();
    if (symbol) map.set(symbol, quote);
  });
  return [...map.values()];
}

function mergeByCode(primary = [], secondary = []) {
  const map = new Map();
  [...primary, ...secondary].forEach((row) => {
    const code = String(row.Code || row["證券代號"] || row["公司代號"] || row.code || row.symbol || "").trim();
    if (code) map.set(code, row);
  });
  return [...map.values()];
}

function filterRowsByCodes(rows = [], codes = new Set()) {
  if (!codes?.size) return [];
  return rows.filter((row) => codes.has(String(row.Code || row["證券代號"] || row["公司代號"] || row.code || row.symbol || "").trim()));
}

function compactDailyRows(rows = []) {
  return rows.map((row) => {
    const close = toNumber(row.ClosingPrice ?? row["收盤價"] ?? row.close ?? row.closePrice ?? row.lastPrice);
    const previousClose = toNumber(row.PreviousClose ?? row.previousClose ?? row.referencePrice ?? row.previousPrice);
    const change = toNumber(row.Change ?? row["漲跌價差"] ?? row.change);
    return {
      code: cleanTwseCell(row.Code || row["證券代號"] || row.code || row.symbol),
      name: cleanTwseCell(row.Name || row["證券名稱"] || row.name),
      volume: toNumber(row.TradeVolume ?? row["成交股數"] ?? row.volume ?? row.tradeVolume),
      value: toNumber(row.TradeValue ?? row["成交金額"] ?? row.value ?? row.tradeValue),
      open: toNumber(row.OpeningPrice ?? row["開盤價"] ?? row.open ?? row.openPrice),
      high: toNumber(row.HighestPrice ?? row["最高價"] ?? row.high ?? row.highPrice),
      low: toNumber(row.LowestPrice ?? row["最低價"] ?? row.low ?? row.lowPrice),
      close,
      previousClose,
      change,
      changePercent: toNumber(row.ChangePercent ?? row.changePercent),
      trades: toNumber(row.Transaction ?? row["成交筆數"] ?? row.trades ?? row.transaction),
      source: row.Source || row.source
    };
  }).filter((row) => row.code && row.name && Number.isFinite(row.close));
}

function compactValuationRows(rows = []) {
  return rows.map((row) => ({
    code: cleanTwseCell(row.Code || row["證券代號"] || row.code),
    name: cleanTwseCell(row.Name || row["證券名稱"] || row.name),
    pe: toNumber(row.PEratio ?? row["本益比"] ?? row.pe),
    yieldRate: toNumber(row.DividendYield ?? row["殖利率(%)"] ?? row.yieldRate),
    pb: toNumber(row.PBratio ?? row["股價淨值比"] ?? row.pb)
  })).filter((row) => row.code);
}

function compactRevenueRows(rows = []) {
  return rows.map((row) => ({
    code: cleanTwseCell(row["公司代號"] || row.company_code || row.code),
    name: cleanTwseCell(row["公司名稱"] || row.company_name || row.name),
    month: cleanTwseCell(row["資料年月"] || row.revenue_month || row.month || row["出表日期"]),
    amount: toNumber(row["營業收入-當月營收"] ?? row.revenue_current_month ?? row.amount),
    yoy: toNumber(row["營業收入-去年同月增減(%)"] ?? row["去年同月增減(%)"] ?? row.yoy),
    mom: toNumber(row["營業收入-上月比較增減(%)"] ?? row["上月比較增減(%)"] ?? row.mom)
  })).filter((row) => row.code);
}

function compactRealtimeRows(rows = []) {
  return rows.map((row) => ({
    symbol: cleanTwseCell(row.symbol || row.code),
    name: cleanTwseCell(row.name),
    openPrice: toNumber(row.openPrice ?? row.open),
    highPrice: toNumber(row.highPrice ?? row.high),
    lowPrice: toNumber(row.lowPrice ?? row.low),
    lastPrice: toNumber(row.lastPrice ?? row.closePrice ?? row.close),
    closePrice: toNumber(row.closePrice ?? row.lastPrice ?? row.close),
    previousClose: toNumber(row.previousClose),
    change: toNumber(row.change),
    changePercent: toNumber(row.changePercent),
    tradeVolume: toNumber(row.tradeVolume ?? row.total?.tradeVolume ?? row.volume),
    tradeValue: toNumber(row.tradeValue ?? row.total?.tradeValue ?? row.value),
    transaction: toNumber(row.transaction ?? row.total?.transaction ?? row.trades),
    lastUpdated: row.lastUpdated || row.closeTime || row.date,
    source: row.source || "Realtime"
  })).filter((row) => row.symbol && Number.isFinite(row.lastPrice));
}

function compactInstitutional(payload, codes = new Set()) {
  if (!payload) return null;
  const stocks = Object.fromEntries(Object.entries(payload.stocks || {})
    .filter(([code]) => codes.has(String(code)))
    .map(([code, item]) => [code, {
      code: item.code || code,
      name: item.name || "",
      foreign: toNumber(item.foreign),
      trust: toNumber(item.trust),
      dealer: toNumber(item.dealer),
      total: toNumber(item.total)
    }]));
  return {
    date: payload.date,
    foreign: toNumber(payload.foreign),
    trust: toNumber(payload.trust),
    dealer: toNumber(payload.dealer),
    total: toNumber(payload.total),
    stocks,
    source: payload.source
  };
}

async function fetchTpexValuation() {
  const response = await fetchWithTimeout("https://www.tpex.org.tw/web/stock/aftertrading/peratio_analysis/pera_result.php?l=zh-tw&o=json&s=0", {
    headers: tpexHeaders()
  }, 2500);
  if (!response.ok) throw new Error("TPEx valuation request failed");
  const payload = await response.json();
  const rows = payload.tables?.[0]?.data || [];
  return rows.map((row) => ({
    Code: cleanTwseCell(row[0]),
    Name: cleanTwseCell(row[1]),
    PEratio: toNumber(row[2]),
    CashDividend: toNumber(row[3]),
    DividendYear: cleanTwseCell(row[4]),
    DividendYield: toNumber(row[5]),
    PBratio: toNumber(row[6]),
    FinancialQuarter: cleanTwseCell(row[7]),
    Source: "TPEx"
  })).filter((row) => row.Code);
}

async function fetchMopsRevenue() {
  const now = Date.now();
  if (monthlyRevenueCache && now - monthlyRevenueCache.createdAt < MONTHLY_REVENUE_CACHE_TTL_MS) {
    return monthlyRevenueCache.rows;
  }

  const marketTypes = ["otc0", "otc1", "rotc0", "rotc1"];
  const candidateMonths = recentTaipeiRevenueMonths(3);
  for (const monthInfo of candidateMonths) {
    const batches = await Promise.all(marketTypes.map((marketType) => fetchMopsRevenueMarket(monthInfo, marketType)));
    const rows = batches.flat();
    if (rows.length) {
      monthlyRevenueCache = {
        createdAt: now,
        rows
      };
      return rows;
    }
  }
  return [];
}

async function fetchMopsRevenueMarket(monthInfo, marketType) {
  try {
    const url = await fetchMopsRevenueResultUrl(monthInfo, marketType);
    if (!url) return [];
    const popupUrl = await fetchMopsRevenuePopupUrl(url);
    if (!popupUrl) return [];
    const response = await fetchWithTimeout(popupUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 EasyInvestTW monthly revenue reader"
      }
    }, 5000);
    if (!response.ok) return [];
    const text = await decodeBig5Response(response);
    return parseMopsRevenueHtml(text, monthInfo);
  } catch {
    return [];
  }
}

async function fetchMopsRevenueResultUrl(monthInfo, marketType) {
  const response = await fetchWithTimeout(`${MOPS_API_BASE}/redirectToOld`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0 EasyInvestTW monthly revenue reader",
      referer: "https://mops.twse.com.tw/mops/web/t21sc04_ifrs"
    },
    body: JSON.stringify({
      apiName: "ajax_t21sc04_ifrs",
      parameters: {
        TYPEK: marketType,
        year: monthInfo.rocYear,
        month: monthInfo.month,
        encodeURIComponent: 1,
        firstin: 1,
        step: 1,
        off: 1
      }
    })
  }, 3500);
  if (!response.ok) return "";
  const payload = await response.json().catch(() => ({}));
  return typeof payload?.result?.url === "string" ? payload.result.url : "";
}

async function fetchMopsRevenuePopupUrl(resultUrl) {
  const response = await fetchWithTimeout(resultUrl, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "Mozilla/5.0 EasyInvestTW monthly revenue reader"
    }
  }, 3500);
  if (!response.ok) return "";
  const html = await response.text();
  const match = html.match(/window\.open\('([^']+)'/);
  if (!match) return "";
  return new URL(match[1], resultUrl).toString();
}

async function decodeBig5Response(response) {
  const buffer = await response.arrayBuffer();
  return new TextDecoder("big5").decode(buffer);
}

function parseMopsRevenueHtml(html, monthInfo) {
  const rows = [];
  const matches = String(html || "").matchAll(/<tr\b[^>]*>\s*<td[^>]*>\s*(\d{4,6})\s*<\/td>([\s\S]*?)<\/tr>/gi);
  for (const match of matches) {
    const cells = [...match[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((cell) => cleanTwseCell(decodeHtml(stripTags(cell[1])).replace(/\s+/g, " ")));
    if (cells.length < 7 || !/^\d{4,6}$/.test(cells[0])) continue;
    rows.push({
      code: cells[0],
      name: cells[1],
      month: `${monthInfo.rocYear}${monthInfo.month}`,
      amount: toNumber(cells[2]),
      mom: toNumber(cells[5]),
      yoy: toNumber(cells[6]),
      cumulativeAmount: toNumber(cells[7]),
      cumulativeYoy: toNumber(cells[9]),
      source: "MOPS"
    });
  }
  return rows;
}

async function fetchFugleActiveRanking() {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey) return [];

  const markets = ["TSE", "OTC"];
  const batches = await Promise.all(markets.map(async (market) => {
    const params = new URLSearchParams({
      trade: "value",
      type: "ALLBUT0999"
    });
    const response = await fetchWithTimeout(`${FUGLE_BASE}/snapshot/actives/${market}?${params}`, {
      headers: {
        accept: "application/json",
        "X-API-KEY": apiKey
      }
    }, 2500);
    if (!response.ok) return [];
    const payload = await response.json();
    return rowsFromFuglePayload(payload).map((row) => normalizeFugleSnapshot(row)).filter(Boolean);
  }));

  return batches
    .flat()
    .filter((row) => row.code && Number.isFinite(row.close))
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 80);
}

async function fetchFugleIndex(symbol = "IR0001") {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey) throw new Error("Fugle API key missing");

  const [quote, candlesPayload, ticker, groups] = await Promise.all([
    fetchFugleJson(`/intraday/quote/${symbol}`).catch(() => null),
    fetchFugleJson(`/intraday/candles/${symbol}?timeframe=1&sort=asc`).catch(() => null),
    fetchFugleJson(`/intraday/ticker/${symbol}`).catch(() => null),
    fetchTwseIndexGroups(1800).catch(() => ({}))
  ]);
  const candles = rowsFromFuglePayload(candlesPayload).map((row) => ({
    date: row.date,
    open: toNumber(row.open),
    high: toNumber(row.high),
    low: toNumber(row.low),
    close: toNumber(row.close),
    volume: toNumber(row.volume)
  })).filter((row) => Number.isFinite(row.close));
  const latestCandle = candles.at(-1);
  const currentIndex = toNumber(quote?.index ?? quote?.closePrice ?? quote?.lastPrice ?? quote?.close) || latestCandle?.close;
  const previousClose = toNumber(quote?.previousClose ?? quote?.referencePrice ?? ticker?.previousClose ?? ticker?.referencePrice);
  const change = toNumber(quote?.change) ?? (Number.isFinite(currentIndex) && Number.isFinite(previousClose) ? currentIndex - previousClose : null);
  const changePercent = toNumber(quote?.changePercent) ?? (Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null);

  if (!Number.isFinite(currentIndex)) {
    throw new Error("Fugle index empty");
  }

  const { listed, ...sideGroups } = groups;

  return {
    name: quote?.name || ticker?.name || "發行量加權股價指數",
    symbol,
    index: currentIndex,
    previousClose,
    open: toNumber(quote?.openPrice ?? quote?.open) || candles[0]?.open || candles[0]?.close,
    high: toNumber(quote?.highPrice ?? quote?.high) || maxBy(candles, "high") || maxBy(candles, "close"),
    low: toNumber(quote?.lowPrice ?? quote?.low) || minBy(candles, "low") || minBy(candles, "close"),
    turnover: normalizeFugleIndexTurnover(quote, candles),
    change,
    changePercent,
    source: "Fugle",
    lastUpdated: quote?.closeTime || quote?.lastUpdated || latestCandle?.date || quote?.date || new Date().toISOString(),
    candles,
    groups: sideGroups
  };
}

async function fetchFugleJson(path) {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey) throw new Error("Fugle API key missing");
  const response = await fetchWithTimeout(`${FUGLE_BASE}${path}`, {
    headers: {
      accept: "application/json",
      "X-API-KEY": apiKey
    }
  }, 4500);
  if (!response.ok) {
    throw new Error(`Fugle request failed: ${path}`);
  }
  return response.json();
}

function normalizeFugleIndexTurnover(quote, candles) {
  const direct = toNumber(quote?.total?.tradeValue ?? quote?.tradeValue ?? quote?.turnover);
  if (Number.isFinite(direct)) return direct > 1000000 ? direct / 100000000 : direct;
  const sum = candles.reduce((total, row) => total + (row.volume || 0), 0);
  return sum > 1000000 ? sum / 100000000 : null;
}

function rowsFromFuglePayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.stocks)) return payload.stocks;
  return [];
}

function normalizeFugleSnapshot(row) {
  const code = String(row.symbol || row.code || row.stockNo || row.stockId || "").trim();
  if (!/^\d{4,6}$/.test(code)) return null;
  const close = toNumber(row.closePrice ?? row.lastPrice ?? row.close);
  const previousClose = toNumber(row.previousClose ?? row.referencePrice ?? row.previousPrice);
  const change = toNumber(row.change) ?? (Number.isFinite(close) && Number.isFinite(previousClose) ? close - previousClose : null);
  const changePercent = toNumber(row.changePercent) ?? (Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null);
  return {
    Code: code,
    Name: row.name || row.companyName || row.shortName || code,
    TradeVolume: toNumber(row.total?.tradeVolume ?? row.tradeVolume ?? row.volume),
    TradeValue: toNumber(row.total?.tradeValue ?? row.tradeValue ?? row.turnover ?? row.value),
    OpeningPrice: toNumber(row.openPrice ?? row.open),
    HighestPrice: toNumber(row.highPrice ?? row.high),
    LowestPrice: toNumber(row.lowPrice ?? row.low),
    ClosingPrice: close,
    PreviousClose: previousClose,
    Change: change,
    ChangePercent: changePercent,
    Transaction: toNumber(row.total?.transaction ?? row.transaction ?? row.trades),
    QuoteTime: row.lastUpdated || row.date || row.time,
    Source: "Fugle"
  };
}

function mergeMarketRows(twseRows, fugleRows) {
  if (!Array.isArray(twseRows) || !twseRows.length) return fugleRows;
  if (!Array.isArray(fugleRows) || !fugleRows.length) return twseRows;

  const byCode = new Map(twseRows.map((row) => [String(row.Code || row["證券代號"] || row.code || "").trim(), row]));
  fugleRows.forEach((row) => {
    const code = String(row.Code || row.code || "").trim();
    const current = byCode.get(code) || {};
    byCode.set(code, {
      ...current,
      ...row,
      Name: row.Name || current.Name || current["證券名稱"] || code
    });
  });
  return Array.from(byCode.values());
}

async function fetchTwseIndex() {
  const date = taipeiDate();
  const [groups, twseCandles, yahooIndex] = await Promise.all([
    fetchTwseIndexGroups(),
    fetchTwseIndexCandles(date),
    fetchYahooIndex("^TWII", "台灣加權指數", "1m").catch(() => null)
  ]);
  const hasYahooIndex = Number.isFinite(toNumber(yahooIndex?.index));
  const candles = yahooIndex?.candles?.length ? yahooIndex.candles : twseCandles;
  const summary = groups.listed || {};
  const latest = candles.at(-1);
  const index = hasYahooIndex ? toNumber(yahooIndex.index) : toNumber(summary.index) || latest?.close;
  const previousClose = hasYahooIndex ? toNumber(yahooIndex.previousClose) : toNumber(summary.previousClose);
  const change = Number.isFinite(index) && Number.isFinite(previousClose) ? index - previousClose : null;
  const changePercent = Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null;

  return {
    name: "發行量加權股價指數",
    symbol: "t00",
    index,
    previousClose,
    open: hasYahooIndex ? toNumber(yahooIndex.open) || toNumber(summary.open) : toNumber(summary.open) || candles[0]?.close,
    high: hasYahooIndex ? toNumber(yahooIndex.high) || toNumber(summary.high) : toNumber(summary.high) || maxBy(candles, "close"),
    low: hasYahooIndex ? toNumber(yahooIndex.low) || toNumber(summary.low) : toNumber(summary.low) || minBy(candles, "close"),
    turnover: toNumber(summary.turnover),
    change,
    changePercent,
    source: hasYahooIndex ? "Yahoo + TWSE" : twseCandles.length ? "TWSE" : candles.length ? "TWSE + Yahoo" : "TWSE",
    lastUpdated: hasYahooIndex ? yahooIndex.lastUpdated : summary.lastUpdated || latest?.date || new Date().toISOString(),
    candles,
    groups
  };
}

async function fetchTwseIndexGroups(timeoutMs = 5000) {
  const symbols = [
    ["listed", "tse_t00.tw", "發行量加權股價指數"],
    ["otc", "otc_o00.tw", "上櫃指數"],
    ["electronic", "tse_t13.tw", "電子類指數"],
    ["finance", "tse_t17.tw", "金融保險類指數"]
  ];
  const exCh = symbols.map((item) => item[1]).join("|");
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${exCh}&json=1&delay=0&_=${Date.now()}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "application/json",
      referer: "https://mis.twse.com.tw/stock/index.jsp",
      "cache-control": "no-cache"
    }
  }, timeoutMs);
  if (!response.ok) return {};
  const payload = await response.json();
  const rows = payload.msgArray || [];
  return Object.fromEntries(symbols.map(([key, channel, fallbackName]) => {
    const code = channel.split("_")[1].replace(".tw", "");
    const row = rows.find((item) => item.ch === channel.replace("tse_", "").replace("otc_", "") || item.c === code || item.ch?.includes(code)) || {};
    return [key, twseSummaryFromRow(row, fallbackName)];
  }));
}

function twseSummaryFromRow(row, fallbackName) {
  const index = toNumber(row.z);
  const previousClose = toNumber(row.y);
  const change = Number.isFinite(index) && Number.isFinite(previousClose) ? index - previousClose : null;
  const changePercent = Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null;
  return {
    name: row.n || fallbackName,
    symbol: row.c,
    index,
    previousClose,
    open: toNumber(row.o),
    high: toNumber(row.h),
    low: toNumber(row.l),
    turnover: toNumber(row.v),
    change,
    changePercent,
    source: "TWSE",
    lastUpdated: row.tlong ? Number(row.tlong) : `${row.d || ""} ${row.t || ""}`,
    candles: []
  };
}

async function fetchTwseIndexCandles(date) {
  const response = await fetchWithTimeout(`https://www.twse.com.tw/exchangeReport/MI_5MINS_INDEX?response=json&date=${date}`, {
    headers: { accept: "application/json" }
  }, 2500);
  if (!response.ok) return [];
  const payload = await response.json();
  const rows = payload.data || [];
  return rows.map((row) => ({
    date: cleanTwseCell(row[0]),
    close: toNumber(row[1]),
    volume: toNumber(row[2])
  })).filter((row) => Number.isFinite(row.close));
}

async function fetchInstitutional() {
  const [twse, tpex] = await Promise.all([
    fetchTwseInstitutional().catch(() => null),
    fetchTpexInstitutional().catch(() => null)
  ]);
  if (!twse && !tpex) throw new Error("Institutional empty result");
  if (!twse) return tpex;
  if (!tpex) return twse;

  return {
    date: twse.date || tpex.date,
    foreign: (twse.foreign || 0) + (tpex.foreign || 0),
    trust: (twse.trust || 0) + (tpex.trust || 0),
    dealer: (twse.dealer || 0) + (tpex.dealer || 0),
    total: (twse.total || 0) + (tpex.total || 0),
    stocks: {
      ...(twse.stocks || {}),
      ...(tpex.stocks || {})
    },
    source: "TWSE+TPEx"
  };
}

async function fetchTwseInstitutional() {
  const candidates = recentTaipeiDates(5);
  const results = await Promise.all(candidates.map(async (candidate) => {
    const url = `https://www.twse.com.tw/rwd/zh/fund/T86?date=${candidate}&selectType=ALLBUT0999&response=json&_=${Date.now()}`;
    const response = await fetchWithTimeout(url, {
      headers: twseHeaders()
    }, 2200).catch(() => null);
    if (!response?.ok) return null;
    const candidatePayload = await response.json().catch(() => null);
    const candidateRows = Array.isArray(candidatePayload?.data) ? candidatePayload.data : [];
    return candidateRows.length ? { payload: candidatePayload, date: candidate } : null;
  }));
  const latest = results.find(Boolean);
  const payload = latest?.payload;
  const date = latest?.date || "";

  if (!payload) throw new Error("TWSE institutional empty result");
  const fields = payload.fields || [];
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const stocks = {};
  const totals = rows.reduce((sum, row) => {
    const value = parseInstitutionalRow(row, fields);
    sum.foreign += value.foreign || 0;
    sum.trust += value.trust || 0;
    sum.dealer += value.dealer || 0;
    if (value.code) {
      stocks[value.code] = {
        code: value.code,
        name: value.name,
        foreign: value.foreign || 0,
        trust: value.trust || 0,
        dealer: value.dealer || 0,
        total: (value.foreign || 0) + (value.trust || 0) + (value.dealer || 0)
      };
    }
    return sum;
  }, { foreign: 0, trust: 0, dealer: 0 });

  return {
    date: twseDateToIso(payload.date || date),
    foreign: totals.foreign,
    trust: totals.trust,
    dealer: totals.dealer,
    total: totals.foreign + totals.trust + totals.dealer,
    stocks,
    source: "TWSE"
  };
}

async function fetchTpexInstitutional() {
  const response = await fetchWithTimeout("https://www.tpex.org.tw/web/stock/3insti/daily_trade/3itrade_hedge_result.php?l=zh-tw&o=json", {
    headers: tpexHeaders()
  }, 2500);
  if (!response.ok) throw new Error("TPEx institutional request failed");
  const payload = await response.json();
  const table = (payload.tables || []).find((item) => Array.isArray(item.data) && item.data.length);
  if (!table) throw new Error("TPEx institutional empty result");

  const stocks = {};
  const totals = table.data.reduce((sum, row) => {
    const value = parseTpexInstitutionalRow(row);
    sum.foreign += value.foreign || 0;
    sum.trust += value.trust || 0;
    sum.dealer += value.dealer || 0;
    if (value.code) stocks[value.code] = value;
    return sum;
  }, { foreign: 0, trust: 0, dealer: 0 });

  return {
    date: twseDateToIso(payload.date || table.date),
    foreign: totals.foreign,
    trust: totals.trust,
    dealer: totals.dealer,
    total: totals.foreign + totals.trust + totals.dealer,
    stocks,
    source: "TPEx"
  };
}

function parseTpexInstitutionalRow(row) {
  const foreign = toNumber(row[10]) || toNumber(row[4]) || 0;
  const trust = toNumber(row[13]) || 0;
  const dealer = toNumber(row[22]) || toNumber(row[16]) || 0;
  return {
    code: cleanTwseCell(row[0]),
    name: cleanTwseCell(row[1]),
    foreign,
    trust,
    dealer,
    total: toNumber(row[23]) ?? (foreign + trust + dealer)
  };
}

function parseInstitutionalRow(row, fields) {
  if (Array.isArray(row)) {
    return {
      code: cleanTwseCell(row[fieldIndex(fields, ["證券代號"])]),
      name: cleanTwseCell(row[fieldIndex(fields, ["證券名稱"])]),
      foreign: toNumber(row[fieldIndex(fields, ["外陸資", "買賣超", "不含"])]) || 0,
      trust: toNumber(row[fieldIndex(fields, ["投信", "買賣超"])]) || 0,
      dealer: toNumber(row[fieldIndex(fields, ["自營商", "買賣超"], ["外資自營商"])]) || 0
    };
  }

  return {
    code: pickValue(row, ["證券代號"]) || pickValue(row, ["code"]),
    name: pickValue(row, ["證券名稱"]) || pickValue(row, ["name"]),
    foreign: pickNumber(row, ["外陸資", "買賣超"], ["外資自營商"]) || 0,
    trust: pickNumber(row, ["投信", "買賣超"]) || 0,
    dealer: pickNumber(row, ["自營商", "買賣超"], ["外資自營商"]) || 0
  };
}

function fieldIndex(fields, required, excluded = []) {
  return fields.findIndex((field) => {
    const label = String(field);
    return required.every((keyword) => label.includes(keyword)) && excluded.every((keyword) => !label.includes(keyword));
  });
}

function pickNumber(row, required, excluded = []) {
  if (!row || typeof row !== "object") return null;
  const key = Object.keys(row).find((item) => {
    const label = String(item);
    return required.every((keyword) => label.includes(keyword)) && excluded.every((keyword) => !label.includes(keyword));
  });
  return key ? toNumber(row[key]) : null;
}

function pickValue(row, required, excluded = []) {
  if (!row || typeof row !== "object") return "";
  const key = Object.keys(row).find((item) => {
    const label = String(item);
    return required.every((keyword) => label.includes(keyword)) && excluded.every((keyword) => !label.includes(keyword));
  });
  return key ? cleanTwseCell(row[key]) : "";
}

async function fetchMarketNews() {
  const apiNews = await fetchCnyesNewsApi();
  if (apiNews.length) return apiNews;
  return fetchCnyesHomeNews();
}

async function fetchCnyesNewsApi() {
  const now = Math.floor(Date.now() / 1000);
  const startAt = now - (7 * 24 * 60 * 60);
  const categories = [
    ["tw_stock", "台股"],
    ["us_stock", "美股"],
    ["headline", "頭條"]
  ];
  const batches = await Promise.all(categories.map(async ([category, label]) => {
    try {
      const url = `https://api.cnyes.com/media/api/v1/newslist/category/${category}?startAt=${startAt}&endAt=${now}&limit=5`;
      const response = await fetchWithTimeout(url, {
        headers: {
          accept: "application/json",
          "user-agent": "Mozilla/5.0 EasyInvestTW market news reader"
        }
      }, 1800);
      if (!response.ok) return [];
      const payload = await response.json();
      const rows = payload.items?.data || [];
      return rows.map((item) => ({
        title: String(item.title || "").trim(),
        url: item.newsId ? `https://news.cnyes.com/news/id/${item.newsId}` : "https://www.cnyes.com/",
        category: item.categoryName || label,
        date: item.publishAt ? new Date(item.publishAt * 1000).toISOString() : "",
        source: "鉅亨網"
      }));
    } catch {
      return [];
    }
  }));

  const seen = new Set();
  return batches.flat().filter((item) => {
    if (!item.title || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).slice(0, 8);
}

async function fetchCnyesHomeNews() {
  const response = await fetchWithTimeout("https://www.cnyes.com/", {
    headers: {
      accept: "text/html",
      "user-agent": "Mozilla/5.0 EasyInvestTW market news reader"
    }
  }, 1800);
  if (!response.ok) throw new Error("Cnyes request failed");
  const html = await response.text();
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const seen = new Set();

  return anchors.map((match) => {
    const url = absoluteUrl(match[1]);
    const title = decodeHtml(stripTags(match[2])).replace(/\s+/g, " ").trim();
    const dateMatch = title.match(/^(\d{2}\/\d{2})\s+(.+)/);
    const cleanTitle = dateMatch ? dateMatch[2].trim() : title;
    return {
      title: cleanTitle,
      url,
      category: categoryFromUrl(url),
      date: dateMatch ? newsDate(dateMatch[1]) : "",
      source: "鉅亨網"
    };
  }).filter((item) => {
    if (!item.title || item.title.length < 12 || !item.url.includes("news.cnyes.com")) return false;
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).slice(0, 8);
}

function absoluteUrl(url) {
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return new URL(url, "https://www.cnyes.com/").toString();
}

function categoryFromUrl(url) {
  if (url.includes("/tw_stock")) return "台股";
  if (url.includes("/us_stock")) return "美股";
  if (url.includes("/headline")) return "頭條";
  return "市場";
}

function newsDate(monthDay) {
  const year = new Intl.DateTimeFormat("en", { timeZone: "Asia/Taipei", year: "numeric" }).format(new Date());
  return `${year}/${monthDay}`;
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, "");
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function taipeiDate(daysAgo = 0) {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}${get("month")}${get("day")}`;
}

function recentTaipeiDates(days) {
  return Array.from({ length: days }, (_, index) => taipeiDate(index));
}

function recentTaipeiRevenueMonths(count) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit"
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  return Array.from({ length: count }, (_, index) => {
    const value = (year * 12) + month - 1 - index;
    const targetYear = Math.floor((value - 1) / 12);
    const targetMonth = ((value - 1) % 12) + 1;
    return {
      rocYear: String(targetYear - 1911),
      month: String(targetMonth).padStart(2, "0")
    };
  });
}

function twseDateToIso(value) {
  const text = String(value || "").trim();
  const compact = text.match(/(\d{4})(\d{2})(\d{2})/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  const roc = text.match(/^(\d{2,3})\/(\d{1,2})\/(\d{1,2})/);
  if (roc) {
    const year = String(Number(roc[1]) + 1911);
    const month = String(Number(roc[2])).padStart(2, "0");
    const day = String(Number(roc[3])).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return text;
}

function taipeiIsoDate(daysAgo = 0) {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function cleanTwseCell(value) {
  return String(value || "").replaceAll("=", "").replaceAll('"', "").trim();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function maxBy(rows, key) {
  const values = rows.map((row) => row[key]).filter(Number.isFinite);
  return values.length ? Math.max(...values) : null;
}

function minBy(rows, key) {
  const values = rows.map((row) => row[key]).filter(Number.isFinite);
  return values.length ? Math.min(...values) : null;
}

async function fetchUsMarket() {
  const symbols = {
    listed: ["^GSPC", "S&P 500"],
    otc: ["^IXIC", "Nasdaq"],
    electronic: ["^DJI", "Dow"],
    finance: ["^RUT", "Russell 2000"]
  };
  const entries = await Promise.all(Object.entries(symbols).map(async ([key, [symbol, name]]) => {
    const data = await fetchYahooIndex(symbol, name);
    return [key, data];
  }));
  return {
    source: "Yahoo",
    groups: Object.fromEntries(entries)
  };
}

async function fetchYahooIndex(symbol, fallbackName, interval = "5m") {
  const response = await fetchWithTimeout(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=${encodeURIComponent(interval)}`, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 EasyInvestTW market data reader"
    }
  }, 1800);
  if (!response.ok) throw new Error(`Yahoo request failed: ${symbol}`);
  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo empty result: ${symbol}`);
  const meta = result.meta || {};
  const quote = result.indicators?.quote?.[0] || {};
  const timestamps = result.timestamp || [];
  const closes = quote.close || [];
  const volumes = quote.volume || [];
  const candles = timestamps.map((time, index) => ({
    date: new Date(time * 1000).toISOString(),
    close: toNumber(closes[index]),
    volume: toNumber(volumes[index])
  })).filter((item) => Number.isFinite(item.close));
  const index = toNumber(meta.regularMarketPrice) || candles.at(-1)?.close;
  const previousClose = toNumber(meta.previousClose) || toNumber(meta.chartPreviousClose);
  const change = Number.isFinite(index) && Number.isFinite(previousClose) ? index - previousClose : null;
  return {
    name: meta.shortName || fallbackName,
    symbol,
    index,
    previousClose,
    open: toNumber(meta.regularMarketOpen) || candles[0]?.close,
    high: toNumber(meta.regularMarketDayHigh) || maxBy(candles, "close"),
    low: toNumber(meta.regularMarketDayLow) || minBy(candles, "close"),
    turnover: null,
    change,
    changePercent: Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null,
    source: "Yahoo",
    lastUpdated: meta.regularMarketTime ? meta.regularMarketTime * 1000 : new Date().toISOString(),
    candles
  };
}

async function fetchHistory(code) {
  const twseHistory = await fetchTwseHistory(code);
  if (twseHistory.length) return twseHistory;

  const fugleHistory = await fetchFugleHistory(code);
  return repairHistoryWithRealtimeQuote(code, fugleHistory);
}

async function fetchTwseHistory(code) {
  const months = recentMonths(6);
  const results = await Promise.all(months.map(async (date) => {
    const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${date}&stockNo=${encodeURIComponent(code)}`;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
        referer: "https://www.twse.com.tw/",
        "user-agent": "Mozilla/5.0 EasyInvestTW historical price reader"
      }
    });
    if (!response.ok) return [];
    const payload = await response.json();
    if (payload.stat && payload.stat !== "OK") return [];
    return (payload.data || []).map((row) => ({
      date: twseDateToIso(row[0]),
      volume: toNumber(row[1]),
      value: toNumber(row[2]),
      open: toNumber(row[3]),
      high: toNumber(row[4]),
      low: toNumber(row[5]),
      close: toNumber(row[6]),
      change: toNumber(row[7]),
      trades: toNumber(row[8]),
      source: "TWSE"
    })).filter((row) => Number.isFinite(row.close));
  }));

  const byDate = new Map();
  results.flat().forEach((row) => {
    if (row.date) byDate.set(row.date, row);
  });
  return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

async function fetchFugleHistory(code) {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    from: taipeiIsoDate(75),
    to: taipeiIsoDate(),
    timeframe: "D",
    adjusted: "false",
    fields: "open,high,low,close,volume,turnover,change",
    sort: "asc"
  });
  const response = await fetch(`${FUGLE_BASE}/historical/candles/${encodeURIComponent(code)}?${params}`, {
    headers: {
      accept: "application/json",
      "X-API-KEY": apiKey
    }
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.data || []).map((row) => ({
    date: row.date,
    volume: row.volume,
    value: row.turnover,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    change: row.change,
    trades: null,
    source: "Fugle"
  })).filter((row) => Number.isFinite(toNumber(row.close)));
}

async function repairHistoryWithRealtimeQuote(code, history) {
  if (!history.length) return history;
  const [twseRealtime, fugleRealtime] = await Promise.all([
    fetchTwseRealtimeQuotes([code]).catch(() => []),
    fetchFugleQuotes([code]).catch(() => [])
  ]);
  const quote = mergeRealtimePayloads(twseRealtime, fugleRealtime)
    .find((item) => String(item.symbol || item.code || "").trim() === String(code));
  const close = realtimeQuoteValue(quote, "close");
  if (!Number.isFinite(close) || close <= 0) return history;

  const last = history.at(-1);
  const previous = history.at(-2);
  const lastClose = toNumber(last.close);
  const previousClose = toNumber(previous?.close);
  const quoteDate = quote.date || dateFromTimestamp(quote.lastUpdated || quote.closeTime) || last.date;
  const deviatesFromQuote = Number.isFinite(lastClose) && Math.abs(lastClose - close) / close > 0.12;
  const impossibleDailyMove = Number.isFinite(lastClose) && Number.isFinite(previousClose) && previousClose > 0
    && Math.abs(lastClose - previousClose) / previousClose > 0.15;

  if (!deviatesFromQuote && !impossibleDailyMove) return history;

  const repaired = {
    ...last,
    date: quoteDate,
    open: realtimeQuoteValue(quote, "open") ?? last.open,
    high: realtimeQuoteValue(quote, "high") ?? last.high,
    low: realtimeQuoteValue(quote, "low") ?? last.low,
    close,
    change: Number.isFinite(previousClose) ? close - previousClose : realtimeQuoteValue(quote, "change"),
    volume: realtimeQuoteValue(quote, "volume") ?? last.volume,
    value: realtimeQuoteValue(quote, "value") ?? last.value,
    trades: realtimeQuoteValue(quote, "trades") ?? last.trades,
    source: `${last.source || "History"}+Realtime`
  };
  return [...history.slice(0, -1), repaired];
}

function realtimeQuoteValue(quote, field) {
  if (!quote) return null;
  const fields = {
    close: [quote.lastPrice, quote.closePrice, quote.close, quote.price],
    open: [quote.openPrice, quote.open],
    high: [quote.highPrice, quote.high],
    low: [quote.lowPrice, quote.low],
    change: [quote.change],
    volume: [quote.tradeVolume, quote.total?.tradeVolume, quote.volume],
    value: [quote.tradeValue, quote.total?.tradeValue, quote.turnover, quote.value],
    trades: [quote.transaction, quote.total?.transaction, quote.trades]
  }[field] || [];
  for (const value of fields) {
    const parsed = toNumber(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function dateFromTimestamp(value) {
  const timestamp = toNumber(value);
  if (!Number.isFinite(timestamp)) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

function recentMonths(count) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}${month}01`;
  }).reverse();
}

async function fetchJson(path) {
  const response = await fetchWithTimeout(`${BASE}${path}`, {
    headers: twseHeaders()
  }, 2500);

  if (!response.ok) {
    throw new Error(`TWSE request failed: ${path}`);
  }

  return response.json();
}

function twseHeaders() {
  return {
    accept: "application/json,text/plain,*/*",
    "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    pragma: "no-cache",
    referer: "https://www.twse.com.tw/zh/page/trading/fund/T86.html",
    "user-agent": "Mozilla/5.0 EasyInvestTW market data reader"
  };
}

function tpexHeaders() {
  return {
    accept: "application/json,text/plain,*/*",
    "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    pragma: "no-cache",
    referer: "https://www.tpex.org.tw/zh-tw/",
    "user-agent": "Mozilla/5.0 EasyInvestTW market data reader"
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function safeFetchJson(path) {
  try {
    return await fetchJson(path);
  } catch {
    return [];
  }
}

async function safeFetchFugleQuotes(symbols) {
  try {
    return await fetchFugleQuotes(symbols);
  } catch {
    return [];
  }
}

async function safeFetchTpexValuation() {
  try {
    return await fetchTpexValuation();
  } catch {
    return [];
  }
}

async function safeFetchMopsRevenue() {
  try {
    return await withSoftTimeout(fetchMopsRevenue(), 3200, []);
  } catch {
    return [];
  }
}

async function safeFetchTwseRealtimeQuotes(symbols) {
  try {
    return await fetchTwseRealtimeQuotes(symbols);
  } catch {
    return [];
  }
}

async function safeFetchFugleActiveRanking() {
  try {
    return await fetchFugleActiveRanking();
  } catch {
    return [];
  }
}

async function safeFetchTwseIndex() {
  try {
    const index = await fetchTwseIndex();
    if (Number.isFinite(toNumber(index?.index))) return index;
    throw new Error("TWSE index empty");
  } catch {
    try {
      return await fetchYahooIndex("^TWII", "台灣加權指數");
    } catch {
      return null;
    }
  }
}

async function safeFetchUsMarket() {
  try {
    return await withSoftTimeout(fetchUsMarket(), 2500, null);
  } catch {
    return null;
  }
}

async function safeFetchInstitutional() {
  try {
    return await withSoftTimeout(fetchInstitutional(), 3200, null);
  } catch {
    return null;
  }
}

async function safeFetchMarketNews() {
  try {
    return await withSoftTimeout(fetchMarketNews(), 2200, []);
  } catch {
    return [];
  }
}

function withSoftTimeout(promise, timeoutMs, fallback) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), timeoutMs);
    Promise.resolve(promise)
      .then((value) => resolve(value))
      .catch(() => resolve(fallback))
      .finally(() => clearTimeout(timer));
  });
}

function sendJson(res, statusCode, body) {
  res.set("content-type", "application/json; charset=utf-8");
  res.set("cache-control", "no-store, max-age=0");
  res.set("access-control-allow-origin", "*");
  return res.status(statusCode).send(JSON.stringify(body));
}
