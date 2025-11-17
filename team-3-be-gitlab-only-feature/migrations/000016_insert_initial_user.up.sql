INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    photo_path,
    email_confirmed,
    password_hash,
    role_id,
    document_id,
    created_at,
    updated_at,
    deleted_at,
    email_verification_token
) VALUES (
    1,
    'Nikita',
    'Karaban',
    'garesmod04@gmail.com',
    'photos/user-1/1763408409-photo_2025-06-29_13-06-00.jpg',
    TRUE,
    '$2b$10$cq4.tWMJEg2L6Egai44OY.k5mrL5kmaZE3jlM6Q3QUQw9eaQYZmjS',
    1,
    NULL,
    NOW(),
    NOW(),
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;
