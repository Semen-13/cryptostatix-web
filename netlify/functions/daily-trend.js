import { getStore } from '@netlify/blobs';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const trendStoreName = 'trending-topics';
const trendFilePath = path.join(process.cwd(), 'data', 'latest_trending_topic.json');

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
  if (store) {
    await store.setJSON('latest', topic);
    await store.setJSON(`history/${topic.date}`, topic);
    console.log('Тема дня сохранена в Netlify Blobs.');
    return;
  }

  fs.writeFileSync(trendFilePath, JSON.stringify(topic, null, 2), 'utf8');
  console.log(`Тема дня сохранена локально в ${trendFilePath}.`);
}

async function readTopic(store = getTrendStore()) {
  if (store) {
    return await store.get('latest', { type: 'json' }) || null;
  }

  if (fs.existsSync(trendFilePath)) {
    return JSON.parse(fs.readFileSync(trendFilePath, 'utf8'));
  }

  return null;
}

async function runGeneration(store = getTrendStore()) {
  try {
    console.log('🚀 Запуск автопилота: Топ тема дня...');

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    // ==========================================
    // ШАГ 1: ДЕТЕКТОР ТРЕНДОВ (CoinGecko + Binance)
    // ==========================================
    console.log('Шаг 1: Поиск трендового актива...');
    
    const cgResponse = await axios.get('https://api.coingecko.com/api/v3/search/trending');
    const trendingCoins = cgResponse.data.coins.map(c => c.item.symbol.toUpperCase());

    const binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const binanceData = binanceResponse.data;

    const qualifiedCoins = binanceData.filter(ticker => {
      const isUSDT = ticker.symbol.endsWith('USDT');
      const volumeUSD = parseFloat(ticker.quoteVolume);
      const symbolWithoutUSDT = ticker.symbol.replace('USDT', '');
      return isUSDT && volumeUSD >= 10000000 && trendingCoins.includes(symbolWithoutUSDT);
    });

    qualifiedCoins.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

    let selectedTicker = "BTC";
    let priceChange = "+0%";
    if (qualifiedCoins.length > 0) {
      selectedTicker = qualifiedCoins[0].symbol.replace('USDT', '');
      priceChange = `${parseFloat(qualifiedCoins[0].priceChangePercent).toFixed(2)}%`;
    } else {
      const fallback = binanceData
        .filter(t => t.symbol.endsWith('USDT') && parseFloat(t.quoteVolume) >= 20000000)
        .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))[0];
      if (fallback) {
        selectedTicker = fallback.symbol.replace('USDT', '');
        priceChange = `${parseFloat(fallback.priceChangePercent).toFixed(2)}%`;
      }
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

    if (!englishContent) {
      englishContent = `<p>At the opening of the trading session, <strong>${selectedTicker}</strong> has captured market attention with a 24-hour price change of <strong>${priceChange}</strong>. Traders and investors are closely monitoring volume spikes and key technical indicators.</p>`;
    }
    console.log("Английская версия успешно подготовлена. Длина:", englishContent.length);

    // ==========================================
    // ШАГ 3: ПЕРЕВОД НА РУССКИЙ (3 попытки)
    // ==========================================
    console.log("Ожидание перед переводом на русский...");
    await sleep(4000);

    let russianContent = "";
    let successRu = false;

    for (let i = 1; i <= 3; i++) {
      try {
        console.log(`Попытка перевода на русский (${i}/3)...`);
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
        if (i === 3) throw err;
        await sleep(3000);
      }
    }

    if (!successRu) {
      throw new Error("Не удалось корректно перевести статью на русский язык.");
    }
    console.log("Русская версия успешно переведена!");

    // ==========================================
    // ШАГ 4: ПЕРЕВОД НА УКРАИНСКИЙ (3 попытки)
    // ==========================================
    console.log("Ожидание перед переводом на украинский...");
    await sleep(4000);

    let ukrainianContent = "";
    let successUa = false;

    for (let i = 1; i <= 3; i++) {
      try {
        console.log(`Попытка перевода на украинский (${i}/3)...`);
        const responseUa = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openrouter/free",
            messages: [
              { 
                role: "system", 
                content: "You are a professional crypto translator. Translate the provided English text into professional Ukrainian. Output ONLY the translated HTML string. Do NOT include markdown code blocks, introductory phrases, analysis, or thinking process. Start directly with the HTML tags and ensure you complete the entire text without cutting off." 
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
        if (i === 3) throw err;
        await sleep(3000);
      }
    }

    if (!successUa) {
      throw new Error("Не удалось корректно перевести статью на украинский язык.");
    }
    console.log("Украинская версия успешно переведена!");

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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runGeneration(getTrendStore(Boolean(process.env.CI)))
    .then((topic) => {
      console.log(`Тема дня (${topic.ticker}) создана и сохранена.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ошибка запуска daily-trend из CLI:', error.message);
      process.exit(1);
    });
}