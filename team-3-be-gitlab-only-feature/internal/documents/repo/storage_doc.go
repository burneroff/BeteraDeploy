package repo

import (
	"cmd/internal/documents/models"
	"context"
	"database/sql"
	"errors"
)

type Storage struct {
	DB *sql.DB
}

func NewStorage(db *sql.DB) *Storage {
	return &Storage{DB: db}
}

func nullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func (s *Storage) determineAccessibleRole(ctx context.Context, docID int) int {
	var count int
	err := s.DB.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM document_roles WHERE document_id = $1", docID,
	).Scan(&count)

	if err != nil || count == 0 {
		return 5 // всем
	}

	var roleID int
	_ = s.DB.QueryRowContext(ctx,
		"SELECT role_id FROM document_roles WHERE document_id = $1 LIMIT 1", docID,
	).Scan(&roleID)

	return roleID
}

func (s *Storage) hasAccess(ctx context.Context, docID, roleID int) bool {
	var count int
	err := s.DB.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM document_roles WHERE document_id = $1", docID,
	).Scan(&count)

	if err != nil || count == 0 {
		return true // роль 5 = всем
	}

	var exists bool
	err = s.DB.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM document_roles WHERE document_id = $1 AND role_id = $2)",
		docID, roleID,
	).Scan(&exists)

	return err == nil && exists
}

// основные методы

