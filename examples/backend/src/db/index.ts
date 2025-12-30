import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

// Helper to manually create tables if they don't exist (Simple alternative to migrations for this example)
export function ensureTables() {
    sqlite.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      display_mode TEXT DEFAULT 'grid' NOT NULL,
      dimension INTEGER DEFAULT 1 NOT NULL
    );
  `);

    sqlite.run(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      is_available INTEGER DEFAULT 1 NOT NULL,
      group_id TEXT REFERENCES groups(id)
    );
  `);

    sqlite.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL REFERENCES resources(id),
      group_id TEXT,
      title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'booked' NOT NULL,
      note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}
