import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import { Database } from "bun:sqlite";

export type Bindings = {
	DB: D1Database;
};

// Cache for Bun SQLite instance
let bunSqliteInstance: any;

export function getDb(env?: Bindings) {
	if (env && env.DB) {
		// Cloudflare D1 environment
		return drizzleD1(env.DB, { schema });
	} else {
		// Local Bun SQLite environment
		if (!bunSqliteInstance) {
			const sqlite = new Database("sqlite.db");
			bunSqliteInstance = drizzleSqlite(sqlite, { schema });

			// Auto-run migrations equivalent (create tables) for local dev
			// ensureTables(sqlite);
		}
		return bunSqliteInstance;
	}
}

// Local SQLite Table Creation Helper (Keep for local Bun dev compatibility)
export const ensureTables = () => {
	const sqlite = new Database("sqlite.db");
	sqlite.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        display_mode TEXT DEFAULT 'grid' NOT NULL,
        dimension INTEGER DEFAULT 1 NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

	sqlite.run(`
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        is_available INTEGER DEFAULT 1 NOT NULL,
        group_id TEXT REFERENCES groups(id),
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

	// Note: Drizzle schema uses camelCase in TypeScript but snake_case in DB usually,
	// but here we are using manual SQL. Let's match whatever schema.sqlite.ts expects.
	// Looking at schema.sqlite.ts (in previous view), it likely uses default names or snake_case.
	// Based on previous file content, it seemed to default to name-as-is or similar.
	// However, the cleanest way is often Drizzle Kit.
	// Use simple table creation for now matching typical Drizzle behavior.

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

	sqlite.run(`
      CREATE TABLE IF NOT EXISTS personnel (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        email TEXT NOT NULL,
        priority INTEGER DEFAULT 0 NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
};
