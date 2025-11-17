package repo_r

import (
	"cmd/internal/roles/models_r"
	"context"
	"database/sql"
	"fmt"
)

type RoleStorage struct {
	DB *sql.DB
}

func NewRoleStorage(db *sql.DB) *RoleStorage {
	return &RoleStorage{DB: db}
}

// 1. Получить все роли
func (s *RoleStorage) GetAll(ctx context.Context) ([]models_r.Role, error) {
	const query = `SELECT id, name FROM roles ORDER BY id`

	rows, err := s.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("db query error: %w", err)
	}
	defer rows.Close()

	var roles []models_r.Role
	for rows.Next() {
		var r models_r.Role
		if err := rows.Scan(&r.ID, &r.Name); err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}
		roles = append(roles, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}
	return roles, nil
}

// 2. Обновить роль пользователя
func (s *RoleStorage) UpdateUserRole(ctx context.Context, userID, newRoleID int) error {
	const query = `UPDATE users SET role_id = $1 WHERE id = $2`

	result, err := s.DB.ExecContext(ctx, query, newRoleID, userID)
	if err != nil {
		return fmt.Errorf("db exec error: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected error: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}
