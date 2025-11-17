package service_v

import (
	"cmd/internal/storage"
	"cmd/internal/views/models_v"
	"cmd/internal/views/repo_v"
	"context"
	"strings"
)

type ViewService struct {
	repo      *repo_v.ViewStorage
	s3Storage *storage.S3Storage
}

func NewViewService(r *repo_v.ViewStorage, s3Storage *storage.S3Storage) *ViewService {
	return &ViewService{
		repo:      r,
		s3Storage: s3Storage,
	}
}

func (s *ViewService) AddView(ctx context.Context, userID, docID int) error {
	return s.repo.AddView(ctx, userID, docID)
}

func (s *ViewService) CountViews(ctx context.Context, docID int) (int, error) {
	return s.repo.CountViews(ctx, docID)
}

// Обновляем метод GetViewers для генерации presigned URL для аватаров
func (s *ViewService) GetViewers(ctx context.Context, docID int) ([]models_v.Viewer, error) {
	viewers, err := s.repo.GetViewers(ctx, docID)
	if err != nil {
		return nil, err
	}

	// Быстрая обработка аватаров - без лишних проверок
	if s.s3Storage != nil {
		for i := range viewers {
			if viewers[i].PhotoPath != nil {
				photoPath := *viewers[i].PhotoPath
				// Генерируем URL только для S3 ключей
				if strings.HasPrefix(photoPath, "photos/") || strings.HasPrefix(photoPath, "avatars/") {
					if avatarURL, err := s.s3Storage.GenerateDownloadURL(photoPath); err == nil {
						viewers[i].PhotoPath = &avatarURL
					}
				}
			}
		}
	}

	return viewers, nil
}
