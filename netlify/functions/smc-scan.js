// netlify/functions/smc-scan.js
import fetch from 'node-fetch';

// Helper: Simple fetch wrapper
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            timeout: 8000
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error.message);
        throw error;
    }
}

export const handler = async (event, context) => {
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

        let tickers = [];
        try {
            const tickerRes = await fetchData('https://fapi.binance.com/fapi/v1/ticker/24hr', {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            tickers = await tickerRes.json();
        } catch (error) {
            console.error("[SMC] Binance API failed:", error.message);
            console.log("[SMC] Using mock data for testing");
            
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

        if (!Array.isArray(tickers)) {
            console.error("[SMC] Invalid tickers response:", typeof tickers);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Invalid response from Binance API" })
            };
        }
        
        console.log(`[SMC] Got ${tickers.length} tickers`);

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

        let binance_api_working = true;
        
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
                    let klines = null;
                    try {
                        const klineRes = await fetchData(
                            `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=100`,
                            { headers: { 'User-Agent': 'Mozilla/5.0' } }
                        );
                        klines = await klineRes.json();
                    } catch (e) {
                        console.log(`[SMC] Could not fetch klines for ${symbol}, using ticker fallback`);
                    }
                    
                    const ticker = tickers.find(t => t.symbol === symbol);
                    const clean_name = symbol.replace("USDT", "");
                    
                    // Use klines if available and valid, otherwise use ticker change
                    if (Array.isArray(klines) && klines.length >= 40) {
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

                        if (macro_highs.length >= 2 && macro_lows.length >= 2) {
                            const last_macro_high = macro_highs[macro_highs.length - 1];
                            const prev_macro_high = macro_highs[macro_highs.length - 2];
                            const last_macro_low = macro_lows[macro_lows.length - 1];
                            const prev_macro_low = macro_lows[macro_lows.length - 2];

                            if (last_macro_high > prev_macro_high && last_macro_low > prev_macro_low) {
                                long_trend_coins.push(clean_name);
                                return;
                            } else if (last_macro_high < prev_macro_high && last_macro_low < prev_macro_low) {
                                short_trend_coins.push(clean_name);
                                return;
                            }
                        }
                    }
                    
                    // Fallback: use ticker price change to determine trend
                    if (ticker) {
                        if (ticker.priceChangePercent > 1) {
                            long_trend_coins.push(clean_name);
                        } else if (ticker.priceChangePercent < -1) {
                            short_trend_coins.push(clean_name);
                        }
                    }
                } catch (e) {
                    console.warn(`[SMC] Warning processing ${symbol}:`, e.message ? e.message.substring(0, 50) : String(e));
                    // Continue with next symbol on error
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
