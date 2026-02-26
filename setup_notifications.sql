-- Notifications table for match alerts, tournament updates, etc.
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',             -- 'match_scheduled', 'match_result', 'team_update', 'info'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,                                      -- optional link to navigate to
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
