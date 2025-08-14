// Simple SQLite wrapper
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
  const db = await open({ filename: './data.sqlite', driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      type TEXT DEFAULT 'stationary',
      created_at INTEGER NOT NULL,
      source TEXT DEFAULT 'user'
    );
    CREATE INDEX IF NOT EXISTS idx_created_at ON posts(created_at);
  `);
  return db;
}
