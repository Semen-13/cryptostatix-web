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
        // Включаем плагин веб-поиска для доступа к актуальным биржевым данным
        plugins: [{ id: "web-search" }], 
        messages: [
          { 
            role: "system", 
            content: "Ты — ведущий криптоаналитик и главный эксперт платформы CryptoStatix. Твоя цель — предоставлять глубокий, профессиональный аналитический разбор рынка. Если запрос требует знания текущих цен или событий, используй веб-поиск. Если запрос аналитический или теоретический — задействуй логику и структурированное мышление. Избегай банальных ответов, общайся как профессиональный трейдер (упоминай паттерны, ликвидность, рыночные настроения). В конце финансовых рекомендаций всегда добавляй краткий дисклеймер о рисках (DYOR)." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error(data.error?.message || "Ошибка ответа от OpenRouter");
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
