import axios from "axios";
import fs from "fs";
import path from "path";

// Функция паузы для разделения запросов
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Основная функция генерации и сохранения
async function runGeneration() {
  console.log("Шаг 1: Генерация развернутого обзора на английском языке...");

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key is missing");
  }

  // Промпт для полноценной статьи на английском
  const englishPrompt = `
Write a detailed, professional daily cryptocurrency market review focused on the opening of the new trading day. 
Include:
- Comprehensive analysis of current Bitcoin trends and price action.
- Detailed breakdown of the Fear & Greed Index and market sentiment.
- RSI signals (daily and 4-hour timeframes).
- Key support and resistance levels, plus potential market drivers (like macroeconomic data).
Use HTML tags like <h2>, <p>, <strong>, <ul>, <li>. No <h1> tags. Make it rich, analytical, and detailed.
Return ONLY the HTML content as a raw string without markdown code blocks.
  `;

  let englishContent = "";
  try {
    const responseEn = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a professional crypto journalist. Output ONLY raw HTML content." },
          { role: { type: "text", text: englishPrompt } }
        ],
        temperature: 0.4,
        max_tokens: 3000
      },
      {
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:8888",
          "X-Title": "CryptoStatix PRO"
        }
      }
    );

    const messageEn = responseEn.data?.choices?.[0]?.message;
    englishContent = messageEn?.content || "";
    englishContent = englishContent.replace(/```html/g, "").replace(/```/g, "").trim();
    console.log("Английская версия успешно сгенерирована. Длина:", englishContent.length);

  } catch (apiError) {
    console.error("Ошибка при генерации английской версии:", apiError.response?.data || apiError.message);
    throw apiError;
  }

  // Небольшая пауза между запросами (можно настроить, например, 5000 мс = 5 сек или больше)
  console.log("Ожидание перед переводом...");
  await sleep(5000);

  console.log("Шаг 2: Перевод и адаптация на русский и украинский языки...");

  const translationPrompt = `
Translate and adapt the following English cryptocurrency market review into Russian ("ru") and Ukrainian ("ua").
Maintain all HTML tags (<h2>, <p>, <strong>, <ul>, <li>) exactly as they are. 
Return the result strictly as a valid JSON object with keys "ru" and "ua":
- "ru": Professional adaptation in Russian.
- "ua": Professional adaptation in Ukrainian.

English source text:
${englishContent}
  `;

  let russianContent = "";
  let ukrainianContent = "";

  try {
    const responseRuUa = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a professional translator. Output ONLY a raw valid JSON object containing keys 'ru', 'ua'. No markdown formatting blocks." },
          { role: { type: "text", text: translationPrompt } }
        ],
        temperature: 0.3,
        max_tokens: 4000
      },
      {
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:8888",
          "X-Title": "CryptoStatix PRO"
        }
      }
    );

    const messageRuUa = responseRuUa.data?.choices?.[0]?.message;
    let rawTranslation = messageRuUa?.content || "";
    rawTranslation = rawTranslation.replace(/```json/g, "").replace(/```/g, "").trim();

    // Безопасный парсинг JSON с переводом
    let parsedTranslation = {};
    try {
      parsedTranslation = JSON.parse(rawTranslation);
    } catch (parseErr) {
      const firstBrace = rawTranslation.indexOf('{');
      const lastBrace = rawTranslation.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        parsedTranslation = JSON.parse(rawTranslation.substring(firstBrace, lastBrace + 1));
      }
    }

    russianContent = parsedTranslation.ru || englishContent;
    ukrainianContent = parsedTranslation.ua || englishContent;
    console.log("Перевод успешно завершен!");

  } catch (translationError) {
    console.error("Ошибка при переводе, используем английский текст как фоллбэк:", translationError.message);
    russianContent = englishContent;
    ukrainianContent = englishContent;
  }

  // Финальная сборка данных
  const articlesData = {
    date: new Date().toISOString(),
    en: englishContent || "<p>Content temporarily unavailable.</p>",
    ru: russianContent,
    ua: ukrainianContent
  };

  const filePath = path.join(process.cwd(), 'data', 'latest_market_review.json');
  fs.writeFileSync(filePath, JSON.stringify(articlesData, null, 2), 'utf8');
  console.log("Полный многоязычный обзор успешно сохранен в data/latest_market_review.json!");
  return articlesData;
}

// Экспорт для Netlify Function
export default async (req, context) => {
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  const headerSecret = req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET || "12345";

  const isAuthorized = secretParam === "12345" || headerSecret === expectedSecret;

  try {
    const filePath = path.join(process.cwd(), 'data', 'latest_market_review.json');
    let articlesData = {};
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      articlesData = JSON.parse(fileContent);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isNewDay = articlesData && articlesData.date ? !articlesData.date.startsWith(todayStr) : true;

    if (isAuthorized && isNewDay) {
      articlesData = await runGeneration();
    }

    return new Response(JSON.stringify({
      success: true,
      data: articlesData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Ошибка в бэкенд-функции:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// Если скрипт запущен напрямую через Node.js из GitHub Actions
if (process.argv[1] && process.argv[1].endsWith('generate-seo.js')) {
  runGeneration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Ошибка при генерации из CLI:", err);
      process.exit(1);
    });
}
