package repo_v

import (
	"cmd/internal/views/models_v"
	"context"
	"database/sql"
	"fmt"
)

type ViewStorage struct {
	DB *sql.DB
}

func NewViewStorage(db *sql.DB) *ViewStorage {
	return &ViewStorage{DB: db}
}

// 1. Ознакомиться
func (s *ViewStorage) AddView(ctx context.Context, userID, docID int) error {
	const q = `
		INSERT INTO document_views (user_id, document_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, document_id) DO NOTHING;
	`
	res, err := s.DB.ExecContext(ctx, q, userID, docID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDBFailure, err)
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return ErrAlreadyViewed
	}
	return nil
}

// 2. Проверить ознакомление
func (s *ViewStorage) IsViewed(ctx context.Context, userID, docID int) (bool, error) {
	const q = `SELECT 1 FROM document_views WHERE user_id = $1 AND document_id = $2`
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

// 3. Количество ознакомившихся
func (s *ViewStorage) CountViews(ctx context.Context, docID int) (int, error) {
	const q = `SELECT COUNT(*) FROM document_views WHERE document_id = $1`
	var count int
	if err := s.DB.QueryRowContext(ctx, q, docID).Scan(&count); err != nil {
		return 0, fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	return count, nil
}

// 4. Список ознакомившихся пользователей
func (s *ViewStorage) GetViewers(ctx context.Context, docID int) ([]models_v.Viewer, error) {
	const q = `
		SELECT u.id, u.first_name, u.last_name, u.photo_path
		FROM document_views v
		JOIN users u ON u.id = v.user_id
		WHERE v.document_id = $1
		ORDER BY v.viewed_at DESC;
	`
	rows, err := s.DB.QueryContext(ctx, q, docID)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	defer rows.Close()

	var viewers []models_v.Viewer
	for rows.Next() {
		var v models_v.Viewer
		var photo sql.NullString
		if err := rows.Scan(&v.ID, &v.FirstName, &v.LastName, &photo); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrDBFailure, err)
		}
		if photo.Valid {
			v.PhotoPath = &photo.String
		}
		viewers = append(viewers, v)
	}
	return viewers, nil
}
