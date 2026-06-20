ALTER TABLE subscribers ADD COLUMN unsubscribe_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token
    ON subscribers (unsubscribe_token);

UPDATE subscribers
SET unsubscribe_token =
    lower(hex(randomblob(4))) || '-' ||
    lower(hex(randomblob(2))) || '-4' ||
    substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', abs(random()) % 4 + 1, 1) ||
    substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6)))
WHERE unsubscribe_token IS NULL;
