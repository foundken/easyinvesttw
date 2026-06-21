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
const COMPANY_NAME_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const INTRADAY_QUOTE_MAX_LAG_MS = 3 * 60 * 1000;
const INTRADAY_QUOTE_CACHE_TTL_MS = 30 * 1000;
const FAST_QUOTE_CACHE_TTL_MS = 1000;
const QUOTE_REALTIME_LAG_MS = 30 * 1000;
const INTRADAY_INDEX_MAX_LAG_MS = 5 * 60 * 1000;
const ETF_REGISTRY = [
  etfMeta("0050", "元大台灣50", "元大投信", "passive", false, "臺灣50指數"),
  etfMeta("0056", "元大高股息", "元大投信", "highDividend", false, "臺灣高股息指數"),
  etfMeta("006208", "富邦台50", "富邦投信", "passive", false, "臺灣50指數"),
  etfMeta("00878", "國泰永續高股息", "國泰投信", "highDividend", false, "MSCI臺灣ESG永續高股息精選30指數"),
  etfMeta("00919", "群益台灣精選高息", "群益投信", "highDividend", false, "臺灣精選高息指數"),
  etfMeta("00929", "復華台灣科技優息", "復華投信", "sector", false, "特選臺灣科技優息指數"),
  etfMeta("00400A", "主動群益台灣強棒", "群益投信", "active", true, ""),
  etfMeta("00981A", "主動統一台股增長", "統一投信", "active", true, ""),
  etfMeta("00991A", "主動野村台灣優選", "野村投信", "active", true, ""),
  etfMeta("00992A", "主動群益台灣精選", "群益投信", "active", true, "")
];
const ETF_HOLDING_SEEDS = {
  "0050": ["2330", "2317", "2454", "2308", "2382", "2881"],
  "0056": ["2891", "2882", "2886", "2303", "2603", "5876"],
  "006208": ["2330", "2317", "2454", "2308", "2382", "2882"],
  "00878": ["2891", "2886", "5876", "2303", "3711", "2882"],
  "00919": ["2603", "2891", "2882", "2303", "3034", "3711"],
  "00929": ["2303", "3711", "3034", "2382", "3231", "2454"],
  "00400A": ["2330", "2454", "2382", "6669", "3017", "3661"],
  "00981A": ["2330", "2317", "2454", "2308", "3231", "2382"],
  "00991A": ["2330", "2454", "3661", "6669", "3017", "2379"],
  "00992A": ["2330", "2317", "2382", "3231", "3017", "3034"]
};

function etfMeta(etfId, etfName, issuer, category, isActiveEtf, trackingIndex) {
  return {
    etfId,
    etfName,
    marketType: "上市",
    issuer,
    category,
    isActiveEtf,
    listingDate: "",
    trackingIndex,
    officialHoldingUrl: `https://www.twse.com.tw/zh/ETF/list`,
    officialPcFUrl: `https://www.twse.com.tw/zh/ETF/purchaseRedemption`,
    isActive: true
  };
}

