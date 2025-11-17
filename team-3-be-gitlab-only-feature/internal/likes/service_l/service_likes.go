package service_l

import (
	"cmd/internal/likes/repo_l"
	"context"
)

type LikeService struct {
	repo *repo_l.LikeStorage
}

func NewLikeService(r *repo_l.LikeStorage) *LikeService {
	return &LikeService{repo: r}
}

// Теперь принимает userID явно
func (s *LikeService) Add(ctx context.Context, userID, docID int) error {
	return s.repo.AddLike(ctx, userID, docID)
}

func (s *LikeService) Remove(ctx context.Context, userID, docID int) error {
	return s.repo.RemoveLike(ctx, userID, docID)
}

func (s *LikeService) Count(ctx context.Context, docID int) (int, error) {
	return s.repo.CountLikes(ctx, docID)
}

func (s *LikeService) IsLiked(ctx context.Context, userID, docID int) (bool, error) {
	return s.repo.IsLiked(ctx, userID, docID)
}
