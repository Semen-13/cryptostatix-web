import axios from "axios";
import fs from "fs";
import path from "path";

async function runGeneration() {
  console.log("Генерация подробного обзора на трех языках через openrouter/free...");

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key is missing");
  }

  const prompt = `
You are a professional crypto journalist and translator. Write a detailed, analytical daily cryptocurrency market review for the opening of the new trading day. 
Include: Bitcoin trends, Fear & Greed Index, RSI signals, and key support/resistance levels.

Return the result STRICTLY as a valid JSON object with keys "en", "ru", and "ua":
- "en": Detailed article in English.
- "ru": Professional full translation/adaptation in Russian.
- "ua": Professional full translation/adaptation in Ukrainian.

Formatting rules:
- Use HTML tags like <h2>, <p>, <strong>, <ul>, <li>. 
- NO <h1> tags. 
- Output ONLY raw valid JSON. Do not include markdown code blocks like \`\`\`json or any extra text.
  `;

  let rawContent = "";
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a strict API that outputs only valid JSON with keys en, ru, ua." },
          { role: "user", content: prompt }
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

    const message = response.data?.choices?.[0]?.message;
    rawContent = message?.content || "";
    console.log("Ответ получен. Длина:", rawContent.length);

  } catch (apiError) {
    console.error("Ошибка API OpenRouter:", apiError.response?.data || apiError.message);
    throw apiError;
  }

  // Безопасное извлечение и парсинг JSON
  let resultJson = {};
  if (rawContent) {
    try {
      // Пытаемся очистить от возможных markdown-оберток
      let cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      
      // Если модель добавила лишний текст вокруг JSON, вырезаем по фигурным скобкам
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      resultJson = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn("Не удалось распарсить JSON, используем безопасный шаблон.");
    }
  }

  const articlesData = {
    date: new Date().toISOString(),
    en: resultJson.en || "<h2>Daily Market Review</h2><p>Market review is temporarily being updated.</p>",
    ru: resultJson.ru || "<h2>Ежедневный обзор рынка</h2><p>Обзор рынка временно обновляется.</p>",
    ua: resultJson.ua || "<h2>Щоденний огляд ринку</h2><p>Огляд ринку тимчасово оновлюється.</p>"
  };

  const filePath = path.join(process.cwd(), 'data', 'latest_market_review.json');
  fs.writeFileSync(filePath, JSON.stringify(articlesData, null, 2), 'utf8');
  console.log("Чистый структурированный обзор успешно сохранен в data/latest_market_review.json!");
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
