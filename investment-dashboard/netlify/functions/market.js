const BASE = "https://openapi.twse.com.tw/v1";

const endpoints = {
  daily: "/exchangeReport/STOCK_DAY_ALL",
  valuation: "/exchangeReport/BWIBBU_ALL",
  revenue: "/opendata/t187ap05_L"
};

const FUGLE_BASE = "https://api.fugle.tw/marketdata/v1.0/stock";

exports.handler = async function handler(event) {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  const symbols = parseSymbols(event.queryStringParameters && event.queryStringParameters.symbols);

  try {
    if (code) {
      return json(200, {
        ok: true,
        code,
        history: await fetchHistory(code)
      });
    }

    const [daily, valuation, revenue, realtime, index] = await Promise.all([
      safeFetchJson(endpoints.daily),
      safeFetchJson(endpoints.valuation),
      safeFetchJson(endpoints.revenue),
      safeFetchFugleQuotes(symbols),
      safeFetchTwseIndex()
    ]);

    return json(200, {
      ok: true,
      updatedAt: new Date().toISOString(),
      daily,
      valuation,
      revenue,
      realtime,
      index,
      realtimeSource: realtime.length ? "Fugle" : null
    });
  } catch (error) {
    return json(502, {
      ok: false,
      error: error.message
    });
  }
};

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
  const [summary, candles] = await Promise.all([
    fetchTwseIndexSummary(),
    fetchTwseIndexCandles(date)
  ]);
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
    candles
  };
}

async function fetchTwseIndexSummary() {
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw&json=1&delay=0&_=${Date.now()}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      referer: "https://mis.twse.com.tw/stock/index.jsp",
      "cache-control": "no-cache"
    }
  });
  if (!response.ok) return {};
  const payload = await response.json();
  const row = payload.msgArray && payload.msgArray[0];
  if (!row) return {};

  return {
    index: row.z,
    previousClose: row.y,
    open: row.o,
    high: row.h,
    low: row.l,
    turnover: row.v,
    lastUpdated: row.tlong ? Number(row.tlong) : `${row.d || ""} ${row.t || ""}`
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

async function fetchHistory(code) {
  const months = recentMonths(6);
  const results = await Promise.all(months.map(async (date) => {
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${date}&stockNo=${encodeURIComponent(code)}&response=json`;
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) return [];
    const payload = await response.json();
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

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=45",
      "access-control-allow-origin": "*"
    },
    body: JSON.stringify(body)
  };
}
