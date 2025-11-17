// internal/likes/api/handler.go
package api

import (
	custommiddleware "cmd/internal/custom_middleware"
	"cmd/internal/likes/service_l"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type LikeHandler struct {
	service *service_l.LikeService
}

func NewHandler(s *service_l.LikeService) *LikeHandler {
	return &LikeHandler{service: s}
}

func (h *LikeHandler) AddLike(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
		return
	}

	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	if err := h.service.Add(r.Context(), user.ID, docID); err != nil {
		if err.Error() == "already liked" {
			http.Error(w, "Уже лайкнуто", http.StatusConflict)
			return
		}
		http.Error(w, "Ошибка лайка", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *LikeHandler) RemoveLike(w http.ResponseWriter, r *http.Request) {
	user, ok := custommiddleware.GetCurrentUser(r)
	if !ok || user == nil {
		http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
		return
	}

	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	if err := h.service.Remove(r.Context(), user.ID, docID); err != nil {
		http.Error(w, "Ошибка снятия лайка", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *LikeHandler) GetLikes(w http.ResponseWriter, r *http.Request) {
	docID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	count, err := h.service.Count(r.Context(), docID)
	if err != nil {
		http.Error(w, "Ошибка подсчёта лайков", http.StatusInternalServerError)
		return
	}
	respondJSON(w, http.StatusOK, map[string]int{"likes": count})
}

func respondJSON(w http.ResponseWriter, code int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}
