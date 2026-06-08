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
    const { prompt } = await request.json();

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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cryptostatix.pp.ua", 
        "X-Title": "CryptoStatix AI Agent",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          { 
            role: "system", 
            content: `Ты — высококлассный криптоаналитик и главный эксперт платформы CryptoStatix. Твоя задача — проводить глубокий аналитический разбор трендов, уровней поддержки и рыночных паттернов на основе предоставленных цифр. Общайся на профессиональном языке трейдеров. Если пользователь спрашивает курс или анализ рынка, используй эти данные, но отвечай так, будто сам видишь графики прямо сейчас: ${marketContext}` 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error(data.error?.message || "Ошибка парсинга ответа OpenRouter");
    }

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
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
