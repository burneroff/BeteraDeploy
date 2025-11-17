package repo

import (
	"cmd/internal/storage"
	"cmd/internal/user/models"
	"cmd/internal/user/service"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// PostgresStorage реализация Storage интерфейса для PostgreSQL
type PostgresStorage struct {
	storage *storage.PostgresStorage
}

// NewWithStorage создает UserStorage
func NewWithStorage(storage *storage.PostgresStorage) *PostgresStorage {
	return &PostgresStorage{storage: storage}
}

// New создает хранилище
func New(config storage.Config) (*PostgresStorage, error) {
	// Используем New из storage пакета
	stg, err := storage.New(config)
	if err != nil {
		return nil, err
	}

	return &PostgresStorage{storage: stg}, nil
}

// NewFromConnectionString создает хранилище из строки подключения
func NewFromConnectionString(connString string) (*PostgresStorage, error) {
	db, err := sql.Open("postgres", connString)
	if err != nil {
		return nil, fmt.Errorf("ошибка открытия базы данных: %w", err)
	}

	// Проверка соединения
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("ошибка отслеживания базы данных: %w", err)
	}

	return &PostgresStorage{storage: &storage.PostgresStorage{DB: db}}, nil
}

// CreateUser создает нового пользователя в базе данных
func (s *PostgresStorage) CreateUser(ctx context.Context, user *models.User) error {
	query := `
        INSERT INTO users (email, first_name, last_name, role_id, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id
    `

	now := time.Now()
	err := s.storage.DB.QueryRowContext(
		ctx,
		query,
		user.Email,
		user.FirstName,
		user.LastName,
		user.RoleID,
		now,
		now,
	).Scan(&user.ID)

	if err != nil {
		// Корректная проверка уникальности для pgx (код 23505)
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return errors.New("user already exists")
		}
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetUserByID возвращает пользователя по ID
func (s *PostgresStorage) GetUserByID(ctx context.Context, userID int) (*models.User, error) {
	query := `
        SELECT 
            u.id, 
            u.email, 
            COALESCE(u.password_hash, '')        AS password_hash,
            u.first_name, 
            u.last_name, 
            COALESCE(u.photo_path, '')           AS photo_path,
            COALESCE(u.email_confirmed, false)   AS email_confirmed,
            u.created_at, 
            u.updated_at,
            COALESCE(u.role_id, 0)               AS role_id,
            COALESCE(r.name, '')                 AS role_name
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = $1 
    `

	user := &models.User{}
	err := s.storage.DB.QueryRowContext(ctx, query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.PhotoPath,
		&user.IsVerified,
		&user.CreatedAt,
		&user.ChangedAt,
		&user.RoleID,
		&user.RoleName,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("пользователь не найден")
		}
		return nil, fmt.Errorf("ошибка поиска пользователя по ID: %w", err)
	}

	return user, nil
}

// GetUserByEmail возвращает пользователя по email
func (s *PostgresStorage) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
        SELECT 
            u.id, 
            u.email, 
            COALESCE(u.password_hash, '')        AS password_hash,
            u.first_name, 
            u.last_name, 
            COALESCE(u.photo_path, '')           AS photo_path,
            COALESCE(u.email_confirmed, false)   AS email_confirmed,
            u.created_at, 
            u.updated_at,
            COALESCE(u.role_id, 0)               AS role_id,
            COALESCE(r.name, '')                 AS role_name
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
    `

	user := &models.User{}
	err := s.storage.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.PhotoPath,
		&user.IsVerified,
		&user.CreatedAt,
		&user.ChangedAt,
		&user.RoleID,
		&user.RoleName,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("пользователь не найден")
		}
		return nil, fmt.Errorf("ошибка поиска пользователя по email: %w", err)
	}

	return user, nil
}

// UpdateUser обновляет данные пользователя
func (s *PostgresStorage) UpdateUser(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users 
		SET email = $1, password_hash = $2, updated_at = $3 
		WHERE id = $4 
	`

	result, err := s.storage.DB.ExecContext(
		ctx,
		query,
		user.Email,
		user.PasswordHash,
		time.Now(),
		user.ID,
	)

	if err != nil {
		return fmt.Errorf("ошибка обновления пользователя: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("не удалось получить количество обновленных строк: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("пользователь не найден")
	}

	return nil
}

// DeleteUser мягкое удаление пользователя
func (s *PostgresStorage) DeleteUser(ctx context.Context, userID int) error {
	query := `
		UPDATE users 
		SET deleted_at = $1 
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := s.storage.DB.ExecContext(ctx, query, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("ошибка удаления пользователя: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("не удалось получить количество обновленных строк: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("пользователь не найден")
	}

	return nil
}

// UserExists проверяет существование пользователя по email
func (s *PostgresStorage) UserExists(ctx context.Context, email string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM users WHERE email = $1
		)
	`

	var exists bool
	err := s.storage.DB.QueryRowContext(ctx, query, email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("не удалось проверить существование пользователя: %w", err)
	}

	return exists, nil
}

