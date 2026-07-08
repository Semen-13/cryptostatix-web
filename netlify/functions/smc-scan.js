// netlify/functions/smc-scan.js
import fetch from 'node-fetch';

// Helper: Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}

export const handler = async (event, context) => {
    // Set Netlify timeout to 25 seconds (function max is 26s)
    context.callbackWaitsForEmptyEventLoop = false;
    
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    try {
        let body = {};
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            body = {};
        }

        const timeframe = body.timeframe || "15m";
        const min_volume = parseFloat(body.min_volume) || 50000000.0;
        const min_change = parseFloat(body.min_change) || 2.0;
        const structure_window = parseInt(body.structure_window) || 10;

        console.log(`[SMC] Starting scan: TF=${timeframe}, Vol=${min_volume}, Change=${min_change}%`);

        const tickerRes = await fetchWithTimeout('https://fapi.binance.com/fapi/v1/ticker/24hr', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }, 8000);
        
        const tickers = await tickerRes.json();

        if (!Array.isArray(tickers)) {
            console.error("Binance API Error:", tickers);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Binance API returned invalid data (possibly geo-blocked in US): " + JSON.stringify(tickers) })
            };
        }

        const filtered_symbols = [];
        const seed_keywords = ["SEED", "INNOVATION", "UP", "DOWN", "BEAR", "BULL"];

        for (const ticker of tickers) {
            const symbol = ticker.symbol;
            if (!symbol.endsWith("USDT")) continue;

            const base_asset = symbol.replace("USDT", "");
            if (seed_keywords.some(kw => base_asset.includes(kw))) continue;

            const quote_volume = parseFloat(ticker.quoteVolume);
            const change_pct = Math.abs(parseFloat(ticker.priceChangePercent));

            if (quote_volume >= min_volume && change_pct >= min_change) {
                filtered_symbols.push(symbol);
            }
        }

        const long_trend_coins = [];
        const short_trend_coins = [];
        
        // Limit symbols to prevent timeout
        const MAX_SYMBOLS = 30;
        const filtered_symbols_limited = filtered_symbols.slice(0, MAX_SYMBOLS);
        console.log(`[SMC] Processing ${filtered_symbols_limited.length} symbols (max: ${MAX_SYMBOLS})`);
        
        const BATCH_SIZE = 10; // Smaller batches for reliability
        
        for (let i = 0; i < filtered_symbols_limited.length; i += BATCH_SIZE) {
            const batch = filtered_symbols_limited.slice(i, i + BATCH_SIZE);
            
            const promises = batch.map(async (symbol) => {
                try {
                    const klineRes = await fetchWithTimeout(
                        `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=100`,
                        { headers: { 'User-Agent': 'Mozilla/5.0' } },
                        5000
                    );
                    if (!klineRes.ok) return;
                    const klines = await klineRes.json();
                    
                    if (klines.length < 40) return;

                    // Format: [Open time, Open, High, Low, Close, Volume, ...]
                    const highs = klines.map(k => parseFloat(k[2]));
                    const lows = klines.map(k => parseFloat(k[3]));

                    const w = structure_window;
                    const macro_highs = [];
                    const macro_lows = [];

                    for (let j = w; j < highs.length - w; j++) {
                        const windowHighs = highs.slice(j - w, j + w + 1);
                        if (highs[j] === Math.max(...windowHighs)) {
                            macro_highs.push(highs[j]);
                        }
                        
                        const windowLows = lows.slice(j - w, j + w + 1);
                        if (lows[j] === Math.min(...windowLows)) {
                            macro_lows.push(lows[j]);
                        }
                    }

                    if (macro_highs.length < 2 || macro_lows.length < 2) return;

                    const last_macro_high = macro_highs[macro_highs.length - 1];
                    const prev_macro_high = macro_highs[macro_highs.length - 2];
                    
                    const last_macro_low = macro_lows[macro_lows.length - 1];
                    const prev_macro_low = macro_lows[macro_lows.length - 2];

                    const clean_name = symbol.replace("USDT", "");

                    if (last_macro_high > prev_macro_high && last_macro_low > prev_macro_low) {
                        long_trend_coins.push(clean_name);
                    } else if (last_macro_high < prev_macro_high && last_macro_low < prev_macro_low) {
                        short_trend_coins.push(clean_name);
                    }
                } catch (e) {
                    console.error(`Error processing ${symbol}:`, e);
                }
            });
            
            await Promise.all(promises);
            console.log(`[SMC] Batch ${Math.floor(i / BATCH_SIZE) + 1} complete. LONG: ${long_trend_coins.length}, SHORT: ${short_trend_coins.length}`);
        }

        console.log(`[SMC] Scan complete! LONG: ${long_trend_coins.length}, SHORT: ${short_trend_coins.length}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                timeframe: timeframe,
                longs: long_trend_coins,
                shorts: short_trend_coins
            })
        };

    } catch (e) {
        console.error("[SMC] Function error:", e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: e.message })
        };
    }
};
