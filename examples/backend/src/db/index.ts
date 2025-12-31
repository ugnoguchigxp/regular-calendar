import * as schema from './schema';

const dbType = process.env.DB_TYPE || 'sqlite';
let dbInstance: any;
let ensureTablesFn: () => void = () => { };

if (dbType === 'postgres') {
  // Postgres Implementation
  // Note: 'postgres' package must be installed: bun add postgres
  console.log('Initializing Postgres DB...');
  ensureTablesFn = () => {
    console.log('Note: For PostgreSQL, please use Drizzle Kit extensions for migrations.');
  };
} else {
  // SQLite Implementation (Default)
  const { Database } = require('bun:sqlite');
  const { drizzle } = require('drizzle-orm/bun-sqlite');

  const sqlite = new Database('sqlite.db');
  dbInstance = drizzle(sqlite, { schema });

  ensureTablesFn = () => {
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
        resource_id TEXT REFERENCES resources(id),
        group_id TEXT,
        title TEXT NOT NULL,
        attendee TEXT DEFAULT 'Anonymous' NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'booked' NOT NULL,
        note TEXT,
        is_all_day INTEGER DEFAULT 0,
        extended_props TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
  };
}

export const db = dbInstance;
export const ensureTables = ensureTablesFn;
