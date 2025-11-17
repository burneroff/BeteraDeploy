// internal/categories/api/handler.go
package api

import (
	"cmd/internal/categories/service_c"
	custommiddleware "cmd/internal/custom_middleware"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type CategoryHandler struct {
	service *service_c.CategoryService
}

func NewHandler(s *service_c.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: s}
}

func (h *CategoryHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	cats, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(w, "Ошибка получения категорий", http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, cats)
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name string `json:"name" validate:"required"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Name == "" {
		http.Error(w, "Название обязательно", http.StatusBadRequest)
		return
	}

	cat, err := h.service.Create(r.Context(), in.Name)
	if err != nil {
		if err.Error() == "category exists" {
			http.Error(w, "Категория уже существует", http.StatusConflict)
			return
		}
		http.Error(w, "Ошибка создания: "+err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusCreated, cat)
}

func (h *CategoryHandler) GetDocumentsByCategory(w http.ResponseWriter, r *http.Request) {
	catID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	// Получаем пользователя из контекста
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
		return
	}

	// Передаем roleID в сервис
	docs, err := h.service.GetDocumentsByCategory(r.Context(), catID, user.RoleID)
	if err != nil {
		http.Error(w, "Ошибка получения документов: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Скрываем accessible_roles для обычных пользователей
	if user.RoleID != 1 && user.RoleID != 2 {
		for i := range docs {
			docs[i].AccessibleRoles = nil
		}
	}

	respondJSON(w, http.StatusOK, docs)
}

func respondJSON(w http.ResponseWriter, code int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}
