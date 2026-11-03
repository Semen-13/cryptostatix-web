import axios from "axios";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runGeneration() {
  console.log("Шаг 1: Генерация развернутого обзора на английском языке...");

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key is missing");
  }

  // Промпт для глубокой и детальной английской статьи
  const englishPrompt = `
Write a detailed, analytical daily cryptocurrency market review for the opening of the new trading day. 
Include:
- Comprehensive analysis of current Bitcoin trends and price action.
- Detailed breakdown of the Fear & Greed Index and market sentiment.
- RSI signals and key support/resistance levels.
Use HTML tags like <h2>, <p>, <strong>, <ul>, <li>. No <h1> tags. Make it rich, analytical, and professional.
Output ONLY raw HTML content without markdown formatting blocks like \`\`\`html.
  `;

  let englishContent = "";
  try {
    const responseEn = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a professional crypto journalist. Output ONLY raw HTML." },
          { role: "user", content: englishPrompt }
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

  // Пауза 5 секунд между запросами
  console.log("Ожидание перед переводом на русский...");
  await sleep(5000);

  // Шаг 2: Перевод на русский
  let russianContent = englishContent;
  try {
    const responseRu = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a professional translator. Translate the given English crypto review into professional Russian. Keep all HTML tags (<h2>, <p>, <strong>, <ul>, <li>) exactly as they are. Output ONLY raw HTML." },
          { role: "user", content: englishContent }
        ],
        temperature: 0.3,
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
    russianContent = responseRu.data?.choices?.[0]?.message?.content || englishContent;
    russianContent = russianContent.replace(/```html/g, "").replace(/```/g, "").trim();
    console.log("Русская версия успешно переведена!");
  } catch (err) {
    console.error("Ошибка перевода на русский:", err.message);
  }

  // Пауза 5 секунд перед следующим переводом
  console.log("Ожидание перед переводом на украинский...");
  await sleep(5000);

  // Шаг 3: Перевод на украинский (основываясь на качественном русском тексте для идеальной грамматики)
  let ukrainianContent = englishContent;
  try {
    const responseUa = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a professional translator. Translate the given review into professional Ukrainian. Keep all HTML tags (<h2>, <p>, <strong>, <ul>, <li>) exactly as they are. Output ONLY raw HTML." },
          { role: "user", content: russianContent }
        ],
        temperature: 0.3,
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
    ukrainianContent = responseUa.data?.choices?.[0]?.message?.content || englishContent;
    ukrainianContent = ukrainianContent.replace(/```html/g, "").replace(/```/g, "").trim();
    console.log("Украинская версия успешно переведена!");
  } catch (err) {
    console.error("Ошибка перевода на украинский:", err.message);
  }

  // Финальная сборка в JSON
  const articlesData = {
    date: new Date().toISOString(),
    en: englishContent,
    ru: russianContent,
    ua: ukrainianContent
  };

  const filePath = path.join(process.cwd(), 'data', 'latest_market_review.json');
  fs.writeFileSync(filePath, JSON.stringify(articlesData, null, 2), 'utf8');
  console.log("Многоязычный детальный обзор успешно сохранен в data/latest_market_review.json!");
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
