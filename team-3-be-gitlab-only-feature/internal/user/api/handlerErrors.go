package api

import (
	"cmd/internal/user/service"
	"encoding/json"
	"net/http"
)

// ErrorResponse структура ответа с ошибкой
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

// SuccessResponse структура успешного ответа
type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// respondWithJSON отправляет успешный JSON ответ
func respondWithJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// respondWithError отправляет ошибку в JSON формате
func respondWithError(w http.ResponseWriter, statusCode int, errorType, message string) {
	respondWithJSON(w, statusCode, ErrorResponse{
		Error:   errorType,
		Message: message,
	})
}

func handleServiceError(w http.ResponseWriter, err error) {
	switch err {
	case service.ErrUserAlreadyExists:
		respondWithError(w, http.StatusConflict, "USER_EXISTS", "Пользователь уже существует")
	case service.ErrInvalidCredentials:
		respondWithError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Неверный email или пароль")
	case service.ErrUserNotFound:
		respondWithError(w, http.StatusNotFound, "USER_NOT_FOUND", "Пользователь не найден")
	default:
		respondWithError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Внутренняя ошибка сервера")
	}
}
