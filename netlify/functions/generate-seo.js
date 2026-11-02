import { getStore } from "@netlify/blobs";
import axios from "axios";

export default async (req, context) => {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  
  const store = getStore("seo-articles");
  const cacheKey = "latest_market_review";

  try {
    let articlesData = await store.get(cacheKey, { type: "json" });

    const todayStr = new Date().toISOString().split('T')[0];
    const isNewDay = articlesData && articlesData.date ? !articlesData.date.startsWith(todayStr) : true;

    if (secret === "12345" || !articlesData || isNewDay) {
      console.log("Генерация обзора через openrouter/free...");

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      
      if (!openRouterApiKey) {
        return new Response(JSON.stringify({ success: false, error: "OpenRouter API key is missing" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
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
              { role: "system", content: "You are a professional crypto journalist and translator. Return ONLY valid JSON with keys en, ru, ua." },
              { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 1500
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

        rawContent = response.data?.choices?.[0]?.message?.content || "";
      } catch (apiError) {
        console.warn("Ошибка при запросе к OpenRouter API:", apiError.message);
      }

      let resultJson = {};
      
      if (rawContent) {
        // Безопасная очистка, если контент существует
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

      // Сохраняем результат с надежными фоллбеками на случай пустого ответа модели
      articlesData = {
        date: new Date().toISOString(),
        en: resultJson.en || "<h2>Daily Market Review</h2><p>Market review is temporarily being updated. Please check back in a moment.</p>",
        ru: resultJson.ru || resultJson.en || "<h2>Ежедневный обзор рынка</h2><p>Обзор рынка временно обновляется. Пожалуйста, зайдите чуть позже.</p>",
        ua: resultJson.ua || resultJson.en || "<h2>Щоденний огляд ринку</h2><p>Огляд ринку тимчасово оновлюється. Будь ласка, зайдіть трохи згодом.</p>"
      };

      await store.setJSON(cacheKey, articlesData);
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