# Карта ДПС — Telegram WebApp (iPad‑friendly, private deploy)

Готовый MVP с картой и ботом. Можно развернуть **целиком с iPad** через приватный репозиторий на GitHub и Render.com.

## Шаги (iPad, приватно)
1. На **github.com** создай **Private**‑репозиторий → **Upload files** → загрузи все файлы из этой папки (включая `public/`).
2. На **render.com** → **New + → Web Service** → подключи приватный репозиторий.
   - Build: `npm install`
   - Start: `npm start`
   - Plan: Free
   - Env Vars: `TELEGRAM_BOT_TOKEN`, `WEB_APP_URL` (итоговый URL Render), `PORT=3000`
3. Дождись статуса Live, открой `/health`.
4. В Telegram у бота → `/start` → «📍 Открыть карту».

## Функции
- Добавление точки тапом по карте с подтверждением и выбором типа (s/t).
- Показ всех точек, автообновление и live‑апдейты (Socket.IO).
- TTL: автоудаление точек старше 24 часов.
- Приём геолокации, отправленной в чат боту.

## Переменные окружения
```
TELEGRAM_BOT_TOKEN=...
WEB_APP_URL=https://<твой-сервис>.onrender.com
PORT=3000
```

## Локальный запуск (не обязателен на iPad)
```
npm i
npm run dev
```

По запросу добавлю модальное окно выбора типа, жалобы/удаление, кластеры меток и авторизацию.


## Запуск через Docker на Timeweb Cloud
1. Установите Docker и Docker Compose на сервер.
2. Клонируйте репозиторий или загрузите архив.
3. Запустите:
```bash
docker compose up -d
```
4. Проверьте работу по адресу `https://твой-домен/health`.
