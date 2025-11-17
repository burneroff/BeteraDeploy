package api_v

import (
	custommiddleware "cmd/internal/custom_middleware"
	"cmd/internal/views/service_v"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type ViewHandler struct {
	service *service_v.ViewService
}

func NewHandler(s *service_v.ViewService) *ViewHandler {
	return &ViewHandler{service: s}
}

func (h *ViewHandler) AddView(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
		return
	}

	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	if err := h.service.AddView(r.Context(), user.ID, docID); err != nil {
		if err.Error() == "already viewed" {
			http.Error(w, "Уже ознакомлен", http.StatusConflict)
			return
		}
		http.Error(w, "Ошибка ознакомления", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *ViewHandler) CountViews(w http.ResponseWriter, r *http.Request) {
	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	count, err := h.service.CountViews(r.Context(), docID)
	if err != nil {
		http.Error(w, "Ошибка подсчёта", http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]int{"views_count": count})
}

func (h *ViewHandler) GetViewers(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
		return
	}

	if user.RoleID != 1 && user.RoleID != 2 {
		http.Error(w, "Доступ запрещён", http.StatusForbidden)
		return
	}

	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	viewers, err := h.service.GetViewers(r.Context(), docID)
	if err != nil {
		http.Error(w, "Ошибка получения списка", http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, viewers)
}

func respondJSON(w http.ResponseWriter, code int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}