func (s *Storage) GetAllDocuments(
	ctx context.Context,
	roleID, viewerID int,
) ([]*models.Document, error) {

	query := `
        SELECT 
            d.id, 
            d.title, 
            d.pdf_path, 
            d.user_id, 
            d.role_id, 
            d.created_at,
            u.first_name, 
            u.last_name, 
            u.photo_path,
            COALESCE(c.id, 0), 
            COALESCE(c.name, 'Без категории'),
            COALESCE(dr.role_id, 5), 
            COALESCE(r.name, 'Всем сотрудникам'),
            COALESCE(likes.cnt, 0),
            COALESCE(comments.cnt, 0),
            EXISTS(SELECT 1 FROM document_views dv WHERE dv.document_id = d.id AND dv.user_id = $2) AS is_viewed,
            EXISTS(SELECT 1 FROM document_likes dl WHERE dl.document_id = d.id AND dl.user_id = $2) AS is_liked
        FROM documents d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN categories c ON d.category_id = c.id
        LEFT JOIN document_roles dr ON dr.document_id = d.id
        LEFT JOIN roles r ON r.id = COALESCE(dr.role_id, 5)
        LEFT JOIN (SELECT document_id, COUNT(*) AS cnt FROM document_likes GROUP BY document_id) likes 
               ON likes.document_id = d.id
        LEFT JOIN (SELECT document_id, COUNT(*) AS cnt FROM comments WHERE deleted_at IS NULL GROUP BY document_id) comments 
               ON comments.document_id = d.id
        WHERE d.deleted_at IS NULL
          AND (
            $1 = 1 OR $1 = 2
            OR dr.role_id IS NULL
            OR dr.role_id = $1
          )
        ORDER BY d.created_at DESC
        LIMIT 50
    `

	rows, err := s.DB.QueryContext(ctx, query, roleID, viewerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []*models.Document
	for rows.Next() {
		var doc models.Document
		var firstName, lastName, photoPath sql.NullString

		err := rows.Scan(
			&doc.ID,
			&doc.Title,
			&doc.PDFPath,
			&doc.UserID,
			&doc.RoleID,
			&doc.CreatedAt,
			&firstName,
			&lastName,
			&photoPath,
			&doc.Category.ID,
			&doc.Category.Name,
			&doc.AccessibleRole.ID,
			&doc.AccessibleRole.Name,
			&doc.LikesCount,
			&doc.CommentsCount,
			&doc.IsViewed,
			&doc.IsLiked, // ВОТ ОНО! РАБОТАЕТ!
		)
		if err != nil {
			return nil, err
		}

		if firstName.Valid {
			doc.FirstName = firstName.String
		}
		if lastName.Valid {
			doc.LastName = lastName.String
		}
		if photoPath.Valid {
			doc.PhotoPath = photoPath.String
		}

		docs = append(docs, &doc)
	}

	return docs, rows.Err()
}

func (s *Storage) GetDocumentByID(ctx context.Context, id, roleID, viewerID int) (*models.Document, error) {
	query := `
        SELECT 
            d.id, d.title, d.pdf_path, d.user_id, d.role_id, d.created_at,
            u.first_name, u.last_name, u.photo_path,
            COALESCE(c.id, 0), COALESCE(c.name, 'Без категории'),
            COALESCE(dr.role_id, 5), COALESCE(r.name, 'Всем сотрудникам'),
            COALESCE(likes.cnt, 0),
            COALESCE(comments.cnt, 0),
            EXISTS(SELECT 1 FROM document_views dv WHERE dv.document_id = d.id AND dv.user_id = $3) AS is_viewed,
            EXISTS(SELECT 1 FROM document_likes dl WHERE dl.document_id = d.id AND dl.user_id = $3) AS is_liked
        FROM documents d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN categories c ON d.category_id = c.id
        LEFT JOIN document_roles dr ON dr.document_id = d.id
        LEFT JOIN roles r ON r.id = COALESCE(dr.role_id, 5)
        LEFT JOIN (SELECT document_id, COUNT(*) AS cnt FROM document_likes GROUP BY document_id) likes 
               ON likes.document_id = d.id
        LEFT JOIN (SELECT document_id, COUNT(*) AS cnt FROM comments WHERE deleted_at IS NULL GROUP BY document_id) comments 
               ON comments.document_id = d.id
        WHERE d.id = $1 AND d.deleted_at IS NULL
          AND (
            $2 = 1 OR $2 = 2
            OR dr.role_id IS NULL
            OR dr.role_id = $2
          )
    `

	var doc models.Document
	var firstName, lastName, photoPath sql.NullString
	var userID sql.NullInt64

	err := s.DB.QueryRowContext(ctx, query, id, roleID, viewerID).Scan(
		&doc.ID,
		&doc.Title,
		&doc.PDFPath,
		&userID,
		&doc.RoleID,
		&doc.CreatedAt,
		&firstName,
		&lastName,
		&photoPath,
		&doc.Category.ID,
		&doc.Category.Name,
		&doc.AccessibleRole.ID,
		&doc.AccessibleRole.Name,
		&doc.LikesCount,
		&doc.CommentsCount,
		&doc.IsViewed,
		&doc.IsLiked,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	if userID.Valid {
		uid := int(userID.Int64)
		doc.UserID = &uid
	}

	doc.FirstName = nullStringToString(firstName)
	doc.LastName = nullStringToString(lastName)
	doc.PhotoPath = nullStringToString(photoPath)

	return &doc, nil
}

func (s *Storage) Create(ctx context.Context, doc *models.Document) error {
	query := `
		INSERT INTO documents (title, pdf_path, user_id, category_id, role_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`

	return s.DB.QueryRowContext(ctx, query,
		doc.Title,
		doc.PDFPath,
		doc.UserID,
		doc.Category.ID,
		doc.RoleID,
	).Scan(&doc.ID, &doc.CreatedAt)
}

func (s *Storage) SaveAccessibleRole(ctx context.Context, docID, roleID int) error {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, "DELETE FROM document_roles WHERE document_id = $1", docID); err != nil {
		return err
	}

	if roleID != 5 {
		if _, err := tx.ExecContext(ctx,
			"INSERT INTO document_roles (document_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
			docID, roleID,
		); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (s *Storage) Delete(ctx context.Context, id int) error {
	query := `UPDATE documents SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	result, err := s.DB.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}
