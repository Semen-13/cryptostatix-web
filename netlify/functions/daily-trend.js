import { getStore } from '@netlify/blobs';
import axios from 'axios';
import { submitToGoogleIndex } from '../../src/utils/indexer.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const trendStoreName = 'trending-topics';

function getTrendStore(required = false) {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const hasNetlifyContext = Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext
  );

  if (siteID && token) {
    return getStore({ name: trendStoreName, siteID, token });
  }

  if (hasNetlifyContext) {
    return getStore(trendStoreName);
  }

  if (required) {
    throw new Error('NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN are required to save the topic to Netlify Blobs');
  }

  return null;
}

async function saveTopic(topic, store) {
  if (!store) {
    throw new Error('Netlify Blobs store is required to save the trending topic');
  }

  await store.setJSON('latest', topic);
  await store.setJSON(`history/${topic.date}`, topic);
  console.log('Тема дня сохранена в Netlify Blobs.');
}

async function saveNoTopicNotice(store, ticker = null, priceChange = null) {
  const currentDate = new Date().toISOString().split('T')[0];
  const topic = {
    ticker,
    price_change: priceChange,
    date: currentDate,
    timestamp: new Date().toISOString(),
    translations: {
      en: {
        title: 'No Topic of the Day Today',
        meta_description: 'There is no Topic of the Day today because our AI assistant is unwell.',
        content: "<p>Our AI assistant is feeling a little under the weather today, so there will be no Topic of the Day. Thank you for your understanding—we'll be back once our silicon patient has recovered!</p>"
      },
      ru: {
        title: 'Сегодня без темы дня',
        meta_description: 'Сегодня темы дня не будет: наш ИИ немного приболел.',
        content: '<p>Наш ИИ сегодня немного приболел, поэтому «Темы дня» не будет. Спасибо за понимание — вернемся, как только наш кремниевый пациент поправится!</p>'
      },
      ua: {
        title: 'Сьогодні без теми дня',
        meta_description: 'Сьогодні теми дня не буде: наш ШІ трохи прихворів.',
        content: '<p>Наш ШІ сьогодні трохи прихворів, тому «Теми дня» не буде. Дякуємо за розуміння — повернемося, щойно наш кремнієвий пацієнт одужає!</p>'
      }
    }
  };

  await saveTopic(topic, store);
  console.warn('Сохранено уведомление: сегодня темы дня не будет.');
  return topic;
}

async function readTopic(store = getTrendStore()) {
  if (store) {
    return await store.get('latest', { type: 'json' }) || null;
  }

  return null;
}

