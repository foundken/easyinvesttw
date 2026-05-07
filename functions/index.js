const { onRequest } = require("firebase-functions/v2/https");

const BASE = "https://openapi.twse.com.tw/v1";

const endpoints = {
  daily: "/exchangeReport/STOCK_DAY_ALL",
  valuation: "/exchangeReport/BWIBBU_ALL",
  revenue: "/opendata/t187ap05_L"
};

const FUGLE_BASE = "https://api.fugle.tw/marketdata/v1.0/stock";

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

    const [daily, valuation, revenue, realtime, index, usIndex, institutional, news] = await Promise.all([
      safeFetchJson(endpoints.daily),
      safeFetchJson(endpoints.valuation),
      safeFetchJson(endpoints.revenue),
      safeFetchFugleQuotes(symbols),
      safeFetchTwseIndex(),
      safeFetchUsMarket(),
      safeFetchInstitutional(),
      safeFetchMarketNews()
    ]);

    return sendJson(res, 200, {
      ok: true,
      updatedAt: new Date().toISOString(),
      daily,
      valuation,
      revenue,
      realtime,
      index,
      usIndex,
      institutional,
      news,
      realtimeSource: realtime.length ? "Fugle" : null
    });
  } catch (error) {
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

async function fetchFugleQuotes(symbols) {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey || !symbols.length) return [];

  const quotes = await Promise.all(symbols.map(async (symbol) => {
    try {
      const response = await fetch(`${FUGLE_BASE}/intraday/quote/${encodeURIComponent(symbol)}`, {
        headers: {
          accept: "application/json",
          "X-API-KEY": apiKey
        }
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }));

  return quotes.filter(Boolean);
}

async function fetchTwseIndex() {
  const date = taipeiDate();
  const [groups, candles] = await Promise.all([
    fetchTwseIndexGroups(),
    fetchTwseIndexCandles(date)
  ]);
  const summary = groups.listed || {};
  const latest = candles.at(-1);
  const index = toNumber(summary.index) || latest?.close;
  const previousClose = toNumber(summary.previousClose);
  const change = Number.isFinite(index) && Number.isFinite(previousClose) ? index - previousClose : null;
  const changePercent = Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null;

  return {
    name: "發行量加權股價指數",
    symbol: "t00",
    index,
    previousClose,
    open: toNumber(summary.open) || candles[0]?.close,
    high: toNumber(summary.high) || maxBy(candles, "close"),
    low: toNumber(summary.low) || minBy(candles, "close"),
    turnover: toNumber(summary.turnover),
    change,
    changePercent,
    source: "TWSE",
    lastUpdated: summary.lastUpdated || latest?.date || new Date().toISOString(),
    candles,
    groups
  };
}

async function fetchTwseIndexGroups() {
  const symbols = [
    ["listed", "tse_t00.tw", "發行量加權股價指數"],
    ["otc", "otc_o00.tw", "上櫃指數"],
    ["electronic", "tse_t13.tw", "電子類指數"],
    ["finance", "tse_t17.tw", "金融保險類指數"]
  ];
  const exCh = symbols.map((item) => item[1]).join("|");
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${exCh}&json=1&delay=0&_=${Date.now()}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      referer: "https://mis.twse.com.tw/stock/index.jsp",
      "cache-control": "no-cache"
    }
  });
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
  const response = await fetch(`https://www.twse.com.tw/exchangeReport/MI_5MINS_INDEX?response=json&date=${date}`, {
    headers: { accept: "application/json" }
  });
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
  const date = taipeiDate();
  const response = await fetch(`https://www.twse.com.tw/rwd/zh/fund/T86?date=${date}&selectType=ALLBUT0999&response=json`, {
    headers: { accept: "application/json" }
  });
  if (!response.ok) throw new Error("TWSE institutional request failed");

  const payload = await response.json();
  const fields = payload.fields || [];
  const rows = Array.isArray(payload.data) ? payload.data : [];
  if (!rows.length) throw new Error("TWSE institutional empty result");
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
    date: payload.date || date,
    foreign: totals.foreign,
    trust: totals.trust,
    dealer: totals.dealer,
    total: totals.foreign + totals.trust + totals.dealer,
    stocks,
    source: "TWSE"
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
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "user-agent": "Mozilla/5.0 EasyInvestTW market news reader"
        }
      });
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
  const response = await fetch("https://www.cnyes.com/", {
    headers: {
      accept: "text/html",
      "user-agent": "Mozilla/5.0 EasyInvestTW market news reader"
    }
  });
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

function taipeiDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}${get("month")}${get("day")}`;
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

async function fetchYahooIndex(symbol, fallbackName) {
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`, {
    headers: { accept: "application/json" }
  });
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
  const fugleHistory = await fetchFugleHistory(code);
  if (fugleHistory.length) return fugleHistory;

  const months = recentMonths(6);
  const results = await Promise.all(months.map(async (date) => {
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${date}&stockNo=${encodeURIComponent(code)}&response=json`;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
        "user-agent": "Mozilla/5.0 EasyInvestTW historical price reader"
      }
    });
    if (!response.ok) return [];
    const payload = await response.json();
    if (payload.stat && payload.stat !== "OK") return [];
    return (payload.data || []).map((row) => ({
      date: row[0],
      volume: row[1],
      value: row[2],
      open: row[3],
      high: row[4],
      low: row[5],
      close: row[6],
      change: row[7],
      trades: row[8]
    }));
  }));

  return results.flat();
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
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`TWSE request failed: ${path}`);
  }

  return response.json();
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

async function safeFetchTwseIndex() {
  try {
    return await fetchTwseIndex();
  } catch {
    return null;
  }
}

async function safeFetchUsMarket() {
  try {
    return await fetchUsMarket();
  } catch {
    return null;
  }
}

async function safeFetchInstitutional() {
  try {
    return await fetchInstitutional();
  } catch {
    return null;
  }
}

async function safeFetchMarketNews() {
  try {
    return await fetchMarketNews();
  } catch {
    return [];
  }
}

function sendJson(res, statusCode, body) {
  res.set("content-type", "application/json; charset=utf-8");
  res.set("cache-control", "public, max-age=45");
  res.set("access-control-allow-origin", "*");
  return res.status(statusCode).send(JSON.stringify(body));
}
