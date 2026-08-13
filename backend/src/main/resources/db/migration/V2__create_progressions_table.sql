CREATE TABLE progressions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    key_note VARCHAR(10) NOT NULL,
    scale VARCHAR(50) NOT NULL,
    chords JSONB NOT NULL,
    memo VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_progressions_user_id_updated_at ON progressions (user_id, updated_at DESC);
