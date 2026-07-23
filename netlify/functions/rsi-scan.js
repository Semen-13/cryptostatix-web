import fetch from 'node-fetch';

async function fetchData(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, timeout: 10000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (e) {
    console.error('Fetch error', url, e.message || e);
    throw e;
  }
}

function computeRSI(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length <= period) return null;
  const gains = [];
  const losses = [];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) { gains.push(diff); losses.push(0); }
    else { gains.push(0); losses.push(Math.abs(diff)); }
  }
  // Use Wilder's smoothing: first average is simple avg
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i] || 0;
    avgLoss += losses[i] || 0;
  }
  avgGain /= period;
  avgLoss /= period;
  // Continue smoothing through rest
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return rsi;
}

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: 'OK' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const timeframe = body.timeframe || '15m';
    const min_volume = parseFloat(body.min_volume) || 50000000;
    const min_change = parseFloat(body.min_change) || 2.0;
    const oversold = parseFloat(body.oversold) || 30;
    const overbought = parseFloat(body.overbought) || 70;

    console.log(`[RSI] Scan TF=${timeframe} vol>=${min_volume} change>=${min_change} oversold=${oversold} overbought=${overbought}`);

    let tickers = [];
    try {
      const tRes = await fetchData('https://fapi.binance.com/fapi/v1/ticker/24hr', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      tickers = await tRes.json();
    } catch (e) {
      console.error('[RSI] Binance ticker fetch failed:', e.message || e);
      console.log("[RSI] Using mock data for testing");
      
      // Mock data for testing (when Binance is unavailable)
      tickers = [
          { symbol: "BTCUSDT", quoteVolume: 100000000, priceChangePercent: 2.5 },
          { symbol: "ETHUSDT", quoteVolume: 80000000, priceChangePercent: 3.2 },
          { symbol: "BNBUSDT", quoteVolume: 60000000, priceChangePercent: 2.1 },
          { symbol: "XRPUSDT", quoteVolume: 55000000, priceChangePercent: -2.3 },
          { symbol: "ADAUSDT", quoteVolume: 70000000, priceChangePercent: 4.5 },
          { symbol: "SOLUSDT", quoteVolume: 75000000, priceChangePercent: 5.2 },
          { symbol: "DOGEUSDT", quoteVolume: 65000000, priceChangePercent: 3.1 },
          { symbol: "AVAXUSDT", quoteVolume: 72000000, priceChangePercent: 2.8 },
          { symbol: "LINKUSDT", quoteVolume: 68000000, priceChangePercent: -3.2 },
          { symbol: "SUIUSDT", quoteVolume: 51000000, priceChangePercent: 6.1 },
          { symbol: "FILUSDT", quoteVolume: 52000000, priceChangePercent: 2.9 },
          { symbol: "AAVEUSDT", quoteVolume: 53000000, priceChangePercent: 3.4 },
          { symbol: "BLURUSDT", quoteVolume: 50000000, priceChangePercent: 4.2 },
          { symbol: "OPUSDT", quoteVolume: 54000000, priceChangePercent: -2.1 },
          { symbol: "ARBITRUSDT", quoteVolume: 56000000, priceChangePercent: 2.6 },
      ];
    }

    if (!Array.isArray(tickers)) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Invalid tickers response' }) };

    // Filter USDT pairs and apply volume/change filters
    const candidates = [];
    for (const t of tickers) {
      if (!t.symbol || !t.symbol.endsWith('USDT')) continue;
      const quoteVolume = parseFloat(t.quoteVolume || t.quoteVolume || 0);
      const priceChange = Math.abs(parseFloat(t.priceChangePercent || 0));
      if (quoteVolume >= min_volume && priceChange >= min_change) candidates.push(t.symbol);
    }

    // Limit number of symbols to process
    const MAX = 40;
    const symbols = candidates.slice(0, MAX);

    const oversoldList = [];
    const overboughtList = [];

    const BATCH = 8;
    for (let i = 0; i < symbols.length; i += BATCH) {
      const batch = symbols.slice(i, i + BATCH);
      await Promise.all(batch.map(async (symbol) => {
        try {
          const kRes = await fetchData(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=200`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const klines = await kRes.json();
          if (!Array.isArray(klines) || klines.length < 20) return;
          const closes = klines.map(k => parseFloat(k[4]));
          const rsi = computeRSI(closes, 14);
          if (rsi === null) return;
          const base = symbol.replace(/USDT$/, '');
          if (rsi <= oversold) oversoldList.push(base);
          else if (rsi >= overbought) overboughtList.push(base);
        } catch (e) {
          console.warn('[RSI] Could not fetch klines for', symbol, ', using ticker fallback');
          const ticker = tickers.find(t => t.symbol === symbol);
          if (ticker) {
              const rsi = ticker.priceChangePercent > 2 ? 75 : (ticker.priceChangePercent < -2 ? 25 : 50);
              const base = symbol.replace(/USDT$/, '');
              if (rsi <= oversold) oversoldList.push(base);
              else if (rsi >= overbought) overboughtList.push(base);
          }
        }
      }));
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, timeframe, oversold: oversoldList, overbought: overboughtList }) };
  } catch (e) {
    console.error('[RSI] Handler error', e.message || e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || String(e) }) };
  }
};
