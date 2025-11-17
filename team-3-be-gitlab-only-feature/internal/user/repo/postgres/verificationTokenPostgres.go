package repo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// SaveVerificationToken сохраняет токен верификации
func (s *PostgresStorage) SaveVerificationToken(ctx context.Context, userID int, token string, expiresAt time.Time) error {
	log.Printf("Сохранение токена верификации: userID=%d, token=%s, expiresAt=%v", userID, token, expiresAt)

	query := `
        UPDATE users
        SET email_verification_token = $1,
            expires_at = $2,
            updated_at = $3
        WHERE id = $4
    `

	result, err := s.storage.DB.ExecContext(ctx, query, token, expiresAt, time.Now(), userID)
	if err != nil {
		log.Printf("❌ Сохранение токена верификации ошибка: %v", err)
		return fmt.Errorf("ошибка сохранения токена верификации: %w", err)
	}

	rows, _ := result.RowsAffected()
	log.Printf("✅ Токен верификации сохранен: строка обновлена = %d", rows)
	return nil
}

// ValidateVerificationToken проверяет токен верификации
func (s *PostgresStorage) ValidateVerificationToken(ctx context.Context, userID int, token string) (bool, error) {
	log.Printf("🔍 Валидация токена верификации для: userID=%d, token=%s", userID, token)

	query := `
        SELECT EXISTS (
            SELECT 1 FROM users
            WHERE id = $1
              AND email_verification_token = $2
              AND expires_at > $3
        )
    `

	var exists bool
	err := s.storage.DB.QueryRowContext(ctx, query, userID, token, time.Now()).Scan(&exists)
	if err != nil {
		log.Printf("❌ Валидация токена верификации error: %v", err)
		return false, fmt.Errorf("ошибка валидации токена верификации: %w", err)
	}

	log.Printf("✅ Валидация токена верификации: exists=%v", exists)
	return exists, nil
}

// GetVerificationToken возвращает токен верификации для пользователя
func (s *PostgresStorage) GetVerificationToken(ctx context.Context, userID int) (string, time.Time, error) {
	log.Printf("Получение токена верификации: userID=%d", userID)

	query := `
        SELECT email_verification_token, expires_at 
        FROM users 
        WHERE id = $1 
          AND expires_at > $2
    `

	var token string
	var expiresAt time.Time

	err := s.storage.DB.QueryRowContext(ctx, query, userID, time.Now()).Scan(&token, &expiresAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Printf("⚠️ Получение токена верификации: токен не найден или просрочен для userID=%d", userID)
			return "", time.Time{}, errors.New("токен верификации не найден или просрочен")
		}
		log.Printf("❌ Получение токена верификации ошибка: %v", err)
		return "", time.Time{}, fmt.Errorf("ошибка получения токена верификации: %w", err)
	}

	log.Printf("✅ Токен верификации получен: token=%s, expiresAt=%v", token, expiresAt)
	return token, expiresAt, nil
}

// DeleteExpiredVerificationTokens удаляет просроченные токены
func (s *PostgresStorage) DeleteVerificationToken(ctx context.Context, userID int) error {
	query := `
        UPDATE users
        SET email_verification_token = NULL,
            expires_at = NULL,
            updated_at = $1
        WHERE id = $2
    `

	_, err := s.storage.DB.ExecContext(ctx, query, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("ошибка удаления токена верификации: %w", err)
	}

	return nil
}

func (s *PostgresStorage) DeleteExpiredVerificationTokens(ctx context.Context) error {
	query := `
        UPDATE users
        SET email_verification_token = NULL,
            expires_at = NULL
        WHERE expires_at <= $1
    `

	_, err := s.storage.DB.ExecContext(ctx, query, time.Now())
	if err != nil {
		return fmt.Errorf("ошибка удаления просроченного токена: %w", err)
	}

	return nil
}
