CREATE TABLE document_likes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, document_id)
);

CREATE INDEX idx_document_likes_document_id ON document_likes (document_id);
CREATE INDEX idx_document_likes_user_id ON document_likes (user_id);
