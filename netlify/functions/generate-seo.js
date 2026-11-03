import { getStore } from "@netlify/blobs";
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
          { role: "system", content: "You are a professional crypto journalist and translator. Return ONLY valid JSON with keys en, ru, ua. Do not include extra text or markdown wrap." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 4000,
        reasoning: { max_tokens: 1000 } // Отключаем трату токенов на рассуждения
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
    // Если content пустой, берем reasoning или reasoning_details
    rawContent = message?.content || message?.reasoning || "";
    
    console.log("Полученный текст статьи:", rawContent ? rawContent.substring(0, 100) + "..." : "ПУСТО");
 } catch (apiError) {
    console.error("Ошибка API OpenRouter:", apiError.response?.data || apiError.message);
    throw apiError;
  }

  let resultJson = {};
  if (rawContent) {
    const cleanedContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      resultJson = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.warn("Не удалось распарсить JSON, используем текст как есть.");
      resultJson = {
        en: cleanedContent,
        ru: cleanedContent,
        ua: cleanedContent
      };
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

// Экспорт для Netlify Function (когда сайт запрашивает через браузер)
export default async (req, context) => {
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  const headerSecret = req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET || "12345";

  const isAuthorized = secretParam === "12345" || headerSecret === expectedSecret;

  const store = getStore("seo-articles");
  const cacheKey = "latest_market_review";

  try {
    let articlesData = await store.get(cacheKey, { type: "json" });
    const todayStr = new Date().toISOString().split('T')[0];
    const isNewDay = articlesData && articlesData.date ? !articlesData.date.startsWith(todayStr) : true;

    if (isAuthorized || !articlesData || isNewDay) {
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
