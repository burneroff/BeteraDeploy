package service_k

import (
	"cmd/internal/comments/models_k"
	"cmd/internal/comments/repo_k"
	"cmd/internal/storage"
	"context"
)

type CommentService struct {
	repo      *repo_k.CommentStorage
	s3Storage *storage.S3Storage
}

func NewCommentService(r *repo_k.CommentStorage, s3Storage *storage.S3Storage) *CommentService {
	return &CommentService{repo: r, s3Storage: s3Storage}
}

// Создать комментарий — userID передаём явно
func (s *CommentService) Create(ctx context.Context, docID, userID int, text string) (*models_k.Comment, error) {
	if text == "" || len(text) > 1000 {
		return nil, repo_k.ErrBadData
	}

	c := &models_k.Comment{
		DocumentID: docID,
		UserID:     userID,
		Text:       text,
	}

	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *CommentService) GetByDocument(ctx context.Context, docID int) ([]models_k.Comment, error) {
	comments, err := s.repo.GetByDocument(ctx, docID)
	if err != nil {
		return nil, err
	}

	if s.s3Storage != nil {
		for i := range comments {
			if comments[i].PhotoPath != nil {
				if url, err := s.s3Storage.GenerateDownloadURL(*comments[i].PhotoPath); err == nil {
					comments[i].PhotoPath = &url
				}
			}
		}
	}

	return comments, nil
}

func (s *CommentService) GetByID(ctx context.Context, id int) (*models_k.Comment, error) {
	return s.repo.GetByID(ctx, id)
}

// Удалить с проверкой прав
func (s *CommentService) Delete(ctx context.Context, commentID, userID, roleID int) error {
	comment, err := s.repo.GetByID(ctx, commentID)
	if err != nil {
		return err
	}

	if comment.UserID != userID && roleID != 1 {
		return repo_k.ErrForbidden
	}

	return s.repo.SoftDelete(ctx, commentID)
}
