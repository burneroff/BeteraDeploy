package api

import (
	service "cmd/internal/comments/service_k"
	custommiddleware "cmd/internal/custom_middleware"
	"cmd/internal/documents/repo"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type CommentHandler struct {
	service *service.CommentService
}

func NewHandler(s *service.CommentService) *CommentHandler {
	return &CommentHandler{service: s}
}

func (h *CommentHandler) GetByDocument(w http.ResponseWriter, r *http.Request) {
	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	comments, err := h.service.GetByDocument(r.Context(), docID)
	if err != nil {
		http.Error(w, "Ошибка получения комментариев", http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, comments)
}

func (h *CommentHandler) Create(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
		return
	}

	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	var in struct {
		Text string `json:"text" validate:"required,min=1,max=1000"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Text == "" {
		http.Error(w, "Текст обязателен", http.StatusBadRequest)
		return
	}

	comment, err := h.service.Create(r.Context(), docID, user.ID, in.Text)
	if err != nil {
		http.Error(w, "Не удалось создать комментарий", http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusCreated, comment)
}

func (h *CommentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
		return
	}

	commentID, _ := strconv.Atoi(chi.URLParam(r, "comment_id"))

	if err := h.service.Delete(r.Context(), commentID, user.ID, user.RoleID); err != nil {
		if errors.Is(err, repo.ErrForbidden) {
			http.Error(w, "Доступ запрещён", http.StatusForbidden)
		} else if errors.Is(err, repo.ErrNotFound) {
			http.Error(w, "Комментарий не найден", http.StatusNotFound)
		} else {
			http.Error(w, "Ошибка удаления", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func respondJSON(w http.ResponseWriter, code int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}
