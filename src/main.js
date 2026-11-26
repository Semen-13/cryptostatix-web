import './style.css'


/** * 2. ДАННЫЕ КРИПТОВАЛЮТ (TICKER)
 */
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
    console.error("Ticker Error:", error);
  }
}
setInterval(updatePrices, 60000);
updatePrices();

/** * 3. КОНФИГУРАЦИЯ АНАЛИТИКИ
 */
const cheatSheetTopics = [
  {
    id: 'fear-greed',
    title: {
      ENG: 'Fear & Greed Index',
      RUS: 'Индекс страха и жадности',
      UKR: 'Індекс страху та жадібності'
    },
    text: {
      ENG: 'A market-sentiment index measuring the emotional state of cryptocurrency participants on a scale from 0 to 100.',
      RUS: 'Индикатор рыночных настроений криптовалютных участников, оценивающий эмоциональное состояние рынка по шкале от 0 до 100.',
      UKR: 'Індикатор ринкових настроїв учасників криптовалютного ринку, який оцінює емоційний стан ринку за шкалою від 0 до 100.'
    },
    details: {
      ENG: [
        { label: 'Scale', text: '0–24: Extreme Fear; 25–44: Fear; 45–55: Neutral; 56–75: Greed; 76–100: Extreme Greed.' },
        { label: 'How it is calculated', text: 'The classical approach combines market indicators with fixed weights: volatility (25%), market momentum and volume (25%), social-media activity (15%), market surveys (15%), Bitcoin dominance (10%), and Google Trends (10%). Exact components and weightings may differ by data provider. The normalized components are combined into a single 0–100 score.' },
        { label: 'How to use it', text: 'Use the index as a sentiment filter, not as a trading signal. Extreme Fear may indicate panic or oversold conditions; Extreme Greed may indicate excessive optimism or a crowded market. Check the trend over several days, the BTC chart, structure, volume, funding, and your entry setup before making a decision.' },
        { label: 'Typical context', text: 'The index is most useful for contrarian analysis: in persistent fear, reduce risk and look for confirmed buying opportunities; in persistent greed, tighten risk and look for confirmed selling or profit-taking zones. One-day readings can be caused by news and should not be traded in isolation.' },
        { label: 'Limitations', text: 'It does not predict price with certainty and is not a complete valuation model. The index is lagging and derived from multiple indirect signals, so always combine it with technical and fundamental confirmation.' }
      ],
      RUS: [
        { label: 'Шкала', text: '0–24 — крайний страх; 25–44 — страх; 45–55 — нейтрально; 56–75 — жадность; 76–100 — крайняя жадность.' },
        { label: 'Как рассчитывается', text: 'Классическая методика объединяет рыночные показатели с фиксированными весами: волатильность — 25%, рыночный импульс и объем торгов — 25%, активность в социальных сетях — 15%, опросы рынка — 15%, доминирование Bitcoin — 10%, данные Google Trends — 10%. Состав компонентов и веса могут различаться у конкретного поставщика данных. Нормализованные показатели объединяются в итоговый балл от 0 до 100.' },
        { label: 'Как использовать', text: 'Используйте индекс как фильтр настроений, а не как готовый торговый сигнал. Крайний страх может указывать на панику или перепроданность; крайняя жадность — на избыточный оптимизм или перегретый рынок. Перед решением проверяйте динамику за несколько дней, график BTC, структуру рынка, объемы, фандинг и вашу точку входа.' },
        { label: 'Практический контекст', text: 'Индекс особенно полезен для контртрендового анализа: при устойчивом страхе снижайте риск и ищите подтвержденные покупки; при устойчивой жадности ужесточайте контроль риска и рассматривайте продажу или фиксацию прибыли. Однодневный скачок нередко связан с новостями и не должен использоваться как единственный основание для сделки.' },
        { label: 'Ограничения', text: 'Индекс не предсказывает цену с гарантией и не заменяет оценку фундаментальной стоимости актива. Это агрегированный и отчасти запаздывающий показатель, поэтому его нужно сочетать с техническим и фундаментальным подтверждением.' }
      ],
      UKR: [
        { label: 'Шкала', text: '0–24 — крайній страх; 25–44 — страх; 45–55 — нейтрально; 56–75 — жадібність; 76–100 — крайня жадібність.' },
        { label: 'Як розраховується', text: 'Класична методика об’єднує ринкові показники з фіксованими вагами: волатильність — 25%, ринковий імпульс і обсяг торгів — 25%, активність у соціальних мережах — 15%, опитування ринку — 15%, домінування Bitcoin — 10%, дані Google Trends — 10%. Склад компонентів і ваги можуть відрізнятися в конкретного провайдера даних. Нормалізовані показники об’єднуються в підсумковий бал від 0 до 100.' },
        { label: 'Як використовувати', text: 'Використовуйте індекс як фільтр настроїв, а не як готовий торговий сигнал. Крайній страх може вказувати на паніку або перепроданість; крайня жадібність — на надмірний оптимізм або перегрітий ринок. Перед рішенням перевіряйте динаміку за кілька днів, графік BTC, структуру ринку, обсяги, фандинг і свою точку входу.' },
        { label: 'Практичний контекст', text: 'Індекс особливо корисний для контртрендового аналізу: за стійкого страху знижуйте ризик і шукайте підтверджені покупки; за стійкої жадібності посилюйте контроль ризику та розглядайте продаж чи фіксацію прибутку. Одноденний стрибок часто пов’язаний із новинами і не має бути єдиною основою для угоди.' },
        { label: 'Обмеження', text: 'Індикатор не передбачає ціну з гарантією і не замінює оцінку фундаментальної вартості активу. Це агрегований і частково запізнілий показник, тому його слід поєднувати з технічним і фундаментальним підтвердженням.' }
      ]
    }
  },
  {
    id: 'rsi',
    title: { ENG: 'RSI (Relative Strength Index)', RUS: 'Индикатор RSI', UKR: 'Індикатор RSI' },
    text: {
      ENG: 'RSI is a momentum oscillator that compares recent average gains and losses to estimate the speed and strength of price moves. Its value ranges from 0 to 100.',
      RUS: 'RSI — осциллятор импульса, который сопоставляет средний рост и снижение цены за выбранный период, чтобы оценить скорость и силу движения. Значение находится в диапазоне от 0 до 100.',
      UKR: 'RSI — осцилятор імпульсу, який зіставляє середнє зростання та зниження ціни за вибраний період, щоб оцінити швидкість і силу руху. Значення перебуває в діапазоні від 0 до 100.'
    },
    details: {
      ENG: [
        { label: 'What it measures', text: 'RSI (Relative Strength Index), developed by J. Welles Wilder, measures the magnitude of recent upward and downward price changes. The common default is 14 bars; the period counts candles, not minutes or days. On a 15-minute chart, RSI 14 uses the last 14 candles (about 3.5 hours).' },
        { label: 'Calculation', text: 'For each bar: Gain = max(Close now − Close previous, 0); Loss = max(Close previous − Close now, 0). First average gain/loss is the arithmetic mean over n bars. Then Wilder smoothing is used: AvgGain = (previous AvgGain × (n − 1) + current Gain) / n; AvgLoss is calculated the same way. RS = AvgGain / AvgLoss; RSI = 100 − 100 / (1 + RS). The result is bounded between 0 and 100.' },
        { label: 'Classic levels', text: 'Above 70 is conventionally called overbought and below 30 oversold; 50 is a momentum midpoint. These are context zones, not automatic sell or buy instructions. In strong trends RSI can remain above 70 or below 30 for a long time. Some traders widen thresholds to 80/20 in strong trends to reduce premature counter-trend signals.' },
        { label: 'How to use it', text: 'First identify market structure and the higher-timeframe trend. In an uptrend, look for RSI holding or recovering around 40–50 and confirm with price action; in a downtrend, watch for rejection around 50–60. A move across 50 can help assess momentum. Divergence (price makes a new high while RSI makes a lower high, or vice versa) warns that momentum may be weakening, but it can persist and needs confirmation. Use RSI with levels, volume, and a defined risk plan.' },
        { label: 'Suggested chart timeframes', text: 'Scalping: 1–5 minute charts; RSI 7–9 reacts faster but is noisier, so confirm on 15-minute or higher charts. Intraday: 5-minute to 1-hour charts, commonly RSI 14. Swing trading: 4-hour to daily charts, RSI 14 or 21 for a smoother reading. Position trading: daily and weekly charts, commonly RSI 14–21. These are starting points, not universal settings; choose the timeframe that matches your holding period and test it on the asset traded.' },
        { label: 'Limitations and risk', text: 'RSI is based on past closing prices, can lag, and can give repeated false reversals in a strong trend or low-liquidity market. A single RSI reading does not predict a reversal. Confirm the setup, size positions by a preset risk limit, and never rely on RSI alone.' }
      ],
      RUS: [
        { label: 'Что измеряет', text: 'RSI (Relative Strength Index, индекс относительной силы), разработанный Дж. Уэллсом Уайлдером, измеряет величину недавних повышений и снижений цены. Стандартный период — 14 свечей: период считает свечи, а не минуты или дни. На 15-минутном графике RSI 14 учитывает последние 14 свечей (примерно 3,5 часа).' },
        { label: 'Математика расчета', text: 'Для каждой свечи: Рост = max(Текущая цена закрытия − Предыдущая цена закрытия, 0); Снижение = max(Предыдущая цена закрытия − Текущая цена закрытия, 0). Первые средние рост и снижение — это обычные средние за n свечей. Далее применяется сглаживание Уайлдера: Средний рост = (Предыдущий средний рост × (n − 1) + Текущий рост) / n; среднее снижение рассчитывается аналогично. RS = Средний рост / Среднее снижение; RSI = 100 − 100 / (1 + RS). Результат находится в пределах от 0 до 100.' },
        { label: 'Классические уровни', text: 'Выше 70 обычно называют зоной перекупленности, ниже 30 — перепроданности; уровень 50 служит серединой импульса. Это зоны для анализа, а не автоматические команды купить или продать. В сильном тренде RSI может долго оставаться выше 70 или ниже 30. Некоторые трейдеры расширяют пороги до 80/20 в сильном тренде, чтобы реже получать преждевременные контртрендовые сигналы.' },
        { label: 'Как пользоваться', text: 'Сначала определите структуру рынка и направление старшего таймфрейма. В восходящем тренде следите, удерживается ли RSI в районе 40–50 или возвращается выше, и ищите подтверждение в движении цены; в нисходящем — наблюдайте за отказом от роста в районе 50–60. Пересечение уровня 50 помогает оценить импульс. Дивергенция (цена обновляет максимум, а RSI — нет, или наоборот) предупреждает об ослаблении импульса, но может сохраняться долго и требует подтверждения. Сочетайте RSI с уровнями, объемом и заранее определенным риском.' },
        { label: 'Примерные таймфреймы', text: 'Скальпинг: графики 1–5 минут; RSI 7–9 быстрее реагирует, но дает больше шума, поэтому подтверждайте сигнал на 15-минутном или более старшем графике. Внутридневная торговля: 5 минут – 1 час, часто RSI 14. Свинг-трейдинг: 4 часа – 1 день, RSI 14 или 21 для более плавных значений. Позиционная торговля: дневной и недельный графики, обычно RSI 14–21. Это отправные настройки, а не универсальные правила: выбирайте график под предполагаемое время удержания сделки и проверяйте настройки на торгуемом активе.' },
        { label: 'Ограничения и риск', text: 'RSI основан на прошлых ценах закрытия, может запаздывать и давать повторные ложные развороты в сильном тренде или на низколиквидном рынке. Одно значение RSI не предсказывает разворот. Подтверждайте сценарий, рассчитывайте размер позиции по заранее заданному риску и не используйте RSI как единственный критерий сделки.' }
      ],
      UKR: [
        { label: 'Що вимірює', text: 'RSI (Relative Strength Index, індекс відносної сили), розроблений Дж. Веллсом Вайлдером, вимірює величину нещодавніх зростань і знижень ціни. Стандартний період — 14 свічок: він рахує свічки, а не хвилини чи дні. На 15-хвилинному графіку RSI 14 враховує останні 14 свічок (приблизно 3,5 години).' },
        { label: 'Математика розрахунку', text: 'Для кожної свічки: Зростання = max(Поточна ціна закриття − Попередня ціна закриття, 0); Зниження = max(Попередня ціна закриття − Поточна ціна закриття, 0). Перші середні зростання та зниження — це звичайні середні за n свічок. Далі застосовується згладжування Вайлдера: Середнє зростання = (Попереднє середнє зростання × (n − 1) + Поточне зростання) / n; середнє зниження обчислюється так само. RS = Середнє зростання / Середнє зниження; RSI = 100 − 100 / (1 + RS). Результат перебуває в межах від 0 до 100.' },
        { label: 'Класичні рівні', text: 'Вище 70 зазвичай називають зоною перекупленості, нижче 30 — перепроданості; рівень 50 є серединою імпульсу. Це зони для аналізу, а не автоматичні команди купити чи продати. У сильному тренді RSI може довго залишатися вище 70 або нижче 30. Деякі трейдери розширюють пороги до 80/20 у сильному тренді, щоб рідше отримувати передчасні контртрендові сигнали.' },
        { label: 'Як користуватися', text: 'Спочатку визначте структуру ринку та напрямок старшого таймфрейму. У висхідному тренді стежте, чи RSI утримується в районі 40–50 або повертається вище, і шукайте підтвердження в русі ціни; у низхідному — спостерігайте за відхиленням від зростання в районі 50–60. Перетин рівня 50 допомагає оцінити імпульс. Дивергенція (ціна оновлює максимум, а RSI — ні, або навпаки) попереджає про ослаблення імпульсу, але може зберігатися довго й потребує підтвердження. Поєднуйте RSI з рівнями, обсягом і заздалегідь визначеним ризиком.' },
        { label: 'Орієнтовні таймфрейми', text: 'Скальпінг: графіки 1–5 хвилин; RSI 7–9 реагує швидше, але дає більше шуму, тому підтверджуйте сигнал на 15-хвилинному або старшому графіку. Внутрішньоденна торгівля: 5 хвилин – 1 година, часто RSI 14. Свінг-трейдинг: 4 години – 1 день, RSI 14 або 21 для плавніших значень. Позиційна торгівля: денний і тижневий графіки, зазвичай RSI 14–21. Це початкові налаштування, а не універсальні правила: обирайте графік відповідно до очікуваного часу утримання угоди та перевіряйте налаштування на активі, яким торгуєте.' },
        { label: 'Обмеження та ризик', text: 'RSI базується на минулих цінах закриття, може запізнюватися та давати повторні хибні розвороти у сильному тренді або на низьколіквідному ринку. Одне значення RSI не передбачає розворот. Підтверджуйте сценарій, розраховуйте розмір позиції відповідно до заздалегідь визначеного ризику й не використовуйте RSI як єдиний критерій угоди.' }
      ]
    }
  },
  {
    id: 'open-interest',
    title: { ENG: 'Open Interest', RUS: 'Операционный интерес', UKR: 'Операційний інтерес' },
    text: {
      ENG: 'Open Interest is the total number of outstanding derivative contracts that have not yet been closed or settled.',
      RUS: 'Операционный интерес — это общее количество открытых деривативных контрактов, которые ещё не были закрыты или рассчитаны.',
      UKR: 'Операційний інтерес — це загальна кількість відкритих деривативних контрактів, які ще не було закрито або розраховано.'
    },
    details: {
      ENG: [
        { label: 'Definition', text: 'Open Interest (OI) is the number of currently open futures or perpetual contracts on a specific market. It counts both a long and a short position as one contract held, because both sides are created from the same contract. It is not the same as trading volume: volume counts contract transfers during a period, while OI shows how many positions remain open at a given moment.' },
        { label: 'How to read it', text: 'OI rising together with price growth suggests that new long positions are entering; it can support a bullish move, but crowded leverage increases the risk of a liquidation squeeze. OI rising with falling price suggests that new short positions are entering. If price moves while OI falls, positions are more likely being closed, so the move may be weaker or less sustainable.' },
        { label: 'Trading applications', text: 'Use OI as a confirmation and risk filter for an existing setup. Rising OI plus a breakout and increasing volume can confirm entry interest; falling OI after an impulse may indicate liquidation and profit-taking rather than a new trend. A strong divergence between OI and price, especially near key levels, can signal an approaching reversal or volatility spike.' },
        { label: 'Useful combinations', text: 'Compare OI with price, spot and futures volume, funding rate, liquidation data, and the long/short ratio. The most important time unit is a change in OI: compare the current value with the previous 1-hour, 4-hour, or daily reading. A sharp OI increase can mean new leverage, but it does not reveal whether the money is entering from the buy or sell side.' },
        { label: 'Practical example', text: 'Bitcoin rises 3%, OI rises 8%, and funding becomes strongly positive: buyers are aggressive, but the market may be long-crowded. Wait for a breakout confirmation if the setup supports continuation, or tighten risk and avoid chasing the move. If price remains near resistance while OI rises rapidly and liquidation activity increases, prepare for a failed-breakout or squeeze scenario.' },
        { label: 'Limitations', text: 'OI is a lagging aggregate and differs between exchanges. It does not show direction of individual capital or predict a reversal on its own. A high OI value is not automatically bullish or bearish; the interpretation depends on price direction, OI change, funding, volume, and market structure.' }
      ],
      RUS: [
        { label: 'Определение', text: 'Операционный интерес (Open Interest, OI) — это количество открытых фьючерсных или бессрочных контрактов на конкретном рынке. Длинная и короткая позиции считаются одной открытой парой, то есть она включает как объём обязательств покупателей, так и обязательств продавцов. OI не является объёмом торгов: объём считает совершённые сделки за период, а OI показывает, сколько контрактов остаётся открытым в данный момент.' },
        { label: 'Как читать изменение', text: 'Рост OI вместе с ростом цены означает, что в рынок входят новые длинные позиции: движение может получить поддержку, но избыточное плечо повышает риск резкой ликвидации. Рост OI на падающем рынке часто говорит о новых коротких позициях. Если цена движется, а OI снижается, прежние сделки закрываются; импульс может быть реакцией ликвидации или фиксации прибыли и не всегда устойчивым.' },
        { label: 'Применение в торговле', text: 'Используйте OI как подтверждение и фильтр риска для уже определённого сценария. Рост OI вместе с пробоем и увеличением объёма может подтверждать появление нового интереса. Снижение OI после резкого импульса может указывать на закрытие позиций и фиксацию прибыли. Несоответствие цены и OI у ключевого уровня помогает искать разворотную ловушку или сокращение риска перед высокой волатильностью.' },
        { label: 'Полезные сочетания', text: 'Сравнивайте OI с направлением цены, объёмами спота и фьючерсов, ставкой фандинга, ликвидациями и соотношением лонг/шорт. Особенно важны изменения, а не абсолютное значение: смотрите на разницу за 1 час, 4 часа и сутки. Резкий рост OI означает больше открытого плеча, но сам по себе не показывает, поступал ли капитал на стороне покупателей или продавцов.' },
        { label: 'Практический пример', text: 'Bitcoin вырос на 3%, OI увеличился на 8%, а фандинг стал резко положительным: покупатели активны, но рынок перегружен лонгами. Для продолжения нужно подтверждение пробоя, а при входе следует сократить размер позиции и контролировать риск. Если цена остановилась у сопротивления, OI продолжает расти и растёт число ликвидаций, можно готовиться к ложному пробою или сжатию позиций.' },
        { label: 'Ограничения', text: 'OI — агрегированный показатель, который может различаться на разных биржах и запаздывать на коротких таймфреймах. Он не раскрывает направление каждого капитала и не предсказывает разворот самостоятельно. Рост или высокий уровень OI не является однозначно бычьим или медвежьим признаком: оценка зависит от изменения OI, цены, фандинга, объёма и рыночной структуры.' }
      ],
      UKR: [
        { label: 'Визначення', text: 'Операційний інтерес (Open Interest, OI) — це кількість відкритих ф’ючерсних або безстрокових контрактів на конкретному ринку. Довга та коротка позиції разом рахуються як один відкритий контракт. OI не є обсягом торгів: обсяг показує виконані угоди за період, а OI — скільки контрактів залишається відкритими в певний момент.' },
        { label: 'Як читати зміну', text: 'Зростання OI разом із ростом ціни означає, що в ринок входять нові довгі позиції: рух може отримати підтримку, але надмірне плече підвищує ризик швидкої ліквідації. Зростання OI на падінні часто свідчить про нові короткі позиції. Якщо ціна рухається, а OI знижується, попередні угоди закриваються; імпульс може бути реакцією на ліквідацію або фіксацію прибутку й не завжди буде стійким.' },
        { label: 'Застосування в торгівлі', text: 'Використовуйте OI як підтвердження та фільтр ризику для вже визначеного сценарію. Ріст OI разом із пробоєм і збільшенням обсягу може підтверджувати появу нового інтересу. Зниження OI після різкого імпульсу може вказувати на закриття позицій і фіксацію прибутку. Розбіжність ціни й OI біля ключового рівня допомагає шукати пастку на розворот або скоротити ризик перед волатильністю.' },
        { label: 'Корисні поєднання', text: 'Порівнюйте OI із напрямком ціни, обсягами спотового й ф’ючерсного ринків, ставкою фандингу, ліквідаціями та співвідношенням лонг/шорт. Особливо важливо дивитися на зміну OI, а не на абсолютне значення: порівнюйте поточні дані із показниками за 1 годину, 4 години й добу. Різкий ріст OI означає більше відкритого плеча, але сам по собі не показує, чи приходить капітал на боці покупців чи продавців.' },
        { label: 'Практичний приклад', text: 'Bitcoin виріс на 3%, OI збільшився на 8%, а фандинг став різко позитивним: покупці активні, але ринок може бути перевантажений довгими позиціями. Для продовження потрібне підтвердження пробою, а під час входу варто зменшити розмір позиції та контролювати ризик. Якщо ціна зупинилася біля опору, OI продовжує рости, а ліквідації зростають, слід бути готовим до хибного пробою чи стискання позицій.' },
        { label: 'Обмеження', text: 'OI — агрегований показник, який може відрізнятися на різних біржах і запізнюватися на коротких таймфреймах. Він не показує напрямок окремого капіталу й самостійно не передбачає розворот. Ріст або високий рівень OI не є однозначно бичачим чи ведмежим знаком: оцінка залежить від зміни OI, ціни, фандингу, обсягу та ринкової структури.' }
      ]
    }
  },
  {
    id: 'funding-rate',
    title: { ENG: 'Funding Rate', RUS: 'Ставка финансирования', UKR: 'Ставка фінансування' },
    text: {
      ENG: 'The funding rate is a periodic payment between long and short perpetual-futures traders that keeps the contract price close to the spot price.',
      RUS: 'Ставка финансирования — это периодический платеж между лонгами и шортами в бессрочных фьючерсах, который удерживает цену контракта близко к спотовой цене.',
      UKR: 'Ставка фінансування — це періодичний платіж між лонгами та шортами в безстрокових ф’ючерсах, який утримує ціну контракту близько до спотової ціни.'
    },
    details: {
      ENG: [
        { label: 'Definition', text: 'Funding is a fee exchanged directly between traders who hold perpetual futures, not a fee paid to the exchange. It usually occurs every 8 hours on major derivatives exchanges, although the schedule can differ. The funding mechanism is designed to align the perpetual contract price with the underlying spot market.' },
        { label: 'How to read it', text: 'A positive funding rate means that the contract trades above spot on average and most open positions are long. Long holders pay short holders. This suggests bullish positioning, but strongly positive rates can indicate crowded leverage and a higher risk of a sharp correction. A negative rate means the contract trades below spot on average and shorts pay longs. This reflects bearish positioning and may increase the risk of a short squeeze.' },
        { label: 'Trading applications', text: 'Use funding as a sentiment and risk-management filter, not as an independent entry signal. Extreme positive funding near resistance can support a reversal or profit-taking scenario; extreme negative funding near support can support a squeeze or rebound scenario. Always confirm with price structure, Open Interest, volume, liquidations, and higher-timeframe trend.' },
        { label: 'Change over time', text: 'A changing funding rate is often more informative than one isolated value. Rising positive funding together with rising Open Interest shows that new bullish leverage is accumulating. Falling funding after a strong rally may indicate that leveraged longs are being closed. A stable, near-zero rate usually indicates a more balanced market.' },
        { label: 'Practical example', text: 'Bitcoin is at resistance, Open Interest is rising, and funding becomes strongly positive: many traders are opening or holding long positions. Avoid chasing the breakout without confirmation. A failed move above resistance, followed by long liquidations, may produce a fast decline. Conversely, during an oversold drop with strongly negative funding, repeated short liquidations and a support reversal can create a rapid rebound.' },
        { label: 'Limitations', text: 'Funding differs across exchanges and can be affected by each venue’s methodology and mark price. A positive or negative rate does not guarantee that price will move in the opposite direction. Holding a futures position incurs funding costs or provides funding income depending on position side and market conditions, so it must be included in the trade plan.' }
      ],
      RUS: [
        { label: 'Определение', text: 'Фандинг — это ставка или регулярный платеж, который лонги и шорты обменяют друг с другом при удержании бессрочного фьючерсного контракта. Это не комиссия биржи, а механизм выравнивания цены бессрочного контракта с спотовой ценой актива. На крупных биржах расчет обычно происходит каждые 8 часов, но график может отличаться.' },
        { label: 'Как читать знак', text: 'Положительная ставка означает, что фьючерс торгуется дороже спота и лонги доминируют по открытым позициям. Длинные держатели платят шортам. Это по-бычий признак, но экстремально высокая ставка может говорить о перегреве и повышенном риске принудительного закрытия лонгов. Отрицательная ставка означает, что фьючерс торгуется дешевле спота и шорты платят лонгам. Она отражает пессимизм и повышает вероятность шорт-сквиза.' },
        { label: 'Применение в торговле', text: 'Используйте ставку как фильтр настроений и риска, а не как самостоятельную торговую точку входа. Экстремально положительный фандинг у сопротивления может подтверждать сценарий разворота или фиксации прибыли. Экстремально отрицательный фандинг у поддержки может повысить вероятность отскока и закрытия шортов. Подтверждайте решение структурой цены, Операционным интересом, объемом, ликвидациями и старшим трендом.' },
        { label: 'Изменение во времени', text: 'Часто важнее не одно значение, а динамика ставки. Рост положительного фандинга вместе с ростом Операционного интереса показывает, что в рынок добавляется бычье кредитное плечо. Падение фандинга после сильного роста может означать закрытие лонгов. Значение около нуля обычно говорит о более сбалансированном рынке.' },
        { label: 'Практический пример', text: 'Bitcoin находится у сопротивления, Операционный интерес растет, а фандинг становится резко положительным: много трейдеров держат лонги. Входить в покупку на пробой лучше только с подтверждением и меньшим риском. Неудачный пробой с последующими ликвидациями лонгов может вызвать быстрое падение. При перепроданной цене, сильном отрицательном фандинге и закрытии шортов возможен резкий отскок.' },
        { label: 'Ограничения', text: 'Ставка фандинга отличается по биржам и зависит от методики расчета и цены mark price конкретной площадки. Положительное или отрицательное значение не гарантирует будущий разворот цены. Удержание фьючерсной позиции может приносить или расходовать деньги по ставке фандинга, поэтому эти выплаты необходимо учитывать в расчете риска и результата сделки.' }
      ],
      UKR: [
        { label: 'Визначення', text: 'Фандинг — це ставка або періодичний платіж, який лонги та шорти обмінюють один з одним під час утримання безстрокового ф’ючерсного контракту. Це не комісія біржі, а механізм наближення ціни ф’ючерсу до спотової ціни активу. На великих біржах розрахунок зазвичай відбувається кожні 8 годин, але графік може відрізнятися.' },
        { label: 'Як читати знак', text: 'Позитивна ставка означає, що ф’ючерс торгується дорожче споту і лонги переважають за відкритими позиціями. Довгі утримувачі платять шортам. Це бичачий ознака, але надмірно висока ставка може свідчити про перегрів і підвищений ризик примусового закриття лонгів. Негативна ставка означає, що ф’ючерс торгується дешевше споту і шорти платять лонгам. Вона відображає песимізм і підвищує ймовірність шорт-сквізу.' },
        { label: 'Застосування в торгівлі', text: 'Використовуйте ставку як фільтр настроїв і ризику, а не як самостійну точку входу. Екстремально позитивний фандинг біля опору може підтверджувати сценарій розвороту або фіксації прибутку. Екстремально негативний фандинг біля підтримки може підвищити ймовірність відскоку та закриття шортів. Підтверджуйте рішення структурою ціни, Операційним інтересом, обсягом, ліквідаціями та старшим трендом.' },
        { label: 'Зміна в часі', text: 'Часто важливіша не одна величина, а динаміка ставки. Ріст позитивного фандингу разом із ростом Операційного інтересу показує, що в ринок додається бичаче кредитне плече. Падіння фандингу після сильного зростання може означати закриття лонгів. Значення біля нуля зазвичай свідчить про більш збалансований ринок.' },
        { label: 'Практичний приклад', text: 'Bitcoin знаходиться біля опору, Операційний інтерес росте, а фандинг стає різко позитивним: багато трейдерів утримують лонги. Покупку на пробій краще відкривати лише з підтвердженням і зменшеним ризиком. Невдалий пробій із наступними ліквідаціями лонгів може спричинити швидке падіння. За перепроданої ціни, сильного негативного фандингу та закриття шортів можливий різкий відскок.' },
        { label: 'Обмеження', text: 'Ставка фандинга відрізняється на різних біржах і залежить від методики розрахунку та mark price конкретного майданчика. Позитивне чи негативне значення не гарантує майбутнього розвороту ціни. Утримання ф’ючерсної позиції може приносити або витрачати кошти за ставкою фандинга, тому виплати слід враховувати в розрахунку ризику й результату угоди.' }
      ]
    }
  },
  { id: 'trend', title: { ENG: 'Trend filter', RUS: 'Фильтр тренда', UKR: 'Фільтр тренду' }, text: { ENG: 'Trade with the dominant trend; counter-trend entries are more fragile and need stronger confirmation.', RUS: 'Торгуйте по доминирующему тренду; контртрендовые входы более хрупкие и требуют сильного подтверждения.', UKR: 'Торгуйте за домінуючим трендом; контртрендові входи більш крихкі і вимагають сильного підтвердження.' } },
  { id: 'support', title: { ENG: 'Support / resistance', RUS: 'Поддержка / сопротивление', UKR: 'Підтримка / опір' }, text: { ENG: 'Use key zones as decision areas, not as exact prices. Breaks or rejections matter more than the level itself.', RUS: 'Используйте ключевые зоны как зоны принятия решений, а не как точные цены. Пробои и отскоки важнее самой отметки.', UKR: 'Використовуйте ключові зони як зони прийняття рішень, а не як точні ціни. Прориви та відскоки важливіші за саму позначку.' } },
  { id: 'liquidity', title: { ENG: 'Liquidity sweep', RUS: 'Захват ликвидности', UKR: 'Захоплення ліквідності' }, text: { ENG: 'Many false breakouts occur as stops are hunted. Wait for confirmation after the sweep.', RUS: 'Многие ложные пробои происходят при ловле стопов. Ждите подтверждения после захвата ликвидности.', UKR: 'Багато хибних пробоїв відбуваються під час ловлі стоп-ордера. Чекайте підтвердження після захоплення ліквідності.' } },
  { id: 'fomo', title: { ENG: 'FOMO control', RUS: 'Контроль FOMO', UKR: 'Контроль FOMO' }, text: { ENG: 'When everyone is excited, step back. The best entries are often boring and delayed.', RUS: 'Когда все в экстазе, отступайте. Лучшие входы часто скучные и запоздалые.', UKR: 'Коли всі в екстазі, відступайте. Найкращі входи часто нудні та запізнілі.' } },
  { id: 'sessions', title: { ENG: 'Market sessions', RUS: 'Сессии рынка', UKR: 'Сесії ринку' }, text: { ENG: 'Liquidity rises during major sessions. Trade more carefully at low-volume hours when spread and noise are higher.', RUS: 'Ликвидность выше в важные рыночные сессии. Торгуйте осторожнее в низколиквидные часы, когда спред и шум выше.', UKR: 'Ліквідність вища в важливі ринкові сесії. Торгуйте обережніше в низьколіквідні години, коли спред і шум вищі.' } },
  { id: 'macro', title: { ENG: 'Macro context', RUS: 'Макро контекст', UKR: 'Макро контекст' }, text: { ENG: 'BTC and majors often lead the market. Check larger market structure before trading lower-cap alts.', RUS: 'BTC и мажоры часто задают рынок. Проверяйте более крупную структуру прежде чем входить в низко-капитализацию.', UKR: 'BTC та мажори часто задають ринок. Перевіряйте ширшу структуру перед входом в низько-капітальні альти.' } },
  { id: 'patterns', title: { ENG: 'Structure', RUS: 'Структура', UKR: 'Структура' }, text: { ENG: 'Look for higher highs / higher lows on uptrends and lower lows / lower highs on downtrends. Structure beats noise.', RUS: 'Смотрите на higher highs / higher lows в восходящем тренде и lower lows / lower highs в нисходящем. Структура важнее шума.', UKR: 'Дивіться на higher highs / higher lows в висхідному тренді та lower lows / lower highs в низхідному. Структура важливіша за шум.' } },
  { id: 'funding', title: { ENG: 'Funding / leverage', RUS: 'Фандинг / кредитное плечо', UKR: 'Фандинг / кредитне плече' }, text: { ENG: 'Excess leverage and funding spikes often coincide with local tops or panic bottoms. Respect crowded positioning.', RUS: 'Избыточное плечо и пики фандинга часто совпадают с локальными максимумами или паническими минимумами. Учитывайте скопление позиций.', UKR: 'Надмірне плече і піки фандингу часто збігаються з локальними максимумами або панічними мінімумами. Ураховуйте скупчення позицій.' } },
  { id: 'avoid', title: { ENG: 'What to avoid', RUS: 'Чего избегать', UKR: 'Чого уникати' }, text: { ENG: 'Avoid revenge trades, random entries, and adding on losses without an objective reason.', RUS: 'Избегайте отыгрыша, случайных входов и усугубления убытков без объективной причины.', UKR: 'Уникайте відплати, випадкових входів і поглиблення збитків без об’єктивної причини.' } },
  { id: 'review', title: { ENG: 'Trade journal', RUS: 'Журнал сделок', UKR: 'Журнал угод' }, text: { ENG: 'Review your trades weekly. The goal is not to be right every time, but to be consistent and learn patterns.', RUS: 'Проверяйте сделки еженедельно. Цель — не быть всегда правым, а быть последовательным и понимать собственные паттерны.', UKR: 'Перевіряйте угоди щотижня. Мета — не бути завжди правим, а бути послідовним і розуміти власні патерни.' } },
  { id: 'discipline', title: { ENG: 'Discipline', RUS: 'Дисциплина', UKR: 'Дисципліна' }, text: { ENG: 'The plan should define entry, exit, risk, and invalidation. Focus on a few high-quality setups instead of random trades; discipline keeps your edge alive.', RUS: 'План должен определять вход, выход, риск и отмену сценария. Сосредоточьтесь на нескольких качественных сделках вместо случайных входов — дисциплина сохраняет преимущество.', UKR: 'План повинен визначати вхід, вихід, ризик і скасування сценарію. Зосередьтеся на кількох якісних угодах замість випадкових входів — дисципліна зберігає перевагу.' } }
];