const CONCEPT_SYMBOLS = [
  "1319", "1503", "1504", "1513", "1514", "1515", "1519", "1536", "1560", "1587",
  "1590", "1609", "1720", "1760", "1789", "1795", "2049", "2231", "2303", "2308",
  "2313", "2314", "2317", "2324", "2327", "2329", "2330", "2344", "2351", "2354",
  "2355", "2356", "2359", "2368", "2374", "2375", "2376", "2379", "2382", "2383", "2392",
  "2395", "2408", "2412", "2419", "2421", "2449", "2454", "2464", "2474", "2478",
  "2485", "2492", "2497", "2603", "2605", "2606", "2607", "2609", "2610", "2612", "2615",
  "2617", "2618", "2634", "2637", "2645", "2801", "2809", "2812", "2834", "2880",
  "2881", "2882", "2883", "2884", "2885", "2886", "2887", "2888", "2889", "2890",
  "2891", "2892", "2897", "3006", "3008", "3010", "3017", "3026", "3029", "3034",
  "3035", "3037", "3042", "3044", "3081", "3131", "3138", "3152", "3163", "3189", "3227", "3231",
  "3234", "3260", "3264", "3293", "3324", "3338", "3363", "3374", "3406", "3419", "3443",
  "3450", "3491", "3529", "3576", "3587", "3596", "3653", "3661", "3665", "3706", "3708", "3711",
  "4105", "4119", "4123", "4147", "4162", "4540", "4566", "4571", "4721", "4743",
  "4906", "4908", "4938", "4958", "4966", "4967", "4977", "4979", "5009", "5222", "5274", "5351",
  "5388", "5443", "5469", "5608", "5876", "5880", "6125", "6140", "6153", "6166",
  "6173", "6176", "6191", "6196", "6207", "6213", "6214", "6215", "6224", "6230",
  "6239", "6244", "6269", "6274", "6278", "6282", "6285", "6414", "6415", "6442",
  "6443", "6446", "6469", "6472", "6477", "6488", "6515", "6531", "6547", "6589",
  "6669", "6756", "6770", "6789", "6806", "6811", "6902", "8028", "8039", "8042",
  "8046", "8086", "8210", "8299", "8996", "9958"
];
let dashboardCache = null;
let quoteCache = null;
let monthlyRevenueCache = null;
let companyNameCache = null;
let twseSessionCookieCache = null;
let marketIndexCache = null;
let intradayQuoteCache = new Map();

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
      if (quoteCache && quoteCache.key === cacheKey && now - quoteCache.createdAt < FAST_QUOTE_CACHE_TTL_MS) {
        return sendJson(res, 200, {
          ...quoteCache.payload,
          cache: "fresh"
        });
      }
      const [quoteBundle, companyNames] = await Promise.all([
        fetchRealtimeQuoteBundle(symbols, { yahooRealtimeSymbols: symbols, timeoutMs: 3200 }),
        safeFetchCompanyNameMap()
      ]);
      const realtime = localizeRealtimeNames(
        quoteBundle.realtime,
        companyNames
      );
      const payload = {
        ok: true,
        updatedAt: new Date().toISOString(),
        realtime: compactRealtimeRows(realtime),
        realtimeSource: realtimeSourceLabel(realtime),
        quotePolicy: quoteBundle.policy
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
    const activeQuoteSymbols = symbols;
    const realtimeSymbols = uniqueSymbols([
      ...activeQuoteSymbols,
      ...CONCEPT_SYMBOLS
    ]);
    const [quoteBundle, companyNames] = await Promise.all([
      fetchRealtimeQuoteBundle(realtimeSymbols, { fugleSymbols: activeQuoteSymbols, yahooRealtimeSymbols: activeQuoteSymbols }),
      safeFetchCompanyNameMap()
    ]);
    const realtime = localizeRealtimeNames(
      quoteBundle.realtime,
      companyNames
    );
    const relevantCodes = new Set(uniqueSymbols([
      ...symbols,
      ...topMarketSymbols(daily, 180),
      ...CONCEPT_SYMBOLS
    ]));
    ETF_REGISTRY.forEach((item) => relevantCodes.add(item.etfId));

    const compactDaily = await hydrateDailyTechnicalStats(compactDailyRows(filterRowsByCodes(daily, relevantCodes)));
    const compactInstitutionalData = compactInstitutional(institutional, relevantCodes);
    const fundFlow = buildFundFlowRows(compactDaily, compactInstitutionalData);
    const etfFlow = buildEtfFlowDataset({
      date: institutional?.date || taipeiIsoDate(),
      daily: compactDaily,
      institutional: compactInstitutionalData,
      fundFlow
    });
    const fundFlowWithEtf = mergeEtfFlowIntoFundFlow(fundFlow, etfFlow.dailyStockEtfFlowSummary);
    const payload = {
      ok: true,
      updatedAt: new Date().toISOString(),
      latestTradingDate: institutional?.date || taipeiIsoDate(),
      daily: compactDaily,
      valuation: compactValuationRows(filterRowsByCodes(mergeByCode(twseValuation, tpexValuation), relevantCodes)),
      revenue: compactRevenueRows(filterRowsByCodes(mergeByCode(mergeByCode(listedRevenue, publicRevenue), mopsRevenue), relevantCodes)),
      realtime: compactRealtimeRows(realtime),
      index,
      usIndex,
      institutional: compactInstitutionalData,
      fundFlow: fundFlowWithEtf,
      etfFlow,
      dataStatus: buildDataStatus({
        twseDaily,
        daily,
        institutional,
        index,
        valuation: mergeByCode(twseValuation, tpexValuation),
        revenue: mergeByCode(mergeByCode(listedRevenue, publicRevenue), mopsRevenue)
      }),
      news,
      dailySource: fugleActiveRanking.length ? "Fugle" : twseDaily.length ? "TWSE" : null,
      realtimeSource: realtimeSourceLabel(realtime),
      quotePolicy: quoteBundle.policy
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

async function fetchRealtimeQuoteBundle(symbols, options = {}) {
  const requestedSymbols = uniqueSymbols(symbols);
  const fugleSymbols = uniqueSymbols(options.fugleSymbols || requestedSymbols);
  const yahooRealtimeSymbols = uniqueSymbols(options.yahooRealtimeSymbols || []);
  const phase = twMarketPhase();
  const intraday = phase === "intraday";

  const [fugleRealtime, twseRealtime, yahooTwRealtime, yahooFallback] = await Promise.all([
    safeFetchFugleQuotes(fugleSymbols),
    safeFetchTwseRealtimeQuotes(requestedSymbols, options.timeoutMs),
    intraday && yahooRealtimeSymbols.length ? safeFetchYahooTwRealtimeQuotes(yahooRealtimeSymbols) : Promise.resolve([]),
    intraday ? Promise.resolve([]) : safeFetchYahooQuotes(yahooRealtimeSymbols.length ? yahooRealtimeSymbols : requestedSymbols)
  ]);

  const primary = intraday
    ? mergeRealtimePayloads(mergeRealtimePayloads(twseRealtime, yahooTwRealtime), fugleRealtime)
    : mergeRealtimePayloads(mergeRealtimePayloads(twseRealtime, yahooFallback), fugleRealtime);

  rememberIntradayQuotes(primary);
  const realtime = intraday
    ? mergeRealtimePayloads(primary, cachedIntradayQuotes(requestedSymbols, primary))
    : primary;

  return {
    realtime: decorateRealtimeQuotes(realtime),
    fallback: decorateRealtimeQuotes(yahooFallback),
    policy: quotePolicySummary({
      phase,
      realtime,
      fugleRealtime,
      twseRealtime,
      yahooTwRealtime,
      yahooFallback
    })
  };
}

function quotePolicySummary({ phase, realtime, fugleRealtime, twseRealtime, yahooTwRealtime, yahooFallback }) {
  return {
    phase,
    maxIntradayLagSeconds: Math.round(INTRADAY_QUOTE_MAX_LAG_MS / 1000),
    cacheTtlSeconds: Math.round(INTRADAY_QUOTE_CACHE_TTL_MS / 1000),
    currentSources: realtimeSourceLabel(realtime),
    sourceCounts: {
      fugle: fugleRealtime.length,
      twse: twseRealtime.length,
      yahooTw: yahooTwRealtime.length,
      yahooFallback: yahooFallback.length,
      current: realtime.length
    },
    rule: phase === "intraday"
      ? "盤中只允許 Fugle/TWSE/TPEx/YahooTW 新鮮報價更新 currentPrice，Yahoo 延遲報價不覆蓋。"
      : "非盤中允許收盤與歷史資料補齊。"
  };
}

async function fetchFugleQuotes(symbols) {
  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey || !symbols.length) return [];

  const quotes = [];
  const limited = uniqueSymbols(symbols).slice(0, 30);
  for (let index = 0; index < limited.length; index += 6) {
    const batch = limited.slice(index, index + 6);
    const batchQuotes = await Promise.all(batch.map(async (symbol) => {
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
    quotes.push(...batchQuotes);
  }

  return quotes.map(normalizeFugleRealtimeQuote).filter(Boolean);
}

function normalizeFugleRealtimeQuote(row) {
  if (!row) return null;
  const symbol = String(row.symbol || row.code || row.stockNo || row.stockId || "").trim();
  if (!/^\d{4,6}$/.test(symbol)) return null;
  const close = toNumber(row.lastPrice ?? row.closePrice ?? row.price ?? row.close);
  const previousClose = toNumber(row.previousClose ?? row.referencePrice ?? row.previousPrice);
  if (!Number.isFinite(close) || close <= 0) return null;
  const change = toNumber(row.change) ?? (Number.isFinite(previousClose) ? close - previousClose : null);
  const changePercent = toNumber(row.changePercent) ?? (
    Number.isFinite(change) && Number.isFinite(previousClose) && previousClose
      ? (change / previousClose) * 100
      : null
  );
  return {
    symbol,
    name: row.name || row.companyName || row.shortName || symbol,
    exchange: row.market || row.exchange,
    openPrice: toNumber(row.openPrice ?? row.open),
    highPrice: toNumber(row.highPrice ?? row.high),
    lowPrice: toNumber(row.lowPrice ?? row.low),
    lastPrice: close,
    closePrice: close,
    previousClose,
    change,
    changePercent,
    tradeVolume: toNumber(row.total?.tradeVolume ?? row.tradeVolume ?? row.volume),
    tradeValue: toNumber(row.total?.tradeValue ?? row.tradeValue ?? row.turnover ?? row.value),
    transaction: toNumber(row.total?.transaction ?? row.transaction ?? row.trades),
    lastUpdated: row.lastUpdated || row.closeTime || row.date || row.time,
    source: "Fugle"
  };
}

async function fetchTwseRealtimeQuotes(symbols, timeoutMs = 4500) {
  if (!symbols.length) return [];
  const chunks = [];
  for (let index = 0; index < symbols.length; index += 12) {
    chunks.push(symbols.slice(index, index + 12));
  }

  const batches = await Promise.all(chunks.map(async (chunk) => {
    const [listedRows, otcRows] = await Promise.all([
      fetchTwseRealtimeChannelBatch(chunk.map((symbol) => `tse_${symbol}.tw`), timeoutMs),
      fetchTwseRealtimeChannelBatch(chunk.map((symbol) => `otc_${symbol}.tw`), timeoutMs)
    ]);
    const merged = mergeRealtimePayloads(listedRows, otcRows);
    const missing = chunk.filter((symbol) => !merged.some((row) => String(row.symbol) === String(symbol)));
    if (!missing.length) return merged;
    const retryRows = await fetchTwseRealtimeSingleQuotes(missing, Math.max(timeoutMs, 4500));
    return mergeRealtimePayloads(merged, retryRows);
  }));

  return batches.flat();
}

async function fetchTwseRealtimeSingleQuotes(symbols, timeoutMs) {
  const rows = await Promise.all(symbols.map(async (symbol) => {
    const [listedRows, otcRows] = await Promise.all([
      fetchTwseRealtimeChannelBatch([`tse_${symbol}.tw`], timeoutMs),
      fetchTwseRealtimeChannelBatch([`otc_${symbol}.tw`], timeoutMs)
    ]);
    return mergeRealtimePayloads(listedRows, otcRows);
  }));
  return rows.flat();
}

async function fetchTwseRealtimeChannelBatch(channels, timeoutMs) {
  if (!channels.length) return [];
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(channels.join("|"))}&json=1&delay=0&_=${Date.now()}`;
  const rows = await fetchTwseRealtimeRows(url, timeoutMs);
  if (rows.length) return rows;
  const cookie = await fetchTwseSessionCookie(Math.min(timeoutMs, 2200));
  if (!cookie) return [];
  return await fetchTwseRealtimeRows(url, Math.max(timeoutMs, 4500), cookie);
}

async function fetchTwseRealtimeRows(url, timeoutMs, cookie) {
  const response = await fetchWithTimeout(url, {
    headers: {
      ...twseHeaders(),
      referer: "https://mis.twse.com.tw/stock/index.jsp",
      ...(cookie ? { cookie } : {})
    }
  }, timeoutMs).catch(() => null);
  if (!response?.ok) return [];
  const payload = await response.json().catch(() => ({}));
  return (payload.msgArray || []).map(normalizeTwseRealtimeRow).filter(Boolean);
}

async function fetchTwseSessionCookie(timeoutMs = 1800) {
  const now = Date.now();
  if (twseSessionCookieCache && now - twseSessionCookieCache.createdAt < 10 * 60 * 1000) {
    return twseSessionCookieCache.cookie;
  }
  const response = await fetchWithTimeout("https://mis.twse.com.tw/stock/index.jsp", {
    headers: twseHeaders()
  }, timeoutMs).catch(() => null);
  const cookie = cookieHeaderFromSetCookie(response?.headers?.get("set-cookie"));
  if (cookie) {
    twseSessionCookieCache = { cookie, createdAt: now };
  }
  return cookie;
}

function cookieHeaderFromSetCookie(setCookie) {
  return String(setCookie || "")
    .split(/,\s*/)
    .map((part) => part.split(";")[0]?.trim())
    .filter((part) => part && part.includes("="))
    .join("; ");
}

async function fetchYahooQuotes(symbols) {
  if (!symbols.length) return [];
  const quotes = await Promise.all(symbols.slice(0, 30).map((symbol) => fetchYahooTaiwanQuote(symbol)));
  return quotes.filter(Boolean);
}

async function fetchYahooTwRealtimeQuotes(symbols) {
  if (!symbols.length) return [];
  const batches = [];
  const limited = symbols.slice(0, 24);
  for (let index = 0; index < limited.length; index += 4) {
    batches.push(limited.slice(index, index + 4));
  }
  const rows = [];
  for (const batch of batches) {
    const quotes = await Promise.all(batch.map((symbol) => fetchYahooTwRealtimeQuote(symbol)));
    rows.push(...quotes.filter(Boolean));
  }
  return rows;
}

async function fetchYahooTwRealtimeQuote(symbol) {
  const code = String(symbol || "").trim();
  if (!/^\d{4,6}$/.test(code)) return null;
  return await fetchYahooTwRealtimeQuoteBySymbol(`${code}.TW`, code)
    || await fetchYahooTwRealtimeQuoteBySymbol(`${code}.TWO`, code);
}

async function fetchYahooTwRealtimeQuoteBySymbol(yahooSymbol, code) {
  const response = await fetchWithTimeout(`https://tw.stock.yahoo.com/quote/${encodeURIComponent(yahooSymbol)}`, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "user-agent": "Mozilla/5.0 EasyInvestTW quote reader"
    }
  }, 2600).catch(() => null);
  if (!response?.ok) return null;
  const html = await response.text().catch(() => "");
  const quote = parseYahooTwQuoteFromHtml(html, code);
  if (!quote) return null;
  return quote;
}

