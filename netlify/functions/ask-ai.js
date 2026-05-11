exports.handler = async (event) => {
  // Разрешаем запросы с твоего сайта (CORS)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    // Достаем текст, поддерживая оба варианта имени поля
    const userPrompt = body.prompt || body.message;

    if (!userPrompt) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: "Пустой запрос" }) 
      };
    }

    // Используем встроенный fetch (не нужен require('node-fetch'))
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://cryptostatix.pp.ua",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [{ "role": "user", "content": userPrompt }]
      })
    });

    const data = await response.json();
    
    // Если OpenRouter вернул ошибку, пробрасываем её для отладки
    if (data.error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Ошибка API", details: data.error })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Внутренняя ошибка сервера", details: error.message })
    };
  }
};
