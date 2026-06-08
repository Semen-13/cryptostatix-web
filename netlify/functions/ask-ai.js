export default async (request, context) => {
  // Разрешаем CORS-запросы, чтобы ваш сайт мог общаться с функцией
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Обработка предзапроса CORS (OPTIONS)
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
    // Получаем текст вопроса от пользователя из фронтенда
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Запрос к OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // По правилам OpenRouter рекомендуется указывать эти заголовки для рейтинга приложений
        "HTTP-Referer": "https://cryptostatix.pp.ua", 
        "X-Title": "CryptoStatix AI",
      },
      body: JSON.stringify({
        model: "openrouter/auto-ish", // Или конкретная бесплатная модель, например: "google/gemini-2.5-flash:free"
        messages: [
          { role: "system", content: "Ты — полезный ИИ-ассистент на сайте Cryptostatix.pp.ua, эксперт по криптовалютам." },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

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
