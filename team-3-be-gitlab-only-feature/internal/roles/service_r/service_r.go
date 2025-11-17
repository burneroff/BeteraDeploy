package service_r

import (
	"cmd/internal/roles/models_r"
	"cmd/internal/roles/repo_r"
	"context"
	"errors"
)

var (
	ErrInvalidRole  = errors.New("invalid role")
	ErrAccessDenied = errors.New("access denied")
)

type RoleService struct {
	repo *repo_r.RoleStorage
}

func NewRoleService(r *repo_r.RoleStorage) *RoleService {
	return &RoleService{repo: r}
}

func (s *RoleService) GetAll(ctx context.Context) ([]models_r.Role, error) {
	return s.repo.GetAll(ctx)
}

// Сменить роль пользователя
func (s *RoleService) ChangeUserRole(ctx context.Context, userID, newRoleID int, currentUserRoleID int) error {
	// Проверяем права - только администратор может менять роли
	if currentUserRoleID != 1 { // 1 = Администратор
		return ErrAccessDenied
	}

	// Проверяем что роль существует
	roles, err := s.repo.GetAll(ctx)
	if err != nil {
		return err
	}

	roleExists := false
	for _, role := range roles {
		if role.ID == newRoleID {
			roleExists = true
			break
		}
	}

	if !roleExists {
		return ErrInvalidRole
	}

	// Меняем роль
	return s.repo.UpdateUserRole(ctx, userID, newRoleID)
}