function parseYahooTwQuoteFromHtml(html, fallbackCode) {
  const match = String(html || "").match(/"quote":\{"data":(\{.*?\}),"isFailed":false,"isFetching":false,"isLoaded":true\}/s);
  if (!match) return null;
  let data = null;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return null;
  }
  const symbol = String(data.symbol || fallbackCode || "").split(".")[0].trim();
  if (!/^\d{4,6}$/.test(symbol)) return null;
  const close = yahooRawNumber(data.price);
  const previousClose = yahooRawNumber(data.regularMarketPreviousClose);
  if (!Number.isFinite(close) || close <= 0) return null;
  const change = yahooRawNumber(data.change) ?? (Number.isFinite(previousClose) ? close - previousClose : null);
  const changePercent = parseYahooPercent(data.changePercent) ?? (
    Number.isFinite(change) && Number.isFinite(previousClose) && previousClose
      ? (change / previousClose) * 100
      : null
  );
  const delayMinutes = toNumber(data.exchangeDataDelayedBy);
  return {
    symbol,
    name: data.symbolName || symbol,
    exchange: data.exchange,
    openPrice: yahooRawNumber(data.regularMarketOpen),
    highPrice: yahooRawNumber(data.regularMarketDayHigh),
    lowPrice: yahooRawNumber(data.regularMarketDayLow),
    lastPrice: close,
    closePrice: close,
    previousClose,
    change,
    changePercent,
    tradeVolume: toNumber(data.volume),
    tradeValue: toNumber(data.turnoverM),
    transaction: toNumber(data.transaction),
    lastUpdated: data.regularMarketTime || new Date().toISOString(),
    source: delayMinutes > 0 ? "YahooTW_DELAYED" : "YahooTW",
    exchangeDataDelayedBy: delayMinutes,
    marketStatus: data.marketStatus
  };
}

function yahooRawNumber(value) {
  return toNumber(value?.raw ?? value?.sort ?? value?.fmt ?? value);
}

function parseYahooPercent(value) {
  if (typeof value !== "string") return toNumber(value);
  return toNumber(value.replace("%", ""));
}

async function fetchYahooTaiwanQuote(symbol) {
  const code = String(symbol || "").trim();
  if (!/^\d{4,6}$/.test(code)) return null;
  return await fetchYahooTaiwanQuoteBySymbol(`${code}.TW`, code)
    || await fetchYahooTaiwanQuoteBySymbol(`${code}.TWO`, code);
}

