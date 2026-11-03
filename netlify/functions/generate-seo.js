import axios from "axios";
import fs from "fs";
import path from "path";

// Основная функция генерации и сохранения
async function runGeneration() {
  console.log("Генерация обзора через openrouter/free...");

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key is missing");
  }

  const prompt = `
Write a professional daily cryptocurrency market review focused on the opening of the new trading day. Analyze current Bitcoin trends, Fear & Greed Index, and RSI signals. 
Return the result strictly as a valid JSON object with keys "en", "ru", and "ua":
- "en": article in English.
- "ru": direct translation/adaptation of the article in Russian.
- "ua": direct translation/adaptation of the article in Ukrainian.
Use HTML tags like <h2>, <p>, <strong>, <ul>, <li>. No <h1> tags. Keep it concise.
  `;

  let rawContent = "";
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { 
            role: "system", 
            content: "You are a crypto API endpoint. Output ONLY raw valid JSON containing keys 'en', 'ru', 'ua'. Do not write any thoughts, reasoning, explanation, or markdown formatting blocks like ```json." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3500
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

    const message = response.data?.choices?.[0]?.message;
    
    // Присваиваем значение во внешнюю переменную (убрали let)
    rawContent = message?.content || "";
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

    console.log("Чистый текст ответа:", rawContent.substring(0, 150));
  } catch (apiError) {
    console.error("Ошибка API OpenRouter:", apiError.response?.data || apiError.message);
    throw apiError;
  }

let resultJson = {};
  if (rawContent) {
    try {
      // Пытаемся распарсить как есть
      resultJson = JSON.parse(rawContent);
    } catch (parseError) {
      try {
        // Пытаемся вырезать всё, что находится между первой '{' и последней '}'
        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonSubstring = rawContent.substring(firstBrace, lastBrace + 1);
          resultJson = JSON.parse(jsonSubstring);
        } else {
          throw new Error("JSON braces not found");
        }
      } catch (innerError) {
        console.warn("Не удалось распарсить JSON, используем безопасный шаблон.");
        resultJson = {
          en: "<h2>Daily Market Review</h2><p>Market review is temporarily being updated. Please check back in a moment.</p>",
          ru: "<h2>Ежедневный обзор рынка</h2><p>Обзор рынка временно обновляется. Пожалуйста, зайдите чуть позже.</p>",
          ua: "<h2>Щоденний огляд ринку</h2><p>Огляд ринку тимчасово оновлюється. Будь ласка, зайдіть трохи згодом.</p>"
        };
      }
    }
  }
  const articlesData = {
    date: new Date().toISOString(),
    en: resultJson.en || "<h2>Daily Market Review</h2><p>Market review is temporarily being updated. Please check back in a moment.</p>",
    ru: resultJson.ru || resultJson.en || "<h2>Ежедневный обзор рынка</h2><p>Обзор рынка временно обновляется. Пожалуйста, зайдите чуть позже.</p>",
    ua: resultJson.ua || resultJson.en || "<h2>Щоденний огляд ринку</h2><p>Огляд ринку тимчасово оновлюється. Будь ласка, зайдіть трохи згодом.</p>"
  };

  const filePath = path.join(process.cwd(), 'data', 'latest_market_review.json');
  fs.writeFileSync(filePath, JSON.stringify(articlesData, null, 2), 'utf8');
  console.log("Статья успешно сохранена в data/latest_market_review.json!");
  return articlesData;
}

// Экспорт для Netlify Function (чтение из локального файла репозитория)
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
