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
      safeFetchFugleIndex()
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

async function fetchFugleIndex() {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey) return null;

  const headers = {
    accept: "application/json",
    "X-API-KEY": apiKey
  };
  const [quoteResponse, candlesResponse] = await Promise.all([
    fetch(`${FUGLE_BASE}/intraday/quote/IR0001`, { headers }),
    fetch(`${FUGLE_BASE}/intraday/candles/IR0001?timeframe=1`, { headers })
  ]);

  if (!quoteResponse.ok) return null;
  const quote = await quoteResponse.json();
  const candlesPayload = candlesResponse.ok ? await candlesResponse.json() : { data: [] };

  return {
    ...quote,
    name: quote.name || "加權指數",
    source: "Fugle",
    candles: candlesPayload.data || []
  };
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

async function safeFetchFugleIndex() {
  try {
    return await fetchFugleIndex();
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