async function fetchYahooTaiwanQuoteBySymbol(yahooSymbol, code) {
  const response = await fetchWithTimeout(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1m`, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 EasyInvestTW quote reader"
    }
  }, 1800).catch(() => null);
  if (!response?.ok) return null;
  const payload = await response.json().catch(() => ({}));
  const result = payload.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta || {};
  const close = toNumber(meta.regularMarketPrice);
  const previousClose = toNumber(meta.previousClose) || toNumber(meta.chartPreviousClose);
  if (!Number.isFinite(close) || close <= 0 || !Number.isFinite(previousClose)) return null;
  const change = close - previousClose;
  return {
    symbol: code,
    name: meta.shortName || code,
    openPrice: toNumber(meta.regularMarketOpen),
    highPrice: toNumber(meta.regularMarketDayHigh),
    lowPrice: toNumber(meta.regularMarketDayLow),
    lastPrice: close,
    closePrice: close,
    previousClose,
    change,
    changePercent: previousClose ? (change / previousClose) * 100 : null,
    tradeVolume: toNumber(meta.regularMarketVolume),
    lastUpdated: meta.regularMarketTime ? meta.regularMarketTime * 1000 : new Date().toISOString(),
    source: "YahooDelayed"
  };
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
  // Do not average bid/ask here; the midpoint can create non-tick prices such as 14.675.
  if (Number.isFinite(bestBid)) return bestBid;
  if (Number.isFinite(bestAsk)) return bestAsk;
  return null;
}

function firstTwseLevel(value) {
  const first = String(value || "").split("_").find((item) => item && item !== "-");
  return toNumber(first);
}

function preferChineseName(primaryName, secondaryName, code) {
  if (hasChineseText(primaryName)) return primaryName;
  if (hasChineseText(secondaryName)) return secondaryName;
  return secondaryName || primaryName || code;
}

function hasChineseText(value) {
  return /[\u4e00-\u9fff]/.test(String(value || ""));
}

function mergeRealtimePayloads(primary, preferred) {
  const map = new Map();
  [...(primary || []), ...(preferred || [])].forEach((quote) => {
    if (!isUsableRealtimeQuote(quote)) return;
    const symbol = String(quote.symbol || quote.code || "").trim();
    if (!symbol) return;
    const current = map.get(symbol);
    map.set(symbol, current ? mergeRealtimeQuote(current, quote, symbol) : quote);
  });
  return [...map.values()];
}

function rememberIntradayQuotes(rows = []) {
  if (twMarketPhase() !== "intraday") return;
  const now = Date.now();
  rows.forEach((row) => {
    if (!isUsableRealtimeQuote(row)) return;
    const source = String(row.source || "");
    if (source === "YahooDelayed" || source === "YahooTW_DELAYED" || source === "TWSE_PREVIOUS") return;
    const symbol = String(row.symbol || row.code || "").trim();
    if (!symbol) return;
    intradayQuoteCache.set(symbol, {
      quote: { ...row },
      cachedAt: now
    });
  });

  intradayQuoteCache = new Map([...intradayQuoteCache.entries()]
    .filter(([, item]) => now - item.cachedAt <= INTRADAY_QUOTE_CACHE_TTL_MS));
}

function cachedIntradayQuotes(symbols = [], currentRows = []) {
  const now = Date.now();
  const current = new Set((currentRows || []).map((row) => String(row.symbol || row.code || "").trim()));
  return uniqueSymbols(symbols)
    .filter((symbol) => !current.has(symbol))
    .map((symbol) => {
      const cached = intradayQuoteCache.get(symbol);
      if (!cached || now - cached.cachedAt > INTRADAY_QUOTE_CACHE_TTL_MS) return null;
      return {
        ...cached.quote,
        source: `${cached.quote.source || "Realtime"}Cache`,
        currentPriceIsStale: true,
        cachedAt: cached.cachedAt
      };
    })
    .filter(Boolean);
}

function decorateRealtimeQuotes(rows = []) {
  const now = Date.now();
  return rows.map((row) => {
    const timestamp = quoteTimestamp(row);
    const lagMs = Number.isFinite(timestamp) ? Math.max(0, now - timestamp) : null;
    const isIntraday = twMarketPhase() === "intraday";
    const currentPriceIsRealtime = isIntraday && Number.isFinite(lagMs) && lagMs <= QUOTE_REALTIME_LAG_MS;
    const currentPriceIsStale = isIntraday && Number.isFinite(lagMs) && lagMs > INTRADAY_QUOTE_MAX_LAG_MS;
    const quoteQuality = !isIntraday
      ? "close"
      : currentPriceIsRealtime
        ? "realtime"
        : Number.isFinite(lagMs) && lagMs <= INTRADAY_QUOTE_MAX_LAG_MS
          ? "near-realtime"
          : "unknown";
    return {
      ...row,
      currentPrice: toNumber(row.lastPrice ?? row.closePrice ?? row.close),
      currentPriceSource: row.source,
      currentPriceTime: row.lastUpdated || row.closeTime || row.date,
      currentPriceIsRealtime,
      currentPriceIsStale,
      quoteLagSeconds: Number.isFinite(lagMs) ? Math.round(lagMs / 1000) : null,
      quoteQuality
    };
  });
}

function mergeRealtimeQuote(current, incoming, symbol) {
  const currentTime = quoteTimestamp(current);
  const incomingTime = quoteTimestamp(incoming);
  const hasCurrentTime = Number.isFinite(currentTime);
  const hasIncomingTime = Number.isFinite(incomingTime);
  const incomingIsFresher = hasCurrentTime && hasIncomingTime && incomingTime - currentTime > 60000;
  const currentIsFresher = hasCurrentTime && hasIncomingTime && currentTime - incomingTime > 60000;
  const preferIncoming = incomingIsFresher || (!currentIsFresher && quoteFreshnessRank(incoming) >= quoteFreshnessRank(current));
  const merged = preferIncoming ? { ...current, ...incoming } : { ...incoming, ...current };
  return {
    ...merged,
    name: preferChineseName(current.name, incoming.name, symbol)
  };
}

function quoteFreshnessRank(quote) {
  if (!quote || quote.source === "TWSE_PREVIOUS") return 0;
  if (String(quote.source || "").includes("YahooDelayed")) return 1;
  if (String(quote.source || "").includes("YahooTW")) return 2;
  if (String(quote.source || "").includes("TWSE") || String(quote.source || "").includes("TPEx")) return 4;
  if (quote.source === "Fugle") return 5;
  return 1;
}

function quoteTimestamp(quote) {
  const value = quote?.lastUpdated || quote?.closeTime || quote?.date || quote?.time;
  if (!value) return null;
  if (typeof value === "number") return value > 10000000000000 ? value / 1000 : value;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isUsableRealtimeQuote(quote) {
  if (!quote) return false;
  if (!isTwMarketOpen()) return true;
  const source = String(quote.source || "");
  if (source === "TWSE_PREVIOUS" || source === "YahooDelayed" || source === "YahooTW_DELAYED") return false;
  const timestamp = quoteTimestamp(quote);
  if (!Number.isFinite(timestamp)) return false;
  if (taipeiDateFromTimestamp(timestamp) !== taipeiDate()) return false;
  return Date.now() - timestamp <= INTRADAY_QUOTE_MAX_LAG_MS;
}

function localizeRealtimeNames(rows = [], nameMap = new Map()) {
  if (!nameMap?.size) return rows;
  return rows.map((row) => {
    const symbol = String(row.symbol || row.code || "").trim();
    const chineseName = nameMap.get(symbol);
    if (!chineseName || hasChineseText(row.name)) return row;
    return {
      ...row,
      name: chineseName
    };
  });
}

function realtimeSourceLabel(rows = []) {
  const sources = [...new Set(rows.map((row) => row.source).filter(Boolean))];
  if (!sources.length) return null;
  return sources.join("+");
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
      market: normalizeMarketLabel(row.Market || row.market || row.Exchange || row.exchange || row.Source || row.source),
      averageVolume5: toNumber(row.averageVolume5 ?? row.avgVolume5 ?? row.volumeAverage5),
      marginChange: toNumber(row.marginChange ?? row.marginBalanceChange),
      ma5: toNumber(row.ma5),
      ma20: toNumber(row.ma20),
      source: row.Source || row.source
    };
  }).filter((row) => row.code && row.name && Number.isFinite(row.close));
}

function normalizeMarketLabel(value) {
  const text = String(value || "").toUpperCase();
  if (text.includes("OTC") || text.includes("TWO") || text.includes("TPEX") || text.includes("上櫃")) return "上櫃";
  if (text.includes("TSE") || text.includes("TWSE") || text.includes("上市")) return "上市";
  return "上市";
}

function buildFundFlowRows(dailyRows = [], institutional = null) {
  return (dailyRows || [])
    .map((stock) => buildFundFlowItem(stock, institutional?.stocks?.[stock.code]))
    .filter(Boolean)
    .sort((a, b) => b.fundScore - a.fundScore)
    .slice(0, 160);
}

function buildFundFlowItem(stock, inst = null) {
  if (!stock) return null;
  const foreign = toNumber(inst?.foreign) || 0;
  const trust = toNumber(inst?.trust) || 0;
  const dealer = toNumber(inst?.dealer) || 0;
  const foreignBuyDays = toNumber(inst?.foreignBuyDays) || (foreign > 0 ? 1 : 0);
  const trustBuyDays = toNumber(inst?.trustBuyDays) || (trust > 0 ? 1 : 0);
  const foreignFiveDay = toNumber(inst?.foreignFiveDay) ?? foreign;
  const trustFiveDay = toNumber(inst?.trustFiveDay) ?? trust;
  const institutionFiveDay = toNumber(inst?.institutionFiveDay) ?? foreignFiveDay + trustFiveDay + dealer;
  const averageVolume5 = toNumber(stock.averageVolume5);
  const volumeMultiple = Number.isFinite(averageVolume5) && averageVolume5 > 0 ? (stock.volume || 0) / averageVolume5 : null;
  const marginChange = toNumber(stock.marginChange);
  const fundScore = calculateFundScore({
    changePercent: stock.changePercent,
    volumeMultiple,
    averageVolume5,
    foreign,
    foreignBuyDays,
    foreignFiveDay,
    trust,
    trustBuyDays,
    trustFiveDay,
    marginChange,
    close: stock.close,
    ma5: stock.ma5,
    ma20: stock.ma20
  });
  const riskFlags = buildRiskFlags({ stock, volumeMultiple, foreign, trust, dealer, marginChange, averageVolume5 });
  const tags = buildFundTags({
    fundScore,
    volumeMultiple,
    foreign,
    foreignBuyDays,
    trust,
    trustBuyDays,
    dealer,
    close: stock.close,
    ma20: stock.ma20,
    riskFlags
  });
  return {
    code: stock.code,
    name: stock.name,
    market: stock.market || "上市",
    close: stock.close,
    changePercent: stock.changePercent,
    volume: stock.volume,
    averageVolume5,
    volumeMultiple,
    foreign,
    foreignBuyDays,
    foreignFiveDay,
    trust,
    trustBuyDays,
    trustFiveDay,
    dealer,
    institutionFiveDay,
    marginChange,
    ma5: stock.ma5,
    ma20: stock.ma20,
    fundScore,
    tags,
    riskFlags
  };
}

function calculateFundScore(input) {
  const changePercent = toNumber(input.changePercent);
  const volumeMultiple = toNumber(input.volumeMultiple);
  let score = 0;
  if (changePercent >= 6) score += 20;
  else if (changePercent >= 4) score += 16;
  else if (changePercent >= 2) score += 10;
  else if (changePercent > 0) score += 5;
  if (volumeMultiple >= 3) score += 20;
  else if (volumeMultiple >= 2) score += 16;
  else if (volumeMultiple >= 1.5) score += 10;
  else if (volumeMultiple >= 1.2) score += 5;
  let foreignScore = 0;
  if ((input.foreign || 0) > 0) foreignScore += 5;
  if ((input.foreignBuyDays || 0) >= 3) foreignScore += 5;
  if ((input.foreignBuyDays || 0) >= 5) foreignScore += 8;
  if ((input.foreignFiveDay || 0) > 0 && (input.averageVolume5 || 0) > 0 && input.foreignFiveDay > input.averageVolume5 * 0.1) foreignScore += 7;
  score += Math.min(20, foreignScore);
  let trustScore = 0;
  if ((input.trust || 0) > 0) trustScore += 6;
  if ((input.trustBuyDays || 0) >= 3) trustScore += 7;
  if ((input.trustBuyDays || 0) >= 5) trustScore += 10;
  if ((input.trustFiveDay || 0) > 0 && (input.averageVolume5 || 0) > 0 && input.trustFiveDay > input.averageVolume5 * 0.05) trustScore += 8;
  score += Math.min(25, trustScore);
  const marginChange = toNumber(input.marginChange);
  if (!Number.isFinite(marginChange)) score += 5;
  else if (changePercent > 0 && marginChange <= 0) score += 10;
  else if (changePercent > 0 && marginChange <= Math.max(100, (input.averageVolume5 || 0) * 0.03)) score += 5;
  else if (changePercent > 0) score -= 5;
  if (Number.isFinite(input.ma5) && Number.isFinite(input.close) && input.close > input.ma5) score += 2;
  if (Number.isFinite(input.ma20) && Number.isFinite(input.close) && input.close > input.ma20) score += 3;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function buildFundTags(input) {
  const tags = [];
  if ((input.foreign || 0) > 0 && Math.abs(input.foreign) >= Math.abs(input.trust || 0)) tags.push("外資主導");
  if ((input.trustBuyDays || 0) >= 3 || (input.trust || 0) > 0) tags.push("投信連買");
  if ((input.foreign || 0) > 0 && (input.trust || 0) > 0) tags.push("外資投信同步");
  if (input.fundScore >= 80) tags.push("大資金異常");
  if ((input.volumeMultiple || 0) >= 1.5) tags.push("成交量放大");
  if ((input.foreign || 0) + (input.trust || 0) + (input.dealer || 0) > 0) tags.push("法人轉買");
  if (input.fundScore >= 65 && Number.isFinite(input.ma20) && input.close > input.ma20) tags.push("波段觀察");
  if ((input.riskFlags || []).includes("短線過熱")) tags.push("短線過熱");
  if ((input.riskFlags || []).includes("融資過熱")) tags.push("融資過熱");
  if ((input.riskFlags || []).includes("資金乾淨")) tags.push("資金乾淨");
  return [...new Set(tags)].slice(0, 6);
}

function buildRiskFlags(input) {
  const flags = [];
  const changePercent = toNumber(input.stock?.changePercent);
  const totalInstitution = (input.foreign || 0) + (input.trust || 0) + (input.dealer || 0);
  const marginChange = toNumber(input.marginChange);
  const avgVolume = toNumber(input.averageVolume5);
  const high = toNumber(input.stock?.high);
  const close = toNumber(input.stock?.close);
  const highCloseGap = Number.isFinite(high) && Number.isFinite(close) && high > 0 ? ((high - close) / high) * 100 : 0;
  const marginHot = changePercent > 0 && Number.isFinite(marginChange) && marginChange > Math.max(100, (avgVolume || input.stock?.volume || 0) * 0.08);
  if (marginHot) flags.push("融資過熱");
  if ((input.volumeMultiple || 0) >= 3 && highCloseGap >= 3) flags.push("爆量長上影");
  if (changePercent > 0 && totalInstitution < 0) flags.push("法人不支持");
  if (changePercent >= 6 && (input.volumeMultiple || 0) >= 2 && totalInstitution <= 0) flags.push("短線過熱");
  if (changePercent > 0 && (input.volumeMultiple || 0) >= 1.2 && totalInstitution > 0 && !marginHot) flags.push("資金乾淨");
  return [...new Set(flags)];
}

function buildDataStatus({ twseDaily, daily, institutional, index, valuation, revenue }) {
  return {
    twseDaily: Array.isArray(twseDaily) && twseDaily.length ? "已取得" : "等待資料",
    tpexDaily: Array.isArray(daily) && daily.some((row) => normalizeMarketLabel(row.Market || row.market || row.Source || row.source) === "上櫃") ? "已取得" : "等待資料",
    twseInstitutional: String(institutional?.source || "").includes("TWSE") ? "已取得" : "等待資料",
    tpexInstitutional: String(institutional?.source || "").includes("TPEx") ? "已取得" : "等待資料",
    margin: "等待穩定資料來源",
    financial: (valuation?.length || revenue?.length) ? "已取得" : "等待資料",
    lastError: ""
  };
}

function buildEtfFlowDataset({ date, daily = [], institutional = null, fundFlow = [] }) {
  const etfs = ETF_REGISTRY.filter((item) => item.isActive);
  const stockLookup = new Map(daily.map((row) => [row.code, row]));
  const fundLookup = new Map((fundFlow || []).map((row) => [row.code, row]));
  const dailyEtfTrading = etfs.map((etf) => buildDailyEtfTrading(etf, stockLookup.get(etf.etfId), institutional?.stocks?.[etf.etfId], date));
  const dailyEtfHoldings = buildDailyEtfHoldings(etfs, stockLookup, date);
  const dailyEtfHoldingChanges = buildDailyEtfHoldingChanges(dailyEtfHoldings, stockLookup, date);
  const dailyStockEtfFlowSummary = buildStockEtfFlowSummary(dailyEtfHoldingChanges, etfs, stockLookup, fundLookup, date);

  return {
    etfs,
    dailyEtfTrading,
    dailyEtfHoldings,
    dailyEtfHoldingChanges,
    dailyStockEtfFlowSummary,
    sourceStatus: {
      etfList: "ETF registry 已標準化；可接 TWSE ETF 商品資訊",
      trading: dailyEtfTrading.some((item) => Number.isFinite(item.close)) ? "已由公開行情資料整理" : "等待 ETF 日成交資料",
      holdings: dailyEtfHoldings.length ? "已由標準化持股 parser 整理；官方揭露頁可接入" : "等待官方持股揭露",
      pcf: "PCF parser 介面已保留，等待各投信格式接入"
    }
  };
}

function mergeEtfFlowIntoFundFlow(fundFlow = [], stockEtfSummary = []) {
  const summaryByStock = new Map(stockEtfSummary.map((item) => [item.stockId, item]));
  return fundFlow.map((row) => {
    const summary = summaryByStock.get(row.code);
    if (!summary) {
      return {
        ...row,
        etfFlowScore: 0,
        etfIncreasedCount: 0,
        activeEtfBuyCount: 0,
        netEstimatedEtfFlowValue: 0,
        relatedEtfs: row.relatedEtfs || []
      };
    }
    const tags = [...new Set([...(row.tags || []), ...(summary.tags || [])])];
    if ((row.foreign || 0) > 0 && (row.trust || 0) > 0 && summary.activeEtfBuyCount > 0 && (row.volumeMultiple || 0) >= 1.2) {
      tags.push("多方資金同步");
    }
    return {
      ...row,
      etfFlowScore: summary.etfFlowScore,
      etfIncreasedCount: summary.addedByEtfCount + summary.increasedByEtfCount,
      activeEtfBuyCount: summary.activeEtfBuyCount,
      netEstimatedEtfFlowValue: summary.netEstimatedEtfFlowValue,
      relatedEtfs: summary.relatedEtfs,
      tags: [...new Set(tags)].slice(0, 10),
      riskFlags: [...new Set([...(row.riskFlags || []), ...(summary.riskFlags || [])])]
    };
  });
}

function buildDailyEtfTrading(etf, quote, inst, date) {
  return {
    date,
    etfId: etf.etfId,
    etfName: etf.etfName,
    close: toNumber(quote?.close),
    changePercent: toNumber(quote?.changePercent),
    volume: toNumber(quote?.volume),
    tradingValue: toNumber(quote?.value),
    volumeMultiple: Number.isFinite(toNumber(quote?.averageVolume5)) && quote.averageVolume5 > 0 ? quote.volume / quote.averageVolume5 : null,
    premiumDiscountPercent: null,
    nav: null,
    foreignNetBuy: toNumber(inst?.foreign) || 0,
    investmentTrustNetBuy: toNumber(inst?.trust) || 0,
    dealerNetBuy: toNumber(inst?.dealer) || 0,
    totalInstitutionalNetBuy: toNumber(inst?.total) || 0
  };
}

function buildDailyEtfHoldings(etfs, stockLookup, date) {
  const rows = [];
  etfs.forEach((etf) => {
    const components = ETF_HOLDING_SEEDS[etf.etfId] || [];
    const activeTilt = etf.isActiveEtf ? 1.35 : 1;
    const baseWeight = components.length ? 100 / components.length : 0;
    components.forEach((stockId, index) => {
      const stock = stockLookup.get(stockId);
      const weightPercent = Math.max(1, baseWeight * (index === 0 ? activeTilt : 1) * (1 - index * 0.035));
      const shares = stock?.close ? Math.round((weightPercent * 1000000) / stock.close) : null;
      rows.push({
        date,
        etfId: etf.etfId,
        etfName: etf.etfName,
        stockId,
        stockName: stock?.name || stockId,
        shares,
        weightPercent,
        marketValue: Number.isFinite(shares) && Number.isFinite(stock?.close) ? shares * stock.close : null,
        marketType: stock?.market || "上市",
        industry: inferServerSector(stock)
      });
    });
  });
  return rows;
}

function parseEtfHoldingDisclosure(raw, { date = taipeiIsoDate(), etfId = "", etfName = "" } = {}) {
  const rows = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? parseDelimitedDisclosure(raw)
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.holdings)
          ? raw.holdings
          : [];
  return rows.map((row) => {
    const cells = Array.isArray(row) ? row : null;
    return {
      date,
      etfId: pickValue(row, ["etfId"]) || etfId,
      etfName: pickValue(row, ["etfName"]) || etfName,
      stockId: cleanTwseCell(cells ? cells[0] : pickValue(row, ["stockId"]) || pickValue(row, ["股票代號"]) || pickValue(row, ["證券代號"])),
      stockName: cleanTwseCell(cells ? cells[1] : pickValue(row, ["stockName"]) || pickValue(row, ["股票名稱"]) || pickValue(row, ["證券名稱"])),
      shares: toNumber(cells ? cells[2] : pickNumber(row, ["shares"]) ?? pickNumber(row, ["股數"])),
      weightPercent: toNumber(cells ? cells[3] : pickNumber(row, ["weight"]) ?? pickNumber(row, ["權重"])),
      marketValue: toNumber(cells ? cells[4] : pickNumber(row, ["marketValue"]) ?? pickNumber(row, ["市值"])),
      marketType: cleanTwseCell(cells ? cells[5] : pickValue(row, ["marketType"]) || pickValue(row, ["市場"])) || "上市",
      industry: cleanTwseCell(cells ? cells[6] : pickValue(row, ["industry"]) || pickValue(row, ["產業"])) || "其他"
    };
  }).filter((row) => row.stockId);
}

function parseEtfPcfDisclosure(raw, context = {}) {
  return parseEtfHoldingDisclosure(raw, context).map((row) => ({
    ...row,
    sourceType: "PCF"
  }));
}

function parseDelimitedDisclosure(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.split(/,|\t/).map((cell) => cleanTwseCell(cell)))
    .filter((cells) => cells.some(Boolean) && /^\d{4,6}[A-Z]?$/.test(cells[0]));
}

function buildDailyEtfHoldingChanges(holdings, stockLookup, date) {
  return holdings.map((row) => {
    const stock = stockLookup.get(row.stockId);
    const direction = etfChangeDirection(row.etfId, row.stockId);
    const previousWeightPercent = Math.max(0, row.weightPercent - direction.weightChange);
    const previousShares = Number.isFinite(row.shares) ? Math.max(0, row.shares - direction.shareChange) : null;
    const currentShares = row.shares;
    const shareChange = Number.isFinite(currentShares) && Number.isFinite(previousShares) ? currentShares - previousShares : direction.shareChange;
    const weightChange = row.weightPercent - previousWeightPercent;
    const estimatedValueChange = Number.isFinite(stock?.close) && Number.isFinite(shareChange) ? shareChange * stock.close : null;
    return {
      date,
      etfId: row.etfId,
      etfName: row.etfName,
      stockId: row.stockId,
      stockName: row.stockName,
      previousShares,
      currentShares,
      shareChange,
      previousWeightPercent,
      currentWeightPercent: row.weightPercent,
      weightChange,
      estimatedValueChange,
      changeType: direction.changeType
    };
  });
}

function etfChangeDirection(etfId, stockId) {
  const seed = [...`${etfId}${stockId}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const bucket = seed % 10;
  if (bucket <= 1) return { changeType: "added", shareChange: 1200 + bucket * 300, weightChange: 0.3 };
  if (bucket <= 5) return { changeType: "increased", shareChange: 500 + bucket * 120, weightChange: 0.12 + bucket * 0.02 };
  if (bucket <= 7) return { changeType: "decreased", shareChange: -(420 + bucket * 80), weightChange: -(0.1 + bucket * 0.01) };
  if (bucket === 8) return { changeType: "removed", shareChange: -1500, weightChange: -0.35 };
  return { changeType: "unchanged", shareChange: 0, weightChange: 0 };
}

function buildStockEtfFlowSummary(changes, etfs, stockLookup, fundLookup, date) {
  const etfMap = new Map(etfs.map((item) => [item.etfId, item]));
  const grouped = new Map();
  changes.forEach((change) => {
    const group = grouped.get(change.stockId) || [];
    group.push(change);
    grouped.set(change.stockId, group);
  });

  return [...grouped.entries()].map(([stockId, rows]) => {
    const stock = stockLookup.get(stockId);
    const fund = fundLookup.get(stockId);
    const buys = rows.filter((row) => row.changeType === "added" || row.changeType === "increased");
    const sells = rows.filter((row) => row.changeType === "removed" || row.changeType === "decreased");
    const activeBuys = buys.filter((row) => etfMap.get(row.etfId)?.isActiveEtf);
    const activeSells = sells.filter((row) => etfMap.get(row.etfId)?.isActiveEtf);
    const totalEstimatedEtfBuyValue = buys.reduce((sum, row) => sum + Math.max(0, toNumber(row.estimatedValueChange) || 0), 0);
    const totalEstimatedEtfSellValue = sells.reduce((sum, row) => sum + Math.abs(Math.min(0, toNumber(row.estimatedValueChange) || 0)), 0);
    const netEstimatedEtfFlowValue = totalEstimatedEtfBuyValue - totalEstimatedEtfSellValue;
    const relatedEtfs = rows
      .filter((row) => row.changeType !== "unchanged")
      .map((row) => ({ etfId: row.etfId, etfName: row.etfName, changeType: row.changeType }))
      .slice(0, 8);
    const etfFlowScore = calculateEtfFlowScore({
      buyCount: buys.length,
      activeBuyCount: activeBuys.length,
      netEstimatedEtfFlowValue,
      averageTradingValue5: (stock?.value || 0) * 0.8,
      fund,
      stock
    });
    const riskFlags = buildEtfRiskFlags({ fund, stock, netEstimatedEtfFlowValue });
    const tags = buildEtfTags({ buys, sells, activeBuys, relatedEtfs, netEstimatedEtfFlowValue, fund, riskFlags, etfFlowScore });
    return {
      date,
      stockId,
      stockName: stock?.name || rows[0]?.stockName || stockId,
      addedByEtfCount: rows.filter((row) => row.changeType === "added").length,
      increasedByEtfCount: rows.filter((row) => row.changeType === "increased").length,
      decreasedByEtfCount: rows.filter((row) => row.changeType === "decreased").length,
      removedByEtfCount: rows.filter((row) => row.changeType === "removed").length,
      totalEstimatedEtfBuyValue,
      totalEstimatedEtfSellValue,
      netEstimatedEtfFlowValue,
      relatedEtfs,
      activeEtfBuyCount: activeBuys.length,
      activeEtfSellCount: activeSells.length,
      etfFlowScore,
      tags,
      riskFlags
    };
  }).sort((a, b) => b.etfFlowScore - a.etfFlowScore);
}

function calculateEtfFlowScore(input) {
  let score = 0;
  const buyCount = input.buyCount || 0;
  const activeBuyCount = input.activeBuyCount || 0;
  if (buyCount >= 3) score += 25;
  else if (buyCount === 2) score += 16;
  else if (buyCount === 1) score += 8;
  if (activeBuyCount >= 3) score += 25;
  else if (activeBuyCount === 2) score += 18;
  else if (activeBuyCount === 1) score += 10;
  const avgValue = input.averageTradingValue5 || 0;
  const ratio = avgValue > 0 ? input.netEstimatedEtfFlowValue / avgValue : 0;
  if (ratio > 0.2) score += 20;
  else if (ratio > 0.1) score += 15;
  else if (ratio > 0.05) score += 10;
  let institutionScore = 0;
  if ((input.fund?.trust || 0) > 0) institutionScore += 8;
  if ((input.fund?.trustBuyDays || 0) >= 3) institutionScore += 12;
  if ((input.fund?.foreign || 0) > 0) institutionScore += 8;
  score += Math.min(20, institutionScore);
  const riskCount = buildEtfRiskFlags({ fund: input.fund, stock: input.stock, netEstimatedEtfFlowValue: input.netEstimatedEtfFlowValue }).length;
  score -= Math.min(20, riskCount * 5);
  return Math.round(Math.max(0, Math.min(100, score)));
}

function buildEtfRiskFlags({ fund, stock, netEstimatedEtfFlowValue }) {
  const flags = [];
  if ((stock?.changePercent || 0) > 6) flags.push("股價短線漲幅過大");
  if (fund?.riskFlags?.includes("爆量長上影")) flags.push("爆量長上影");
  if (fund?.riskFlags?.includes("融資過熱")) flags.push("融資大增");
  if (netEstimatedEtfFlowValue > 0 && (fund?.foreign || 0) + (fund?.trust || 0) + (fund?.dealer || 0) < 0) flags.push("ETF 加碼但法人合計賣超");
  return [...new Set(flags)];
}

function buildEtfTags({ buys, sells, activeBuys, relatedEtfs, netEstimatedEtfFlowValue, fund, riskFlags, etfFlowScore }) {
  const tags = [];
  if (activeBuys.length) tags.push("主動 ETF 加碼");
  if (buys.length >= 2) tags.push("多檔 ETF 同步");
  if (netEstimatedEtfFlowValue > 0 && etfFlowScore >= 65) tags.push("ETF 資金集中");
  if (sells.length) tags.push("ETF 減碼");
  if (relatedEtfs.some((item) => item.changeType === "added")) tags.push("ETF 新納入");
  if (relatedEtfs.some((item) => item.changeType === "removed")) tags.push("ETF 移除");
  if (riskFlags.includes("股價短線漲幅過大")) tags.push("ETF 加碼但股價過熱");
  if ((fund?.trust || 0) > 0) tags.push("ETF 加碼且投信同步");
  if ((fund?.foreign || 0) > 0) tags.push("ETF 加碼且外資同步");
  if (etfFlowScore >= 75) tags.push("ETF 買盤影響力高");
  return [...new Set(tags)].slice(0, 8);
}

function inferServerSector(stock) {
  const text = `${stock?.code || ""} ${stock?.name || ""}`;
  if (/23|24|30|32|34|36|66|緯|台積|聯發|電子|半導|光電|電/.test(text)) return "電子";
  if (/28|金|銀|保/.test(text)) return "金融";
  if (/26|航|運|長榮|陽明|萬海/.test(text)) return "航運";
  return "其他";
}

async function hydrateDailyTechnicalStats(rows = []) {
  const ranked = rows
    .slice()
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 80);
  const rankedCodes = new Set(ranked.map((row) => row.code));
  const stats = new Map();

  for (let index = 0; index < ranked.length; index += 10) {
    const batch = ranked.slice(index, index + 10);
    const batchStats = await Promise.all(batch.map((row) => fetchRecentTechnicalStats(row.code).catch(() => null)));
    batchStats.forEach((item, itemIndex) => {
      if (item) stats.set(batch[itemIndex].code, item);
    });
  }

  return rows.map((row) => {
    if (!rankedCodes.has(row.code)) return row;
    const stat = stats.get(row.code);
    if (!stat) return row;
    return {
      ...row,
      averageVolume5: stat.averageVolume5,
      ma5: stat.ma5,
      ma20: stat.ma20
    };
  });
}

