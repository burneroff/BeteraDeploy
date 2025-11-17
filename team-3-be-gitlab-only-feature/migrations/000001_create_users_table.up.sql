CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,          
    last_name VARCHAR(100) NOT NULL,          
    email VARCHAR(255) UNIQUE NOT NULL,       
    photo_path TEXT,                          
    email_confirmed BOOLEAN DEFAULT FALSE,     
    password_hash VARCHAR(255),               
    role_id INTEGER,                          
    document_id INTEGER,                       
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verification_token TEXT,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--автообновление
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--триггер для автообновления
CREATE TRIGGER users_set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();