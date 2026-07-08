# Развертывание на Netlify

## Быстрый старт

### 1. Подготовка репозитория
Убедитесь что проект залит на GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/cryptostatix-web.git
git push -u origin main
```

### 2. Подключение к Netlify

**Способ 1: Через веб-интерфейс (проще)**
1. Перейдите на [app.netlify.com](https://app.netlify.com)
2. Нажмите "Add new site" → "Import an existing project"
3. Выберите GitHub и авторизуйтесь
4. Выберите репозиторий `cryptostatix-web`
5. Настройки сборки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

**Способ 2: Через Netlify CLI**
```bash
npm install -g netlify-cli
netlify init
# Выберите свой репозиторий и следуйте инструкциям
```

### 3. Развертывание
После подключения:
1. Любой push в `main` автоматически запустит сборку
2. Netlify выполнит `npm run build`
3. Обслужит файлы из `dist/`
4. Активирует функции из `netlify/functions/`

## Что происходит на Netlify

### Frontend (Vite)
```
npm run build → dist/ → обслужено статически
```

### Backend (Netlify Functions)
```
netlify/functions/smc-scan.js → /.netlify/functions/smc-scan → API endpoint
```

## Проверка после развертывания

1. Откройте ваш Netlify domain (напр. `cryptostatix-web.netlify.app`)
2. Перейдите в **Скринеры → Скринер тренда**
3. Нажмите **ЗАПУСТИТЬ АНАЛИЗ**
4. Проверьте **Logs** в Netlify dashboard

## Проверка функций

Откройте Dev Tools (F12) → Console и запустите тест:
```javascript
fetch('/.netlify/functions/smc-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        timeframe: '15m',
        min_volume: 50000000,
        min_change: 2.0,
        structure_window: 10
    })
}).then(r => r.json()).then(console.log)
```

## Возможные проблемы

### 1. Функция возвращает 404
- Проверьте что `netlify/functions/smc-scan.js` существует
- Проверьте настройку `functions = "netlify/functions"` в `netlify.toml`

### 2. CORS ошибки
- CORS поддержка уже включена в функции
- Если ошибка - проверьте Headers в `netlify/functions/smc-scan.js`

### 3. Binance API недоступен
- Может быть блокировка в вашей стране/регионе
- Функция обработает ошибку и вернет сообщение об ошибке

### 4. Анализ занимает долго
- Это нормально, функция обрабатывает много монет
- Может занять 10-30 секунд в зависимости от количества отфильтрованных символов

## Локальная отладка

Если нужно тестировать перед развертыванием:

```bash
# Терминал 1
npm run dev

# Терминал 2
node dev-server.js
```

Откройте http://localhost:5173

## Переменные окружения (если понадобятся)

В `netlify.toml` добавьте:
```toml
[env]
  binance_api_timeout = "30000"
```

В функции получите через `process.env.binance_api_timeout`

## Дополнительные ресурсы

- [Netlify Functions документация](https://docs.netlify.com/functions/overview/)
- [Netlify CLI документация](https://docs.netlify.com/cli/get-started/)
- [Vite документация](https://vitejs.dev/)