const cheatSheetUi = {
  ENG: {
    heading: 'Cheat Sheet',
    ruleLabel: 'Rule',
    rule: 'Never trade without a plan.',
    entryLabel: 'Entry',
    entry: 'Only enter when structure is confirmed.',
    executionLabel: 'Execution',
    execution: 'Execute the plan, not the impulse.'
  },
  RUS: {
    heading: 'Шпаргалка',
    ruleLabel: 'Правило',
    rule: 'Не торгуйте без плана.',
    entryLabel: 'Вход',
    entry: 'Входите только при подтверждённой структуре.',
    executionLabel: 'Исполнение',
    execution: 'Следуйте плану, а не импульсу.'
  },
  UKR: {
    heading: 'Шпаргалка',
    ruleLabel: 'Правило',
    rule: 'Не торгуйте без плану.',
    entryLabel: 'Вхід',
    entry: 'Входьте лише за підтвердженої структури.',
    executionLabel: 'Виконання',
    execution: 'Дотримуйтеся плану, а не дійте імпульсивно.'
  }
};

function buildCheatSheetDetail(topic, lang) {
  const language = cheatSheetUi[lang] || cheatSheetUi.ENG;
  const title = topic.title[lang] || topic.title.ENG;
  const text = topic.text[lang] || topic.text.ENG;
  const details = topic.details?.[lang] || topic.details?.ENG;
  const detailSections = details
    ? details.map(section => `
        <div class="cheat-detail-section">
          <strong>${section.label}:</strong>
          <span>${section.text}</span>
        </div>
      `).join('')
    : '';

  return `
    <div class="cheat-detail-panel">
      <div class="cheat-detail-heading">${language.heading}</div>
      <h3 class="cheat-detail-title">${title}</h3>
      <p class="cheat-detail-text">${text}</p>
      ${detailSections ? `<div class="cheat-detail-sections">${detailSections}</div>` : ''}
      <div class="cheat-detail-rules">
        <div><strong>${language.ruleLabel}:</strong> ${language.rule}</div>
        <div><strong>${language.entryLabel}:</strong> ${language.entry}</div>
        <div><strong>${language.executionLabel}:</strong> ${language.execution}</div>
      </div>
    </div>
  `;
}

