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
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API Key Missing' }) };
    }

    // Используем максимально стабильный URL и версию модели
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{ text: `Ты — ИИ-аналитик CryptoStatix. Отвечай кратко (2-3 предложения) на русском языке. Вопрос: ${message}` }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error Detail:', JSON.stringify(data));
      return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Gemini API Error' }) };
    }

    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Не удалось получить ответ.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: aiResponseText })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
