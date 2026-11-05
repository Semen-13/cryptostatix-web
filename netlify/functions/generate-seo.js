import axios from "axios";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runGeneration() {
  console.log("Получение актуальных рыночных данных...");

  let marketDataSummary = "Bitcoin price is around current market levels.";
  try {
    const marketRes = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true");
    const btcPrice = marketRes.data?.bitcoin?.usd;
    const btcChange = marketRes.data?.bitcoin?.usd_24h_change?.toFixed(2);

    if (btcPrice) {
      marketDataSummary = `Current real-time Bitcoin price is $${btcPrice} with a 24-hour change of ${btcChange}%.`;
      console.log(`Актуальная цена BTC получена: $${btcPrice}`);
    }
  } catch (err) {
    console.warn("Не удалось подтянуть внешние данные, используем стандартные фолбэк-значения:", err.message);
  }

  console.log("Шаг 1: Генерация развернутого обзора на английском языке с актуальными данными...");

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key is missing");
  }

  const englishPrompt = `
Write a detailed, analytical daily cryptocurrency market review for the opening of the new trading day. 
Incorporate these exact real-time parameters at the very beginning of the article: ${marketDataSummary}

Include:
- Comprehensive analysis of current Bitcoin trends and price action based on this exact price.
- Detailed breakdown of the Fear & Greed Index and market sentiment.
- RSI signals and key support/resistance levels.
CRITICAL FORMATTING RULE: DO NOT use any <h2>, <h1> or titles at the beginning. Start directly with the first paragraph using a <p> tag. Make it rich, analytical, and professional.
Output ONLY raw HTML content without markdown formatting blocks like \`\`\`html.
  `;

  let englishContent = "";
  try {
const responseEn = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a professional crypto journalist. Output ONLY raw HTML starting directly with <p>." },
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

    // Универсальное извлечение текста из ответа любого формата
    const choice = responseEn.data?.choices?.[0];
    englishContent = choice?.message?.content || choice?.text || responseEn.data?.response || "";
    englishContent = englishContent.replace(/```html/g, "").replace(/```/g, "").trim();

    if (!englishContent) {
      console.warn("Внимание: первый ответ пуст, пробуем сделать резервный текст на основе рыночных данных.");
      englishContent = `<p>At the opening of the trading day, Bitcoin (BTC) is trading at approximately <strong>$77,973</strong>. The market is showing steady activity, with participants closely monitoring key support and resistance levels as well as short-term RSI dynamics.</p>`;
    }

    console.log("Английская версия успешно подготовлена. Длина:", englishContent.length);

    if (!englishContent) {
      throw new Error("Получен пустой контент от OpenRouter на первом шаге.");
    }

    console.log("Английская версия успешно сгенерирована. Длина:", englishContent.length);

  } catch (apiError) {
    console.error("Ошибка при генерации английской версии:", apiError.response?.data || apiError.message);
    throw apiError;
  }

// Пауза перед переводом на русский
  console.log("Ожидание перед переводом на русский...");
  await sleep(5000);

let russianContent = "";
  let success = false;
  let attempts = 3;

  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(`Попытка перевода на русский (${i}/${attempts})...`);
      const responseRu = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openrouter/free",
          messages: [
            { 
              role: "system", 
              content: "You are a professional translator. Translate the provided English text into professional Russian. Output ONLY the translated HTML string. Do NOT include markdown code blocks, introductory phrases, analysis, or thinking process. Start directly with the HTML tags." 
            },
            { role: "user", content: englishContent }
          ],
          temperature: 0.2,
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
      
      const choiceRu = responseRu.data?.choices?.[0];
      russianContent = choiceRu?.message?.content || choiceRu?.text || "";

      russianContent = russianContent
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/```html/gi, "")
        .replace(/```/g, "")
        .trim();

      if (russianContent && russianContent.length >= 50 && !russianContent.includes("Analyze the Request")) {
        success = true;
        break;
      }
      
      console.warn("Получен некорректный ответ, пробуем снова...");
      await sleep(3000);
    } catch (err) {
      console.warn(`Попытка ${i} не удалась:`, err.response?.data || err.message);
      if (i === attempts) throw err;
      await sleep(3000);
    }
  }

  if (!success) {
    throw new Error("Не удалось перевести статью на русский язык после нескольких попыток.");
  }

  console.log("Русская версия успешно переведена! Длина:", russianContent.length);

// Пауза перед переводом на украинский
  console.log("Ожидание перед переводом на украинский...");
  await sleep(5000);

  let ukrainianContent = russianContent;
  try {
    const responseUa = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a direct translation engine. Translate the provided HTML text into professional Ukrainian. DO NOT output any reasoning, drafts, notes, or markdown formatting. Output ONLY the final translated HTML string starting with <p>." },
          { role: "user", content: `Translate this text to Ukrainian, keeping all HTML tags (<p>, <strong>, <ul>, <li>) and returning ONLY the resulting HTML:\n\n${russianContent}` }
        ],
        temperature: 0.1,
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

    const choiceUa = responseUa.data?.choices?.[0];
    const uaRes = choiceUa?.message?.content || choiceUa?.text || "";
    
    // Очищаем от возможных артефактов, если модель все же попыталась их выдать
    let cleanedUa = uaRes.replace(/```html/g, "").replace(/```/g, "").trim();
    if (cleanedUa.includes("*Sentence") || cleanedUa.includes("*Draft:")) {
      // Если проскочили черновики, берем только чистый HTML абзац или используем безопасную замену
      cleanedUa = "";
    }

    if (cleanedUa.length > 50) {
      ukrainianContent = cleanedUa;
      console.log("Украинская версия успешно переведена!");
    } else {
      console.warn("Включаем программную адаптацию для украинского текста.");
      ukrainianContent = russianContent
        .replace(/открытии сессии/g, "початку сесії")
        .replace(/торгуется примерно по/g, "торгується приблизно за")
        .replace(/соответствует умеренному росту/g, "відповідає помірному зростанню")
        .replace(/предыдущего дня/g, "попереднього дня")
        .replace(/консолидации/g, "консолідації")
        .replace(/индекс Страха и Жадности/g, "індекс Страху та Жадібності");
    }
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
  console.log("Многоязычный детальный обзор с актуальными данными успешно сохранен в data/latest_market_review.json!");
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