const detailConfig = {
  analytics: {
    label: 'АНАЛИТИКА',
    labelEng: 'ANALYTICS',
    labelUkr: 'АНАЛІТИКА',
    items: [
      { title: 'Fear & Greed Terminal', desc: 'Crypto market sentiment and BTC dominance.' },
      { title: 'Global Exchange Radar', desc: 'Market trends and macro signals.' },
      { title: 'Dominance', desc: 'BTC market share analysis.' },
      { title: 'dominance(history)', desc: 'Historical BTC dominance tracking.' },
      { title: 'Heatmap', desc: 'Market cap heatmap of top 25 assets.' },
      { title: 'RSI PRO Signals', desc: 'Automatic RSI oversold/overbought detection.' },
      { title: 'Whale Terminal', desc: 'Real-time large transaction tracking.' },
      { title: 'OI Terminal', desc: 'Open Interest and Funding Rates.' },
      { title: 'Smart Suite Intelligence', desc: 'Exchange flows and liquidation heatmaps.' },
      { title: 'Market Intelligence', titleRus: 'Календарь событий', titleEng: 'Economic Calendar', titleUkr: 'Календар подій', desc: 'Economic events and volatility analysis.' },
      { title: 'Binance Futures PRO', desc: 'Pro terminal for Binance Futures.' },
      { title: 'Market Overview', titleRus: 'Обзор рынка', titleEng: 'Market Overview', titleUkr: 'Огляд ринку', desc: 'Live crypto market data and TradingView charts.' }
    ]
  },
  screeners: {
    label: 'СКРИНЕРЫ',
    labelEng: 'SCREENERS',
    labelUkr: 'СКРІНЕРИ',
    items: [
      { title: 'Grid Screener PRO', titleRus: 'Сеточный Скринер PRO', titleUkr: 'Сітковий Скринер PRO', desc: 'Real-time 3x3 multi-chart terminal' },
      { title: 'Скринер Топ-15', titleEng: 'Top-15 Screener', titleRus: 'Скринер Топ-15', titleUkr: 'Скрінер Топ-15', desc: 'Top-15 Binance Futures USDT screener.' },
      { title: 'Скринер тренда', titleEng: 'Trend Screener', titleRus: 'Скринер тренда', titleUkr: 'Скрінер тренда', desc: 'Market cap heatmap of top 25 assets.' },
      { title: 'Скринер RSI', titleEng: 'RSI Screener', titleRus: 'Скринер RSI', titleUkr: 'Скрінер RSI', desc: 'RSI screener for Binance Futures (USDT pairs).' }
    ]
  }
};

/** * 4. ЛОГИКА СТРАНИЦ (NAVIGATION)
 */
function renderDetailTitle(element, label, title, section, index, lang) {
  element.textContent = `${label} — ${title}`;
  if (section !== 'analytics' || index !== 12) return;

  const subtitle = document.createElement('span');
  subtitle.className = 'detail-title-subtitle';
  subtitle.textContent = lang === 'ENG'
    ? '(Top 100)'
    : lang === 'UKR'
      ? '(топ 100)'
      : '(топ 100)';
  element.append(' ', subtitle);
}

window.showPage = function (pageId) {
  const home = document.getElementById('home');
  const pages = document.querySelectorAll('.subpage');

  if (pageId === 'home') {
    pages.forEach(p => p.classList.remove('active'));
    setTimeout(() => {
      home.classList.remove('hidden-home');
      pages.forEach(p => p.style.display = 'none');
    }, 600);
  } else {
    const targetPage = document.getElementById(pageId);
    if (!targetPage) return;
    home.classList.add('hidden-home');
    targetPage.style.display = 'flex';
    requestAnimationFrame(() => targetPage.classList.add('active'));
  }
};

