// netlify/functions/ask-ai.js

exports.handler = async (event, context) => {
  // 1. Настройка CORS-заголовков для работы с фронтендом
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Обработка Preflight-запроса браузера
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Разрешаем только POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    // Проверка наличия ключа в переменных окружения Netlify
    const apiKey = process.env.GEMINI_API_KEY; //
    
    if (!apiKey) {
      console.error('Критическая ошибка: GEMINI_API_KEY не найден в переменных окружения.');
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: 'API Key Configuration Missing' }) 
      };
    }

    const { message } = JSON.parse(event.body);
    if (!message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
    }

    // Используем v1 и модель gemini-pro для максимальной стабильности
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;

    const payload = {
      contents: [{
        parts: [{ text: message }]
      }]
    };

    // В Netlify (Node.js 18+) fetch встроен глобально. Если версия старая, замени на node-fetch.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error Detail:', JSON.stringify(data));
      return { 
        statusCode: response.status, 
        headers, 
        body: JSON.stringify({ error: 'Gemini API Error', details: data.error?.message }) 
      };
    }

    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Не удалось получить текст ответа.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: aiResponseText })
    };

  } catch (error) {
    console.error('Runtime Error:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }) 
    };
  }
};
