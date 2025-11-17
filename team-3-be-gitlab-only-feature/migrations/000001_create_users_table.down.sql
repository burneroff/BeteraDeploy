DROP TRIGGER IF EXISTS users_set_timestamp ON users;
DROP FUNCTION IF EXISTS trigger_set_timestamp();
DROP TABLE IF EXISTS users CASCADE;