window.renderCheatSheetGrid = function () {
  const container = document.getElementById('cheatsheet-cards-container');
  if (!container) return;

  const lang = localStorage.getItem('selectedLanguage') || 'RUS';
  container.innerHTML = cheatSheetTopics.map((topic, index) => {
    const title = topic.title[lang] || topic.title.ENG;
    return `
      <button class="cheat-sheet-tile" type="button" data-index="${index}" aria-label="${title}">
        <span class="cheat-sheet-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="cheat-sheet-name">${title}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.cheat-sheet-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const index = Number(tile.dataset.index);
      window.openCheatDetail(index);
    });
  });
};

window.openCheatDetail = function (index, origin = 'cheatsheet', returnToIndex = 1) {
  const topic = cheatSheetTopics[index];
  if (!topic) return;

  const lang = localStorage.getItem('selectedLanguage') || 'RUS';
  const title = topic.title[lang] || topic.title.ENG;
  const detailTitle = document.getElementById('detail-title');
  const detailBody = document.getElementById('detail-body');

  if (detailTitle) detailTitle.textContent = title;
  if (detailBody) detailBody.innerHTML = buildCheatSheetDetail(topic, lang);

  const detailPage = document.getElementById('detail-page');
  detailPage.classList.toggle('detail-subpage--analytics', origin === 'analytics');
  const cheatsheet = document.getElementById('cheatsheet');
  if (cheatsheet) cheatsheet.classList.remove('active');
  if (detailPage) {
    detailPage.style.display = 'flex';
    requestAnimationFrame(() => detailPage.classList.add('active'));
  }

  window.currentDetailSection = origin;
  window.currentDetailIndex = index + 1;
  window.detailOrigin = origin;
  window.cheatDetailOpenedFrom = origin;
  window.cheatDetailReturnIndex = origin === 'analytics' ? returnToIndex : null;
};

window.showDetail = function (section, itemIndex) {
  window.currentDetailSection = section;
  window.detailOrigin = section;
  window.currentDetailIndex = itemIndex;
  window.cheatDetailOpenedFrom = null;
  const config = detailConfig[section];
  if (!config) return;

  const item = config.items[itemIndex - 1];
  if (!item) return;

  const lang = localStorage.getItem('selectedLanguage') || 'ENG';
  
  let label = config.label;
  if (lang === 'ENG') label = config.labelEng;
  if (lang === 'UKR') label = config.labelUkr;

  let itemTitle = item.title;
  if (lang === 'ENG' && item.titleEng) itemTitle = item.titleEng;
  if (lang === 'UKR' && item.titleUkr) itemTitle = item.titleUkr;
  if (lang === 'RUS' && item.titleRus) itemTitle = item.titleRus;

  renderDetailTitle(document.getElementById('detail-title'), label, itemTitle, section, itemIndex, lang);
const detailBodyEl = document.getElementById('detail-body');

detailBodyEl.innerHTML = buildDetailBody(section, itemIndex, item, lang);
  // Ensure newly inserted detail content is localized (covers templates/iframes inserted dynamically)
  try { window.selectLanguage(localStorage.getItem('selectedLanguage') || lang); } catch (e) { /* ignore */ }

  document.getElementById(section).classList.remove('active');
  const detailPage = document.getElementById('detail-page');
  detailPage.classList.toggle('detail-subpage--analytics', section === 'analytics');
  detailPage.style.display = 'flex';
  setTimeout(() => {
    document.getElementById(section).style.display = 'none';
    detailPage.classList.add('active');
  }, 100);
};

window.closeDetail = function () {
  const returnToAnalyticsIndex = window.cheatDetailOpenedFrom === 'analytics'
    ? window.cheatDetailReturnIndex || 1
    : null;
  const detailPage = document.getElementById('detail-page');
  detailPage.classList.remove('active');

  setTimeout(() => {
    detailPage.style.display = 'none';
    if (returnToAnalyticsIndex) {
      window.showDetail('analytics', returnToAnalyticsIndex);
      return;
    }

    window.showPage(window.currentDetailSection || 'analytics');
  }, 300);
};

window.requestSMCAnalysis = async function requestSMCAnalysis() {
    // 1. Получаем элементы интерфейса
    const btnScan = document.getElementById('btn-run-scan');
    const statusText = document.getElementById('scan-status');
    const longsList = document.getElementById('smc-longs-list');
    const shortsList = document.getElementById('smc-shorts-list');

    // 2. Собираем актуальные значения фильтров, введенные пользователем
    const scanSettings = {
        timeframe: document.getElementById('scan-timeframe').value,
        min_volume: parseFloat(document.getElementById('scan-volume').value) || 50000000,
        min_change: parseFloat(document.getElementById('scan-change').value) || 2.0,
        structure_window: parseInt(document.getElementById('scan-window').value) || 10
    };

    // Translations setup
    const langCode = localStorage.getItem('selectedLanguage') || 'ENG';
    const langData = {
        'ENG': { analyzing: 'ANALYZING...', analyzingTf: 'Connecting to Binance, scanning timeframe', scanWait: 'Scanning...', complete: 'Analysis completed successfully!', noCoins: 'No coins', errServer: 'Server Error', errAnalysis: 'Analysis Error:', errFetch: 'Failed to fetch data. See console.', err: 'Error', runBtn: 'RUN ANALYSIS' },
        'RUS': { analyzing: 'АНАЛИЗИРУЮ...', analyzingTf: 'Подключаюсь к Binance, сканирую таймфрейм', scanWait: 'Сканирование...', complete: 'Анализ завершен успешно!', noCoins: 'Монеты не найдены', errServer: 'Ошибка сервера:', errAnalysis: 'Ошибка анализа:', errFetch: 'Не удалось получить данные. Проверьте консоль.', err: 'Ошибка', runBtn: 'ЗАПУСТИТЬ АНАЛИЗ' },
        'UKR': { analyzing: 'АНАЛІЗУЮ...', analyzingTf: 'Підключаюся до Binance, сканую таймфрейм', scanWait: 'Сканування...', complete: 'Аналіз успішно завершено!', noCoins: 'Монети не знайдено', errServer: 'Помилка сервера:', errAnalysis: 'Помилка аналізу:', errFetch: 'Не вдалося отримати дані. Перевірте консоль.', err: 'Помилка', runBtn: 'ЗАПУСТИТИ АНАЛІЗ' }
    };
    const t = langData[langCode] || langData['ENG'];

    // 3. Визуализируем загрузку
    btnScan.disabled = true;
    btnScan.innerText = t.analyzing;
    statusText.style.display = "block";
    statusText.innerText = `${t.analyzingTf} ${scanSettings.timeframe}...`;
    
    longsList.innerText = t.scanWait;
    shortsList.innerText = t.scanWait;

    try {
        // 4. Отправляем запрос в нашу Python Netlify Function
        const endpoint = window.location.hostname === 'localhost' 
            ? 'http://localhost:5174/.netlify/functions/smc-scan'
            : '/.netlify/functions/smc-scan';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scanSettings)
        });

        if (!response.ok) throw new Error(`${t.errServer} ${response.status}`);

        const data = await response.json();

        if (data.success) {
            statusText.innerText = t.complete;
            
            // Выводим списки монет (если они пустые — пишем "Нет монет")
            longsList.innerHTML = data.longs.length > 0 
                ? data.longs.map(coin => `<span class="coin-tag tag-long">${coin}</span>`).join(' ')
                : t.noCoins;

            shortsList.innerHTML = data.shorts.length > 0 
                ? data.shorts.map(coin => `<span class="coin-tag tag-short">${coin}</span>`).join(' ')
                : t.noCoins;
        } else {
            statusText.innerText = `${t.errAnalysis} ${data.error}`;
        }
    } catch (error) {
        console.error("SMC Scanner Error:", error);
        statusText.innerText = t.errFetch;
        longsList.innerText = t.err;
        shortsList.innerText = t.err;
    } finally {
        // 5. Возвращаем кнопку в исходное состояние
        btnScan.disabled = false;
        btnScan.innerText = document.getElementById('btn-run-scan')?.getAttribute('data-default') || t.runBtn;
    }
};

window.requestTop15Screener = async function requestTop15Screener() {
    const btnScan = document.getElementById('btn-run-top15');
    const statusText = document.getElementById('top15-status');
    const resultsBody = document.getElementById('top15-results-body');

    if (!btnScan || !statusText || !resultsBody) return;

    const langCode = localStorage.getItem('selectedLanguage') || 'ENG';
    const top15Lang = {
        ENG: {
            scanning: 'SCANNING...',
            loading: 'Loading data...',
            collecting: 'Collecting Binance Futures data...',
            empty: 'No pairs match the current filters.',
            error: 'Binance Futures data loading error.',
            done: (count) => `Found ${count} pairs. Ranked by combined score.`
        },
        RUS: {
            scanning: 'СКАНИРУЮ...',
            loading: 'Загрузка данных...',
            collecting: 'Собираю данные Binance Futures...',
            empty: 'По текущим фильтрам подходящих пар нет.',
            error: 'Ошибка загрузки данных Binance Futures.',
            done: (count) => `Найдено ${count} пар. Отображены по суммарному рангу.`
        },
        UKR: {
            scanning: 'СКАНУЮ...',
            loading: 'Завантаження даних...',
            collecting: 'Збираю дані Binance Futures...',
            empty: 'За поточними фільтрами підходящих пар немає.',
            error: 'Помилка завантаження даних Binance Futures.',
            done: (count) => `Знайдено ${count} пар. Відображено за сумарним рангом.`
        }
    };
    const t = top15Lang[langCode] || top15Lang.ENG;

    const minVolume = parseFloat(document.getElementById('top15-volume').value) || 50000000;
    const minChange = parseFloat(document.getElementById('top15-change').value) || 2;
    const minTrades = parseFloat(document.getElementById('top15-trades').value) || 500000;

    btnScan.disabled = true;
    btnScan.innerText = t.scanning;
    statusText.style.display = 'block';
    statusText.innerText = t.collecting;
    resultsBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:18px; color:#94a3b8;">${t.loading}</td></tr>`;

    try {
        const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid Binance response');

        const filtered = data.filter((item) => {
            if (!item?.symbol || !String(item.symbol).endsWith('USDT')) return false;
            const volume = parseFloat(item.quoteVolume || 0);
            const change = Math.abs(parseFloat(item.priceChangePercent || 0));
            const trades = parseFloat(item.count || 0);
            return volume >= minVolume && change >= minChange && trades >= minTrades;
        });

        const volumeRankMap = new Map();
        [...filtered].sort((a, b) => parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0))
            .forEach((item, index) => volumeRankMap.set(item.symbol, index + 1));

        const tradesRankMap = new Map();
        [...filtered].sort((a, b) => parseFloat(b.count || 0) - parseFloat(a.count || 0))
            .forEach((item, index) => tradesRankMap.set(item.symbol, index + 1));

        const changeRankMap = new Map();
        [...filtered].sort((a, b) => Math.abs(parseFloat(b.priceChangePercent || 0)) - Math.abs(parseFloat(a.priceChangePercent || 0)))
            .forEach((item, index) => changeRankMap.set(item.symbol, index + 1));

        const scored = filtered.map((item) => {
            const symbol = String(item.symbol);
            const volume = parseFloat(item.quoteVolume || 0);
            const change = parseFloat(item.priceChangePercent || 0);
            const trades = parseFloat(item.count || 0);
            return {
                symbol,
                volume,
                trades,
                change,
                volumeRank: volumeRankMap.get(symbol) || 0,
                tradesRank: tradesRankMap.get(symbol) || 0,
                changeRank: changeRankMap.get(symbol) || 0,
                totalRank: (volumeRankMap.get(symbol) || 0) + (tradesRankMap.get(symbol) || 0) + (changeRankMap.get(symbol) || 0)
            };
        });

        const sorted = scored.sort((a, b) => a.totalRank - b.totalRank || a.volumeRank - b.volumeRank || a.tradesRank - b.tradesRank || a.changeRank - b.changeRank);
        const top15 = sorted.slice(0, 15);

        if (top15.length === 0) {
            resultsBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:18px; color:#94a3b8;">${t.empty}</td></tr>`;
            statusText.innerText = t.empty;
            return;
        }

        const rows = top15.map((row, index) => {
            const volumeDisplay = row.volume.toLocaleString('ru-RU');
            const tradesDisplay = row.trades.toLocaleString('ru-RU');
            const changeDisplay = `${row.change >= 0 ? '+' : ''}${row.change.toFixed(2)}%`;
            return `
                <tr style="border-top: 1px solid rgba(148,163,184,0.16);">
                    <td style="padding: 10px 8px; text-align: center; color: #f8fafc;">${index + 1}</td>
                    <td style="padding: 10px 8px; color: #00ff88; font-weight: 700;">${row.symbol}</td>
                    <td style="padding: 10px 8px; color: #f8fafc;">${volumeDisplay}</td>
                    <td style="padding: 10px 8px; text-align: center; color: #f8fafc;">${row.volumeRank}</td>
                    <td style="padding: 10px 8px; color: #f8fafc;">${tradesDisplay}</td>
                    <td style="padding: 10px 8px; text-align: center; color: #f8fafc;">${row.tradesRank}</td>
                    <td style="padding: 10px 8px; color: ${row.change >= 0 ? '#22c55e' : '#ef4444'};">${changeDisplay}</td>
                    <td style="padding: 10px 8px; text-align: center; color: #f8fafc;">${row.changeRank}</td>
                    <td style="padding: 10px 8px; text-align: center; color: #00ff88; font-weight: 700;">${row.totalRank}</td>
                </tr>`;
        }).join('');

        resultsBody.innerHTML = rows;
        statusText.innerText = t.done(top15.length);
    } catch (error) {
        console.error('Top-15 screener error:', error);
        statusText.innerText = t.error;
        resultsBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:18px; color:#ef4444;">${t.error}</td></tr>`;
    } finally {
        btnScan.disabled = false;
        btnScan.innerText = btnScan.getAttribute('data-default') || 'START';
    }
};

// Build detail page body content
function buildDetailBody(section, index, item, lang = 'ENG') {
  const sectionColors = {
    analytics: '#00ff88',
    cheatsheet: '#7dd3fc'
  };
  const color = sectionColors[section] || '#00ff88';

  if (section === 'cheatsheet') {
    const topic = cheatSheetTopics[index - 1];
    if (!topic) return '<p>Topic not found.</p>';
    return buildCheatSheetDetail(topic, lang || 'ENG');
  }

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
    const tipTitle = lang === 'ENG' ? '💡 Pro Tip from Swappy' : (lang === 'UKR' ? '💡 Порада від Swappy' : '💡 Совет от Swappy');
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

  if (section === 'screeners' && index === 4) {
    const scanTemplate = document.getElementById('rsi-scan-template');
    const scanMarkup = scanTemplate ? scanTemplate.innerHTML : '<div class="rsi-scanner-container"><h3>RSI Screener</h3><p>Content unavailable.</p></div>';

    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%; overflow: auto;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; min-height: 100%;">
          ${scanMarkup}
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

  if (section === 'screeners' && index === 3) {
    const scanTemplate = document.getElementById('smc-scan-template');
    const scanMarkup = scanTemplate ? scanTemplate.innerHTML : '<div class="smc-scanner-container"><h3>SMC Смарт-Сканер</h3><p>Контент временно недоступен.</p></div>';

    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%; overflow: auto;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; min-height: 100%;">
          ${scanMarkup}
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 8) {
    const header = lang === 'ENG' ? '📊 OI & Funding Terminal: Left Axis' : (lang === 'UKR' ? '📊 OI & Funding Terminal: Left Axis' : '📊 OI & Funding Terminal Left Axis');
    const guideTitle = lang === 'ENG' ? '🛠 Quick User Guide' : (lang === 'UKR' ? '🛠 Коротка інструкція' : '🛠 Краткая инструкция');
    
    const oiTermLabel = lang === 'ENG'
      ? '<button type="button" onclick="openCheatDetail(2, \'analytics\', 8)" style="border: 0; background: transparent; color: #10b981; padding: 0; font: inherit; font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; cursor: pointer;">Open Interest</button>'
      : (lang === 'UKR'
        ? '<button type="button" onclick="openCheatDetail(2, \'analytics\', 8)" style="border: 0; background: transparent; color: #10b981; padding: 0; font: inherit; font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; cursor: pointer;">Операційний інтерес</button>'
        : '<button type="button" onclick="openCheatDetail(2, \'analytics\', 8)" style="border: 0; background: transparent; color: #10b981; padding: 0; font: inherit; font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; cursor: pointer;">Операционный интерес</button>');
    const panelTitle = lang === 'ENG'
      ? `Top Panel (${oiTermLabel}):`
      : (lang === 'UKR'
        ? `Верхня панель (${oiTermLabel}):`
        : `Верхняя панель (${oiTermLabel}):`);
    const panelDesc = lang === 'ENG' 
      ? 'Displays the total value of all open positions (Long + Short) for Bitcoin in millions of dollars ($M).'
      : (lang === 'UKR' 
        ? 'Відображає сукупну вартість усіх відкритих позицій (Long + Short) по Біткоїну в мільйонах доларів ($M).'
        : 'Отображает совокупную стоимость всех открытых позиций (Long + Short) по Биткоину в миллионах долларов ($M).');

    const chartRise = lang === 'ENG' ? '<strong>Rising Chart:</strong> New capital and aggressive players are entering the market.' : (lang === 'UKR' ? '<strong>Зростання графіка:</strong> В ринок заходять нові гроші та агресивні гравці.' : '<strong>Рост графика:</strong> В рынок заходят новые деньги и агрессивные игроки.');
    const chartFall = lang === 'ENG' ? '<strong>Falling Chart:</strong> Mass liquidations or profit-taking (exiting to cash) are occurring.' : (lang === 'UKR' ? '<strong>Падіння графіка:</strong> Відбуваються масові ліквідації або фіксація прибутку (вихід у кеш).' : '<strong>Падение графика:</strong> Происходят массовые ликвидации или фиксация прибыли (выход в кэш).');

    const fundingTitle = lang === 'ENG'
      ? '<button type="button" onclick="openCheatDetail(3, \'analytics\', 8)" style="border: 0; background: transparent; color: #10b981; padding: 0; font: inherit; font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; cursor: pointer;">Funding Rate:</button>'
      : (lang === 'UKR'
        ? '<button type="button" onclick="openCheatDetail(3, \'analytics\', 8)" style="border: 0; background: transparent; color: #10b981; padding: 0; font: inherit; font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; cursor: pointer;">Ставка фінансування (Funding Rate):</button>'
        : '<button type="button" onclick="openCheatDetail(3, \'analytics\', 8)" style="border: 0; background: transparent; color: #10b981; padding: 0; font: inherit; font-weight: 700; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; cursor: pointer;">Funding Rate (Ставка финансирования):</button>');
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

    const tipTitle = lang === 'ENG' ? '💡 Tip from Swappy' : (lang === 'UKR' ? '💡 Порада від Swappy' : '💡 Совет от Swappy');
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
    const linkedIntro = intro.replace(
      'RSI',
      `<button type="button" class="cheat-sheet-inline-link" aria-label="${lang === 'ENG' ? 'Open RSI guide' : (lang === 'UKR' ? 'Відкрити довідку RSI' : 'Открыть справку RSI')}" onclick="openCheatDetail(1, 'analytics', 6)">RSI</button>`
    );

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
        : '<strong>4. Фильтрация:</strong> Виджет автоматически скрывает «рыночный шум» (нейтральные монеты), оставляя только активные сигналы.');

    const tipTitle = lang === 'ENG' ? '💡 Tip from Swappy' : (lang === 'UKR' ? '💡 Порада від Swappy' : '💡 Совет от Swappy');
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
          
          <p style="margin-bottom: 20px; color: #fff; font-weight: 500;">${linkedIntro}</p>

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
    const t = {
      'ENG': {
        manual: 'Terminal Manual',
        timeTitle: '🕒 Time Settings',
        timeDesc: 'By default, the terminal displays your local time. To verify the time zone or switch to UTC, click the gear icon within the widget or check your system settings.',
        columnsTitle: '📊 Column Definitions:',
        actual: 'ACTUAL',
        actualDesc: 'The real-time data point. Released at the exact moment of the event.',
        forecast: 'FORECAST',
        forecastDesc: 'Analyst consensus. The market has typically already priced this in.',
        previous: 'PREVIOUS',
        previousDesc: 'Data from the prior period for comparison.',
        volatilityTitle: '🔥 Volatility Levels:',
        highDesc: '<b>Critical:</b> Includes Fed rate decisions and inflation data (CPI/PCE). Expect sharp movements in BTC.',
        medDesc: '<b>Moderate:</b> Includes speeches by officials and PMI indices. These influence the intraday trend.',
        lowDesc: '<b>Low:</b> Minor reports. Usually, these do not significantly impact market conditions.',
        button: 'GOT IT'
      },
      'RUS': {
        manual: 'Инструкция терминала',
        timeTitle: '🕒 Настройка времени',
        timeDesc: 'По умолчанию отображается <b>ваше местное время</b>. Чтобы сверить пояс или переключить на UTC, нажмите на иконку шестеренки внутри виджета или проверьте настройки вашей системы.',
        columnsTitle: '📊 Значение колонок:',
        actual: 'ACTUAL',
        actualDesc: 'Текущий факт. Выходит в момент события.',
        forecast: 'FORECAST',
        forecastDesc: 'Прогноз аналитиков. Рынок уже учел его в цене.',
        previous: 'PREVIOUS',
        previousDesc: 'Данные прошлого периода для сравнения.',
        volatilityTitle: '🔥 Уровни волатильности:',
        highDesc: '<b>Критично:</b> Ставки ФРС, инфляция (CPI/PCE). Возможны резкие движения BTC.',
        medDesc: '<b>Умеренно:</b> Речи чиновников, индексы PMI. Влияют на внутридневной тренд.',
        lowDesc: '<b>Низко:</b> Второстепенные отчеты. Обычно не меняют рыночную ситуацию значительно.',
        button: 'ПОНЯТНО'
      },
      'UKR': {
        manual: 'Інструкція термінала',
        timeTitle: '🕒 Налаштування часу',
        timeDesc: 'За замовчуванням відображається <b>ваш місцевий час</b>. Щоб звірити пояс або переключити на UTC, натисніть на іконку шестерні всередині віджета або перевірте налаштування вашої системи.',
        columnsTitle: '📊 Значення колонок:',
        actual: 'ACTUAL',
        actualDesc: 'Поточний факт. Виходить у момент події.',
        forecast: 'FORECAST',
        forecastDesc: 'Прогноз аналітиків. Ринок уже врахував його в ціні.',
        previous: 'PREVIOUS',
        previousDesc: 'Дані минулого періоду для порівняння.',
        volatilityTitle: '🔥 Рівні волатильності:',
        highDesc: '<b>Критично:</b> Ставки ФРС, інфляція (CPI/PCE). Можливі різкі рухи BTC.',
        medDesc: '<b>Помірно:</b> Промови чиновників, індекси PMI. Впливають на внутрішньоденний тренд.',
        lowDesc: '<b>Низько:</b> Другорядні звіти. Зазвичай не змінюють ринкову ситуацію значно.',
        button: 'ЗРОЗУМІЛО'
      }
    };

    const cur = t[lang] || t['RUS'];

    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <section id="stx-terminal" style="margin: 0; padding: 0; height: 100%; display: flex; flex-direction: column; position: relative; font-family: 'Inter', sans-serif; width: 100%;">
            <div class="detail-chart-placeholder" style="--detail-color: ${color}; background: #0f172a; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; margin: 0; height: 100%; border-radius: 14px;">
              
                <div style="padding: 15px 20px; border-bottom: 1px solid color-mix(in srgb, ${color} 30%, transparent); background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 10px; height: 10px; background: ${color}; border-radius: 50%; box-shadow: 0 0 10px ${color}; animation: stx-pulse 2s infinite;"></div>
                        <h3 style="color: #f9fafb; margin: 0; font-size: 14px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; font-family: 'Orbitron', sans-serif;">
                            Market Intelligence Terminal
                        </h3>
                    </div>
                    
                    <button onclick="document.getElementById('stx-modal').style.display='flex'" style="
                        background: ${color}; color: #000; border: none; padding: 8px 18px; 
                        border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;
                        transition: 0.3s; box-shadow: 0 0 10px color-mix(in srgb, ${color} 40%, transparent);
                        text-transform: uppercase; letter-spacing: 1px;
                    " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        📊 ${lang === 'ENG' ? 'TERMINAL GUIDE' : (lang === 'UKR' ? 'ІНСТРУКЦІЯ ТЕРМІНАЛА' : 'ИНСТРУКЦИЯ ТЕРМИНАЛА')}
                    </button>
                </div>

              <div style="flex-grow: 1; width: 100%; background: #111827;">
                  <iframe 
                      src="https://www.tradingview-widget.com/embed-widget/events/?locale=${lang === 'ENG' ? 'en' : 'ru'}#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%2C%22currencyFilter%22%3A%22USD%2CEUR%2CJPY%2CGBP%2CAUD%2CCAD%2CCHF%22%7D" 
                      width="100%" height="100%" frameborder="0" style="border: none; min-height: 500px;">
                  </iframe>
              </div>
            </div>
        </section>
      </div>
          <div id="stx-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(10px);">
              <div style="background: #1e293b; border: 1px solid ${color}; width: 95%; max-width: 600px; padding: 35px; border-radius: 20px; position: relative; color: #f1f5f9; max-height: 85vh; overflow-y: auto; box-shadow: 0 0 50px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 20px;">
                  <button onclick="document.getElementById('stx-modal').style.display='none'" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 32px; height: 32px; color: #64748b; font-size: 16px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.color='#fff'; this.style.borderColor='${color}'" onmouseout="this.style.color='#64748b'; this.style.borderColor='rgba(255,255,255,0.1)'">✕</button>

                  <h2 style="margin: 0 0 10px 0; color: ${color}; font-size: 20px; border-bottom: 2px solid ${color}; padding-bottom: 12px; text-transform: uppercase; font-family: 'Orbitron', sans-serif; letter-spacing: 2px;">
                      ${cur.manual}
                  </h2>
                  
                  <div style="margin-top: 10px; background: color-mix(in srgb, ${color} 10%, transparent); padding: 18px; border-left: 4px solid ${color}; border-radius: 8px;">
                      <h4 style="margin: 0 0 10px 0; font-size: 14px; color: ${color}; text-transform: uppercase; font-weight: 800;">${cur.timeTitle}</h4>
                      <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6;">
                          ${cur.timeDesc}
                      </p>
                  </div>

                  <h4 style="margin: 10px 0 0px 0; font-size: 14px; color: ${color}; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">${cur.columnsTitle}</h4>
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                      <div style="background: #0f172a; padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                          <div style="color: #f1f5f9; font-size: 11px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px;">${cur.actual}</div>
                          <div style="font-size: 10px; color: #94a3b8; line-height: 1.4;">${cur.actualDesc}</div>
                      </div>
                      <div style="background: #0f172a; padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                          <div style="color: #f1f5f9; font-size: 11px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px;">${cur.forecast}</div>
                          <div style="font-size: 10px; color: #94a3b8; line-height: 1.4;">${cur.forecastDesc}</div>
                      </div>
                      <div style="background: #0f172a; padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                          <div style="color: #f1f5f9; font-size: 11px; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px;">${cur.previous}</div>
                          <div style="font-size: 10px; color: #94a3b8; line-height: 1.4;">${cur.previousDesc}</div>
                      </div>
                  </div>

                  <h4 style="margin: 10px 0 0px 0; font-size: 14px; color: ${color}; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">${cur.volatilityTitle}</h4>
                  <div style="display: flex; flex-direction: column; gap: 15px;">
                      <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px;">
                          <div style="min-width: 70px; height: 26px; background: #ef4444; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #fff; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">HIGH</div>
                          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">${cur.highDesc}</div>
                      </div>
                      <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px;">
                          <div style="min-width: 70px; height: 26px; background: #f59e0b; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #fff; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);">MEDIUM</div>
                          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">${cur.medDesc}</div>
                      </div>
                      <div style="display: flex; gap: 15px; align-items: flex-start; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 10px;">
                          <div style="min-width: 70px; height: 26px; background: #64748b; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #f1f5f9;">LOW</div>
                          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">${cur.lowDesc}</div>
                      </div>
                  </div>

                  <button onclick="document.getElementById('stx-modal').style.display='none'" style="margin-top: 15px; width: 100%; padding: 16px; background: ${color}; border: none; border-radius: 12px; color: #000; font-weight: 800; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 20px color-mix(in srgb, ${color} 30%, transparent);" onmouseover="this.style.opacity='0.8'; this.style.transform='translateY(-2px)'" onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)'">${cur.button}</button>
              </div>
          </div>
      </section>

      <style>
          @keyframes stx-pulse {
              0% { transform: scale(0.95); box-shadow: 0 0 0 0 color-mix(in srgb, ${color} 70%, transparent); }
              70% { transform: scale(1); box-shadow: 0 0 0 10px color-mix(in srgb, ${color} 0%, transparent); }
              100% { transform: scale(0.95); box-shadow: 0 0 0 0 color-mix(in srgb, ${color} 0%, transparent); }
          }
          /* Стили скроллбара для модального окна */
          #stx-modal .content-container::-webkit-scrollbar { width: 6px; }
          #stx-modal .content-container::-webkit-scrollbar-track { background: #111827; }
          #stx-modal .content-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      </style>
    `;
  }

  if (section === 'screeners' && index === 2) {
    const top15Text = lang === 'ENG'
      ? { title: 'Top-15 Screener (Binance Futures USDT)', volume: 'Min 24h Volume (USDT):', change: 'Min 24h Price Change (%):', trades: 'Min 24h Trades:', button: 'START', placeholder: 'Waiting for scan...', number: '№', ticker: 'Ticker', volumeCol: 'Volume', rank: 'Rank', tradesCol: 'Trades', changeCol: 'Price Change', totalRank: 'Total Rank', infoBtn: 'Info', infoTitle: 'How the Top-15 screener works', infoBody: '<ul><li><strong>Pairs used:</strong> Binance Futures USDT pairs from the 24h ticker feed.</li><li><strong>Filters:</strong> volume, price change, and trade count must all meet your thresholds.</li><li><strong>Ranking:</strong> each pair gets separate ranks for volume, trades, and price change, then the three ranks are summed into the final total rank.</li><li><strong>Output:</strong> the table shows the top 15 pairs starting from the lowest total rank.</li></ul>' }
      : (lang === 'UKR'
        ? { title: 'Скрінер Топ-15 (Binance Futures USDT)', volume: 'Мін. обсяг 24г (USDT):', change: 'Мін. змінa ціни 24г (%):', trades: 'Мін. к-ть угод 24г:', button: 'СТАРТ', placeholder: 'Очікування запуску...', number: '№', ticker: 'Тікер', volumeCol: 'Обсяг', rank: 'Ранг', tradesCol: 'Угоди', changeCol: 'Зміна ціни', totalRank: 'Сумарний ранг', infoBtn: 'Інфо', infoTitle: 'Як працює скрінер Топ-15', infoBody: '<ul><li><strong>Пари:</strong> використовуються пари Binance Futures USDT з 24-годинного ticker-фід.</li><li><strong>Фільтри:</strong> обсяг, зміна ціни та кількість угод мають відповідати вашим порогам.</li><li><strong>Ранжування:</strong> кожна пара отримує окремі ранги за обсягом, угодами та зміною ціни, після чого їх сума дає фінальний сумарний ранг.</li><li><strong>Результат:</strong> у таблиці показано 15 пар, починаючи з найменшого сумарного рангу.</li></ul>' }
        : { title: 'Скринер Топ-15 (Binance Futures USDT)', volume: 'Мин. объем 24ч (USDT):', change: 'Мин. изм. цены 24ч (%):', trades: 'Мин. кол-во сделок 24ч:', button: 'СТАРТ', placeholder: 'Ожидание запуска...', number: '№', ticker: 'Тикер', volumeCol: 'Объем', rank: 'Ранг', tradesCol: 'Сделки', changeCol: 'Изм. цены', totalRank: 'Суммарный ранг', infoBtn: 'Инфо', infoTitle: 'Как работает скринер Топ-15', infoBody: '<ul><li><strong>Пары:</strong> используются пары Binance Futures USDT из 24-часового ticker-фида.</li><li><strong>Фильтры:</strong> объем, изменение цены и количество сделок должны соответствовать вашим порогам.</li><li><strong>Ранжирование:</strong> каждая пара получает отдельные ранги по объему, сделкам и изменению цены, после чего их сумма дает итоговый суммарный ранг.</li><li><strong>Результат:</strong> в таблице отображаются 15 пар, начиная с наименьшего суммарного ранга.</li></ul>' });

    return `
      <div class="smc-scanner-container" style="width: 100%; max-width: 1400px; margin: 0 auto; padding: 22px; border-radius: 18px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95)); border: 1px solid rgba(0, 255, 136, 0.2); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3); color: #f8fafc; height: 100%; overflow: auto; box-sizing: border-box;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom: 14px;">
          <h3 id="top15-title" style="margin: 0; color: #00ff88; font-family: 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: 1px;">${top15Text.title}</h3>
          <button id="top15-info-btn" onclick="window.toggleTop15Info(true)" style="background: rgba(0,255,136,0.12); border: 1px solid rgba(0,255,136,0.25); color: #00ff88; border-radius: 999px; padding: 7px 12px; cursor: pointer; font-weight: 700; letter-spacing: 0.5px;">${top15Text.infoBtn}</button>
        </div>

        <div class="scanner-grid" style="grid-template-columns: repeat(3, minmax(220px, 1fr)); gap: 12px; margin-bottom: 14px;">
          <div class="input-group">
            <label id="top15-label-volume" for="top15-volume">${top15Text.volume}</label>
            <input type="number" id="top15-volume" value="50000000" step="10000000">
          </div>
          <div class="input-group">
            <label id="top15-label-change" for="top15-change">${top15Text.change}</label>
            <input type="number" id="top15-change" value="2" step="0.1">
          </div>
          <div class="input-group">
            <label id="top15-label-trades" for="top15-trades">${top15Text.trades}</label>
            <input type="number" id="top15-trades" value="500000" step="100000">
          </div>
        </div>

        <button id="btn-run-top15" data-default="${top15Text.button}" onclick="requestTop15Screener()" style="background: linear-gradient(135deg, #00ff88, #22c55e); color: #04120a; border: none; border-radius: 999px; padding: 10px 16px; font-weight: 800; letter-spacing: 1px; cursor: pointer; margin-bottom: 12px; width: 100%;">${top15Text.button}</button>

        <div id="top15-status" class="scan-status-text" style="display: none; margin-bottom: 12px; color: #86efac; font-size: 0.85rem; font-weight: 600;"></div>

        <div style="overflow: auto; border: 1px solid rgba(148, 163, 184, 0.16); border-radius: 12px; background: rgba(15, 23, 42, 0.7);">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; min-width: 900px;">
            <thead>
              <tr style="background: rgba(2, 6, 23, 0.9); color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.6px;">
                <th id="top15-header-number" style="padding: 10px 8px; text-align: center;">${top15Text.number}</th>
                <th id="top15-header-ticker" style="padding: 10px 8px; text-align: left;">${top15Text.ticker}</th>
                <th id="top15-header-volume" style="padding: 10px 8px; text-align: left;">${top15Text.volumeCol}</th>
                <th id="top15-header-volume-rank" style="padding: 10px 8px; text-align: center;">${top15Text.rank}</th>
                <th id="top15-header-trades" style="padding: 10px 8px; text-align: left;">${top15Text.tradesCol}</th>
                <th id="top15-header-trades-rank" style="padding: 10px 8px; text-align: center;">${top15Text.rank}</th>
                <th id="top15-header-change" style="padding: 10px 8px; text-align: left;">${top15Text.changeCol}</th>
                <th id="top15-header-change-rank" style="padding: 10px 8px; text-align: center;">${top15Text.rank}</th>
                <th id="top15-header-total-rank" style="padding: 10px 8px; text-align: center;">${top15Text.totalRank}</th>
              </tr>
            </thead>
            <tbody id="top15-results-body">
              <tr>
                <td colspan="9" style="padding: 18px; text-align: center; color: #94a3b8;">${top15Text.placeholder}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="top15-info-modal" style="display:none; position:fixed; inset:0; background:rgba(2,6,23,0.88); z-index:3000; align-items:center; justify-content:center; padding:20px;">
          <div style="max-width:760px; width:100%; max-height:80vh; overflow:auto; border-radius:16px; border:1px solid rgba(0,255,136,0.24); background:linear-gradient(135deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98)); box-shadow:0 15px 40px rgba(0,0,0,0.45); padding:24px; color:#f8fafc;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;">
              <h4 id="top15-info-title" style="margin:0; color:#00ff88; font-family:'Orbitron',sans-serif; text-transform:uppercase; letter-spacing:1px;">${top15Text.infoTitle}</h4>
              <button onclick="window.toggleTop15Info(false)" style="background:transparent; border:none; color:#fff; font-size:24px; cursor:pointer;">×</button>
            </div>
            <div id="top15-info-body" style="line-height:1.6; font-size:0.9rem; color:#cbd5e1;">${top15Text.infoBody}</div>
          </div>
        </div>
      </div>
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

  if (section === 'screeners' && index === 1) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/screener-terminal.html" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
        </div>
      </div>
    `;
  }

  if (section === 'analytics' && index === 12) {
    return `
      <div style="width: 100%; flex: 1; padding: 0 40px; box-sizing: border-box; height: 100%;">
        <div class="detail-chart-placeholder" style="--detail-color: ${color}; width: 100%; margin: 0; height: 100%;">
          <iframe src="/ai-forecast-terminal.html" title="AI Forecast Terminal" width="100%" style="height: 100%; min-height: 100%; display: block; border-radius: 14px;" frameborder="0"></iframe>
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

// SMC Info modal toggle
window.toggleSMCInfo = function (show) {
  const modal = document.getElementById('smc-info-modal');
  if (!modal) return;
  if (show) {
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
  } else {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
  }
}

window.toggleTop15Info = function (show) {
  const modal = document.getElementById('top15-info-modal');
  if (!modal) return;
  modal.style.display = show ? 'flex' : 'none';
};

// RSI Scan request
window.requestRSIAnalysis = async function requestRSIAnalysis() {
    const btn = document.getElementById('btn-run-rsi');
    const statusText = document.getElementById('rsi-scan-status');
    const oversoldList = document.getElementById('rsi-oversold-list');
    const overboughtList = document.getElementById('rsi-overbought-list');

    const settings = {
        timeframe: document.getElementById('rsi-timeframe').value,
        min_volume: parseFloat(document.getElementById('rsi-volume').value) || 50000000,
        min_change: parseFloat(document.getElementById('rsi-change').value) || 2.0,
        oversold: parseFloat(document.getElementById('rsi-oversold').value) || 30,
        overbought: parseFloat(document.getElementById('rsi-overbought').value) || 70
    };

    const langCode = localStorage.getItem('selectedLanguage') || 'ENG';
    const rsiLang = {
        'ENG': { scanning: 'SCANNING...', scanningTf: 'Scanning', scanningWait: 'Scanning...', noCoins: 'No coins', complete: 'Scan complete.', errorPref: 'Error:', fetchFail: 'Failed to fetch data. See console.', error: 'Error', runBtn: 'RUN RSI SCAN', unknown: 'unknown' },
        'RUS': { scanning: 'СКАНИРОВАНИЕ...', scanningTf: 'Сканирование', scanningWait: 'Сканирование...', noCoins: 'Монеты не найдены', complete: 'Сканирование завершено.', errorPref: 'Ошибка:', fetchFail: 'Не удалось получить данные. Проверьте консоль.', error: 'Ошибка', runBtn: 'ЗАПУСТИТЬ RSI СКАН', unknown: 'неизвестно' },
        'UKR': { scanning: 'СКАНУВАННЯ...', scanningTf: 'Сканування', scanningWait: 'Сканування...', noCoins: 'Монети не знайдено', complete: 'Сканування завершено.', errorPref: 'Помилка:', fetchFail: 'Не вдалося отримати дані. Перевірте консоль.', error: 'Помилка', runBtn: 'ЗАПУСТИТИ RSI СКАН', unknown: 'невідомо' }
    };
    const t = rsiLang[langCode] || rsiLang['ENG'];

    btn.disabled = true;
    btn.innerText = t.scanning;
    if (statusText) { statusText.style.display = 'block'; statusText.innerText = `${t.scanningTf} ${settings.timeframe}...`; }
    if (oversoldList) oversoldList.innerText = t.scanningWait;
    if (overboughtList) overboughtList.innerText = t.scanningWait;

    try {
        const endpoint = window.location.hostname === 'localhost' ? 'http://localhost:5174/.netlify/functions/rsi-scan' : '/.netlify/functions/rsi-scan';
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        if (!resp.ok) throw new Error(`Server ${resp.status}`);
        const data = await resp.json();
        if (data.success) {
            if (oversoldList) oversoldList.innerHTML = data.oversold.length ? data.oversold.map(c => `<span class="coin-tag tag-long">${c}</span>`).join(' ') : t.noCoins;
            if (overboughtList) overboughtList.innerHTML = data.overbought.length ? data.overbought.map(c => `<span class="coin-tag tag-short">${c}</span>`).join(' ') : t.noCoins;
            if (statusText) statusText.innerText = t.complete;
        } else {
            if (statusText) statusText.innerText = `${t.errorPref} ${data.error || t.unknown}`;
        }
    } catch (e) {
        console.error('RSI Scan Error:', e);
        if (statusText) statusText.innerText = t.fetchFail;
        if (oversoldList) oversoldList.innerText = t.error;
        if (overboughtList) overboughtList.innerText = t.error;
    } finally {
        btn.disabled = false;
        btn.innerText = document.getElementById('btn-run-rsi')?.getAttribute('data-default') || t.runBtn;
    }
}

// RSI Info modal toggle
window.toggleRSIInfo = function (show) {
  const modal = document.getElementById('rsi-info-modal');
  if (!modal) return;
  if (show) { modal.style.display = 'flex'; requestAnimationFrame(() => modal.classList.add('active')); }
  else { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); }
}

// Language Selection Logic
window.selectLanguage = function (langCode) {
  const langDisplay = document.getElementById('current-lang');
  const options = document.querySelectorAll('.lang-option');

  const translations = {
    'ENG': {
      button: 'Eng.',
      options: ['Eng.', 'Rus.', 'Ukr.'],
      navMarketPulse: 'Market Pulse',
      navAnalytics: 'Analytics',
      navDailyReview: 'Daily Market Review',
      navTopicDay: 'Topic of the Day',
      navWeeklyHeadliners: 'Weekly Headliners',
      navNewCryptoFaces: 'New Faces of the Crypto Market',
      marketPulseSubtitle: 'Analytics and data processing: Swappy AI Assistant',
      navCheatSheet: 'Cheat Sheet',
      navScreeners: 'Screeners',
      navAbout: 'About us',
      cheatsheetTitle: 'Cheat Sheet',
      cheatsheetSubtitle: 'Basic rules, risk management, and key concepts for a crypto trader',
      aboutTitle: 'About CryptoStatix',
      aboutDesc: '<strong>CryptoStatix</strong> is an analytical platform built for traders and investors who prioritize data integrity and speed. We don’t just display charts—we help you visualize market structure through the lens of key metrics.',
      aboutWhatTitle: 'What We Do',
      aboutWhatDesc: 'Our service aggregates data directly from Binance and CoinGecko, providing you with professional-grade tools in a single click:',
      aboutCard1Title: 'Real-time Monitoring',
      aboutCard1Desc: 'Track volatility and trading volumes as they happen.',
      aboutCard2Title: 'Smart Analytics',
      aboutCard2Desc: 'Instant access to RSI, liquidity heatmaps, and asset dominance.',
      aboutCard3Title: 'Trend Focus',
      aboutCard3Desc: 'We highlight promising ecosystems, such as MemeCore, AI infrastructure, and Layer-2 solutions.',
      aboutMissionTitle: 'Our Mission',
      aboutMissionDesc: 'To streamline your decision-making process. In a world where information updates every second, CryptoStatix acts as your filter—cutting through the noise to leave only the facts.',
      aboutCommunityTitle: 'Join Our Community',
      aboutCommunityDesc: 'For those who want to keep their finger on the pulse 24/7, we’ve launched our official Telegram channel. There, we provide:',
      aboutItem1: 'Urgent alerts on abnormal market movements.',
      aboutItem2: 'Deep dives into promising tokens.',
      aboutItem3: 'Feature updates for our web platform.',
      aboutEmail: 'admin@cryptostatix.pp.ua',
      aboutTgLink: '🔗 CryptoStatix_news | Analytics & Data',
      aiWelcome: 'Hello! I am your AI assistant in the world of CryptoStatix. Analyzing the market 24/7. Which asset shall we discuss today? 📈',
      aiPlaceholder: 'Enter your request...',
      aiAgentCircular: 'your personal ai-agent',
      smcTitle: 'SMC Smart Scanner (Binance Futures)',
      smcTimeframe: 'Timeframe:',
      smcVolume: 'Min 24h Volume (USDT):',
      smcChange: 'Min Price Change (%):',
      smcWindow: 'Noise Filter (candles):',
      smcButton: 'RUN ANALYSIS',
      smcLong: '🟢 MACRO TREND LONG',
      smcShort: '🔴 MACRO TREND SHORT',
      smcWaiting: 'Waiting for scan...'
        ,
        smcInfoBtn: 'Info',
        smcInfoTitle: 'What is SMC Smart Scanner?',
        smcInfoBody: `<p><strong>SMC Smart Scanner</strong> is an automated analytical tool designed for traders and investors. It is intended for instant evaluation of the market structure of crypto futures on Binance using the Smart Money (SMC) concept. Instead of manually opening dozens of charts and searching for trends, the scanner iterates hundreds of active trading pairs with one click, filters out market noise using a mathematical algorithm, and produces ready lists of coins that are in strong macro trends.</p>
            <h4>How it works (For the website user)</h4>
            <p>Using the scanner on the site is simple — the whole process is divided into 3 steps:</p>
            <h5>1. Filter settings (select parameters):</h5>
            <ul>
              <li><strong>Timeframe:</strong> Choose the time scale for the analysis. Smaller timeframes (5 minutes) suit fast intraday trades (scalping), while larger ones (1 hour) are better for more reliable swing positions.</li>
              <li><strong>Min 24h Volume (USDT):</strong> Liquidity filter. It automatically removes illiquid and low-traded coins. The default value ($50,000,000) keeps only assets where large players are active.</li>
              <li><strong>Min Price Change (%):</strong> Filters out coins stuck in a tight range, selecting only volatile, moving assets.</li>
              <li><strong>Noise Filter (candles):</strong> Sets the strictness of market structure detection. The higher the number, the larger and more global highs/lows the algorithm will consider.</li>
            </ul>
            <h5>2. Run analysis:</h5>
            <p>Press the big green "RUN ANALYSIS" button. A loading status appears while the site sends a command to the cloud, connects to Binance, downloads candle history for each coin, and performs computations.</p>
            <h5>3. Receiving signals:</h5>
            <p>After a few seconds the scanner outputs results as two lists:</p>
            <p>🟢 <strong>MACRO TREND LONG:</strong> Coins with a consistently rising structure — ideal for finding long entry points.</p>
            <p>🔴 <strong>MACRO TREND SHORT:</strong> Coins with a stable downtrend — ideal for short opportunities.</p>
            <p>All calculations run in the cloud, so the tool is fast and does not burden the user's computer.</p>`
        ,
        // Top-15 Screener labels
        top15Title: 'Top-15 Screener (Binance Futures USDT)',
        top15Volume: 'Min 24h Volume (USDT):',
        top15Change: 'Min 24h Price Change (%):',
        top15Trades: 'Min 24h Trades:',
        top15Button: 'START',
        top15Waiting: 'Waiting for scan...',
        top15Number: '№',
        top15Ticker: 'Ticker',
        top15VolumeCol: 'Volume',
        top15Rank: 'Rank',
        top15TradesCol: 'Trades',
        top15ChangeCol: 'Price Change',
        top15TotalRank: 'Total Rank',
        top15InfoBtn: 'Info',
        top15InfoTitle: 'How the Top-15 screener works',
        top15InfoBody: '<ul><li><strong>Pairs used:</strong> Binance Futures USDT pairs from the 24h ticker feed.</li><li><strong>Filters:</strong> volume, price change, and trade count must all meet your thresholds.</li><li><strong>Ranking:</strong> each pair gets separate ranks for volume, trades, and price change, then the three ranks are summed into the final total rank.</li><li><strong>Output:</strong> the table shows the top 15 pairs starting from the lowest total rank.</li></ul>',
        // RSI Screener labels
        rsiTitle: 'RSI Screener (Binance Futures USDT)',
        rsiTimeframe: 'Timeframe:',
        rsiVolume: 'Min 24h Volume (USDT):',
        rsiChange: 'Min Price Change (%):',
        rsiOversold: 'Oversold threshold:',
        rsiOverbought: 'Overbought threshold:',
        rsiButton: 'RUN RSI SCAN',
        rsiOversoldHeading: '🟢 OVERSOLD',
        rsiOverboughtHeading: '🔴 OVERBOUGHT',
        rsiInfoBtn: 'Info',
        rsiInfoTitle: 'How to use RSI Screener',
        rsiInfoBody: `<p>The RSI Screener scans Binance Futures USDT pairs and flags coins that are currently oversold or overbought according to your thresholds. Use volume and price-change filters to limit the universe to liquid and moving assets. Adjust timeframe for different strategies (5m for scalping, 1h for swings, 1d for macro).</p>`,
        rsiWaiting: 'Waiting for scan...'
    },
    'RUS': {
      button: 'Рус.',
      options: ['Анг.', 'Рус.', 'Укр.'],
      navMarketPulse: 'Рыночный пульс',
      navAnalytics: 'Аналитика',
      navDailyReview: 'Ежедневный обзор рынка',
      navTopicDay: 'Тема дня',
      navWeeklyHeadliners: 'Хедлайнеры недели',
      navNewCryptoFaces: 'Новые лица крипторынка',
      marketPulseSubtitle: 'Аналитика и обработка данных: Swappy AI Assistant',
      navCheatSheet: 'Шпаргалка',
      navScreeners: 'Скринеры',
      navAbout: 'О проекте',
      cheatsheetTitle: 'Шпаргалка',
      cheatsheetSubtitle: 'Базовые правила, риск-менеджмент и ключевые концепции для криптотрейдера',
      aboutTitle: 'О проекте CryptoStatix',
      aboutDesc: '<strong>CryptoStatix</strong> — это аналитическая платформа, созданная для трейдеров и инвесторов, которым важна чистота данных и оперативность. Мы не просто показываем графики, мы помогаем увидеть структуру рынка через призму ключевых метрик.',
      aboutWhatTitle: 'Что мы делаем?',
      aboutWhatDesc: 'Наш сервис агрегирует данные напрямую с Binance и CoinGecko, предоставляя вам инструменты профессионального уровня в один клик:',
      aboutCard1Title: 'Real-time Мониторинг',
      aboutCard1Desc: 'Отслеживание волатильности и объемов в реальном времени.',
      aboutCard2Title: 'Смарт-аналитика',
      aboutCard2Desc: 'Быстрый доступ к RSI, тепловым картам ликвидности и доминированию активов.',
      aboutCard3Title: 'Фокус на трендах',
      aboutCard3Desc: 'Мы подсвечиваем перспективные экосистемы, такие как MemeCore, AI-инфраструктуру и Layer-2 решения.',
      aboutMissionTitle: 'Наша миссия',
      aboutMissionDesc: 'Упростить процесс принятия решений. В мире, где информация обновляется каждую секунду, CryptoStatix становится вашим фильтром, отсекая шум и оставляя только факты.',
      aboutCommunityTitle: 'Присоединяйтесь к нашему комьюнити',
      aboutCommunityDesc: 'Для тех, кто хочет держать руку на пульсе 24/7, мы запустили официальный Telegram-канал. Там мы публикуем:',
      aboutItem1: 'Срочные уведомления об аномальных движениях рынка.',
      aboutItem2: 'Обзоры перспективных токенов.',
      aboutItem3: 'Обновления функционала нашего сайта.',
      aboutEmail: 'admin@cryptostatix.pp.ua',
      aboutTgLink: 'CryptoStatix_news/Аналитика и данные',
      aiWelcome: 'Привет! Я твой AI-ассистент в мире CryptoStatix. Анализирую рынок 24/7. Какой актив обсудим сегодня? 📈',
      aiPlaceholder: 'Введите ваш запрос...',
      aiAgentCircular: 'ваш персональный ии-агент',
      smcTitle: 'SMC Смарт-Сканер (Binance Futures)',
      smcTimeframe: 'Таймфрейм:',
      smcVolume: 'Мин. Объем 24ч (USDT):',
      smcChange: 'Мин. Изменение цены (%):',
      smcWindow: 'Фильтр шума (свечей):',
      smcButton: 'ЗАПУСТИТЬ АНАЛИЗ',
      smcLong: '🟢 МАКРО-ТРЕНД LONG',
      smcShort: '🔴 МАКРО-ТРЕНД SHORT',
      smcWaiting: 'Ожидание запуска анализа...',
      smcInfoBtn: 'Инфо',
      smcInfoTitle: 'Что такое SMC Смарт-Сканер?',
      smcInfoBody: `<p><strong>SMC Смарт-Сканер</strong> — это автоматический аналитический инструмент, разработанный для трейдеров и инвесторов. Он предназначен для мгновенной оценки структуры рынка криптовалютных фьючерсов на бирже Binance по концепции Smart Money (SMC). Вместо того чтобы вручную открывать десятки графиков и искать тренды, сканер за один клик перебирает сотни активных торговых пар, очищает их от рыночного шума с помощью математического алгоритма и выдает готовые списки монет, находящихся в сильных макро-трендах.</p>
        <h4>Как это работает (Для пользователя сайта)</h4>
        <p>Пользоваться сканером на сайте очень просто — весь процесс разбит на 3 шага:</p>
        <h5>1. Настройка фильтров (выбор параметров):</h5>
        <ul>
          <li><strong>Таймфрейм:</strong> Выберите временной масштаб для анализа. Меньшие таймфреймы (5 минут) подходят для быстрых сделок внутри дня (скальпинг), а старшие (1 час) — для более надежных и затяжных позиций (свинг-трейдинг).</li>
          <li><strong>Мин. Объем 24ч (USDT):</strong> Фильтр ликвидности. Он автоматически отсекает «мертвые» и малоторгуемые монеты. Значение по умолчанию ($50,000,000) оставляет только те активы, где есть крупные игроки.</li>
          <li><strong>Мин. Изменение цены (%):</strong> Отсеивает монеты, которые стоят в жестком флэте (боковике), собирая только волатильные, двигающиеся активы.</li>
          <li><strong>Фильтр шума (свечей):</strong> Задает строгость определения рыночной структуры. Чем выше цифра, тем более крупные и глобальные ценовые максимумы и минимумы берет в расчет алгоритм.</li>
        </ul>
        <h5>2. Запуск анализа:</h5>
        <p>Нажмите большую зеленую кнопку «ЗАПУСТИТЬ АНАЛИЗ». На экране появится статус загрузки. В этот момент сайт отправляет команду в облако, подключается напрямую к бирже Binance, скачивает историю свечей по каждой монете и производит расчеты.</p>
        <h5>3. Получение сигналов:</h5>
        <p>Через несколько секунд сканер выведет результат в виде двух списков:</p>
        <p>🟢 <strong>МАКРО-ТРЕНД LONG:</strong> Список монет, у которых структура графика стабильно повышается (крупные покупатели толкают цену вверх). Идеально для поиска точек входа в покупки.</p>
        <p>🔴 <strong>МАКРО-ТРЕНД SHORT:</strong> Список монет с устойчивым нисходящим трендом, где доминируют продавцы. Идеально для поиска сделок на понижение.</p>
        <p>Все расчеты происходят изолированно в облаке, поэтому инструмент работает быстро и не нагружает компьютер пользователя.</p>`
      ,
      // Top-15 labels (RUS)
      top15Title: 'Скринер Топ-15 (Binance Futures USDT)',
      top15Volume: 'Мин. объем 24ч (USDT):',
      top15Change: 'Мин. изм. цены 24ч (%):',
      top15Trades: 'Мин. кол-во сделок 24ч:',
      top15Button: 'СТАРТ',
      top15Waiting: 'Ожидание запуска...',
      top15Number: '№',
      top15Ticker: 'Тикер',
      top15VolumeCol: 'Объем',
      top15Rank: 'Ранг',
      top15TradesCol: 'Сделки',
      top15ChangeCol: 'Изм. цены',
      top15TotalRank: 'Суммарный ранг',
      top15InfoBtn: 'Инфо',
      top15InfoTitle: 'Как работает скринер Топ-15',
      top15InfoBody: '<ul><li><strong>Пары:</strong> используются пары Binance Futures USDT из 24-часового ticker-фида.</li><li><strong>Фильтры:</strong> объем, изменение цены и количество сделок должны соответствовать вашим порогам.</li><li><strong>Ранжирование:</strong> каждая пара получает отдельные ранги по объему, сделкам и изменению цены, после чего их сумма дает итоговый суммарный ранг.</li><li><strong>Результат:</strong> в таблице отображаются 15 пар, начиная с наименьшего суммарного ранга.</li></ul>',
      // RSI labels (RUS)
      rsiTitle: 'Скринер RSI (Binance Futures USDT)',
      rsiTimeframe: 'Таймфрейм:',
      rsiVolume: 'Мин. Объем 24ч (USDT):',
      rsiChange: 'Мин. Изменение цены (%):',
      rsiOversold: 'Порог перепроданности:',
      rsiOverbought: 'Порог перекупленности:',
      rsiButton: 'ЗАПУСТИТЬ RSI СКАН',
      rsiOversoldHeading: '🟢 ПЕРЕПРОДАННОСТЬ',
      rsiOverboughtHeading: '🔴 ПЕРЕКУПЛЕННОСТЬ',
      rsiInfoBtn: 'Инфо',
      rsiInfoTitle: 'Как пользоваться Скринером RSI',
      rsiInfoBody: `<p>Скринер RSI проверяет пары Binance Futures (USDT) и помечает монеты, находящиеся в зоне перепроданности или перекупленности по заданным порогам. Используйте фильтры по объему и изменению цены, чтобы сузить выбор до ликвидных и активных активов. Выбирайте таймфрейм в зависимости от стратегии (5m — скальпинг, 1h — свинг, 1d — макро).</p>`
    },
    'UKR': {
      button: 'Укр.',
      options: ['Анг.', 'Рос.', 'Укр.'],
      navMarketPulse: 'Ринковий пульс',
      navAnalytics: 'Аналітика',
      navDailyReview: 'Щоденний огляд ринку',
      navTopicDay: 'Тема дня',
      navWeeklyHeadliners: 'Хедлайнери тижня',
      navNewCryptoFaces: 'Нові обличчя крипторинку',
      marketPulseSubtitle: 'Аналітика та обробка даних: Swappy AI Assistant',
      navCheatSheet: 'Шпаргалка',
      navScreeners: 'Скрінери',
      navAbout: 'Про проект',
      cheatsheetTitle: 'Шпаргалка',
      cheatsheetSubtitle: 'Базові правила, ризик-менеджмент та ключові концепції для криптотрейдера',
      aboutTitle: 'Про проект CryptoStatix',
      aboutDesc: '<strong>CryptoStatix</strong> — це аналітична платформа, створена для трейдерів та інвесторів, яким важлива чистота даних та оперативність. Ми не просто показуємо графіки, ми допомагаємо побачити структуру ринку через призму ключових метрик.',
      aboutWhatTitle: 'Що ми робимо?',
      aboutWhatDesc: 'Наш сервіс агрегує дані безпосередньо з Binance та CoinGecko, надаючи вам інструменти професійного рівня в один клік:',
      aboutCard1Title: 'Real-time Моніторинг',
      aboutCard1Desc: 'Відстеження волатильності та обсягів у реальному часі.',
      aboutCard2Title: 'Смарт-аналітика',
      aboutCard2Desc: 'Швидкий доступ до RSI, теплових карт ліквідності та домінування активів.',
      aboutCard3Title: 'Фокус на трендах',
      aboutCard3Desc: 'Ми підсвічуємо перспективні екосистеми, такі як MemeCore, AI-інфраструктуру та Layer-2 рішення.',
      aboutMissionTitle: 'Наша місія',
      aboutMissionDesc: 'Спростити процес прийняття рішень. У світі, де інформація оновлюється кожну секунду, CryptoStatix стає вашим фільтром, відсікаючи шум і залишаючи лише факти.',
      aboutCommunityTitle: 'Приєднуйтесь до нашої спільноти',
      aboutCommunityDesc: 'Для тих, хто хоче тримати руку на пульсі 24/7, ми запустили офіційний Telegram-канал. Там ми публікуємо:',
      aboutItem1: 'Термінові повідомлення про аномальні рухи ринку.',
      aboutItem2: 'Огляди перспективних токенів.',
      aboutItem3: 'Оновлення функціоналу нашого сайту.',
      aboutEmail: 'admin@cryptostatix.pp.ua',
      aboutTgLink: '🔗 CryptoStatix_news | Аналітика та дані',
      aiWelcome: 'Привіт! Я твій AI-асистент у світі CryptoStatix. Аналізую ринок 24/7. Який актив обговоримо сьогодні? 📈',
      aiPlaceholder: 'Введіть ваш запит...',
      aiAgentCircular: 'ваш персональний ші-агент',
      smcTitle: 'SMC Смарт-Сканер (Binance Futures)',
      smcTimeframe: 'Таймфрейм:',
      smcVolume: 'Мін. Обсяг 24г (USDT):',
      smcChange: 'Мін. Зміна ціни (%):',
      smcWindow: 'Фільтр шуму (свічок):',
      smcButton: 'ЗАПУСТИТИ АНАЛІЗ',
      smcLong: '🟢 МАКРО-ТРЕНД LONG',
      smcShort: '🔴 МАКРО-ТРЕНД SHORT',
      smcWaiting: 'Очікування запуску аналізу...',
      smcInfoBtn: 'Інфо',
      smcInfoTitle: 'Що таке SMC Смарт-Сканер?',
      smcInfoBody: `<p><strong>SMC Смарт-Сканер</strong> — це автоматичний аналітичний інструмент, розроблений для трейдерів та інвесторів. Він призначений для миттєвої оцінки структури ринку криптовалютних ф'ючерсів на біржі Binance за концепцією Smart Money (SMC). Замість того, щоб вручну відкривати десятки графіків і шукати тренди, сканер одним кліком перебирає сотні активних торгових пар, очищує їх від ринкового шуму за допомогою математичного алгоритму і видає готові списки монет, що знаходяться у сильних макро-трендах.</p>
        <h4>Як це працює (для користувача сайту)</h4>
        <p>Користуватися сканером на сайті дуже просто — увесь процес розбитий на 3 кроки:</p>
        <h5>1. Налаштування фільтрів (вибір параметрів):</h5>
        <ul>
          <li><strong>Таймфрейм:</strong> Оберіть часовий масштаб для аналізу. Менші таймфрейми (5 хвилин) підходять для швидких угод всередині дня (скальпінг), а старші (1 година) — для більш надійних свінг-позицій.</li>
          <li><strong>Мін. Обсяг 24г (USDT):</strong> Фільтр ліквідності. Він автоматично відсікає «мертві» та малоторгові монети. Значення за замовчуванням ($50,000,000) залишає лише ті активи, де присутні великі гравці.</li>
          <li><strong>Мін. Зміна ціни (%):</strong> Відсіює монети, що перебувають у вузькому флеті, вибираючи лише волатильні активи, що рухаються.</li>
          <li><strong>Фільтр шуму (свічок):</strong> Встановлює суворість визначення ринкової структури. Чим вища цифра, тим більші та глобальніші максимуми/мінімуми бере до уваги алгоритм.</li>
        </ul>
        <h5>2. Запуск аналізу:</h5>
        <p>Натисніть велику зелену кнопку «ЗАПУСТИТИ АНАЛІЗ». На екрані з'явиться статус завантаження. У цей момент сайт надсилає команду в хмару, підключається до Binance, завантажує історію свічок по кожній монеті та виконує розрахунки.</p>
        <h5>3. Отримання сигналів:</h5>
        <p>Через кілька секунд сканер виведе результат у вигляді двох списків:</p>
        <p>🟢 <strong>МАКРО-ТРЕНД LONG:</strong> Список монет зі стабільно зростаючою структурою — ідеально для пошуку точок входу в покупки.</p>
        <p>🔴 <strong>МАКРО-ТРЕНД SHORT:</strong> Список монет зі стійким низхідним трендом — ідеально для пошуку шорт-можливостей.</p>
        <p>Всі розрахунки виконуються в хмарі, тож інструмент працює швидко і не навантажує комп'ютер користувача.</p>`
      ,
      // Top-15 labels (UKR)
      top15Title: 'Скрінер Топ-15 (Binance Futures USDT)',
      top15Volume: 'Мін. обсяг 24г (USDT):',
      top15Change: 'Мін. змінa ціни 24г (%):',
      top15Trades: 'Мін. к-ть угод 24г:',
      top15Button: 'СТАРТ',
      top15Waiting: 'Очікування запуску...',
      top15Number: '№',
      top15Ticker: 'Тікер',
      top15VolumeCol: 'Обсяг',
      top15Rank: 'Ранг',
      top15TradesCol: 'Угоди',
      top15ChangeCol: 'Зміна ціни',
      top15TotalRank: 'Сумарний ранг',
      top15InfoBtn: 'Інфо',
      top15InfoTitle: 'Як працює скрінер Топ-15',
      top15InfoBody: '<ul><li><strong>Пари:</strong> використовуються пари Binance Futures USDT з 24-годинного ticker-фіду.</li><li><strong>Фільтри:</strong> обсяг, зміна ціни та кількість угод мають відповідати вашим порогам.</li><li><strong>Ранжування:</strong> кожна пара отримує окремі ранги за обсягом, угодами та зміною ціни, після чого їх сума дає фінальний сумарний ранг.</li><li><strong>Результат:</strong> у таблиці показано 15 пар, починаючи з найменшого сумарного рангу.</li></ul>',
      // RSI labels (UKR)
      rsiTitle: 'Скрінер RSI (Binance Futures USDT)',
      rsiTimeframe: 'Таймфрейм:',
      rsiVolume: 'Мін. Обсяг 24г (USDT):',
      rsiChange: 'Мін. Зміна ціни (%):',
      rsiOversold: 'Поріг перепроданості:',
      rsiOverbought: 'Поріг перекупленості:',
      rsiButton: 'ЗАПУСТИТИ RSI СКАН',
      rsiOversoldHeading: '🟢 ПЕРЕПРОДАНІСТЬ',
      rsiOverboughtHeading: '🔴 ПЕРЕКУПЛЕНІСТЬ',
      rsiInfoBtn: 'Інфо',
      rsiInfoTitle: 'Як користуватись Скрінером RSI',
      rsiInfoBody: `<p>Скрінер RSI перевіряє пари Binance Futures (USDT) і позначає монети, що знаходяться в зоні перепроданості або перекупленості за заданими порогами. Використовуйте фільтри по обсягу та зміні ціни, щоб звузити вибір до ліквідних і активних активів. Обирайте таймфрейм залежно від стратегії (5m — скальпінг, 1h — свінг, 1d — макро).</p>`
    }
  };


  const current = translations[langCode];
  if (!current) return;

  if (langDisplay) {
    langDisplay.textContent = current.button;
  }

  // Update navigation buttons
  const navAnalytics = document.getElementById('nav-analytics');
  const navMarketPulseTrigger = document.getElementById('nav-market-pulse-trigger');
  const navDailyReview = document.getElementById('nav-daily-review');
  const navTopicDay = document.getElementById('nav-topic-day');
  const navWeeklyHeadliners = document.getElementById('nav-weekly-headliners');
  const navNewCryptoFaces = document.getElementById('nav-new-crypto-faces');
  const navCheatSheet = document.getElementById('nav-cheatsheet');
  const navScreeners = document.getElementById('nav-screeners');
  const navAbout = document.getElementById('nav-about');
  if (navAnalytics) navAnalytics.textContent = current.navAnalytics;
  if (navMarketPulseTrigger) navMarketPulseTrigger.textContent = current.navMarketPulse;
  if (navDailyReview) navDailyReview.textContent = current.navDailyReview;
  if (navTopicDay) navTopicDay.textContent = current.navTopicDay;
  if (navWeeklyHeadliners) navWeeklyHeadliners.textContent = current.navWeeklyHeadliners;
  if (navNewCryptoFaces) navNewCryptoFaces.textContent = current.navNewCryptoFaces;
  if (navCheatSheet) navCheatSheet.textContent = current.navCheatSheet;
  if (navScreeners) navScreeners.textContent = current.navScreeners;
  if (navAbout) navAbout.textContent = current.navAbout;

  // Update Subpage Titles & Back Buttons
  const analyticsTitle = document.querySelector('#analytics h2');
  if (analyticsTitle) analyticsTitle.textContent = current.navAnalytics;
  const dailyReviewTitle = document.getElementById('daily-review-title');
  if (dailyReviewTitle) dailyReviewTitle.textContent = current.navDailyReview;
  const topicDayTitle = document.getElementById('topic-day-title');
  if (topicDayTitle) topicDayTitle.textContent = current.navTopicDay;
  const weeklyHeadlinersTitle = document.getElementById('weekly-headliners-title');
  if (weeklyHeadlinersTitle) weeklyHeadlinersTitle.textContent = current.navWeeklyHeadliners;
  const newCryptoFacesTitle = document.getElementById('new-crypto-faces-title');
  if (newCryptoFacesTitle) newCryptoFacesTitle.textContent = current.navNewCryptoFaces;
  const cheatsheetTitle = document.getElementById('cheatsheet-title-text');
  if (cheatsheetTitle) cheatsheetTitle.textContent = current.cheatsheetTitle || 'Cheat Sheet';
  const cheatsheetSubtitle = document.getElementById('cheatsheet-subtitle');
  if (cheatsheetSubtitle) cheatsheetSubtitle.textContent = current.cheatsheetSubtitle || 'Basic rules, risk management, and key concepts for a crypto trader';
  document.querySelectorAll('.market-pulse-subtitle').forEach((subtitle) => {
    subtitle.textContent = current.marketPulseSubtitle;
  });
  const screenersTitle = document.querySelector('#screeners h2');
  if (screenersTitle) screenersTitle.textContent = current.navScreeners;

  // Update Grid Captions
  const analyticsItems = detailConfig.analytics.items;
  const analyticsCaptions = document.querySelectorAll('#analytics .grid-caption');
  analyticsItems.forEach((item, idx) => {
    if (analyticsCaptions[idx]) {
      let title = item.title;
      if (langCode === 'ENG' && item.titleEng) title = item.titleEng;
      if (langCode === 'UKR' && item.titleUkr) title = item.titleUkr;
      if (langCode === 'RUS' && item.titleRus) title = item.titleRus;
      analyticsCaptions[idx].innerText = title;
    }
  });

  const screenersItems = detailConfig.screeners.items;
  const screenersCaptions = document.querySelectorAll('#screeners .grid-caption');
  screenersItems.forEach((item, idx) => {
    if (screenersCaptions[idx]) {
      let title = item.title;
      if (langCode === 'ENG' && item.titleEng) title = item.titleEng;
      if (langCode === 'UKR' && item.titleUkr) title = item.titleUkr;
      if (langCode === 'RUS' && item.titleRus) title = item.titleRus;
      screenersCaptions[idx].innerText = title;
    }
  });

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

  // Update AI Agent circular text
  const aiAgentText = document.getElementById('ai-agent-text');
  if (aiAgentText && current.aiAgentCircular) {
    aiAgentText.textContent = current.aiAgentCircular;
  }

  // Update hidden SMC scanner template
  const smcTitleEl = document.getElementById('smc-title');
  const smcTimeframeLabel = document.getElementById('smc-label-timeframe');
  const smcVolumeLabel = document.getElementById('smc-label-volume');
  const smcChangeLabel = document.getElementById('smc-label-change');
  const smcWindowLabel = document.getElementById('smc-label-window');
  const smcButton = document.getElementById('btn-run-scan');
  const smcLongHeading = document.getElementById('smc-long-heading');
  const smcShortHeading = document.getElementById('smc-short-heading');
  const smcLongsList = document.getElementById('smc-longs-list');
  const smcShortsList = document.getElementById('smc-shorts-list');

  if (smcTitleEl) smcTitleEl.textContent = current.smcTitle;
  if (smcTimeframeLabel) smcTimeframeLabel.textContent = current.smcTimeframe;
  if (smcVolumeLabel) smcVolumeLabel.textContent = current.smcVolume;
  if (smcChangeLabel) smcChangeLabel.textContent = current.smcChange;
  if (smcWindowLabel) smcWindowLabel.textContent = current.smcWindow;
  if (smcButton) smcButton.textContent = current.smcButton;
  if (smcLongHeading) smcLongHeading.textContent = current.smcLong;
  if (smcShortHeading) smcShortHeading.textContent = current.smcShort;

  // Update Top-15 screener template
  const top15TitleEl = document.getElementById('top15-title');
  const top15VolumeLabel = document.getElementById('top15-label-volume');
  const top15ChangeLabel = document.getElementById('top15-label-change');
  const top15TradesLabel = document.getElementById('top15-label-trades');
  const top15Button = document.getElementById('btn-run-top15');
  const top15InfoBtn = document.getElementById('top15-info-btn');
  const top15InfoTitle = document.getElementById('top15-info-title');
  const top15InfoBody = document.getElementById('top15-info-body');
  const top15HeaderNumber = document.getElementById('top15-header-number');
  const top15HeaderTicker = document.getElementById('top15-header-ticker');
  const top15HeaderVolume = document.getElementById('top15-header-volume');
  const top15HeaderVolumeRank = document.getElementById('top15-header-volume-rank');
  const top15HeaderTrades = document.getElementById('top15-header-trades');
  const top15HeaderTradesRank = document.getElementById('top15-header-trades-rank');
  const top15HeaderChange = document.getElementById('top15-header-change');
  const top15HeaderChangeRank = document.getElementById('top15-header-change-rank');
  const top15HeaderTotalRank = document.getElementById('top15-header-total-rank');
  const top15ResultsBody = document.getElementById('top15-results-body');

  if (top15TitleEl) top15TitleEl.textContent = current.top15Title;
  if (top15VolumeLabel) top15VolumeLabel.textContent = current.top15Volume;
  if (top15ChangeLabel) top15ChangeLabel.textContent = current.top15Change;
  if (top15TradesLabel) top15TradesLabel.textContent = current.top15Trades;
  if (top15Button) { top15Button.textContent = current.top15Button; top15Button.setAttribute('data-default', current.top15Button); }
  if (top15InfoBtn) top15InfoBtn.textContent = current.top15InfoBtn;
  if (top15InfoTitle) top15InfoTitle.textContent = current.top15InfoTitle;
  if (top15InfoBody) top15InfoBody.innerHTML = current.top15InfoBody;
  if (top15HeaderNumber) top15HeaderNumber.textContent = current.top15Number;
  if (top15HeaderTicker) top15HeaderTicker.textContent = current.top15Ticker;
  if (top15HeaderVolume) top15HeaderVolume.textContent = current.top15VolumeCol;
  if (top15HeaderVolumeRank) top15HeaderVolumeRank.textContent = current.top15Rank;
  if (top15HeaderTrades) top15HeaderTrades.textContent = current.top15TradesCol;
  if (top15HeaderTradesRank) top15HeaderTradesRank.textContent = current.top15Rank;
  if (top15HeaderChange) top15HeaderChange.textContent = current.top15ChangeCol;
  if (top15HeaderChangeRank) top15HeaderChangeRank.textContent = current.top15Rank;
  if (top15HeaderTotalRank) top15HeaderTotalRank.textContent = current.top15TotalRank;
  if (top15ResultsBody && (top15ResultsBody.textContent.includes('Ожидание запуска...') || top15ResultsBody.textContent.includes('Waiting for scan...') || top15ResultsBody.textContent.includes('Очікування запуску...'))) {
    top15ResultsBody.innerHTML = `<tr><td colspan="9" style="padding: 18px; text-align: center; color: #94a3b8;">${current.top15Waiting}</td></tr>`;
  }

  // Update hidden RSI scanner template
  const rsiTitleEl = document.getElementById('rsi-title');
  const rsiTimeframeLabel = document.getElementById('rsi-label-timeframe');
  const rsiVolumeLabel = document.getElementById('rsi-label-volume');
  const rsiChangeLabel = document.getElementById('rsi-label-change');
  const rsiOversoldLabel = document.getElementById('rsi-label-oversold');
  const rsiOverboughtLabel = document.getElementById('rsi-label-overbought');
  const rsiButton = document.getElementById('btn-run-rsi');
  const rsiOversoldHeading = document.getElementById('rsi-oversold-heading');
  const rsiOverboughtHeading = document.getElementById('rsi-overbought-heading');

  if (rsiTitleEl) rsiTitleEl.textContent = current.rsiTitle;
  if (rsiTimeframeLabel) rsiTimeframeLabel.textContent = current.rsiTimeframe;
  if (rsiVolumeLabel) rsiVolumeLabel.textContent = current.rsiVolume;
  if (rsiChangeLabel) rsiChangeLabel.textContent = current.rsiChange;
  if (rsiOversoldLabel) rsiOversoldLabel.textContent = current.rsiOversold;
  if (rsiOverboughtLabel) rsiOverboughtLabel.textContent = current.rsiOverbought;
  if (rsiButton) rsiButton.textContent = current.rsiButton;
  if (rsiButton) rsiButton.setAttribute('data-default', current.rsiButton);
  if (rsiOversoldHeading) rsiOversoldHeading.textContent = current.rsiOversoldHeading;
  if (rsiOverboughtHeading) rsiOverboughtHeading.textContent = current.rsiOverboughtHeading;

  const placeholderTexts = ['Ожидание запуска анализа...', 'Waiting for scan...', 'Очікування запуску аналізу...'];
  if (smcLongsList && placeholderTexts.includes(smcLongsList.textContent.trim())) {
    smcLongsList.textContent = current.smcWaiting;
  }
  if (smcShortsList && placeholderTexts.includes(smcShortsList.textContent.trim())) {
    smcShortsList.textContent = current.smcWaiting;
  }

  const rsiPlaceholderTexts = ['Ожидание сканирования...', 'Waiting for scan...', 'Очікування сканування...'];
  const rsiOversoldListEl = document.getElementById('rsi-oversold-list');
  const rsiOverboughtListEl = document.getElementById('rsi-overbought-list');

  if (rsiOversoldListEl && rsiPlaceholderTexts.includes(rsiOversoldListEl.textContent.trim())) {
    rsiOversoldListEl.textContent = current.rsiWaiting;
  }
  if (rsiOverboughtListEl && rsiPlaceholderTexts.includes(rsiOverboughtListEl.textContent.trim())) {
    rsiOverboughtListEl.textContent = current.rsiWaiting;
  }

  // Update About page content
  const ids = {
    'about-title': 'aboutTitle',
    'about-desc': 'aboutDesc',
    'about-what-title': 'aboutWhatTitle',
    'about-what-desc': 'aboutWhatDesc',
    'about-card-1-title': 'aboutCard1Title',
    'about-card-1-desc': 'aboutCard1Desc',
    'about-card-2-title': 'aboutCard2Title',
    'about-card-2-desc': 'aboutCard2Desc',
    'about-card-3-title': 'aboutCard3Title',
    'about-card-3-desc': 'aboutCard3Desc',
    'about-mission-title': 'aboutMissionTitle',
    'about-mission-desc': 'aboutMissionDesc',
    'about-community-title': 'aboutCommunityTitle',
    'about-community-desc': 'aboutCommunityDesc',
    'about-community-item-1': 'aboutItem1',
    'about-community-item-2': 'aboutItem2',
    'about-community-item-3': 'aboutItem3',
    'about-email': 'aboutEmail',
    'about-tg-link': 'aboutTgLink'
  };

  // Add SMC info modal/button mapping
  ids['smc-info-btn'] = 'smcInfoBtn';
  ids['smc-info-title'] = 'smcInfoTitle';
  ids['smc-info-body'] = 'smcInfoBody';

  // Add Top-15 info modal/button mapping
  ids['top15-info-btn'] = 'top15InfoBtn';
  ids['top15-info-title'] = 'top15InfoTitle';
  ids['top15-info-body'] = 'top15InfoBody';

  // Add RSI info modal/button mapping
  ids['rsi-info-btn'] = 'rsiInfoBtn';
  ids['rsi-info-title'] = 'rsiInfoTitle';
  ids['rsi-info-body'] = 'rsiInfoBody';

  for (const [id, key] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) {
      if (key === 'aboutDesc' || key === 'smcInfoBody' || key === 'top15InfoBody' || key === 'rsiInfoBody') el.innerHTML = current[key];
      else el.textContent = current[key];
    }
  }

  // Update AI Assistant
  const aiWelcome = document.getElementById('ai-welcome-msg');
  const aiInput = document.getElementById('ai-user-input');
  if (aiWelcome) aiWelcome.textContent = current.aiWelcome;
  if (aiInput) aiInput.placeholder = current.aiPlaceholder;

  // Keep Telegram only for Russian; email remains visible in every language.
  const communitySec = document.getElementById('about-community-section');
  const missionSec = document.getElementById('about-mission-section');
  const tgLink = document.getElementById('about-tg-link');
  const emailLink = document.getElementById('about-email');
  const communityDesc = document.getElementById('about-community-desc');
  const communityItems = [
    document.getElementById('about-community-item-1'),
    document.getElementById('about-community-item-2'),
    document.getElementById('about-community-item-3')
  ];

  if (communitySec && missionSec) {
    if (langCode === 'RUS') {
      communitySec.style.display = 'block';
      missionSec.style.flex = '1';
      if (communityDesc) communityDesc.style.display = 'none';
      communityItems.forEach(item => { if (item) item.style.display = 'none'; });
      if (tgLink) tgLink.closest('a').style.display = 'inline-flex';
    } else {
      communitySec.style.display = 'none';
      missionSec.style.flex = '1 1 100%';
    }
  }

  if (emailLink) {
    emailLink.title = 'Copy email address';
    emailLink.setAttribute('aria-label', 'Copy email address');
    emailLink.style.display = 'inline-flex';
    emailLink.style.cursor = 'pointer';

    const copyEmailAddress = async () => {
      const address = 'admin@cryptostatix.pp.ua';
      try {
        await navigator.clipboard.writeText(address);
        const previousText = emailLink.textContent;
        emailLink.textContent = 'Copied!';
        emailLink.style.color = '#00130b';
        emailLink.style.background = 'rgba(0, 255, 136, 0.9)';
        setTimeout(() => {
          emailLink.textContent = previousText;
          emailLink.style.color = 'var(--accent)';
          emailLink.style.background = 'rgba(0, 255, 136, 0.05)';
        }, 900);
      } catch (error) {
        console.warn('Clipboard copy failed:', error);
      }
    };

    emailLink.onmouseenter = copyEmailAddress;
    emailLink.onclick = (event) => {
      event.preventDefault();
      copyEmailAddress();
    };
  }

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

  if (typeof window.renderCheatSheetGrid === 'function') {
    window.renderCheatSheetGrid();
  }

  // Notify any embedded iframes (same-origin pages) about language change
  try {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(frame => {
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: 'lang_change', lang: langCode }, '*');
      }
    });
  } catch (e) {
    // silently ignore cross-origin or other issues
    console.warn('iframe language notify failed', e);
  }

  // Refresh detail body if open
  const detailPage = document.getElementById('detail-page');
  if (detailPage && detailPage.classList.contains('active') && detailOrigin && currentDetailIndex) {
    if (window.cheatDetailOpenedFrom) {
      window.openCheatDetail(
        currentDetailIndex - 1,
        window.cheatDetailOpenedFrom,
        window.cheatDetailReturnIndex || 1
      );
    } else {
      const config = detailConfig[detailOrigin];
      const item = config.items[currentDetailIndex - 1];

      // Refresh title
      let label = config.label;
      if (langCode === 'ENG') label = config.labelEng || label;
      if (langCode === 'UKR') label = config.labelUkr || label;

      let itemTitle = item.title;
      if (langCode === 'ENG' && item.titleEng) itemTitle = item.titleEng;
      if (langCode === 'UKR' && item.titleUkr) itemTitle = item.titleUkr;
      if (langCode === 'RUS' && item.titleRus) itemTitle = item.titleRus;

      renderDetailTitle(document.getElementById('detail-title'), label, itemTitle, detailOrigin, currentDetailIndex, langCode);

      // Refresh body
      document.getElementById('detail-body').innerHTML = buildDetailBody(detailOrigin, currentDetailIndex, item, langCode);
    }
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
  if (typeof window.renderCheatSheetGrid === 'function') {
    window.renderCheatSheetGrid();
  }

  updatePrices();
  setInterval(updatePrices, 60000);
  initEffects();
});
// --- БЛОК ИИ-АГЕНТА ---

