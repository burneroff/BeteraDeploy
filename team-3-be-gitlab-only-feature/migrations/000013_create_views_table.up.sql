CREATE TABLE document_views (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, document_id)
);

CREATE INDEX idx_document_views_doc_id ON document_views(document_id);
CREATE INDEX idx_document_views_user_id ON document_views(user_id);
