export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    // Проверяем оба варианта названия поля
    const userPrompt = body.prompt || body.message;

    if (!userPrompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ reply: "Ошибка: запрос пуст" })
      };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://cryptostatix.pp.ua", // Твой домен
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [{ "role": "user", "content": userPrompt }]
      })
    });

    const data = await response.json();
    
    // Добавляем проверку на наличие ответа в данных от OpenRouter
    const aiReply = data.choices?.[0]?.message?.content || "Ошибка: OpenRouter прислал пустой ответ";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: aiReply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: "Ошибка сервера: " + error.message })
    };
  }
};
