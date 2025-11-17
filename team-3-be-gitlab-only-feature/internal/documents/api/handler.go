package api

import (
	custommiddleware "cmd/internal/custom_middleware"
	"cmd/internal/documents/models"
	"cmd/internal/documents/repo"
	"cmd/internal/documents/service"
	"cmd/internal/storage"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

const (
	MaxFileSize = 20 * 1024 * 1024 // 20 MB
	MaxFormSize = 32 * 1024 * 1024 // 32 MB
)

type Handler struct {
	service   *service.Service
	s3Storage *storage.S3Storage
}

func NewHandler(s *service.Service, st *storage.S3Storage) *Handler {
	return &Handler{
		service:   s,
		s3Storage: st,
	}
}

// Create — создание документа с accessible_role (1-5)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Неавторизован", http.StatusUnauthorized)
		return
	}

	// Ограничиваем размер файла
	r.Body = http.MaxBytesReader(w, r.Body, MaxFileSize)
	if err := r.ParseMultipartForm(MaxFormSize); err != nil {
		http.Error(w, "Файл слишком большой (макс 20MB)", http.StatusBadRequest)
		return
	}

	metadata := r.FormValue("metadata")
	if metadata == "" {
		http.Error(w, "Поле 'metadata' обязательно", http.StatusBadRequest)
		return
	}

	var input struct {
		Title          string `json:"title"`
		CategoryID     int    `json:"category_id"`
		AccessibleRole int    `json:"accessible_role"` // 1-5
	}

	if err := json.Unmarshal([]byte(metadata), &input); err != nil {
		http.Error(w, "Неверный JSON в metadata", http.StatusBadRequest)
		return
	}

	if input.Title == "" {
		http.Error(w, "Поле 'title' обязательно", http.StatusBadRequest)
		return
	}
	if input.CategoryID == 0 {
		http.Error(w, "Поле 'category_id' обязательно", http.StatusBadRequest)
		return
	}
	if input.AccessibleRole < 1 || input.AccessibleRole > 5 {
		http.Error(w, "accessible_role должен быть от 1 до 5", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Файл обязателен", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Читаем файл в память
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Ошибка чтения файла", http.StatusInternalServerError)
		return
	}

	// Генерируем S3 ключ
	s3Key := fmt.Sprintf("documents/%d-%s", time.Now().Unix(), handler.Filename)

	// ЗАГРУЖАЕМ ФАЙЛ НАПРЯМУЮ в S3
	_, err = h.s3Storage.UploadFile(r.Context(), s3Key, fileBytes, "application/pdf")
	if err != nil {
		http.Error(w, "Ошибка загрузки файла в S3: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Создаём документ в БД с S3 ключом
	doc := &models.Document{
		Title:   input.Title,
		PDFPath: s3Key, // Сохраняем S3 ключ
		UserID:  &user.ID,
		RoleID:  user.RoleID,
	}

	doc.Category.ID = input.CategoryID

	if err := h.service.Repo.Create(r.Context(), doc); err != nil {
		http.Error(w, "Ошибка сохранения документа", http.StatusInternalServerError)
		return
	}

	if err := h.service.Repo.SaveAccessibleRole(r.Context(), doc.ID, input.AccessibleRole); err != nil {
		http.Error(w, "Ошибка сохранения прав доступа", http.StatusInternalServerError)
		return
	}

	// Успешный ответ - файл уже загружен
	respondJSON(w, map[string]any{
		"status":          "success",
		"doc_id":          doc.ID,
		"accessible_role": input.AccessibleRole,
	}, http.StatusCreated)
}

// GetAll — список всех доступных документов
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Неавторизован", http.StatusUnauthorized)
		return
	}

	docs, err := h.service.GetAllDocuments(r.Context(), user.RoleID, user.ID)
	if err != nil {
		http.Error(w, "Ошибка получения документов", http.StatusInternalServerError)
		return
	}

	// Преобразуем S3 ключи в presigned URLs
	if h.s3Storage != nil {
		for i := range docs {
			// Проверяем существование файла по оригинальному ключу
			exists, err := h.s3Storage.CheckFileExists(r.Context(), docs[i].PDFPath)
			if err != nil {
				continue // пропускаем этот документ
			}

			if !exists {
				continue // пропускаем этот документ
			}

			// Генерируем presigned URL только если файл существует
			downloadURL, err := h.s3Storage.GenerateDownloadURL(docs[i].PDFPath)
			if err != nil {
				continue // пропускаем этот документ
			}
			docs[i].PDFPath = downloadURL
		}
	}

	// Скрываем старое поле AccessibleRoles для всех, кроме админа/модера
	if user.RoleID != 1 && user.RoleID != 2 {
		for i := range docs {
			docs[i].AccessibleRoles = nil
		}
	}

	respondJSON(w, map[string]any{
		"documents": docs,
		"count":     len(docs),
	}, http.StatusOK)
}

// GetByID — получение одного документа + presigned URL
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", http.StatusBadRequest)
		return
	}

	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Неавторизован", http.StatusUnauthorized)
		return
	}

	doc, err := h.service.GetDocumentByID(r.Context(), id, user.RoleID, user.ID)
	if err != nil {
		if errors.Is(err, repo.ErrNotFound) {
			http.Error(w, "Документ не найден", http.StatusNotFound)
			return
		}
		if errors.Is(err, repo.ErrForbidden) {
			http.Error(w, "Доступ запрещён", http.StatusForbidden)
			return
		}
		http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
		return
	}

	// Сначала проверяем существование файла по оригинальному ключу
	if h.s3Storage != nil {
		// Проверяем существование файла по оригинальному пути (до генерации presigned URL)
		_, err = h.s3Storage.CheckFileExists(r.Context(), doc.PDFPath)
		if err != nil {
			http.Error(w, "Файл не найден в хранилище", http.StatusInternalServerError)
			return
		}

		downloadURL, err := h.s3Storage.GenerateDownloadURL(doc.PDFPath)
		if err != nil {
			http.Error(w, "Ошибка генерации ссылки на файл", http.StatusInternalServerError)
			return
		}
		doc.PDFPath = downloadURL // заменяем постоянный путь на временный URL
	}

	// Скрываем поле для обычных пользователей
	if user.RoleID != 1 && user.RoleID != 2 {
		doc.AccessibleRoles = nil
	}

	respondJSON(w, doc, http.StatusOK)
}

// Delete — мягкое удаление (только админ)
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Неавторизован", http.StatusUnauthorized)
		return
	}

	if user.RoleID != 1 {
		http.Error(w, "Только администратор может удалять", http.StatusForbidden)
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteDocument(r.Context(), id, user.RoleID, user.ID); err != nil {
		if errors.Is(err, repo.ErrNotFound) {
			http.Error(w, "Документ не найден", http.StatusNotFound)
		} else {
			http.Error(w, "Ошибка удаления", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// respondJSON — универсальный ответ
func respondJSON(w http.ResponseWriter, data any, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false) // ← ЭТО РЕШАЕТ ПРОБЛЕМУ!
	encoder.Encode(data)
}
