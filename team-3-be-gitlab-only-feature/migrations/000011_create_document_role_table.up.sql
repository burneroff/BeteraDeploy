CREATE TABLE document_roles (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, role_id)
);

CREATE INDEX idx_document_roles_document_id ON document_roles(document_id);
CREATE INDEX idx_document_roles_role_id ON document_roles(role_id);