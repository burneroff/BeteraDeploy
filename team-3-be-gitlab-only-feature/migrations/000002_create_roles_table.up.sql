CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES
    ('Администратор'),
    ('HR-специалист'),
    ('Менеджер'),
    ('Специалист');