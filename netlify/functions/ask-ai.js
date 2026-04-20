// netlify/functions/ask-ai.js

exports.handler = async (event, context) => {
  // 1. Простая защита от кросс-доменных запросов (CORS)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 2. Обработка предварительного запроса (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 3. Разрешаем только POST-запросы с вопросом
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // 4. Получаем данные от пользователя
    const { message } = JSON.parse(event.body);

    if (!message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
    }

    // 5. !!! ВАЖНО !!! Получаем API-ключ из настроек Netlify
    // Ты должен добавить переменную GEMINI_API_KEY в панель управления Netlify.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set on Netlify!');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error (API Key Missing)' }) };
    }

    // 6. СИСТЕМНАЯ ИНСТРУКЦИЯ (Системный Промпт)
    // Это "мозг" твоего агента. Напиши сюда всё, что он должен уметь.
    const systemInstruction = `
      Ты — ведущий ИИ-аналитик для терминала CryptoStatix (cryptostatix.pp.ua).
      Твой стиль: профессиональный, лаконичный, используй технический анализ.
      Ты должен помогать пользователям интерпретировать сложные рыночные данные (RSI, графики, киты).
      Если тебя спрашивают про биткоин, дай краткую сводку по RSI и ключевым уровням.
      Используй смайлики (например, 📈, 📉, 🐋), чтобы текст был более живым, но не злоупотребляй.
      Отвечай кратко, не более 3-4 предложений, если пользователь не просит подробностей.
      Если ты не знаешь ответа на основе данных технического анализа, честно скажи об этом.
    `;

    // 7. URL для запроса к Google Gemini API (последняя версия 1.5 Flash - она быстрее и дешевле)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // 8. Формируем тело запроса к Gemini
    const payload = {
      contents: [
        {
          role: "user", // Сначала передаем системную инструкцию как сообщение от пользователя (так лучше работает)
          parts: [{ text: `Системная инструкция для тебя: ${systemInstruction}` }]
        },
        {
          role: "user",
          parts: [{ text: `Вопрос пользователя: ${message}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7, // Настройка "креативности" (0.7 - хорошо для баланса)
        maxOutputTokens: 250, // Ограничение длины ответа (бесплатный тариф)
      }
    };

    // 9. Отправляем запрос в Google Gemini
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

    // 10. Извлекаем чистый текст ответа
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извини, я не смог сгенерировать ответ.';

    // 11. Возвращаем ответ обратно на сайт
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
