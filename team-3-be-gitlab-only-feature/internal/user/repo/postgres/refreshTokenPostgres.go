package repo

import (
	repoUser "cmd/internal/user/repo"
	"context"
	"fmt"
)

type RefresgToken interface {
	SaveRefreshToken(ctx context.Context, rt repoUser.RefreshToken) (int64, error)
	GetRefreshToken(ctx context.Context, token string) (repoUser.RefreshToken, error)
	DeleteRefreshToken(ctx context.Context, token string) error
	DeleteAllUserRefreshTokens(ctx context.Context, userID int) error
}

func (s *PostgresStorage) SaveRefreshToken(ctx context.Context, rt repoUser.RefreshToken) (int64, error) {
	query := `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4) RETURNING id`
	var id int64
	err := s.storage.DB.QueryRowContext(ctx, query, rt.UserID, rt.Token, rt.ExpiresAt, rt.CreatedAt).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("ошибка сохранения refresh токена: %w", err)
	}
	return id, nil
}

func (s *PostgresStorage) GetRefreshToken(ctx context.Context, token string) (repoUser.RefreshToken, error) {
	query := `SELECT id, user_id, token, expires_at, created_at FROM refresh_tokens WHERE token = $1`
	var rt repoUser.RefreshToken
	err := s.storage.DB.QueryRowContext(ctx, query, token).Scan(
		&rt.ID, &rt.UserID, &rt.Token, &rt.ExpiresAt, &rt.CreatedAt,
	)
	if err != nil {
		return repoUser.RefreshToken{}, fmt.Errorf("ошибка возвращения refresh токена: %w", err)
	}
	return rt, nil
}

func (s *PostgresStorage) DeleteRefreshToken(ctx context.Context, token string) error {
	query := `DELETE FROM refresh_tokens WHERE token = $1`
	_, err := s.storage.DB.ExecContext(ctx, query, token)
	if err != nil {
		return fmt.Errorf("ошибка удаления refresh токена: %w", err)
	}
	return nil
}

func (s *PostgresStorage) DeleteAllUserRefreshTokens(ctx context.Context, userID int) error {
	query := `DELETE FROM refresh_tokens WHERE user_id = $1`
	_, err := s.storage.DB.ExecContext(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("ошибка удаления refresh токенов пользователя: %w", err)
	}
	return nil
}
