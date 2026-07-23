// dev-server.js - Local development server with Netlify Functions support
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handler as rsiHandler } from './netlify/functions/rsi-scan.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5174;

app.use(express.json());
app.use(express.static('dist'));

// CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Mock SMC Scan function (simulated version of Netlify Function)
app.post('/.netlify/functions/smc-scan', async (req, res) => {
    try {
        const { timeframe = "15m", min_volume = 50000000, min_change = 2.0, structure_window = 10 } = req.body;
        
        console.log(`🔍 SMC Scan started: TF=${timeframe}, Vol=${min_volume}, Change=${min_change}%`);
        
        // Fetch Binance data
        const tickerRes = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const tickers = await tickerRes.json();
        
        if (!Array.isArray(tickers)) {
            return res.status(500).json({ 
                error: `Binance API error: ${JSON.stringify(tickers).substring(0, 100)}` 
            });
        }
        
        const filtered_symbols = [];
        const seed_keywords = ["SEED", "INNOVATION", "UP", "DOWN", "BEAR", "BULL"];
        
        // Filter symbols
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
        
        console.log(`📊 Filtered to ${filtered_symbols.length} symbols`);
        
        const long_trend_coins = [];
        const short_trend_coins = [];
        const BATCH_SIZE = 15;
        
        // Analyze klines in batches
        for (let i = 0; i < filtered_symbols.length; i += BATCH_SIZE) {
            const batch = filtered_symbols.slice(i, i + BATCH_SIZE);
            
            const promises = batch.map(async (symbol) => {
                try {
                    const klineRes = await fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=100`);
                    if (!klineRes.ok) return;
                    const klines = await klineRes.json();
                    
                    if (klines.length < 40) return;
                    
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
                    console.error(`⚠️ Error processing ${symbol}:`, e.message.substring(0, 50));
                }
            });
            
            await Promise.all(promises);
            console.log(`✓ Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
        }
        
        console.log(`✅ Found ${long_trend_coins.length} LONG, ${short_trend_coins.length} SHORT coins`);
        
        res.json({
            success: true,
            timeframe,
            longs: long_trend_coins,
            shorts: short_trend_coins
        });
        
    } catch (error) {
        console.error("❌ SMC Scan Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// RSI Scan route using the Netlify function handler we added
app.post('/.netlify/functions/rsi-scan', async (req, res) => {
    try {
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify(req.body)
        };
        const result = await rsiHandler(event, {});
        const headers = result.headers || { 'Content-Type': 'application/json' };
        res.set(headers);
        res.status(result.statusCode || 200).send(result.body);
    } catch (e) {
        console.error('RSI route error', e);
        res.status(500).json({ error: String(e) });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Dev Server started on http://localhost:${PORT}`);
    console.log(`📱 Vite dev server should be running on http://localhost:5173`);
    console.log(`⚠️  Make sure to run: npm run dev (in another terminal)\n`);
});
