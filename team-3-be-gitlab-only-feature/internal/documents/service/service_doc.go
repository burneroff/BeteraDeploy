package service

import (
	"cmd/internal/documents/models"
	"cmd/internal/documents/repo"
	"cmd/internal/storage"
	"context"
	"log"
	"strings"
)

type Service struct {
	Repo      *repo.Storage
	S3Storage *storage.S3Storage // ← ДОБАВЛЯЕМ
}

func NewService(r *repo.Storage, s3Storage *storage.S3Storage) *Service {
	return &Service{
		Repo:      r,
		S3Storage: s3Storage,
	}
}

func (s *Service) GetAllDocuments(ctx context.Context, roleID, viewerID int) ([]models.Document, error) {
	docsPtr, err := s.Repo.GetAllDocuments(ctx, roleID, viewerID)
	if err != nil {
		return nil, err
	}

	docs := make([]models.Document, len(docsPtr))

	// Быстрый выход если S3 не доступен
	if s.S3Storage == nil {
		for i := range docsPtr {
			docs[i] = *docsPtr[i]
		}
		return docs, nil
	}

	for i := range docsPtr {
		docs[i] = *docsPtr[i]

		// Обрабатываем аватар
		if docs[i].PhotoPath != "" {
			if strings.HasPrefix(docs[i].PhotoPath, "photos/") || strings.HasPrefix(docs[i].PhotoPath, "avatars/") {
				if avatarURL, err := s.S3Storage.GenerateDownloadURL(docs[i].PhotoPath); err == nil {
					docs[i].PhotoPath = avatarURL
				}

			}
		}

		// Обрабатываем PDF
		if docs[i].PDFPath != "" && strings.HasPrefix(docs[i].PDFPath, "documents/") {
			if downloadURL, err := s.S3Storage.GenerateDownloadURL(docs[i].PDFPath); err == nil {
				docs[i].PDFPath = downloadURL
			}

		}
	}

	return docs, nil
}

func (s *Service) GetDocumentByID(ctx context.Context, id, roleID, viewerID int) (*models.Document, error) {
	doc, err := s.Repo.GetDocumentByID(ctx, id, roleID, viewerID)
	if err != nil {
		return nil, err
	}

	// Генерируем presigned URL для PDF файла если нужно
	if doc != nil && s.S3Storage != nil && doc.PDFPath != "" {
		// Если это уже presigned URL, пропускаем
		if strings.Contains(doc.PDFPath, "X-Amz-Signature") {
			return doc, nil
		}

		// Если это S3 ключ (начинается с documents/), генерируем presigned URL
		if strings.HasPrefix(doc.PDFPath, "documents/") {
			// Проверяем существование файла
			exists, err := s.S3Storage.CheckFileExists(ctx, doc.PDFPath)
			if err != nil {
				log.Printf("⚠️ Ошибка проверки файла для документа %d: %v", doc.ID, err)
			} else if exists {
				// Генерируем presigned URL
				downloadURL, err := s.S3Storage.GenerateDownloadURL(doc.PDFPath)
				if err != nil {
					log.Printf("⚠️ Ошибка генерации URL для документа %d: %v", doc.ID, err)
				} else {
					doc.PDFPath = downloadURL
					log.Printf("✅ Presigned URL сгенерирован для документа %d", doc.ID)
				}
			} else {
				log.Printf("⚠️ Файл не найден в S3 для документа %d: %s", doc.ID, doc.PDFPath)
			}
		}
	}

	return doc, nil
}

func (s *Service) CreateDocument(ctx context.Context, doc *models.Document) error {
	return s.Repo.Create(ctx, doc)
}

func (s *Service) DeleteDocument(ctx context.Context, id, roleID, viewerID int) error {
	if _, err := s.Repo.GetDocumentByID(ctx, id, roleID, viewerID); err != nil {
		return err
	}
	return s.Repo.Delete(ctx, id)
}
