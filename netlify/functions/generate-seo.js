import axios from "axios";
import { getStore } from "@netlify/blobs";
import { submitToGoogleIndex } from '../../src/utils/indexer.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const reviewStoreName = "market-reviews";
const reviewStoreKey = "latest";

function getReviewStore(required = false) {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const hasNetlifyContext = Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext
  );

  if (siteID && token) {
    return getStore({ name: reviewStoreName, siteID, token });
  }

  if (hasNetlifyContext) {
    return getStore(reviewStoreName);
  }

  if (required) {
    throw new Error("NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN are required to save the review to Netlify Blobs");
  }

  return null;
}

async function saveReview(articlesData, store = getReviewStore()) {
  const currentDate = new Date().toISOString().split('T')[0];

  if (!store) {
    throw new Error("Netlify Blobs store is required to save the market review");
  }

  await store.setJSON(reviewStoreKey, articlesData);
  console.log("Многоязычный обзор успешно сохранен в Netlify Blobs.");

  // Добавляем в sitemap и пингуем Google Indexing API
  await submitToGoogleIndex(`reviews/${currentDate}`);
}

async function saveNoReviewNotice(store) {
  const articlesData = {
    date: new Date().toISOString(),
    en: "<p>Our AI assistant is feeling a little under the weather today, so there will be no market review. Thank you for your understanding—we'll be back once our silicon patient has recovered!</p>",
    ru: "<p>Наш ИИ сегодня немного приболел, поэтому обзора рынка не будет. Спасибо за понимание — вернемся, как только наш кремниевый пациент поправится!</p>",
    ua: "<p>Наш ШІ сьогодні трохи прихворів, тому огляду ринку не буде. Дякуємо за розуміння — повернемося, щойно наш кремнієвий пацієнт одужає!</p>"
  };

  await saveReview(articlesData, store);
  console.warn("Сохранено уведомление: сегодня обзора рынка не будет.");
  return articlesData;
}

async function readReview(store) {
  if (store) {
    return await store.get(reviewStoreKey, { type: "json" }) || {};
  }

  return {};
}

async function runGeneration(store = getReviewStore()) {
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
    console.error("OpenRouter API key is missing; publishing the no-review notice.");
    return saveNoReviewNotice(store);
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
  let englishGenerationError;
  let emptyEnglishResponseReceived = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
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

      const choice = responseEn.data?.choices?.[0];
      englishContent = choice?.message?.content || choice?.text || responseEn.data?.response || "";
      englishContent = englishContent.replace(/```html/g, "").replace(/```/g, "").trim();

      if (englishContent) break;

      emptyEnglishResponseReceived = true;
      console.warn(`Получен пустой ответ при генерации английской версии (${attempt}/3).`);
    } catch (apiError) {
      englishGenerationError = apiError;
      console.error(`Ошибка при генерации английской версии (${attempt}/3):`, apiError.response?.data || apiError.message);
    }

    if (attempt < 3) await sleep(3000);
  }

  if (!englishContent) {
    console.warn(
      emptyEnglishResponseReceived
        ? "После трех пустых ответов публикуем уведомление об отсутствии обзора."
        : "Не удалось получить ответ от OpenRouter; публикуем уведомление об отсутствии обзора.",
      englishGenerationError?.message || ""
    );
    return saveNoReviewNotice(store);
  }
  console.log("Английская версия успешно подготовлена. Длина:", englishContent.length);

