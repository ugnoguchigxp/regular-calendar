CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_mode TEXT DEFAULT 'grid' NOT NULL,
    dimension INTEGER DEFAULT 1 NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_available INTEGER DEFAULT 1 NOT NULL,
    group_id TEXT REFERENCES groups(id),
    created_at INTEGER,
    updated_at INTEGER
);

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

CREATE TABLE IF NOT EXISTS personnel (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
