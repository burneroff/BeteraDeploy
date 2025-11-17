ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

ALTER TABLE documents
ADD CONSTRAINT documents_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE NO ACTION;
