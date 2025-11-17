package service_c

import (
	models "cmd/internal/categories/models_c"
	"cmd/internal/categories/repo_c"
	docModels "cmd/internal/documents/models"
	"context"
)

type CategoryService struct {
	repo *repo_c.CategoryStorage
}

func NewCategoryService(r *repo_c.CategoryStorage) *CategoryService {
	return &CategoryService{repo: r}
}

func (s *CategoryService) GetAll(ctx context.Context) ([]models.Category, error) {
	return s.repo.GetAll(ctx)
}

func (s *CategoryService) Create(ctx context.Context, name string) (*models.Category, error) {
	return s.repo.Create(ctx, name)
}

func (s *CategoryService) GetDocumentsByCategory(ctx context.Context, categoryID int, roleID int) ([]docModels.Document, error) {
	return s.repo.GetDocumentsByCategory(ctx, categoryID, roleID)
}
