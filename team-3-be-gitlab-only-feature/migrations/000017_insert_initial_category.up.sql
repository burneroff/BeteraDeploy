INSERT INTO categories (
    id,
    name
) VALUES (
    1,
    'Все документы'
)
ON CONFLICT (id) DO NOTHING;