async function runGeneration(store = getTrendStore()) {
  try {
    console.log('🚀 Запуск автопилота: Топ тема дня...');

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error("OpenRouter API key is missing; publishing the no-topic notice.");
      return saveNoTopicNotice(store);
    }

 // ==========================================
    // ШАГ 1: ДЕТЕКТОР ТРЕНДОВ (CoinGecko API)
    // ==========================================
    console.log('Шаг 1: Поиск трендового актива через CoinGecko...');
    
    let selectedTicker = "BTC";
    let priceChange = "+0%";

    try {
      const cgTrendingRes = await axios.get('https://api.coingecko.com/api/v3/search/trending');
      const trendingCoins = cgTrendingRes.data.coins;

      if (trendingCoins && trendingCoins.length > 0) {
        // Берем первый попавшийся трендовый коин с CoinGecko
        const topCoin = trendingCoins[0].item;
        selectedTicker = topCoin.symbol.toUpperCase();
        // У CoinGecko в трендах может не быть точного % изменения, пробуем вытащить или ставим дефолт
        priceChange = topCoin.data?.price_change_percentage_24h?.usd 
          ? `${parseFloat(topCoin.data.price_change_percentage_24h.usd).toFixed(2)}%` 
          : "+5.0%";
      }
    } catch (cgError) {
      console.warn("Не удалось получить тренды с CoinGecko, используем резервный актив (BTC):", cgError.message);
    }

    console.log(`🎯 Выбран актив дня: ${selectedTicker} (Изменение за 24ч: ${priceChange})`);
    // ==========================================
    // ШАГ 2: ГЕНЕРАЦИЯ АНГЛИЙСКОЙ ВЕРСИИ ОБЗОРА
    // ==========================================
    console.log(`Шаг 2: Генерация развернутого обзора для ${selectedTicker} на английском языке...`);

    const englishPrompt = `
Write a detailed, analytical cryptocurrency market review focused on the trending asset: ${selectedTicker}. 
The asset has shown a 24-hour price change of ${priceChange}.

Include:
- Comprehensive analysis of why ${selectedTicker} is trending today, examining its recent price action and volume surge.
- Evaluation of key technical indicators (such as RSI signals, Open Interest, or support/resistance levels) related to ${selectedTicker}.
- Market sentiment context and how it impacts this specific token.
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
              { role: "system", content: "You are a professional crypto analyst. Output ONLY raw HTML starting directly with <p>." },
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
        englishContent = choice?.message?.content || choice?.text || "";
        englishContent = englishContent.replace(/```html/g, "").replace(/```/g, "").trim();

        if (englishContent) break;

        emptyEnglishResponseReceived = true;
        console.warn(`Получен пустой ответ при генерации английской версии (${attempt}/3).`);
      } catch (generationError) {
        englishGenerationError = generationError;
        console.warn(`Ошибка при генерации английской версии (${attempt}/3):`, generationError.response?.data || generationError.message);
      }

      if (attempt < 3) await sleep(3000);
    }

    if (!englishContent) {
      console.warn(
        emptyEnglishResponseReceived
          ? "После трех пустых ответов публикуем уведомление об отсутствии темы дня."
          : "Не удалось получить ответ от OpenRouter; публикуем уведомление об отсутствии темы дня.",
        englishGenerationError?.message || ""
      );
      return saveNoTopicNotice(store, selectedTicker, priceChange);
    }
    console.log("Английская версия успешно подготовлена. Длина:", englishContent.length);

    // ==========================================
    // ШАГ 3: ПЕРЕВОД НА РУССКИЙ (5 попыток)
    // ==========================================
    console.log("Ожидание перед переводом на русский...");
    await sleep(4000);

    let russianContent = "";
    let successRu = false;

    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`Попытка перевода на русский (${i}/5)...`);
        const responseRu = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openrouter/free",
            messages: [
              { 
                role: "system", 
                content: "You are a professional crypto translator. Translate the provided English text into professional Russian. Output ONLY the translated HTML string. Do NOT include markdown code blocks, introductory phrases, analysis, or thinking process. Start directly with the HTML tags and ensure you complete the entire text without cutting off." 
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
        
        const choiceRu = responseRu.data?.choices?.[0];
        russianContent = choiceRu?.message?.content || choiceRu?.text || "";

        russianContent = russianContent
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .replace(/```html/gi, "")
          .replace(/```/g, "")
          .trim();

        const finishReason = choiceRu?.finish_reason;
        const isCutOff = finishReason === 'length';
        const endsWithHtmlTag = /<\/(p|ul|ol|li|div|h[3-6])>$/i.test(russianContent);

        if (russianContent && russianContent.length >= 100 && !isCutOff && endsWithHtmlTag) {
          successRu = true;
          break;
        }
        console.warn(`Повтор перевода (finish_reason: ${finishReason})...`);
        await sleep(3000);
      } catch (err) {
        console.warn(`Попытка перевода на русский (${i}/5) не удалась:`, err.response?.data || err.message);
        await sleep(3000);
      }
    }

    if (!successRu) {
      console.warn("Не удалось подготовить русский перевод; публикуем уведомление об отсутствии темы дня.");
      return saveNoTopicNotice(store, selectedTicker, priceChange);
    }
    console.log("Русская версия успешно переведена!");
// ==========================================
    // ШАГ 4: ПЕРЕВОД НА УКРАИНСКИЙ (с авто-фолбэком на английский)
    // ==========================================
    console.log("Ожидание перед переводом на украинский...");
    await sleep(4000);

    let ukrainianContent = "";
    let successUa = false;

    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`Попытка перевода на украинский (${i}/5)...`);
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
        ukrainianContent = choiceUa?.message?.content || choiceUa?.text || "";

        ukrainianContent = ukrainianContent
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .replace(/```html/gi, "")
          .replace(/```/g, "")
          .trim();

        const finishReason = choiceUa?.finish_reason;
        const isCutOff = finishReason === 'length';
        const endsWithHtmlTag = /<\/(p|ul|ol|li|div|h[3-6])>$/i.test(ukrainianContent);

        if (ukrainianContent && ukrainianContent.length >= 100 && !isCutOff && endsWithHtmlTag) {
          successUa = true;
          break;
        }
        console.warn(`Повтор перевода (finish_reason: ${finishReason})...`);
        await sleep(3000);
      } catch (err) {
        console.warn(`Попытка ${i} не удалась:`, err.message);
        await sleep(3000);
      }
    }

    // БЕЗОПАСНЫЙ ФОЛБЭК: Если перевести так и не удалось, берем английскую версию
    if (!successUa || !ukrainianContent) {
      console.warn("⚠️ Не удалось перевести на украинский язык после 5 попыток. Используем английскую версию как фолбэк.");
      ukrainianContent = englishContent;
    } else {
      console.log("Украинская версия успешно переведена!");
    }
    // ==========================================
    // ШАГ 5: СОХРАНЕНИЕ В NETLIFY BLOBS (стор "trending-topics")
    // ==========================================
    const currentDate = new Date().toISOString().split('T')[0];
    const finalPayload = {
      ticker: selectedTicker,
      price_change: priceChange,
      date: currentDate,
      timestamp: new Date().toISOString(),
      translations: {
        en: {
          title: `Why ${selectedTicker} is Trending: Metrics & Market Analysis`,
          meta_description: `Explore why ${selectedTicker} is gaining momentum. Swappy AI analyzes key volume, RSI, and market trends on CryptoStatix PRO.`,
          content: englishContent
        },
        ru: {
          title: `Почему растет ${selectedTicker}: Анализ метрик и рыночного тренда`,
          meta_description: `Разбор причин роста ${selectedTicker}. ИИ Swappy проанализировал объемы, RSI сигналы и тренды на платформе CryptoStatix.`,
          content: russianContent
        },
        ua: {
          title: `Чому зростає ${selectedTicker}: Аналіз метрик та ринкового тренду`,
          meta_description: `Огляд причин руху ${selectedTicker}. ШІ Swappy проаналізував обсяги, RSI сигнали та тренди на CryptoStatix PRO.`,
          content: ukrainianContent
        }
      }
    };

await saveTopic(finalPayload, store);

    // Добавляем в sitemap и пингуем Google Indexing API
    await submitToGoogleIndex(`trending/${selectedTicker.toLowerCase()}`);

    console.log('✅ Топ тема дня успешно сформирована!');

    return finalPayload;

  } catch (error) {
    console.error('❌ Ошибка в daily-trend:', error.message);
    throw error;
  }
}

export default async () => {
  try {
    const data = await readTopic();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('❌ Ошибка чтения темы дня:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

if (process.argv[1] && process.argv[1].endsWith('daily-trend.js')) {
  const store = getTrendStore(Boolean(process.env.CI));
  runGeneration(store)
    .then((topic) => {
      console.log(`Тема дня (${topic.ticker}) создана и сохранена.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ошибка запуска daily-trend из CLI:', error.message);
      process.exit(1);
    });
}