CREATE TABLE IF NOT EXISTS subscribers (
    email      TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    status     TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'unsubscribed'))
);

CREATE TABLE IF NOT EXISTS notified_posts (
    slug        TEXT PRIMARY KEY,
    notified_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedback (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    slug       TEXT    NOT NULL,
    reaction   TEXT    NOT NULL CHECK (reaction IN ('up', 'down')),
    comment    TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
