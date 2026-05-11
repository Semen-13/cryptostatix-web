const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const userPrompt = body.prompt || body.message; 

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": \Bearer ${process.env.OPENROUTER_API_KEY}`,`
                "HTTP-Referer": "https://cryptostatix.pp.ua",
                "Content-Type": "application/json"
            },
          body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free", // Эта модель сейчас самая стабильная
        "messages": [{ "role": "user", "content": userPrompt }]
      })
        });

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content || "Ошибка: ИИ вернул пустой ответ";

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: aiReply })
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};