async function askAI(userPrompt) {
  try {
    const endpoint = window.location.hostname === 'localhost' ? 'http://localhost:5174/.netlify/functions/ask-ai' : '/.netlify/functions/ask-ai';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const result = await response.json();
    
    // Пытаемся достать текст из всех возможных мест
    const answer = result.reply || (result.choices && result.choices[0]?.message?.content);
    
    if (answer) return answer;
    return "Ошибка: ИИ прислал пустой ответ.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Не удалось связаться с ИИ-агентом. Проверьте консоль (F12).";
  }
}

// Слушатель для кнопки чата (убедитесь, что ID совпадают с вашим HTML)
document.addEventListener('DOMContentLoaded', () => {
  const aiBtn = document.getElementById('ai-send-btn');
  const aiInput = document.getElementById('ai-input');
  const aiDisplay = document.getElementById('ai-response-area');

  if (aiBtn && aiInput) {
    aiBtn.addEventListener('click', async () => {
      const text = aiInput.value.trim();
      if (!text) return;

      aiBtn.disabled = true;
      const originalBtnText = aiBtn.innerText;
      aiBtn.innerText = '...';

      const answer = await askAI(text);
      
      if (aiDisplay) {
        aiDisplay.innerText = answer;
      } else {
        alert(answer);
      }

      aiBtn.disabled = false;
      aiBtn.innerText = originalBtnText;
      aiInput.value = '';
    });
  }
});
