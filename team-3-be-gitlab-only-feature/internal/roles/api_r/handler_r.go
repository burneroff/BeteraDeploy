package api_r

import (
	custommiddleware "cmd/internal/custom_middleware"
	"cmd/internal/roles/service_r"
	"encoding/json"
	"net/http"
)

type RoleHandler struct {
	service *service_r.RoleService
}

func NewRoleHandler(s *service_r.RoleService) *RoleHandler {
	return &RoleHandler{service: s}
}

func (h *RoleHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	roles, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(roles)
}

func (h *RoleHandler) ChangeUserRole(w http.ResponseWriter, r *http.Request) {
	// 1. Получаем текущего пользователя из контекста (ИСПРАВЛЕНО)
	currentUser, ok := custommiddleware.GetUserFromContext(r.Context())
	if !ok || currentUser == nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	// 2. Парсим JSON запрос
	var request struct {
		UserID int `json:"user_id"`
		RoleID int `json:"role_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// 3. Валидация
	if request.UserID <= 0 || request.RoleID <= 0 {
		http.Error(w, `{"error": "Invalid user ID or role ID"}`, http.StatusBadRequest)
		return
	}

	// 4. Вызов сервиса
	if err := h.service.ChangeUserRole(r.Context(), request.UserID, request.RoleID, currentUser.RoleID); err != nil {
		// Детальная обработка ошибок
		switch err {
		case service_r.ErrAccessDenied:
			http.Error(w, `{"error": "Access denied"}`, http.StatusForbidden)
		case service_r.ErrInvalidRole:
			http.Error(w, `{"error": "Invalid role"}`, http.StatusBadRequest)
		default:
			http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		}
		return
	}

	// 5. Успешный ответ
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Role changed successfully",
	})
}
