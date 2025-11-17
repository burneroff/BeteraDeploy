package repo_l

import (
	"context"
	"database/sql"
	"fmt"
)

type LikeStorage struct {
	DB *sql.DB
}

func NewLikeStorage(db *sql.DB) *LikeStorage {
	return &LikeStorage{DB: db}
}

// 1. Добавить лайк
func (s *LikeStorage) AddLike(ctx context.Context, userID, docID int) error {
	const q = `
        INSERT INTO document_likes (user_id, document_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, document_id) DO NOTHING
    `
	res, err := s.DB.ExecContext(ctx, q, userID, docID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDBFailure, err)
	}

	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrAlreadyLiked
	}
	return nil
}

// 2. Удалить лайк
func (s *LikeStorage) RemoveLike(ctx context.Context, userID, docID int) error {
	const q = `DELETE FROM document_likes WHERE user_id = $1 AND document_id = $2`
	res, err := s.DB.ExecContext(ctx, q, userID, docID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDBFailure, err)
	}

	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// 3. Проверить, лайкнул ли
func (s *LikeStorage) IsLiked(ctx context.Context, userID, docID int) (bool, error) {
	const q = `SELECT 1 FROM document_likes WHERE user_id = $1 AND document_id = $2`
	var x int
	err := s.DB.QueryRowContext(ctx, q, userID, docID).Scan(&x)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	return true, nil
}

// 4. Количество лайков
func (s *LikeStorage) CountLikes(ctx context.Context, docID int) (int, error) {
	const q = `SELECT COUNT(*) FROM document_likes WHERE document_id = $1`
	var count int
	if err := s.DB.QueryRowContext(ctx, q, docID).Scan(&count); err != nil {
		return 0, fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	return count, nil
}
