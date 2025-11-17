INSERT INTO roles (id, name)
VALUES (5, 'Все пользователи')
ON CONFLICT (id) DO NOTHING;

-- Если уже есть — обновляем только имя
UPDATE roles 
SET name = 'Все пользователи'
WHERE id = 5;
