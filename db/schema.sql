CREATE TABLE IF NOT EXISTS subscribers (
    email      TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    status     TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'unsubscribed'))
);
