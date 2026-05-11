export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const body = JSON.parse(event.body);
    const userPrompt = body.prompt || body.message;

    if (!userPrompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ reply: "Запрос пуст" }) };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://cryptostatix.pp.ua", 
        "X-Title": "CryptoStatix AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemma-7b-it:free", // Пробуем другую бесплатную модель
        "messages": [{ "role": "user", "content": userPrompt }],
        "temperature": 0.7
      })
    });

    const data = await response.json();
    
    // Выводим полный ответ в логи Netlify для диагностики
    console.log("OpenRouter Response:", JSON.stringify(data));

    if (data.error) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: `Ошибка OpenRouter: ${data.error.message || "Неизвестная ошибка"}` })
      };
    }

    const aiReply = data.choices?.[0]?.message?.content || "OpenRouter не смог сгенерировать текст. Попробуйте другой запрос.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: aiReply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: "Критическая ошибка сервера: " + error.message })
    };
  }
};
