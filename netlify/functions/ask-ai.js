// netlify/functions/ask-ai.js

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set on Netlify!');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API Key Missing' }) };
    }

    // Правильный URL для Gemini 1.5 Flash
   const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `
      Ты — ведущий ИИ-аналитик для терминала CryptoStatix (cryptostatix.pp.ua).
      Стиль: профессиональный, лаконичный, используй технический анализ (RSI, уровни).
      Отвечай кратко, 3-4 предложения.
    `;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `Системная инструкция: ${systemInstruction}\nВопрос пользователя: ${message}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Error from Gemini API' }) };
    }

    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извини, я не смог сгенерировать ответ.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: aiResponseText })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