// GetAllUsers возвращает всех пользователей
func (s *PostgresStorage) GetAllUsers(ctx context.Context) ([]*models.User, error) {
	query := `
        SELECT 
            u.id,
  			u.email,
			COALESCE(u.first_name, '')   AS first_name,
  			COALESCE(u.last_name, '')    AS last_name,
  			COALESCE(u.photo_path, '')   AS photo_path,
  			u.email_confirmed,
  			u.created_at,
  			u.updated_at,
  			COALESCE(u.role_id, 0)       AS role_id,
  			COALESCE(r.name, '')         AS role_name
        FROM users AS u
  		LEFT JOIN roles AS r ON r.id = u.role_id
 		WHERE u.deleted_at IS NULL
  		ORDER BY u.created_at DESC
    `

	rows, err := s.storage.DB.QueryContext(ctx, query) // ← ИСПРАВЬТЕ s.DB
	if err != nil {
		return nil, fmt.Errorf("ошибка возвращения всех пользователей: %w", err)
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.FirstName,
			&user.LastName,
			&user.PhotoPath, // ← ДОБАВЬТЕ
			&user.IsVerified,
			&user.CreatedAt,
			&user.ChangedAt,
			&user.RoleID,
			&user.RoleName,
		)
		if err != nil {
			return nil, fmt.Errorf("ошибка вызова данных пользователя: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("ошибка строки: %w", err)
	}

	return users, nil
}

// GetRoleIDByName возвращает ID роли по имени
func (s *PostgresStorage) GetRoleIDByName(ctx context.Context, roleName string) (int, error) {
	query := `SELECT id FROM role WHERE name = $1`

	var roleID int
	err := s.storage.DB.QueryRowContext(ctx, query, roleName).Scan(&roleID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, errors.New("роль не найдена")
		}
		return 0, fmt.Errorf("ошибка вызова роли: %w", err)
	}

	return roleID, nil
}

// MarkUserAsVerified помечает пользователя как верифицированного
func (s *PostgresStorage) MarkUserAsVerified(ctx context.Context, userID int) error {
	log.Printf("✅ Верификация пользователя: userID=%d", userID)

	query := `UPDATE users SET email_confirmed = true, updated_at = $1 WHERE id = $2`
	result, err := s.storage.DB.ExecContext(ctx, query, time.Now(), userID)
	if err != nil {
		log.Printf("❌ Верификация пользователя error: %v", err)
		return fmt.Errorf("ошибка в отметке пользователя как верифицированного: %w", err)
	}

	rows, _ := result.RowsAffected()
	log.Printf("✅ Верификация пользователя: строк обновлено = %d", rows)
	if rows == 0 {
		return errors.New("пользователь не найден")
	}

	return nil
}

// UpdatePassword обновляет пароль пользователя
func (s *PostgresStorage) UpdatePassword(ctx context.Context, userID int, hashedPassword string) error {
	query := `UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3`

	result, err := s.storage.DB.ExecContext(ctx, query, hashedPassword, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("ошибка обновления пароля: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("ошибка обновления строки: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("пользователь не найден")
	}

	return nil
}

// UpdatePasswordAndVerify обновляет пароль и помечает пользователя как верифицированного
func (s *PostgresStorage) UpdatePasswordAndVerify(ctx context.Context, userID int, hashedPassword string) error {
	query := `UPDATE users SET password_hash = $1, email_confirmed = true, updated_at = $2 WHERE id = $3`

	result, err := s.storage.DB.ExecContext(ctx, query, hashedPassword, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("ошибка обновления пароля или верификации пользователя: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("ошибка внесения изменений в строки: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("пользователь не найден")
	}

	return nil
}

func (s *PostgresStorage) UpdateUserPhoto(ctx context.Context, userID int, photoPath string) error {
	query := `UPDATE users SET photo_path = $1, updated_at = $2 WHERE id = $3`
	_, err := s.storage.DB.ExecContext(ctx, query, photoPath, time.Now(), userID)
	return err
}

// UpdateUserProfile обновляет профиль пользователя
func (s *PostgresStorage) UpdateUserProfile(ctx context.Context, userID int, updateReq service.UpdateProfileRequest) error {
	query := `UPDATE users SET 
              first_name = COALESCE($1, first_name), 
              last_name = COALESCE($2, last_name), 
              photo_path = COALESCE($3, photo_path),
              updated_at = $4 
              WHERE id = $5`

	_, err := s.storage.DB.ExecContext(ctx, query,
		updateReq.FirstName,
		updateReq.LastName,
		updateReq.PhotoPath,
		time.Now(),
		userID,
	)
	return err
}

func (s *PostgresStorage) Ping(ctx context.Context) error {
	if s.storage == nil || s.storage.DB == nil {
		return errors.New("database connection not initialized")
	}
	return s.storage.DB.PingContext(ctx)
}

// Close закрывает соединение с базой данных
func (s *PostgresStorage) Close() error {
	if s.storage != nil && s.storage.DB != nil {
		return s.storage.DB.Close()
	}
	return nil
}
