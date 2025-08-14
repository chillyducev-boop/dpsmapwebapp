// Telegram bot logic (node-telegram-bot-api)
import TelegramBot from 'node-telegram-bot-api';

export function setupBot(token, webAppUrl) {
  const bot = new TelegramBot(token, { polling: true });

  const menuKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '📍 Открыть карту', web_app: { url: webAppUrl } }],
        [{ text: 'Отправить текущую геопозицию', request_location: true }]
      ],
      resize_keyboard: true
    }
  };

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
      'Карта ДПС — мини-приложение. Открой карту, смотри точки и добавляй новые.',
      menuKeyboard
    );
  });

  bot.on('location', async (msg) => {
    const { latitude, longitude } = msg.location || {};
    if (!latitude) return;
    const payload = { lat: latitude, lng: longitude, type: 'stationary', created_at: Date.now(), source: 'tg_location' };
    try {
      await fetch(process.env.WEB_APP_URL + '/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      bot.sendMessage(msg.chat.id, 'Точка добавлена! Спасибо.');
    } catch (e) {
      bot.sendMessage(msg.chat.id, 'Не удалось добавить точку. Попробуйте позже.');
    }
  });

  return bot;
}
