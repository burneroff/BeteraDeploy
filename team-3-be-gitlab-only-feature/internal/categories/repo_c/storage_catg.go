package repo_c

import (
	models "cmd/internal/categories/models_c"
	docModels "cmd/internal/documents/models"
	"context"
	"database/sql"
	"fmt"
	"time"
)

type CategoryStorage struct {
	DB *sql.DB
}

func NewCategoryStorage(db *sql.DB) *CategoryStorage {
	return &CategoryStorage{DB: db}
}

// Вспомогательная структура для сканирования с NULL значениями
type documentRow struct {
	ID         int
	Title      string
	PDFPath    string
	CategoryID int
	UserID     sql.NullInt64
	RoleID     int
	CreatedAt  time.Time
	FirstName  sql.NullString
	LastName   sql.NullString
	PhotoPath  sql.NullString
}

func (s *CategoryStorage) GetAll(ctx context.Context) ([]models.Category, error) {
	var categories []models.Category
	query := `SELECT id, name FROM categories ORDER BY name`
	rows, err := s.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var cat models.Category
		if err := rows.Scan(&cat.ID, &cat.Name); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}
	return categories, nil
}

func (s *CategoryStorage) Create(ctx context.Context, name string) (*models.Category, error) {
	var category models.Category
	query := `INSERT INTO categories (name) VALUES ($1) RETURNING id, name`
	err := s.DB.QueryRowContext(ctx, query, name).Scan(&category.ID, &category.Name)
	if err != nil {
		if err.Error() == "pq: duplicate key value violates unique constraint" {
			return nil, fmt.Errorf("category exists")
		}
		return nil, err
	}
	return &category, nil
}

func (s *CategoryStorage) GetDocumentsByCategory(ctx context.Context, categoryID int, roleID int) ([]docModels.Document, error) {
	var rows []documentRow

	// Для админов и модераторов - все документы категории
	if roleID == 1 || roleID == 2 {
		query := `
			SELECT d.id, d.title, d.pdf_path, d.category_id, d.user_id, d.role_id, 
				   d.created_at, u.first_name, u.last_name, u.photo_path
			FROM documents d
			LEFT JOIN users u ON d.user_id = u.id
			WHERE d.category_id = $1 AND d.deleted_at IS NULL  -- ← ВЕРНУЛ ПРОВЕРКУ
			ORDER BY d.created_at DESC`

		rows, err := s.queryDocumentRows(ctx, query, categoryID)
		if err != nil {
			return nil, err
		}
		return s.convertToDocuments(ctx, rows)
	}

	// Для обычных пользователей - только доступные документы
	query := `
		SELECT d.id, d.title, d.pdf_path, d.category_id, d.user_id, d.role_id, 
			   d.created_at, u.first_name, u.last_name, u.photo_path
		FROM documents d
		LEFT JOIN users u ON d.user_id = u.id
		WHERE d.category_id = $1 
		  AND d.deleted_at IS NULL  -- ← ВЕРНУЛ ПРОВЕРКУ
		  AND EXISTS (
			SELECT 1 FROM document_roles dr2 
			WHERE dr2.document_id = d.id AND dr2.role_id = $2
		  )
		ORDER BY d.created_at DESC`

	rows, err := s.queryDocumentRowsWithParams(ctx, query, categoryID, roleID)
	if err != nil {
		return nil, err
	}
	return s.convertToDocuments(ctx, rows)
}

// Вспомогательные методы для работы с NULL значениями

func (s *CategoryStorage) queryDocumentRows(ctx context.Context, query string, categoryID int) ([]documentRow, error) {
	var rows []documentRow

	dbRows, err := s.DB.QueryContext(ctx, query, categoryID)
	if err != nil {
		return nil, err
	}
	defer dbRows.Close()

	for dbRows.Next() {
		var row documentRow
		err := dbRows.Scan(
			&row.ID, &row.Title, &row.PDFPath, &row.CategoryID,
			&row.UserID, &row.RoleID, &row.CreatedAt,
			&row.FirstName, &row.LastName, &row.PhotoPath,
		)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}
	return rows, nil
}

func (s *CategoryStorage) queryDocumentRowsWithParams(ctx context.Context, query string, categoryID, roleID int) ([]documentRow, error) {
	var rows []documentRow

	dbRows, err := s.DB.QueryContext(ctx, query, categoryID, roleID)
	if err != nil {
		return nil, err
	}
	defer dbRows.Close()

	for dbRows.Next() {
		var row documentRow
		err := dbRows.Scan(
			&row.ID, &row.Title, &row.PDFPath, &row.CategoryID,
			&row.UserID, &row.RoleID, &row.CreatedAt,
			&row.FirstName, &row.LastName, &row.PhotoPath,
		)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}
	return rows, nil
}

func (s *CategoryStorage) convertToDocuments(ctx context.Context, rows []documentRow) ([]docModels.Document, error) {
	var docs []docModels.Document

	for _, row := range rows {
		doc := s.convertToDocument(row)

		// Получаем accessible_roles
		roles, _ := s.getDocumentRoles(ctx, doc.ID)
		doc.AccessibleRoles = roles

		docs = append(docs, doc)
	}
	return docs, nil
}

func (s *CategoryStorage) convertToDocument(row documentRow) docModels.Document {
	doc := docModels.Document{
		ID:        row.ID,
		Title:     row.Title,
		PDFPath:   row.PDFPath,
		RoleID:    row.RoleID,
		CreatedAt: row.CreatedAt,
	}

	if row.UserID.Valid {
		userID := int(row.UserID.Int64)
		doc.UserID = &userID
	}

	if row.FirstName.Valid {
		doc.FirstName = row.FirstName.String
	}

	if row.LastName.Valid {
		doc.LastName = row.LastName.String
	}

	if row.PhotoPath.Valid {
		doc.PhotoPath = row.PhotoPath.String
	}

	doc.Category.ID = row.CategoryID

	return doc
}

// Вспомогательная функция для получения ролей документа
func (s *CategoryStorage) getDocumentRoles(ctx context.Context, docID int) ([]int, error) {
	var roles []int
	query := `SELECT role_id FROM document_roles WHERE document_id = $1`
	rows, err := s.DB.QueryContext(ctx, query, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var roleID int
		if err := rows.Scan(&roleID); err != nil {
			return nil, err
		}
		roles = append(roles, roleID)
	}
	return roles, nil
}
