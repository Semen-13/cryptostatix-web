export default async (request, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (request.method === "OPTIONS") {
    return new Response("OK", { headers, status: 200 });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, context: pageContext = null, history = [] } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // 1. Получаем реальные данные с биржи (CoinGecko API)
    let marketContext = "";
    try {
      const liveDataRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true");
      if (liveDataRes.ok) {
        const prices = await liveDataRes.json();
        marketContext = `
          \n[АКТУАЛЬНЫЕ ДАННЫЕ С БИРЖИ НА СЕГОДНЯ]:
          - Bitcoin (BTC): $${prices.bitcoin.usd} (Имз. за 24ч: ${prices.bitcoin.usd_24h_change.toFixed(2)}%)
          - Ethereum (ETH): $${prices.ethereum.usd} (Изм. за 24ч: ${prices.ethereum.usd_24h_change.toFixed(2)}%)
          - Solana (SOL): $${prices.solana.usd} (Изм. за 24ч: ${prices.solana.usd_24h_change.toFixed(2)}%)
        `;
      }
    } catch (e) {
      console.log("Биржевой API временно недоступен, работаем без контекста котировок");
    }

    // 2. Запрос к OpenRouter без конфликтующих плагинов
    const navigationCatalog = `
      ДОСТУПНЫЕ РАЗДЕЛЫ:
      - home — главная
      - analytics — каталог аналитических виджетов
      - screeners — каталог скринеров
      - cheatsheet — шпаргалка
      - about — о проекте
      - daily-review — ежедневный обзор рынка
      - topic-day — тема дня
      - weekly-headliners — хедлайнеры недели
      - new-crypto-faces — новые лица крипторынка

      ВИДЖЕТЫ АНАЛИТИКИ (analytics index):
      1 Fear & Greed, 2 Global Exchange Radar, 3 Dominance, 4 Dominance History,
      5 Heatmap, 6 RSI PRO Signals, 7 Whale Terminal, 8 OI Terminal,
      9 Smart Suite Intelligence, 10 Economic Calendar, 11 Binance Futures PRO,
      12 Market Overview.

      ВИДЖЕТЫ СКРИНЕРОВ (screeners index):
      1 Grid Screener PRO, 2 Top-15 Screener, 3 Trend Screener, 4 RSI Screener.
    `;

    const systemPrompt = `Ты — высококлассный криптоаналитик и главный эксперт платформы CryptoStatix.
Твоя задача — анализировать рынок и пояснять виджеты, индикаторы, графики и риски простым, профессиональным языком.
Можешь перемещать пользователя по интерфейсу CryptoStatix.
Всегда отвечай только понятным пользователю текстом и командой навигации в требуемом JSON-формате.

Правила:
- Не придумывай котировки, уровни и торговые сигналы, которых нет в данных.
- Не обещай прибыль и не давай персональный финансовый совет.
- Разъясняй назначение виджета, как читать график, типичные ограничения и смысл изменения показателя.
- Для навигации используй ТОЛЬКО действие из белого списка ниже.
- Если навигация не нужна, action должен быть null.
- Для открытия виджета используй open_detail с section analytics или screeners и индексом 1–12 / 1–4.
- Для открытия раздела используй navigate с одним из доступных page.
- Для домой используй navigate page home.
- Для закрытия открытого виджета используй close_detail.
- Не вызывай функции запуска сканеров или торговые операции.

Формат ответа строго:
{"reply":"текст ответа","action":{"type":"navigate","page":"analytics"}}
или для пояснения без навигации:
{"reply":"текст ответа","action":null}

Допустимые типы action: navigate, open_detail, close_detail.
Контекст интерфейса и доступные разделы:
${navigationCatalog}
Текущий контекст пользователя:
${JSON.stringify(pageContext)}
${marketContext}`;

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item => item && typeof item.content === "string")
          .slice(-8)
          .map(item => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: item.content.slice(0, 4000),
          }))
      : [];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cryptostatix.pp.ua", 
        "X-Title": "CryptoStatix AI Agent",
      },
      body: JSON.stringify({
       model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error(data.error?.message || "Ошибка парсинга ответа OpenRouter");
    }

    const rawReply = data.choices[0].message.content;
    let parsedReply = null;

    try {
      const jsonStart = rawReply.indexOf("{");
      const jsonEnd = rawReply.lastIndexOf("}");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        parsedReply = JSON.parse(rawReply.slice(jsonStart, jsonEnd + 1));
      } else {
        parsedReply = JSON.parse(rawReply);
      }
    } catch (_) {
      parsedReply = { reply: rawReply, action: null };
    }

    let action = null;
    if (parsedReply?.action && typeof parsedReply.action === "object") {
      const candidate = parsedReply.action;
      if (candidate.type === "navigate") {
        const allowedPages = new Set([
          "home", "analytics", "screeners", "cheatsheet", "about",
          "daily-review", "topic-day", "weekly-headliners", "new-crypto-faces"
        ]);
        if (allowedPages.has(candidate.page)) {
          action = { type: "navigate", page: candidate.page };
        }
      } else if (
        candidate.type === "open_detail"
        && (candidate.section === "analytics" || candidate.section === "screeners")
        && Number.isInteger(candidate.index)
      ) {
        const maxIndex = candidate.section === "analytics" ? 12 : 4;
        if (candidate.index >= 1 && candidate.index <= maxIndex) {
          action = { type: "open_detail", section: candidate.section, index: candidate.index };
        }
      } else if (candidate.type === "close_detail") {
        action = { type: "close_detail" };
      }
    }

    return new Response(JSON.stringify({
      reply: typeof parsedReply?.reply === "string"
        ? parsedReply.reply
        : rawReply,
      action,
    }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
};
