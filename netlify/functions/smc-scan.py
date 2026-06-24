import json
import ccxt
import pandas as pd
import numpy as np

def handler(event, context):
    # Настройка CORS-заголовков для безопасного общения с фронтендом
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    }

    # Отвечаем на предварительный запрос браузера (preflight)
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": "OK"}

    # Разрешаем только POST-запросы
    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "Method Not Allowed"})}

    try:
        # Читаем конфигурацию фильтров, отправленную пользователем с сайта
        body = json.loads(event.get("body", "{}"))
        
        timeframe = body.get("timeframe", "15m")
        min_volume = float(body.get("min_volume", 50000000.0))
        min_change = float(body.get("min_change", 2.0))
        structure_window = int(body.get("structure_window", 10))

        # Инициализируем подключение к фьючерсной секции Binance
        exchange = ccxt.binance({'options': {'defaultType': 'future'}})
        exchange.load_markets()
        tickers = exchange.fetch_tickers()

        filtered_symbols = []
        seed_keywords = ["SEED", "INNOVATION", "UP", "DOWN", "BEAR", "BULL"]

        # 1. Первичная фильтрация пар по объему и волатильности за 24 часа
        for symbol, ticker in tickers.items():
            if not symbol.endswith(":USDT"): continue
            base_asset = symbol.split('/')[0]
            if any(kw in base_asset for kw in seed_keywords): continue

            quote_volume = ticker.get('quoteVolume', 0)
            change_pct = abs(ticker.get('percentage', 0))

            if quote_volume and change_pct:
                if quote_volume >= min_volume and change_pct >= min_change:
                    filtered_symbols.append(symbol)

        long_trend_coins = []
        short_trend_coins = []

        # 2. Математический анализ структуры рынка (SMC) для каждой отфильтрованной монеты
        for sym in filtered_symbols:
            try:
                ohlcv = exchange.fetch_ohlcv(sym, timeframe, limit=100)
                if len(ohlcv) < 40: continue

                df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                w = structure_window

                # Определение локальных экстремумов через скользящее окно
                df['macro_high'] = df['high'].rolling(w * 2 + 1, center=True).max() == df['high']
                df['macro_low'] = df['low'].rolling(w * 2 + 1, center=True).min() == df['low']

                highs = df[df['macro_high']]['high'].tolist()
                lows = df[df['macro_low']]['low'].tolist()

                if len(highs) < 2 or len(lows) < 2: continue

                last_macro_high, prev_macro_high = highs[-1], highs[-2]
                last_macro_low, prev_macro_low = lows[-1], lows[-2]

                clean_name = sym.split(':')[0]

                # Проверка условий повышающейся/понижающейся макро-структуры рынка
                if last_macro_high > prev_macro_high and last_macro_low > prev_macro_low:
                    long_trend_coins.append(clean_name)
                elif last_macro_high < prev_macro_high and last_macro_low < prev_macro_low:
                    short_trend_coins.append(clean_name)
            except Exception:
                continue

        # Возвращаем результаты в формате JSON на фронтенд
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "success": True,
                "timeframe": timeframe,
                "longs": long_trend_coins,
                "shorts": short_trend_coins
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }
