import './style.css'

// --- ДОБАВЬТЕ ЭТОТ БЛОК ДЛЯ АВТО-ПРОВЕРКИ ЯЗЫКА ---
const initLanguage = () => {
    const lang = localStorage.getItem('selectedLanguage') || 'RUS';
    const langCodes = { 'ENG': 'en', 'UKR': 'uk', 'RUS': 'ru' };
    document.documentElement.lang = langCodes[lang] || 'ru';
};
initLanguage(); // Запускаем проверку мгновенно
// ------------------------------------------------

// Crypto Data
const coinIds = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'ripple', 'solana', 'cardano'];
const coinList = [
  { name: 'BTC', id: 'bitcoin' },
  { name: 'ETH', id: 'ethereum' },
  { name: 'USDT', id: 'tether' },
  { name: 'BNB', id: 'binancecoin' },
  { name: 'XRP', id: 'ripple' },
  { name: 'SOL', id: 'solana' },
  { name: 'ADA', id: 'cardano' }
];

async function updatePrices() {
  const tickerBox = document.getElementById('ticker-box');
  const tickerBoxCopy = document.getElementById('ticker-box-copy');
  if (!tickerBox || !tickerBoxCopy) return;

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`);
    const data = await response.json();

    let htmlContent = '';
    coinList.forEach(coin => {
      const coinData = data[coin.id];
      if (!coinData) return;

      const price = coinData.usd;
      const change = coinData.usd_24h_change.toFixed(2);
      const changeClass = change >= 0 ? 'price-up' : 'price-down';
      const symbol = change >= 0 ? '+' : '';
      const formattedPrice = price < 1 ? price.toFixed(4) : price.toLocaleString();

      htmlContent += `
          <span class="coin">
            <span class="dot"></span>
            <span class="coin-name">${coin.name}</span> $${formattedPrice} 
            <small class="${changeClass}">${symbol}${change}%</small>
          </span>`;
    });

    tickerBox.innerHTML = htmlContent;
    tickerBoxCopy.innerHTML = htmlContent;

  } catch (error) {
    console.error("Ошибка:", error);
  }
}

// Detail content config per section
const detailConfig = {
  analytics: {
    label: 'АНАЛИТИКА',
    items: [
      { title: 'Fear & Greed Terminal', desc: 'Общая капитализация криптовалютного рынка и доминирование BTC.' },
      { title: 'Global Exchange Radar', desc: 'Анализ текущих рыночных тенденций и макро-сигналов.' },
      { title: 'Dominance', desc: 'Доминирование Bitcoin (BTC) над остальным рынком криптовалют.' },
      { title: 'dominance(history)', desc: 'Анализ ликвидности и доминирования Bitcoin на крипторынке.' },
      { title: 'Heatmap', desc: 'Тепловая карта ликвидности и рыночной капитализации топ-25 криптовалют.' },
      { title: 'RSI PRO Signals', desc: 'Автоматический поиск сигналов перепроданности и перекупленности по RSI (14).' },
      { title: 'Whale Terminal', desc: 'Мониторинг крупных сделок и активности китов в реальном времени.' },
      { title: 'OI Terminal', desc: 'Анализ открытого интереса и ставок финансирования BTC.' },
      { title: 'Smart Suite Intelligence', desc: 'Аналитика биржевых потоков и тепловая карта ликвидаций в реальном времени.' },
      { title: 'Market Intelligence', desc: 'Анализ экономических событий и их влияния на волатильность рынка.' },
      { title: 'Binance Futures PRO', desc: 'Профессиональный терминал для торговли фьючерсами на Binance.' },
      { title: 'NFT Рынок', desc: 'Объём и динамика рынка NFT по коллекциям и блокчейнам.' },
      { title: 'CryptoStatix Tracker', desc: 'Сигналы машинного обучения на основе технического анализа.' }
    ]
  }
};

// Track where we came from for back navigation
let detailOrigin = null;
let currentDetailIndex = null;



// Page Switching Logic
window.showPage = function (pageId) {
  const home = document.getElementById('home');
  const pages = document.querySelectorAll('.subpage');

  if (pageId === 'home') {
    // Back to home
    pages.forEach(p => p.classList.remove('active'));
    setTimeout(() => {
      home.classList.remove('hidden-home');
      pages.forEach(p => p.style.display = 'none');
    }, 600);
    detailOrigin = null;
  } else {
    // Show subpage
    const targetPage = document.getElementById(pageId);
    if (!targetPage) return;

    home.classList.add('hidden-home');
    targetPage.style.display = 'flex';

    // Trigger animation frame
    requestAnimationFrame(() => {
      targetPage.classList.add('active');
    });
  }
}

// Show Detail Subpage for a specific grid item
window.showDetail = function (section, itemIndex) {
  const config = detailConfig[section];
  if (!config) return;

  const item = config.items[itemIndex - 1];
  if (!item) return;

  detailOrigin = section;
  currentDetailIndex = itemIndex;

  // Set content
// 1. Получаем язык из хранилища
  const lang = localStorage.getItem('selectedLanguage') || 'RUS';

  // 2. ДОБАВЛЯЕМ ЭТИ ДВЕ СТРОКИ:
  const langCodes = { 'ENG': 'en', 'UKR': 'uk', 'RUS': 'ru' };
  document.documentElement.lang = langCodes[lang] || 'ru';

  let label = config.label;
  if (lang === 'ENG') {
    if (section === 'analytics') label = 'ANALYTICS';
  } else if (lang === 'UKR') {
    if (section === 'analytics') label = 'АНАЛІТИКА';
  } else {
    if (section === 'analytics') label = 'АНАЛИТИКА';
  }

  document.getElementById('detail-title').textContent = `${label} — ${item.title}`;
  document.getElementById('detail-body').innerHTML = buildDetailBody(section, itemIndex, item, lang);
  // Hide parent subpage first
  const parentPage = document.getElementById(section);
  parentPage.classList.remove('active');

  // Show detail page
  const detailPage = document.getElementById('detail-page');
  detailPage.style.display = 'flex';

  setTimeout(() => {
    parentPage.style.display = 'none';
    detailPage.classList.add('active');
  }, 100);
}

// Close Detail and go back to parent subpage
window.closeDetail = function () {
  const detailPage = document.getElementById('detail-page');
  detailPage.classList.remove('active');

  if (detailOrigin) {
    const parentPage = document.getElementById(detailOrigin);
    parentPage.style.display = 'flex';
    setTimeout(() => {
      detailPage.style.display = 'none';
      parentPage.classList.add('active');
    }, 100);
  } else {
    setTimeout(() => {
      detailPage.style.display = 'none';
    }, 600);
  }
}

// Build detail page body content
function buildDetailBody(section, index, item, lang = 'RUS') {
  const sectionColors = {
    analytics: '#00ff88'
  };
  const color = sectionColors[section] || '#00ff88';

  if (section === 'analytics' && index === 1) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/fear-greed-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 2) {
    const title = lang === 'ENG' ? '🛰️ CryptoStatix PRO: Social Signal Terminal v10.0' : '🛰️ CryptoStatix PRO: Social Signal Terminal v10.0'; // Same for both
    const intro = lang === 'ENG' 
      ? 'CryptoStatix PRO is an interactive analytical tool designed to visualize market dominance and short-term momentum of cryptocurrency assets. The terminal combines market share data from major exchanges with real-time volatility metrics and a simulated social interest index.'
      : (lang === 'UKR' 
        ? 'CryptoStatix PRO — це інтерактивний аналітичний інструмент, призначений для візуалізації ринкової домінації та короткострокового імпульсу (Momentum) криптовалютних активів. Термінал поєднує дані про частку ринку найбільших бірж із реальними показниками волатильності та симульованим індексом соціального інтересу.'
        : 'CryptoStatix PRO — это интерактивный аналитический инструмент, предназначенный для визуализации рыночной доминанты и краткосрочного импульса (Momentum) криптовалютных активов. Терминал объединяет данные о доле рынка крупнейших бирж с реальными показателями волатильности и симулированным индексом социального интереса.');
    const guideTitle = lang === 'ENG' ? '📋 Quick Start Guide' : (lang === 'UKR' ? '📋 Короткий посібник' : '📋 Краткая инструкция');
    const point1 = lang === 'ENG' 
      ? '<strong>1. Launch:</strong> Data is automatically fetched via the CoinGecko API upon page load.'
      : (lang === 'UKR'
        ? '<strong>1. Запуск:</strong> Дані підтягуються автоматично через API CoinGecko під час завантаження сторінки.'
        : '<strong>1. Запуск:</strong> Данные подтягиваются автоматически через API CoinGecko при загрузке страницы.');
    const point2Title = lang === 'ENG' ? '<strong>2. Radar Analysis (Top Widget):</strong>' : (lang === 'UKR' ? '<strong>2. Аналіз Radar (Верхній віджет):</strong>' : '<strong>2. Анализ Radar (Верхний виджет):</strong>');
    const point2List = lang === 'ENG'
      ? `<li>The pie chart shows the distribution of trading influence between the top 8 exchanges and the rest of the market.</li>
         <li>Click on any sector (e.g., Bybit or OKX) to instantly filter the bubble chart for that specific platform's listings.</li>`
      : (lang === 'UKR'
        ? `<li>Кругова діаграма показує розподіл торгового впливу між 8 найбільшими біржами та рештою ринку.</li>
           <li>Клацніть на будь-який сектор (наприклад, Bybit або OKX), щоб миттєво відфільтрувати бульбашкову діаграму під лістинг конкретного майданчика.</li>`
        : `<li>Круговая диаграмма показывает распределение торгового влияния между 8 крупнейшими биржами и остальным рынком.</li>
           <li>Кликните на любой сектор (например, Bybit или OKX), чтобы мгновенно отфильтровать пузырьковый график под листинг конкретной площадки.</li>`);
    const point3Title = lang === 'ENG' ? '<strong>3. Momentum Analysis (Bottom Widget):</strong>' : (lang === 'UKR' ? '<strong>3. Аналіз Momentum (Нижній віджет):</strong>' : '<strong>3. Анализ Momentum (Нижний виджет):</strong>');
    const point3List = lang === 'ENG'
      ? `<li><strong>Y-Axis (Velocity %):</strong> Real price change over 24 hours. The higher the bubble, the stronger the bullish momentum.</li>
         <li><strong>X-Axis (Hype Index):</strong> Social activity surrounding the coin (scale 50 to 90).</li>
         <li><strong>Bubble Size:</strong> Reflects actual 24h trading volume in USD. Large bubbles represent market "whales" with high liquidity.</li>
         <li><strong>Details:</strong> Hover over any bubble to trigger the Cyber-Tooltip with precise figures and Market Weight evaluation.</li>`
      : (lang === 'UKR'
        ? `<li><strong>Вісь Y (Velocity %):</strong> Реальна зміна ціни за 24 години. Чим вища бульбашка, тим сильніший «бичачий» імпульс.</li>
           <li><strong>Вісь X (Hype Index):</strong> Соціальна активність навколо монети (від 50 до 90).</li>
           <li><strong>Розмір бульбашки:</strong> Відображає реальний обсяг торгів у доларах. Великі бульбашки — це «кити» ринку з високою ліквідністю.</li>
           <li><strong>Деталізація:</strong> Наведіть курсор на будь-яку бульбашку, щоб побачити Cyber-Tooltip з точними цифрами та оцінкою ринкової ваги (Market Weight).</li>`
        : `<li><strong>Ось Y (Velocity %):</strong> Реальное изменение цены за 24 часа. Чем выше пузырек, тем сильнее «бычий» импульс.</li>
           <li><strong>Ось X (Hype Index):</strong> Социальная активность вокруг монеты (от 50 до 90).</li>
           <li><strong>Размер пузырька:</strong> Отражает реальный объем торгов в долларах. Крупные пузырьки — это «киты» рынка с высокой ликвидностью.</li>
           <li><strong>Детализация:</strong> Наведите курсор на любой пузырек, чтобы увидеть Cyber-Tooltip с точными цифрами и оценкой рыночного веса (Market Weight).</li>`);
    const tipTitle = lang === 'ENG' ? '💡 Pro Tip from Gemini' : (lang === 'UKR' ? '💡 Порада від Gemini' : '💡 Совет от Gemini');
    const tipQuote = lang === 'ENG' ? '"Keep an eye on the \'outliers\' in the upper-right quadrant."' : (lang === 'UKR' ? '«Слідкуйте за "вискочками" у правому верхньому квадранті».' : '«Следите за "выскочками" в правом верхнем квадранте».»');
    const tipBody = lang === 'ENG'
      ? 'In trading, the most profitable yet dangerous sector consists of coins with high Hype Index and high Velocity. If you see a large bubble (high liquidity) surging upward while hype remains moderate, it’s often a sign of organic accumulation by "smart money."'
      : (lang === 'UKR'
        ? 'У трейдингу найприбутковіший, але й найнебезпечніший сектор — це монети з високим Hype Index та високою Velocity. Якщо ви бачите, що велика бульбашка (висока ліквідність) різко рухається вгору при помірному хайпі — це ознака органічного накопичення «розумними грошима».'
        : 'В трейдинге самый прибыльный, но и самый опасный сектор — это монеты с высоким Hype Index и высокой Velocity. Если вы видите, что крупный пузырек (высокая ликвидность) резко перемещается вверх при умеренном хайпе — это признак органического накопления «умными деньгами».');
    const techTip = lang === 'ENG'
      ? 'Technical Note: The free API has rate limits. If the status in the corner changes to API Limit, simply wait a minute — the terminal will automatically reconnect and refresh the data without needing a page reload.'
      : (lang === 'UKR'
        ? 'Технічна порада: Безкоштовне API має ліміти. Якщо статус у кутку змінився на API Limit, просто зачекайте хвилину — термінал сам відновить з\'єднання та оновить цифри без перезавантаження сторінки.'
        : 'Технический совет: Бесплатное API имеет лимиты. Если статус в углу сменился на API Limit, просто подождите минуту — терминал сам восстановит соединение и обновит цифры без перезагрузки страницы.');

    return `
      <div style="display: flex; flex-direction: row; gap: 40px; width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; flex: 1.2; margin: 0; min-height: unset; height: 100%;">
          <iframe src="/social-signal-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
        <div class="instructions-panel" style="flex: 0.8; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--detail-color, ${color}); border-radius: 14px; padding: 25px 30px; box-shadow: 0 0 30px color-mix(in srgb, ${color} 15%, transparent); overflow-y: auto; color: rgba(255,255,255,0.8); line-height: 1.6; font-size: 0.85rem; height: 100%;">
          <h3 style="color: ${color}; margin-top: 0; margin-bottom: 20px; font-family: 'Orbitron', sans-serif; font-size: 1rem; text-transform: uppercase; letter-spacing: 1.2px;">${title}</h3>
          
          <p style="margin-bottom: 20px; color: #fff; font-weight: 500;">${intro}</p>

          <h4 style="color: ${color}; margin-top: 25px; margin-bottom: 15px; font-size: 0.95rem; text-transform: uppercase;">${guideTitle}</h4>
          
          <p>${point1}</p>

          <p>${point2Title}</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            ${point2List}
          </ul>

          <p>${point3Title}</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            ${point3List}
          </ul>

          <div style="margin-top: 30px; padding: 20px; background: rgba(0, 242, 255, 0.05); border-radius: 12px; border: 1px dashed ${color};">
            <h4 style="color: ${color}; margin-top: 0; margin-bottom: 10px; font-size: 0.95rem;">${tipTitle}</h4>
            <p style="font-style: italic; color: rgba(255,255,255,0.9); margin-bottom: 10px;">${tipQuote}</p>
            <p>${tipBody}</p>
            <p style="margin-top: 10px; font-weight: 600; color: ${color};">${techTip}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 3) {
    const title = lang === 'ENG' ? '⚡️ How to Use the Market Dominance Panel' : (lang === 'UKR' ? '⚡️ Як використовувати панель Market Dominance' : '⚡️ Как использовать панель Market Dominance');
    const intro = lang === 'ENG'
      ? 'This panel is your primary capital sentiment indicator. It shows where the money is flowing: into the safe-haven asset (Bitcoin) or into riskier assets (Altcoins).'
      : (lang === 'UKR'
        ? 'Ця панель — ваш головний індикатор настроїв капіталу. Вона показує, куди течуть гроші: у захисний актив (Bitcoin) чи в ризикові активи (Альти).'
        : 'Эта панель — ваш главный индикатор настроения капитала. Она показывает, куда текут деньги: в защитный актив (Bitcoin) или в рисковые активы (Альты).');
    const point1Title = lang === 'ENG' ? '1. What to look for in the table (Market Share)' : (lang === 'UKR' ? '1. Що шукати в таблиці (Market Share)' : '1. Что искать в таблице (Market Share)');
    const point1Desc = lang === 'ENG'
      ? 'The top widget displays each coin\'s percentage share of the total crypto market.'
      : (lang === 'UKR'
        ? 'Верхній віджет відображає відсоткову частку кожної монети від усього крипторинку.'
        : 'Верхний виджет отображает процентную долю каждой монеты от всего крипторынка.');
    const point1List = lang === 'ENG'
      ? `<li><strong>Rising BTC Dominance:</strong> Money is exiting altcoins and flowing into Bitcoin. This typically happens during a market drop (panic) or at the start of a massive bull rally.</li>
         <li><strong>Falling BTC Dominance:</strong> The start of "Altseason." Investors are taking profits from Bitcoin and rotating them into ETH, SOL, and XRP, triggering explosive growth.</li>`
      : (lang === 'UKR'
        ? `<li><strong>Ріст BTC Dominance:</strong> Гроші виходять з альткоїнів і перетікають у біткоїн. Зазвичай це відбувається під час падіння ринку (паніка) або на початку потужного бичачого ралі.</li>
           <li><strong>Падіння BTC Dominance:</strong> Початок «Альтсезову». Інвестори фіксують прибуток у біткоїні та перекладають його в ETH, SOL та XRP, що викликає їхнє бурхливе зростання.</li>`
        : `<li><strong>Рост BTC Dominance:</strong> Деньги выходят из альткоинов и перетекают в биткоин. Обычно это происходит при падении рынка (паника) или в начале мощного бычьего ралли.</li>
           <li><strong>Падение BTC Dominance:</strong> Начало «Альтсезона». Инвесторы фиксируют прибыль в биткоине и перекладывают её в ETH, SOL и XRP, что вызывает их бурный рост.</li>`);
    const point2Title = lang === 'ENG' ? '2. How to read Sentiment Analysis' : (lang === 'UKR' ? '2. Як читати Sentiment Analysis' : '2. Как читать Sentiment Analysis');
    const point2Desc = lang === 'ENG'
      ? 'The bottom widget is a technical compass for the Bitcoin Dominance Index ($BTC.D).'
      : (lang === 'UKR'
        ? 'Нижній віджет — це технічний компас для індексу домінації біткоїна (<strong>$BTC.D</strong>).'
        : 'Нижний виджет — это технический компас для индекса доминации биткоина (<strong>$BTC.D</strong>).');
    const point2List = lang === 'ENG'
      ? `<li><strong>Strong Buy Zone:</strong> Expect dominance to rise. Altcoins may weaken relative to BTC. Exercise caution with long positions on alts.</li>
         <li><strong>Strong Sell Zone:</strong> An ideal signal for altcoins. Dominance is falling, creating space for Solana, Ethereum, and other assets to surge.</li>`
      : (lang === 'UKR'
        ? `<li><strong>Зона «Активно купувати» (Strong Buy):</strong> Очікується зростання домінації. Альткоїни можуть слабшати відносно BTC. Рекомендується обережність із довгими позиціями по альтах.</li>
           <li><strong>Зона «Активно продавати» (Strong Sell):</strong> Ідеальний сигнал для альткоїнів. Домінація падає, звільняючи простір для зростання Solana, Ethereum та інших активів.</li>`
        : `<li><strong>Зона «Активно покупать» (Strong Buy):</strong> Ожидается рост доминации. Альткоины могут слабеть относительно BTC. Рекомендуется осторожность с длинными позициями по альтам.</li>
           <li><strong>Зона «Активно продавать» (Strong Sell):</strong> Идеальный сигнал для альткоинов. Доминация падает, освобождая пространство для роста Solana, Ethereum и других активов.</li>`);
    const point3Title = lang === 'ENG' ? '3. The Trader\'s Golden Rule' : (lang === 'UKR' ? '3. Золоте правило трейдера' : '3. Золотое правило трейдера');
    const point3Rule = lang === 'ENG'
      ? '<strong>Profit = Falling BTC Dominance + Stable Bitcoin Price.</strong>'
      : (lang === 'UKR'
        ? '<strong>Профіт = Падіння BTC Dominance + Стабільна ціна Біткоїна.</strong>'
        : '<strong>Профит = Падение BTC Dominance + Стабильная цена Биткоина.</strong>');
    const point3Desc = lang === 'ENG'
      ? 'If the bottom widget shows a "Sell" signal for dominance while Bitcoin\'s price is sideways or slowly rising, it’s a "green light" to enter the strongest altcoins from the list above.'
      : (lang === 'UKR'
        ? 'Якщо ви бачите, що нижній віджет показує сигнал «Продавати» по домінації, а ціна самого Біткоїна при цьому стоїть на місці або плавно зростає — це «зелене світло» для входу в найсильніші альткоїни зі списку вище.'
        : 'Если вы видите, что нижний виджет показывает сигнал «Продавать» по доминации, а цена самого Биткоина при этом стоит на месте или плавно растет — это «зеленый свет» для входа в наиболее сильные альткоины из списка выше.');
    const assetGuideTitle = lang === 'ENG' ? 'Asset Quick-Guide:' : (lang === 'UKR' ? 'Підказка по активах:' : 'Подсказка по активам:');
    const asset1 = lang === 'ENG' ? '<strong>Ethereum (ETH):</strong> The main health indicator of the smart contract ecosystem.' : (lang === 'UKR' ? '<strong>Ethereum (ETH):</strong> Головний індикатор здоров\'я екосистеми смарт-контрактів.' : '<strong>Ethereum (ETH):</strong> Главный индикатор здоровья экосистемы смарт-контрактов.');
    const asset2 = lang === 'ENG' ? '<strong>Solana (SOL) / BNB:</strong> Indicators of speculative interest and on-chain activity.' : (lang === 'UKR' ? '<strong>Solana (SOL) / BNB:</strong> Індикатори спекулятивного інтересу та активності в мережах.' : '<strong>Solana (SOL) / BNB:</strong> Индикаторы спекулятивного интереса и активности в сетях.');
    const asset3 = lang === 'ENG' ? '<strong>XRP:</strong> Often moves against the market based on legal news.' : (lang === 'UKR' ? '<strong>XRP:</strong> Часто рухається проти ринку на тлі юридичних новин.' : '<strong>XRP:</strong> Часто двигается против рынка на фоне юридических новостей.');

    return `
      <div style="display: flex; flex-direction: row; gap: 40px; width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; flex: 0.8; margin: 0; min-height: unset; height: 100%;">
          <iframe src="/dominance-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
        <div class="instructions-panel" style="flex: 1.2; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--detail-color, ${color}); border-radius: 14px; padding: 25px 30px; box-shadow: 0 0 30px color-mix(in srgb, ${color} 15%, transparent); overflow-y: auto; color: rgba(255,255,255,0.8); line-height: 1.6; font-size: 0.85rem; height: 100%;">
          <h3 style="color: ${color}; margin-top: 0; margin-bottom: 20px; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1.5px;">${title}</h3>
          
          <p style="margin-bottom: 20px; color: #fff; font-weight: 500;">${intro}</p>

          <h4 style="color: ${color}; margin-top: 25px; margin-bottom: 10px; font-size: 0.95rem;">${point1Title}</h4>
          <p>${point1Desc}</p>
          <ul style="padding-left: 20px; margin-bottom: 20px;">
            ${point1List}
          </ul>

          <h4 style="color: ${color}; margin-top: 25px; margin-bottom: 10px; font-size: 0.95rem;">${point2Title}</h4>
          <p>${point2Desc}</p>
          <ul style="padding-left: 20px; margin-bottom: 20px;">
            ${point2List}
          </ul>

          <h4 style="color: ${color}; margin-top: 25px; margin-bottom: 10px; font-size: 0.95rem;">${point3Title}</h4>
          <p style="background: rgba(0,255,136,0.1); padding: 10px; border-radius: 8px; border-left: 3px solid ${color};">
            ${point3Rule}
          </p>
          <p>${point3Desc}</p>

          <div style="margin-top: 30px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 10px;">
            <p><strong>${assetGuideTitle}</strong></p>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li>${asset1}</li>
              <li>${asset2}</li>
              <li>${asset3}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
  if (section === 'analytics' && index === 4) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/dominance-history.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 5) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/heatmap-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 8) {
    const header = lang === 'ENG' ? '📊 OI & Funding Terminal: Left Axis' : (lang === 'UKR' ? '📊 OI & Funding Terminal: Left Axis' : '📊 OI & Funding Terminal Left Axis');
    const guideTitle = lang === 'ENG' ? '🛠 Quick User Guide' : (lang === 'UKR' ? '🛠 Коротка інструкція' : '🛠 Краткая инструкция');
    
    const panelTitle = lang === 'ENG' ? 'Top Panel (BTC OI):' : (lang === 'UKR' ? 'Верхня панель (BTC OI):' : 'Верхняя панель (BTC OI):');
    const panelDesc = lang === 'ENG' 
      ? 'Displays the total value of all open positions (Long + Short) for Bitcoin in millions of dollars ($M).'
      : (lang === 'UKR' 
        ? 'Відображає сукупну вартість усіх відкритих позицій (Long + Short) по Біткоїну в мільйонах доларів ($M).'
        : 'Отображает совокупную стоимость всех открытых позиций (Long + Short) по Биткоину в миллионах долларов ($M).');

    const chartRise = lang === 'ENG' ? '<strong>Rising Chart:</strong> New capital and aggressive players are entering the market.' : (lang === 'UKR' ? '<strong>Зростання графіка:</strong> В ринок заходять нові гроші та агресивні гравці.' : '<strong>Рост графика:</strong> В рынок заходят новые деньги и агрессивные игроки.');
    const chartFall = lang === 'ENG' ? '<strong>Falling Chart:</strong> Mass liquidations or profit-taking (exiting to cash) are occurring.' : (lang === 'UKR' ? '<strong>Падіння графіка:</strong> Відбуваються масові ліквідації або фіксація прибутку (вихід у кеш).' : '<strong>Падение графика:</strong> Происходят массовые ликвидации или фиксация прибыли (выход в кэш).');

    const fundingTitle = lang === 'ENG' ? 'Funding Rate:' : (lang === 'UKR' ? 'Ставка фінансування (Funding Rate):' : 'Funding Rate (Ставка финансирования):');
    const fundPos = lang === 'ENG' 
      ? '<strong style="color: #10b981;">Positive (Green):</strong> Longs pay Shorts. The market is bullish, but potential overheating is possible.'
      : (lang === 'UKR'
        ? '<strong style="color: #10b981;">Позитивна (Зелена):</strong> Лонги платять шортам. Ринок налаштований по-бичачому, але можливий перегрів.'
        : '<strong style="color: #10b981;">Положительная (Зеленая):</strong> Лонги платят шортам. Рынок настроен по-бычьи, но возможен перегрев.');
    const fundNeg = lang === 'ENG'
      ? '<strong style="color: #ef4444;">Negative (Red):</strong> Shorts pay Longs. Pessimism prevails; watch out for a potential "short squeeze."'
      : (lang === 'UKR'
        ? '<strong style="color: #ef4444;">Негативна (Червона):</strong> Шорти платять лонгам. На ринку переважає песимізм, можливий «шорт-сквіз».'
        : '<strong style="color: #ef4444;">Отрицательная (Красная):</strong> Шорты платят лонгам. На рынке преобладает пессимизм, возможен «шорт-сквиз».');

    const altTable = lang === 'ENG'
      ? '<strong>Altcoin Table:</strong> Shows the TOP 10 coins by trading volume over the last 24 hours (excluding BTC). This is your indicator of where liquidity is rotating right now.'
      : (lang === 'UKR'
        ? '<strong>Таблиця альткоїнів:</strong> Показує ТОП-10 монет за обсягом торгів за останні 24 години (виключаючи BTC). Це ваш індикатор того, куди перетікає ліквідність прямо зараз.'
        : '<strong>Таблица альткоинов:</strong> Показывает ТОП-10 монет по объему торгов за последние 24 часа (исключая BTC). Это ваш индикатор того, куда перетекает ликвидность прямо сейчас.');

    const tipTitle = lang === 'ENG' ? '💡 Tip from Gemini' : (lang === 'UKR' ? '💡 Порада від Gemini' : '💡 Совет от Gemini');
    const tipIntro = lang === 'ENG' 
      ? 'Use this widget to spot divergences. This is one of the most reliable signals in crypto trading:'
      : (lang === 'UKR'
        ? 'Використовуйте цей віджет для пошуку дивергенцій (розбіжностей). Це один із найнадійніших сигналів у криптотрейдингу:'
        : 'Используйте этот виджет для поиска дивергенций (расхождений). Это один из самых надежных сигналов в криптотрейдинге:');

    const dangerSig = lang === 'ENG'
      ? '<strong>"Danger Signal":</strong> If the BTC price is rising sharply while the Open Interest (OI) chart begins to fall, it’s a sign that the rally is driven by short-covering (liquidations) rather than new buying pressure. Such moves are often exhausted quickly and lead to a reversal.'
      : (lang === 'UKR'
        ? '<strong>«Сигнал Небезпеки»:</strong> Якщо ціна BTC активно зростає, а графік Open Interest (OI) у віджеті починає падати — це ознака того, що зростання йде на закритті шортів (ліквідаціях), а не на нових покупках.'
        : '<strong>«Сигнал Опасности»:</strong> Если цена BTC активно растет, а график Open Interest (OI) в виджете начинает падать — это признак того, что рост идет на закрытии шортов (ликвидациях), а не на новых покупках. Такой рост часто бывает ложным и быстро заканчивается разворотом.');

    const strengthSig = lang === 'ENG'
      ? '<strong>"Strength Signal":</strong> If the price remains stagnant while OI starts to surge, it means major players are accumulating positions within a tight range. Expect a powerful impulsive move in the coming hours.'
      : (lang === 'UKR'
        ? '<strong>«Сигнал Сили»:</strong> Якщо ціна стоїть на місці, а OI починає різко зростати — значить, великі гравці набирають позицію у вузькому діапазоні. Чекайте потужного імпульсу в найближчі години.'
        : '<strong>«Сигнал Силы»:</strong> Если цена стоит на месте, а OI начинает резко расти — значит, крупные игроки набирают позицию в узком диапазоне. Ждите мощного импульса в ближайшие часы.');

    return `
      <div style="display: flex; flex-direction: row; gap: 40px; width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; flex: 0.8; margin: 0; min-height: unset; height: 100%;">
          <iframe src="/oi-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
        <div class="instructions-panel" style="flex: 1.2; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--detail-color, ${color}); border-radius: 14px; padding: 25px 30px; box-shadow: 0 0 30px color-mix(in srgb, ${color} 15%, transparent); overflow-y: auto; color: rgba(255,255,255,0.8); line-height: 1.6; font-size: 0.85rem; height: 100%;">
          <h3 style="color: ${color}; margin-top: 0; margin-bottom: 20px; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1.5px;">${header}</h3>
          
          <h4 style="color: ${color}; margin-top: 25px; margin-bottom: 15px; font-size: 0.95rem; text-transform: uppercase;">${guideTitle}</h4>
          <p><strong>${panelTitle}</strong> ${panelDesc}</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>${chartRise}</li>
            <li>${chartFall}</li>
          </ul>

          <p><strong>${fundingTitle}</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>${fundPos}</li>
            <li>${fundNeg}</li>
          </ul>

          <p>${altTable}</p>

          <div style="margin-top: 30px; padding: 20px; background: rgba(0, 255, 136, 0.05); border-radius: 12px; border: 1px dashed ${color};">
            <h4 style="color: ${color}; margin-top: 0; margin-bottom: 10px; font-size: 0.95rem;">${tipTitle}</h4>
            <p style="font-style: italic; color: rgba(255,255,255,0.9); margin-bottom: 10px;">${tipIntro}</p>
            <p>${dangerSig}</p>
            <p style="margin-top: 10px;">${strengthSig}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 7) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/whale-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 6) {
    const header = lang === 'ENG' ? '📊 RSI Signals PRO Scanner' : (lang === 'UKR' ? '📊 RSI Signals PRO Скенер' : '📊 RSI Signals PRO Scanner');
    
    const intro = lang === 'ENG'
      ? 'RSI Signals PRO is a high-precision analytical widget designed for instant discovery of trading opportunities in the crypto market. The tool scans the TOP 50 most liquid assets in real-time, displaying only the coins currently in critical "Overbought" or "Oversold" zones.'
      : (lang === 'UKR'
        ? 'RSI Signals PRO — це високоточний аналітичний віджет, призначений для миттєвого пошуку торгових можливостей на крипторинку. Інструмент сканує ТОП-50 найбільш ліквідних активів у реальному часі та виводить тільки ті монети, які знаходяться в критичних зонах «перекупленості» або «перепроданості».'
        : 'RSI Signals PRO — это высокоточный аналитический виджет, предназначенный для мгновенного поиска торговых возможностей на крипторынке. Инструмент сканирует ТОП-50 наиболее ликвидных активов в реальном времени и выводит только те монеты, которые находятся в критических зонах «перекупленности» или «перепроданности».');

    const guideTitle = lang === 'ENG' ? '🛠 Quick User Guide' : (lang === 'UKR' ? '🛠 Коротка інструкція' : '🛠 Краткая инструкция пользователя');
    
    const point1 = lang === 'ENG'
      ? '<strong>1. Select Timeframe:</strong> Use the buttons at the top (5M, 1H, 1D) to switch between strategies:'
      : (lang === 'UKR'
        ? '<strong>1. Вибір таймфрейму:</strong> Використовуйте кнопки у верхній частині віджета (5M, 1H, 1D) для перемикання між стратегіями:'
        : '<strong>1. Выбор таймфрейма:</strong> Используйте кнопки в верхней части виджета (5M, 1H, 1D) для переключения между стратегиями:');

    const p1List = lang === 'ENG'
      ? `<li><strong>5M:</strong> For scalping and fast day trading.</li>
         <li><strong>1H:</strong> For intraday and mid-term trades.</li>
         <li><strong>1D:</strong> For assessing global trend reversals.</li>`
      : (lang === 'UKR'
        ? `<li><strong>5M:</strong> Для скальпінгу та швидкої внутрішньоденної торгівлі.</li>
           <li><strong>1H:</strong> Для середньострокових угод (інтрадей).</li>
           <li><strong>1D:</strong> Для оцінки глобальних розворотів тренду.</li>`
        : `<li><strong>5M:</strong> Для скальпинга и быстрой внутридневной торговли.</li>
           <li><strong>1H:</strong> Для среднесрочных сделок (интрадей).</li>
           <li><strong>1D:</strong> Для оценки глобальных разворотов тренда.</li>`);

    const point2 = lang === 'ENG'
      ? '<strong>2. Progress Monitoring:</strong> The blue bar under the header shows the status of the current market scan.'
      : (lang === 'UKR'
        ? '<strong>2. Моніторинг прогресу:</strong> Синя смуга під заголовком показує статус поточного сканування ринку.'
        : '<strong>2. Мониторинг прогресса:</strong> Синяя полоса под заголовком показывает статус текущего сканирования рынка.');

    const point3Title = lang === 'ENG' ? '<strong>3. Reading Signals:</strong>' : (lang === 'UKR' ? '<strong>3. Читання сигналів:</strong>' : '<strong>3. Чтение сигналов:</strong>');
    
    const p3List = lang === 'ENG'
      ? `<li><strong style="color: #10b981;">Green (Oversold):</strong> RSI is below 30. The coin is oversold. A technical bounce upward is likely.</li>
         <li><strong style="color: #ef4444;">Red (Overbought):</strong> RSI is above 70. The coin is overheated. A correction or downward reversal is likely.</li>`
      : (lang === 'UKR'
        ? `<li><strong style="color: #10b981;">Зелений колір (Oversold):</strong> RSI нижче 30. Монета перепродана. Ймовірний технічний відскок вгору.</li>
           <li><strong style="color: #ef4444;">Червоний колір (Overbought):</strong> RSI вище 70. Монета перегріта. Ймовірна корекція або розворот вниз.</li>`
        : `<li><strong style="color: #10b981;">Зеленый цвет (Oversold):</strong> RSI ниже 30. Монета перепродана. Вероятен технический отскок вверх.</li>
           <li><strong style="color: #ef4444;">Красный цвет (Overbought):</strong> RSI выше 70. Монета перегрета. Вероятна коррекция или разворот вниз.</li>`);

    const point4 = lang === 'ENG'
      ? '<strong>4. Filtering:</strong> The widget automatically hides "market noise" (neutral coins), leaving only active signals.'
      : (lang === 'UKR'
        ? '<strong>4. Фільтрація:</strong> Віджет автоматично приховує «ринковий шум» (нейтральні монети), залишаючи тільки активні сигнали.'
        : '<strong>4. Фильтрация:</strong> Виджет автоматически скрывает «рыночный шум» (нейтральные монеты), оставляя только активные сигнали.');

    const tipTitle = lang === 'ENG' ? '💡 Tip from Gemini' : (lang === 'UKR' ? '💡 Порада від Gemini' : '💡 Совет от Gemini');
    const tipQuote = lang === 'ENG' ? '«Remember, RSI is not a command to act, but context.»' : (lang === 'UKR' ? '«Пам\'ятай, що RSI — це не наказ до дії, а контекст.»' : '«Помни, что RSI — это не приказ к действию, а контекст.»');
    
    const tipText = lang === 'ENG'
      ? 'The most powerful signals occur not just when touching the 30 or 70 zones, but when exiting them. If a coin stays below 30 for a long time (extreme oversold), it may indicate a strong downtrend — don\'t rush to "catch a falling knife" without volume confirmation or chart patterns.'
      : (lang === 'UKR'
        ? 'Найпотужніші сигнали виникають не просто при торканні зон 30 або 70, а при виході з них. Якщо монета довго перебуває в зоні нижче 30 (екстремальна перепроданість), це може вказувати на сильний спадний тренд — не поспішай «ловити падаючий ніж» без підтвердження обсягами або патернами на графіку.'
        : 'Самые мощные сигналы возникают не просто при касании зон 30 или 70, а при выходе из них. Если монета долго находится в зоне ниже 30 (экстремальная перепроданность), это может указывать на сильный нисходящий тренд — не спеши "ловить падающий нож" без подтверждения объемами или паттернами на графике.');

    const masterRule = lang === 'ENG'
      ? 'Golden Rule: Combine RSI readings with support and resistance levels. If RSI < 30 coincides with a touch of a key historical support level, the probability of a successful bounce increases significantly!'
      : (lang === 'UKR'
        ? 'Золоте правило: Поєднуй показання RSI з рівнями підтримки та опору. Якщо RSI < 30 збігається з торканням важливого історичного рівня підтримки — ймовірність успішного відскоку зростає в рази!'
        : 'Золотое правило: Сочетай показания RSI с уровнями поддержки и сопротивления. Если RSI < 30 совпадает с касанием важного исторического уровня поддержки — вероятность успешного отскока возрастает в разы!');

    return `
      <div style="display: flex; flex-direction: row; gap: 40px; width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; flex: 0.8; margin: 0; min-height: unset; height: 100%;">
          <iframe src="/rsi-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
        <div class="instructions-panel" style="flex: 1.2; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--detail-color, ${color}); border-radius: 14px; padding: 25px 30px; box-shadow: 0 0 30px color-mix(in srgb, ${color} 15%, transparent); overflow-y: auto; color: rgba(255,255,255,0.8); line-height: 1.6; font-size: 0.85rem; height: 100%;">
          <h3 style="color: ${color}; margin-top: 0; margin-bottom: 20px; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1.5px;">${header}</h3>
          
          <p style="margin-bottom: 20px; color: #fff; font-weight: 500;">${intro}</p>

          <h4 style="color: ${color}; margin-top: 25px; margin-bottom: 15px; font-size: 0.95rem; text-transform: uppercase;">${guideTitle}</h4>
          
          <p>${point1}</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            ${p1List}
          </ul>

          <p>${point2}</p>

          <p>${point3Title}</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            ${p3List}
          </ul>

          <p>${point4}</p>

          <div style="margin-top: 30px; padding: 20px; background: rgba(0, 255, 136, 0.05); border-radius: 12px; border: 1px dashed ${color};">
            <h4 style="color: ${color}; margin-top: 0; margin-bottom: 10px; font-size: 0.95rem;">${tipTitle}</h4>
            <p style="font-style: italic; color: rgba(255,255,255,0.9); margin-bottom: 10px;">${tipQuote}</p>
            <p>${tipText}</p>
            <p style="margin-top: 10px; font-weight: 600; color: ${color};">${masterRule}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 9) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/smart-suite-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 10) {
    return `
      <section id="stx-terminal" style="margin: 0; padding: 0; height: calc(100vh - 120px); display: flex; flex-direction: column; position: relative; font-family: 'Inter', sans-serif; width: calc(100% - 60px); margin: 0 auto;">
          
          <div style="background: #0f172a; border: 1px solid #1e293b; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; box-shadow: 0 0 30px rgba(59, 130, 246, 0.15);">
              
              <div style="padding: 15px 20px; border-bottom: 1px solid #1e293b; background: #1e293b; display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 10px #3b82f6; animation: stx-pulse 2s infinite;"></div>
                      <h3 style="color: #f9fafb; margin: 0; font-size: 14px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; font-family: 'Orbitron', sans-serif;">
                          Market Intelligence Terminal
                      </h3>
                  </div>
                  
                  <button onclick="document.getElementById('stx-modal').style.display='flex'" style="
                      background: #3b82f6; color: white; border: none; padding: 8px 18px; 
                      border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;
                      transition: 0.3s; box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
                      text-transform: uppercase; letter-spacing: 1px;
                  " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                      📊 TERMINAL GUIDE
                  </button>
              </div>

              <div style="flex-grow: 1; width: 100%; background: #111827;">
                  <iframe 
                      src="https://www.tradingview-widget.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%2C%22currencyFilter%22%3A%22USD%2CEUR%2CJPY%2CGBP%2CAUD%2CCAD%2CCHF%22%7D" 
                      width="100%" height="100%" frameborder="0" style="border: none; min-height: 500px;">
                  </iframe>
              </div>
          </div>

          <div id="stx-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(10px);">
              <div style="background: #1e293b; border: 1px solid #3b82f6; width: 95%; max-width: 600px; padding: 35px; border-radius: 20px; position: relative; color: #f1f5f9; max-height: 85vh; overflow-y: auto; box-shadow: 0 0 50px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 20px;">
                  <button onclick="document.getElementById('stx-modal').style.display='none'" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 32px; height: 32px; color: #64748b; font-size: 16px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.color='#fff'; this.style.borderColor='#3b82f6'" onmouseout="this.style.color='#64748b'; this.style.borderColor='rgba(255,255,255,0.1)'">✕</button>

                  <h2 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; text-transform: uppercase; font-family: 'Orbitron', sans-serif; letter-spacing: 2px;">
                      Инструкция терминала
                  </h2>
                  
                  <div style="margin-top: 10px; background: rgba(59, 130, 246, 0.1); padding: 18px; border-left: 4px solid #3b82f6; border-radius: 8px;">
                      <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #3b82f6; text-transform: uppercase; font-weight: 800;">🕒 Настройка времени</h4>
                      <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6;">
                          По умолчанию отображается <b>ваше местное время</b>. Чтобы сверить пояс или переключить на UTC, нажмите на иконку шестеренки внутри виджета или проверьте настройки вашей системы.
                      </p>
                  </div>

                  <h4 style="margin: 10px 0 0px 0; font-size: 14px; color: #38bdf8; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">📊 Значение колонок:</h4>
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                      <div style="background: #0f172a; padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                          <div style="color: #f1f5f9; font-size: 11px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px;">ACTUAL</div>
                          <div style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Текущий факт. Выходит в момент события.</div>
                      </div>
                      <div style="background: #0f172a; padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                          <div style="color: #f1f5f9; font-size: 11px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px;">FORECAST</div>
                          <div style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Прогноз аналитиков. Рынок уже учел его в цене.</div>
                      </div>
                      <div style="background: #0f172a; padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                          <div style="color: #f1f5f9; font-size: 11px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px;">PREVIOUS</div>
                          <div style="font-size: 10px; color: #94a3b8; line-height: 1.4;">Данные прошлого периода для сравнения.</div>
                      </div>
                  </div>

                  <h4 style="margin: 10px 0 0px 0; font-size: 14px; color: #38bdf8; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">🔥 Уровни волатильности:</h4>
                  <div style="display: flex; flex-direction: column; gap: 15px;">
                      <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px;">
                          <div style="min-width: 70px; height: 26px; background: #ef4444; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #fff; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">HIGH</div>
                          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;"><b>Критично:</b> Ставки ФРС, инфляция (CPI/PCE). Возможны резкие движения BTC.</div>
                      </div>
                      <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px;">
                          <div style="min-width: 70px; height: 26px; background: #f59e0b; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #fff; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);">MEDIUM</div>
                          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;"><b>Умеренно:</b> Речи чиновников, индексы PMI. Влияют на внутридневной тренд.</div>
                      </div>
                      <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px;">
                          <div style="min-width: 70px; height: 26px; background: #64748b; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #f1f5f9;">LOW</div>
                          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;"><b>Низко:</b> Второстепенные отчеты. Обычно не меняют рыночную ситуацию значительно.</div>
                      </div>
                  </div>

                  <button onclick="document.getElementById('stx-modal').style.display='none'" style="margin-top: 15px; width: 100%; padding: 16px; background: #3b82f6; border: none; border-radius: 12px; color: white; font-weight: 800; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);" onmouseover="this.style.background='#2563eb'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#3b82f6'; this.style.transform='translateY(0)'">ПОНЯТНО</button>
              </div>
          </div>
      </section>

      <style>
          @keyframes stx-pulse {
              0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
              70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
              100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          /* Стили скроллбара для модального окна */
          #stx-modal .content-container::-webkit-scrollbar { width: 6px; }
          #stx-modal .content-container::-webkit-scrollbar-track { background: #111827; }
          #stx-modal .content-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      </style>
    `;
  }

  if (section === 'analytics' && index === 11) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/binance-futures-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 12) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/ai-forecast-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }



  return `
    ${section === 'analytics' ? '' : `
      <div class="detail-header-block" style="--detail-color: ${color}">
        <div class="detail-index">${String(index).padStart(2, '0')}</div>
        <div class="detail-info">
          <div class="detail-item-title">${item.title}</div>
          <div class="detail-item-desc">${item.desc}</div>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-stat-card">
          <div class="stat-label">СТАТУС</div>
          <div class="stat-value" style="color: ${color}">АКТИВЕН</div>
        </div>
        <div class="detail-stat-card">
          <div class="stat-label">ПРИОРИТЕТ</div>
          <div class="stat-value" style="color: ${color}">#${index}</div>
        </div>
        <div class="detail-stat-card">
          <div class="stat-label">МОДУЛЬ</div>
          <div class="stat-value" style="color: ${color}">${section.toUpperCase()}</div>
        </div>
        <div class="detail-stat-card">
          <div class="stat-label">ОБНОВЛЁН</div>
          <div class="stat-value" style="color: ${color}">LIVE</div>
        </div>
      </div>
    `}
    <div class="detail-chart-placeholder" style="--detail-color: ${color}">
      <div class="chart-scan-line" style="background: linear-gradient(90deg, transparent, ${color}30, transparent)"></div>
      <span class="chart-label" style="color: ${color}">ДАННЫЕ ЗАГРУЖАЮТСЯ...</span>
    </div>
  `;
}

// Dynamic Effects
function initEffects() {
  document.addEventListener('mousemove', (e) => {
    const home = document.getElementById('home');
    if (home && !home.classList.contains('hidden-home')) {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      // Subtle parallax on background
      home.style.backgroundPosition = `${50 + (x - 0.5) * 2}% ${50 + (y - 0.5) * 2}%`;
    }
  });
}

// Modal Logic
window.toggleModal = function (show) {
  const modal = document.getElementById('system-modal');
  if (!modal) return;

  if (show) {
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
  } else {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 400);
  }
}

// Language Selection Logic
window.selectLanguage = function (langCode) {
  const langDisplay = document.getElementById('current-lang');
  const options = document.querySelectorAll('.lang-option');

  const translations = {
    'ENG': {
      button: 'Eng.',
      options: ['Eng.', 'Rus.', 'Ukr.'],
      navAnalytics: 'Analytics',
      navAbout: 'About us'
    },
    'RUS': {
      button: 'Рус.',
      options: ['Анг.', 'Рус.', 'Укр.'],
      navAnalytics: 'Аналитика',
      navAbout: 'О проекте'
    },
    'UKR': {
      button: 'Укр.',
      options: ['Анг.', 'Рос.', 'Укр.'],
      navAnalytics: 'Аналітика',
      navAbout: 'Про проект'
    }
  };

  const current = translations[langCode];
  if (!current) return;

  if (langDisplay) {
    langDisplay.textContent = current.button;
  }

  // Update navigation buttons
  const navAnalytics = document.getElementById('nav-analytics');
  const navAbout = document.getElementById('nav-about');
  if (navAnalytics) navAnalytics.textContent = current.navAnalytics;
  if (navAbout) navAbout.textContent = current.navAbout;

  // Update Subpage Titles & Back Buttons
  const analyticsTitle = document.querySelector('#analytics h2');
  if (analyticsTitle) analyticsTitle.textContent = current.navAnalytics;

  const aboutTitle = document.querySelector('#about h2');
  if (aboutTitle) aboutTitle.textContent = current.navAbout === 'About us' ? 'About Project' : (current.navAbout === 'О проекте' ? 'О проекте' : 'Про проект');

  const backBtns = document.querySelectorAll('.back-btn');
  backBtns.forEach(btn => {
    if (btn.id === 'detail-back-btn') {
      btn.textContent = langCode === 'RUS' ? '← НАЗАД' : (langCode === 'UKR' ? '← НАЗАД' : '← BACK');
    } else {
      btn.textContent = langCode === 'RUS' ? 'НА ГЛАВНУЮ' : (langCode === 'UKR' ? 'НА ГОЛОВНУ' : 'TO HOME');
    }
  });

  // Update labels and selection highlight in the menu
  const langCodes = ['ENG', 'RUS', 'UKR'];
  options.forEach((opt, index) => {
    opt.textContent = current.options[index];

    if (langCodes[index] === langCode) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });

  // Save to localStorage so iframes can pick it up
  localStorage.setItem('selectedLanguage', langCode);

  // Refresh detail body if open
  const detailPage = document.getElementById('detail-page');
  if (detailPage && detailPage.classList.contains('active') && detailOrigin && currentDetailIndex) {
    const config = detailConfig[detailOrigin];
    const item = config.items[currentDetailIndex - 1];
    
    // Refresh title
    let label = config.label;
    if (langCode === 'ENG') {
      if (detailOrigin === 'analytics') label = 'ANALYTICS';
    } else if (langCode === 'UKR') {
      if (detailOrigin === 'analytics') label = 'АНАЛІТИКА';
    }
    document.getElementById('detail-title').textContent = `${label} — ${item.title}`;
    
    // Refresh body
    document.getElementById('detail-body').innerHTML = buildDetailBody(detailOrigin, currentDetailIndex, item, langCode);
  }

  // Close the dropdown after selection
  toggleModal(false);
}

// Global ESC listener for modal & details
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('system-modal');
    if (modal && modal.classList.contains('active')) {
      toggleModal(false);
    } else if (document.getElementById('detail-page').classList.contains('active')) {
      closeDetail();
    }
  }
});

// Start everything
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language from localStorage
  const savedLang = localStorage.getItem('selectedLanguage') || 'RUS';
  window.selectLanguage(savedLang);

  updatePrices();
  setInterval(updatePrices, 60000);
  initEffects();
});
