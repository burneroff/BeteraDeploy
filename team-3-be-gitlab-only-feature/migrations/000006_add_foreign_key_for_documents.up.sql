ALTER TABLE documents ADD CONSTRAINT fk_category
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;