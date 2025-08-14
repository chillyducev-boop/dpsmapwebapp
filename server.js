import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import { setupBot } from './bot.js';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = await initDB();

app.get('/api/points', async (req, res) => {
  const since = parseInt(req.query.since || '0', 10);
  const rows = await db.all('SELECT id, lat, lng, type, created_at, source FROM posts WHERE created_at >= ? ORDER BY created_at DESC LIMIT 1000', since);
  res.json({ ok: true, points: rows });
});

app.post('/api/points', async (req, res) => {
  const { lat, lng, type, created_at, source } = req.body || {};
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ ok: false, error: 'lat/lng required' });
  }
  const ts = Number.isFinite(created_at) ? created_at : Date.now();
  await db.run('INSERT INTO posts(lat, lng, type, created_at, source) VALUES(?,?,?,?,?)',
    lat, lng, type || 'stationary', ts, source || 'user');
  const point = { lat, lng, type: type || 'stationary', created_at: ts, source: source || 'user' };
  io.emit('point:new', point);
  res.json({ ok: true, point });
});

// periodic cleanup: delete points older than 24h
setInterval(async () => {
  const cutoff = Date.now() - 2*10*60*1000;
  await db.run('DELETE FROM posts WHERE created_at < ?', cutoff);
}, 10*60*1000);

app.get('/health', (req, res) => res.json({ ok: true }));

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;
if (token && webAppUrl) {
  setupBot(token, webAppUrl);
  console.log('Telegram bot started.');
} else {
  console.warn('No TELEGRAM_BOT_TOKEN or WEB_APP_URL — bot is disabled.');
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log('Server listening on', PORT));