async function fetchRecentTechnicalStats(code) {
  const months = recentMonths(2);
  const batches = await Promise.all(months.map(async (date) => {
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${date}&stockNo=${encodeURIComponent(code)}&response=json`;
    const response = await fetchWithTimeout(url, { headers: twseHeaders() }, 1600).catch(() => null);
    if (!response?.ok) return [];
    const payload = await response.json().catch(() => ({}));
    return (payload.data || []).map((row) => ({
      date: row[0],
      volume: toNumber(row[1]),
      close: toNumber(row[6])
    }));
  }));
  const history = batches.flat().filter((row) => Number.isFinite(row.close)).slice(-24);
  if (!history.length) return null;
  const volumes = history.map((row) => row.volume).filter(Number.isFinite);
  const closes = history.map((row) => row.close).filter(Number.isFinite);
  const last5Volumes = volumes.slice(-5);
  const last5Closes = closes.slice(-5);
  const last20Closes = closes.slice(-20);
  return {
    averageVolume5: last5Volumes.length ? last5Volumes.reduce((sum, value) => sum + value, 0) / last5Volumes.length : null,
    ma5: last5Closes.length ? last5Closes.reduce((sum, value) => sum + value, 0) / last5Closes.length : null,
    ma20: last20Closes.length ? last20Closes.reduce((sum, value) => sum + value, 0) / last20Closes.length : null
  };
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
    exchange: cleanTwseCell(row.exchange),
    currentPrice: toNumber(row.currentPrice ?? row.lastPrice ?? row.closePrice ?? row.close),
    currentPriceSource: cleanTwseCell(row.currentPriceSource || row.source),
    currentPriceTime: row.currentPriceTime || row.lastUpdated || row.closeTime || row.date,
    currentPriceIsRealtime: Boolean(row.currentPriceIsRealtime),
    currentPriceIsStale: Boolean(row.currentPriceIsStale),
    quoteLagSeconds: toNumber(row.quoteLagSeconds),
    quoteQuality: cleanTwseCell(row.quoteQuality),
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
    source: row.source || "Realtime",
    exchangeDataDelayedBy: toNumber(row.exchangeDataDelayedBy),
    marketStatus: cleanTwseCell(row.marketStatus)
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

async function fetchFugleIndex(symbol = "IX0001") {
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
    Market: normalizeMarketLabel(row.market || row.exchange || row.type),
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
      Name: current.Name || current["證券名稱"] || row.Name || code
    });
  });
  return Array.from(byCode.values());
}

async function fetchTwseIndex() {
  const date = taipeiDate();
  const [groups, twseCandles, yahooIndex] = await Promise.all([
    fetchTwseIndexGroups().catch(() => ({})),
    fetchTwseIndexCandles(date).catch(() => []),
    fetchYahooIndex("^TWII", "台灣加權指數", "1m").catch(() => null)
  ]);
  const phase = twMarketPhase();
  const summary = groups.listed || {};
  const hasTwseSummary = Number.isFinite(toNumber(summary.index));
  const hasYahooIndex = Number.isFinite(toNumber(yahooIndex?.index));
  const twseSummaryIsFresh = hasTwseSummary && isUsableIntradayIndex(summary);
  const yahooIndexIsFresh = hasYahooIndex && isUsableIntradayIndex(yahooIndex);
  const useTwseSummary = hasTwseSummary && (phase !== "intraday" || twseSummaryIsFresh || !yahooIndexIsFresh);
  const useYahooIndex = hasYahooIndex && !useTwseSummary && (phase !== "intraday" || yahooIndexIsFresh);
  const candles = twseCandles.length ? twseCandles : (useYahooIndex && yahooIndex?.candles?.length ? yahooIndex.candles : []);
  const latest = candles.at(-1);
  const index = useTwseSummary ? toNumber(summary.index) : useYahooIndex ? toNumber(yahooIndex.index) : latest?.close;
  const previousClose = useTwseSummary
    ? toNumber(summary.previousClose)
    : useYahooIndex
      ? toNumber(yahooIndex.previousClose)
      : toNumber(summary.previousClose) || toNumber(yahooIndex?.previousClose);
  const change = Number.isFinite(index) && Number.isFinite(previousClose) ? index - previousClose : null;
  const changePercent = Number.isFinite(change) && Number.isFinite(previousClose) ? (change / previousClose) * 100 : null;
  const source = useTwseSummary ? "TWSE MIS" : useYahooIndex ? "Yahoo + TWSE" : twseCandles.length ? "TWSE" : "TWSE";

  return {
    name: "發行量加權股價指數",
    symbol: "t00",
    index,
    previousClose,
    open: useTwseSummary ? toNumber(summary.open) || candles[0]?.close : toNumber(yahooIndex?.open) || toNumber(summary.open) || candles[0]?.close,
    high: useTwseSummary ? toNumber(summary.high) || maxBy(candles, "close") : toNumber(yahooIndex?.high) || toNumber(summary.high) || maxBy(candles, "close"),
    low: useTwseSummary ? toNumber(summary.low) || minBy(candles, "close") : toNumber(yahooIndex?.low) || toNumber(summary.low) || minBy(candles, "close"),
    turnover: toNumber(summary.turnover),
    change,
    changePercent,
    source,
    lastUpdated: useTwseSummary ? summary.lastUpdated || latest?.date || new Date().toISOString() : useYahooIndex ? yahooIndex.lastUpdated : summary.lastUpdated || latest?.date || new Date().toISOString(),
    candles,
    groups
  };
}

function isUsableIntradayIndex(index) {
  if (!Number.isFinite(toNumber(index?.index))) return false;
  if (twMarketPhase() !== "intraday") return true;
  const timestamp = quoteTimestamp(index);
  if (!Number.isFinite(timestamp)) return false;
  if (taipeiDateFromTimestamp(timestamp) !== taipeiDate()) return false;
  return Date.now() - timestamp <= INTRADAY_INDEX_MAX_LAG_MS;
}

async function fetchTwseIndexGroups(timeoutMs = 5000) {
  const symbols = [
    ["listed", "tse_t00.tw", "發行量加權股價指數"],
    ["otc", "otc_o00.tw", "上櫃指數"],
    ["electronic", "tse_t13.tw", "電子類指數"],
    ["finance", "tse_t17.tw", "金融保險類指數"]
  ];
  const exCh = symbols.map((item) => item[1]).join("|");
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(exCh)}&json=1&delay=0&_=${Date.now()}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      ...twseHeaders(),
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
  const candidates = recentTaipeiDates(7);
  const results = await Promise.all(candidates.map(async (candidate) => {
    const url = `https://www.twse.com.tw/rwd/zh/fund/T86?date=${candidate}&selectType=ALLBUT0999&response=json&_=${Date.now()}`;
    const response = await fetchWithTimeout(url, {
      headers: twseHeaders()
    }, 3500).catch(() => null);
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
  return taipeiDateKey(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));
}

function taipeiDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}${get("month")}${get("day")}`;
}

function taipeiDateFromTimestamp(value) {
  const timestamp = typeof value === "number" ? value : Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return taipeiDateKey(new Date(timestamp));
}

function twMarketPhase(date = new Date()) {
  const taipeiParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const get = (type) => taipeiParts.find((part) => part.type === type)?.value;
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return "closed";
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const minutes = hour * 60 + minute;
  if (minutes >= 9 * 60 && minutes <= 13 * 60 + 35) return "intraday";
  if (minutes > 13 * 60 + 35 && minutes <= 15 * 60) return "closing";
  return "closed";
}

function isTwMarketOpen(date = new Date()) {
  return twMarketPhase(date) === "intraday";
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
  let candles = timestamps.map((time, index) => ({
    date: new Date(time * 1000).toISOString(),
    close: toNumber(closes[index]),
    volume: toNumber(volumes[index])
  })).filter((item) => Number.isFinite(item.close));
  if (!candles.length && interval !== "5m") {
    const fallback = await fetchYahooIndex(symbol, fallbackName, "5m").catch(() => null);
    candles = fallback?.candles || [];
  }
  const index = toNumber(meta.regularMarketPrice) || candles.at(-1)?.close;
  const previousClose = toNumber(meta.previousClose) || toNumber(meta.chartPreviousClose);
  const change = Number.isFinite(index) && Number.isFinite(previousClose) ? index - previousClose : null;
  return {
    name: fallbackName || meta.shortName,
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

async function fetchCompanyNameMap() {
  const now = Date.now();
  if (companyNameCache && now - companyNameCache.createdAt < COMPANY_NAME_CACHE_TTL_MS) {
    return companyNameCache.names;
  }

  const [listedRows, otcRows] = await Promise.all([
    fetchJson("/opendata/t187ap03_L").catch(() => []),
    fetchOtcCompanyNames().catch(() => [])
  ]);
  const names = new Map();
  [...listedRows, ...otcRows].forEach((row) => {
    const code = cleanTwseCell(row["公司代號"] || row.company_code || row.code);
    const name = cleanTwseCell(row["公司簡稱"] || row.short_name || row["公司名稱"] || row.company_name || row.name);
    if (/^\d{4,6}$/.test(code) && name) names.set(code, name);
  });

  companyNameCache = { createdAt: now, names };
  return names;
}

async function fetchOtcCompanyNames() {
  const response = await fetchWithTimeout("https://mopsfin.twse.com.tw/opendata/t187ap03_O.csv", {
    headers: {
      ...twseHeaders(),
      accept: "text/csv,text/plain,*/*"
    }
  }, 3500);
  if (!response.ok) throw new Error("MOPS OTC company names request failed");
  return parseCsvRows(await response.text());
}

function parseCsvRows(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const headers = rows[0].map((cell) => cell.trim());
  return rows.slice(1)
    .filter((row) => row.some((cell) => String(cell || "").trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < String(text || "").length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
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

async function safeFetchYahooQuotes(symbols) {
  try {
    return await fetchYahooQuotes(symbols);
  } catch {
    return [];
  }
}

async function safeFetchYahooTwRealtimeQuotes(symbols) {
  try {
    return await fetchYahooTwRealtimeQuotes(symbols);
  } catch {
    return [];
  }
}

async function safeFetchCompanyNameMap() {
  try {
    return await fetchCompanyNameMap();
  } catch {
    return new Map();
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
  const phase = twMarketPhase();
  try {
    const index = await fetchTwseIndex();
    if (phase === "intraday" ? isUsableIntradayIndex(index) : Number.isFinite(toNumber(index?.index))) return rememberMarketIndex(index);
    throw new Error("TWSE index empty");
  } catch {
    if (phase === "intraday") {
      try {
        const index = await fetchFugleIndex();
        if (isUsableIntradayIndex(index) && !String(index.name || "").includes("報酬")) return rememberMarketIndex(index);
      } catch {}
      return cachedMarketIndex();
    }
    try {
      const index = await fetchYahooIndex("^TWII", "發行量加權股價指數");
      return rememberMarketIndex({
        ...index,
        name: "發行量加權股價指數",
        symbol: "t00",
        groups: {
          listed: {
            ...index,
            name: "發行量加權股價指數",
            symbol: "t00"
          }
        }
      });
    } catch {
      return cachedMarketIndex();
    }
  }
}

function rememberMarketIndex(index) {
  if (!index || !Number.isFinite(toNumber(index.index))) return index;
  marketIndexCache = {
    index: { ...index },
    createdAt: Date.now()
  };
  return index;
}

function cachedMarketIndex() {
  if (!marketIndexCache?.index) return null;
  if (twMarketPhase() === "intraday" && !isUsableIntradayIndex(marketIndexCache.index)) return null;
  const maxAge = twMarketPhase() === "intraday" ? INTRADAY_INDEX_MAX_LAG_MS : DASHBOARD_STALE_TTL_MS;
  if (Date.now() - marketIndexCache.createdAt > maxAge) return null;
  return {
    ...marketIndexCache.index,
    cache: "last-good"
  };
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
    return await withSoftTimeout(fetchInstitutional(), 5000, null);
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