// Пауза перед переводом на русский
  console.log("Ожидание перед переводом на русский...");
  await sleep(5000);

  let russianContent = "";
  let success = false;
  let attempts = 5;

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
              content: "You are a professional translator. Translate the provided English text into professional Russian. Output ONLY the translated HTML string. Do NOT include markdown code blocks, introductory phrases, analysis, or thinking process. Start directly with the HTML tags and ensure you complete the entire text without cutting off." 
            },
            { role: "user", content: englishContent }
          ],
          temperature: 0.2,
          max_tokens: 4000 // Увеличили лимит токенов, чтобы текст не обрывался
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

      // Проверяем, не оборвался ли ответ из-за лимита токенов
      const finishReason = choiceRu?.finish_reason;
      const isCutOff = finishReason === 'length';

      // Проверяем, что текст достаточно длинный, не содержит мусора и заканчивается корректным HTML-тегом
      const endsWithHtmlTag = /<\/(p|ul|ol|li|div|h[3-6])>$/i.test(russianContent);

      if (
        russianContent && 
        russianContent.length >= 100 && 
        !russianContent.includes("Analyze the Request") &&
        !isCutOff &&
        endsWithHtmlTag
      ) {
        success = true;
        break;
      }
      
      console.warn(`Получен некорректный или об обрезанный ответ (finish_reason: ${finishReason}), пробуем снова...`);
      await sleep(3000);
    } catch (err) {
      console.warn(`Попытка ${i} не удалась:`, err.response?.data || err.message);
      await sleep(3000);
    }
  }

  if (!success) {
    console.warn("Не удалось подготовить русский перевод; публикуем уведомление об отсутствии обзора.");
    return saveNoReviewNotice(store);
  }

  console.log("Русская версия успешно переведена! Длина:", russianContent.length);

// Пауза перед переводом на украинский
  console.log("Ожидание перед переводом на украинский...");
  await sleep(5000);

  let ukrainianContent = "";
  let uaSuccess = false;
  let uaAttempts = 5;

  for (let i = 1; i <= uaAttempts; i++) {
    try {
      console.log(`Попытка перевода на украинский (${i}/${uaAttempts})...`);
      const responseUa = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openrouter/free",
          messages: [
            { 
                role: "system", 
                content: "You are a professional crypto translator. Translate the provided English text into professional Ukrainian. Preserve all HTML tags and important details. Output ONLY the translated HTML string. Do NOT include markdown code blocks, introductory phrases, analysis, or thinking process. Start directly with the HTML tags and ensure you complete the entire text without cutting off." 
              },
              { role: "user", content: englishContent }
          ],
          temperature: 0.2,
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

      const choiceUa = responseUa.data?.choices?.[0];
      let uaRes = choiceUa?.message?.content || choiceUa?.text || "";
      
      uaRes = uaRes
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/```html/gi, "")
        .replace(/```/g, "")
        .trim();

      const finishReason = choiceUa?.finish_reason;
      const isCutOff = finishReason === 'length';
      const endsWithHtmlTag = /<\/(p|ul|ol|li|div|h[3-6])>$/i.test(uaRes);

      if (
        uaRes && 
        uaRes.length >= 100 && 
        !uaRes.includes("*Sentence") && 
        !uaRes.includes("*Draft:") &&
        !isCutOff &&
        endsWithHtmlTag
      ) {
        ukrainianContent = uaRes;
        uaSuccess = true;
        console.log("Украинская версия успешно переведена! Длина:", ukrainianContent.length);
        break;
      }

      console.warn(`Получен некорректный или об обрезанный украинский ответ (finish_reason: ${finishReason}), пробуем снова...`);
      await sleep(3000);
    } catch (err) {
      console.warn(`Попытка ${i} на украинском не удалась:`, err.response?.data || err.message);
      if (i === uaAttempts) {
        console.error("Ошибка перевода на украинский: исчерпаны все попытки.");
      }
      await sleep(3000);
    }
  }

  // Если все попытки провалились, в качестве подстраховки берем английский контент, 
  // чтобы не записывать ломанный или смешанный русско-украинский текст
  if (!uaSuccess) {
    console.warn("Внимание: не удалось получить чистый украинский перевод. Используем английскую версию как запасной вариант.");
    ukrainianContent = englishContent;
  }

  // Финальная сборка в JSON
  const articlesData = {
    date: new Date().toISOString(),
    en: englishContent,
    ru: russianContent,
    ua: ukrainianContent
  };

  await saveReview(articlesData, store);
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
    const store = getReviewStore();
    let articlesData = await readReview(store);

    const todayStr = new Date().toISOString().split('T')[0];
    const isNewDay = articlesData && articlesData.date ? !articlesData.date.startsWith(todayStr) : true;

    if (isAuthorized && isNewDay) {
      articlesData = await runGeneration(store);
    }

    return new Response(JSON.stringify({
      success: true,
      data: articlesData
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
      }
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
  runGeneration(getReviewStore(true))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Ошибка при генерации из CLI:", err);
      process.exit(1);
    });
}
