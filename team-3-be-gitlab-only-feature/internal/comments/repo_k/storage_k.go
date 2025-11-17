package repo_k

import (
	models "cmd/internal/comments/models_k"
	"context"
	"database/sql"
	"fmt"
	"time"
)

type CommentStorage struct {
	DB *sql.DB
}

func NewCommentStorage(db *sql.DB) *CommentStorage {
	return &CommentStorage{DB: db}
}

// 1. Получить все комментарии к документу
func (s *CommentStorage) GetByDocument(ctx context.Context, docID int) ([]models.Comment, error) {
	const q = `
		SELECT c.id, c.document_id, c.user_id, c.text, c.created_at, 
		       u.first_name, u.last_name, u.photo_path
		FROM comments c
		JOIN users u ON u.id = c.user_id
		WHERE c.document_id = $1 AND c.is_deleted = FALSE
		ORDER BY c.created_at DESC
	`

	rows, err := s.DB.QueryContext(ctx, q, docID)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var c models.Comment
		var photoPath sql.NullString
		if err := rows.Scan(
			&c.ID, &c.DocumentID, &c.UserID, &c.Text, &c.CreatedAt,
			&c.FirstName, &c.LastName, &photoPath,
		); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrDBFailure, err)
		}
		if photoPath.Valid {
			p := photoPath.String
			c.PhotoPath = &p
		}
		comments = append(comments, c)
	}
	return comments, nil
}

// 2. Добавить комментарий
func (s *CommentStorage) Create(ctx context.Context, c *models.Comment) error {
	if c.Text == "" || len(c.Text) > 999 {
		return ErrBadData
	}

	const q = `
		INSERT INTO comments (document_id, user_id, text)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	err := s.DB.QueryRowContext(ctx, q, c.DocumentID, c.UserID, c.Text).
		Scan(&c.ID, &c.CreatedAt)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	return nil
}

// 3. Удаление комментария
func (s *CommentStorage) SoftDelete(ctx context.Context, id int) error {
	const q = `
		UPDATE comments 
		SET is_deleted = TRUE, deleted_at = $2
		WHERE id = $1 AND is_deleted = FALSE
	`
	res, err := s.DB.ExecContext(ctx, q, id, time.Now())
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// 4. Получить комментарий по ID
func (s *CommentStorage) GetByID(ctx context.Context, id int) (*models.Comment, error) {
	const q = `
		SELECT id, document_id, user_id, text, created_at, is_deleted
		FROM comments
		WHERE id = $1
	`
	var c models.Comment
	err := s.DB.QueryRowContext(ctx, q, id).Scan(
		&c.ID, &c.DocumentID, &c.UserID, &c.Text, &c.CreatedAt, &c.IsDeleted,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("%w: %v", ErrDBFailure, err)
	}
	return &c, nil
}
