package api

import (
	custommiddleware "cmd/internal/custom_middleware"
	"cmd/internal/user/api/validators"
	"cmd/internal/user/models"
	"cmd/internal/user/service"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"runtime/debug"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Handler отвечает за HTTP-эндпоинты.
type Handler struct {
	service  service.Service
	validate *validator.Validate
}

// HandlerConfig — зависимости.
type HandlerConfig struct {
	Service service.Service
}

// New — конструктор.
func New(config HandlerConfig) *Handler {
	validate := validators.NewAppValidator()
	return &Handler{
		service:  config.Service,
		validate: validate,
	}
}

// -----------------------------------------------------------------------------
// Вспомогательные утилиты
// -----------------------------------------------------------------------------

// decodeJSON строго декодирует JSON с ограничением размера и запретом неизвестных полей.
func decodeJSON(w http.ResponseWriter, r *http.Request, dst any, maxBytes int64) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return err
	}
	// не позволяем доп. JSON после первого объекта
	if dec.More() {
		return errors.New("unexpected extra JSON input")
	}
	return nil
}

// panic guard для каждого хендлера
func withRecover(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("🚨 PANIC: %v\n", err)
				log.Printf("📋 Stack:\n%s", debug.Stack())
				respondWithError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Внутренняя ошибка сервера")
			}
		}()
		fn(w, r)
	}
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

// RegisterHandler — регистрация (без пароля), отправка верификационного письма.
func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		var req models.RegisterRequest
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			log.Println("❌ JSON decode error:", err)
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}

		// Валидация входа
		if err := h.validate.Struct(req); err != nil {
			respondWithError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Неверные данные в запросе")
			return
		}

		authResponse, err := h.service.RegisterUser(r.Context(), req)
		if err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusCreated, SuccessResponse{
			Message: "Пользователь успешно зарегистрирован. Проверьте почту для подтверждения.",
			Data:    authResponse,
		})
	})(w, r)
}

// VerifyEmailHandler — ЛЕГАСИ: чистая верификация по ссылке (без установки пароля).
func (h *Handler) VerifyEmailHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		userIDStr := r.URL.Query().Get("user_id")
		token := r.URL.Query().Get("token")
		if userIDStr == "" || token == "" {
			respondWithError(w, http.StatusBadRequest, "MISSING_PARAMS", "Отсутствуют обязательные параметры: user_id и token")
			return
		}
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_USER_ID", "Неверный формат ID пользователя")
			return
		}

		if err := h.service.VerifyEmail(r.Context(), userID, token); err != nil {
			handleServiceError(w, err)
			return
		}
		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Email успешно подтверждён",
		})
	})(w, r)
}

// GenerateAvatarHandler - генерация аватара по умолчанию
func (h *Handler) GenerateAvatarHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		var req struct {
			UserID int `json:"user_id" validate:"required,min=1"`
		}
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}
		if err := h.validate.Struct(req); err != nil {
			respondWithError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Неверные данные в запросе")
			return
		}

		avatarURL, err := h.service.GenerateDefaultAvatar(r.Context(), req.UserID)
		if err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Аватар успешно сгенерирован",
			Data:    map[string]string{"avatar_url": avatarURL},
		})
	})(w, r)
}

func (h *Handler) UploadPhotoHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		// Парсим multipart form
		err := r.ParseMultipartForm(10 << 20) // 10MB limit
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_FORM", "Неверный формат данных")
			return
		}

		userIDStr := r.FormValue("user_id")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil || userID <= 0 {
			respondWithError(w, http.StatusBadRequest, "INVALID_USER_ID", "Неверный ID пользователя")
			return
		}

		file, header, err := r.FormFile("photo")
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "NO_FILE", "Файл не найден")
			return
		}
		defer file.Close()

		// Читаем файл
		fileBytes := make([]byte, header.Size)
		_, err = file.Read(fileBytes)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "READ_ERROR", "Ошибка чтения файла")
			return
		}

		// Проверяем тип файла
		contentType := header.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			respondWithError(w, http.StatusBadRequest, "INVALID_TYPE", "Файл должен быть изображением")
			return
		}

		// Загружаем через сервис
		photoURL, err := h.service.UploadUserPhoto(r.Context(), userID, fileBytes, header.Filename)
		if err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Фото успешно загружено",
			Data:    map[string]string{"photo_url": photoURL},
		})
	})(w, r)
}

// UpdateProfileHandler - обновление профиля пользователя
func (h *Handler) UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		userIDStr := r.URL.Query().Get("user_id")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil || userID <= 0 {
			respondWithError(w, http.StatusBadRequest, "INVALID_USER_ID", "Неверный ID пользователя")
			return
		}

		var req service.UpdateProfileRequest
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}

		if err := h.service.UpdateUserProfile(r.Context(), userID, req); err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Профиль успешно обновлен",
		})
	})(w, r)
}

// ResendVerificationHandler — повторная отправка письма с подтверждением.
func (h *Handler) ResendVerificationHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		var req struct {
			UserID int    `json:"user_id" validate:"required,min=1"`
			Email  string `json:"email"  validate:"required,email"`
		}
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}
		if err := h.validate.Struct(req); err != nil {
			respondWithError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Неверные данные в запросе")
			return
		}

		if err := h.service.ResendVerificationEmail(r.Context(), req.UserID, req.Email); err != nil {
			handleServiceError(w, err)
			return
		}
		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Письмо с подтверждением повторно отправлено",
		})
	})(w, r)
}

// LoginHandler — вход, выдаёт access + refresh.
func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		var req models.LoginRequest
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}
		if err := h.validate.Struct(req); err != nil {
			respondWithError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Неверные данные в запросе")
			return
		}

		authResponse, err := h.service.LoginUser(r.Context(), req)
		if err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Успешный вход в систему",
			Data:    authResponse,
		})
	})(w, r)
}

// RefreshTokenHandler — принимает refresh, возвращает новый access (+ ротацию refresh).
func (h *Handler) RefreshTokenHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		var req struct {
			RefreshToken string `json:"refresh_token" validate:"required"`
		}
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}
		if err := h.validate.Struct(req); err != nil {
			respondWithError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Неверные данные в запросе")
			return
		}

		authResponse, err := h.service.RefreshToken(r.Context(), req.RefreshToken)
		if err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Токены обновлены",
			Data:    authResponse,
		})
	})(w, r)
}

// GetUserByIDHandler — получить пользователя по id.
func (h *Handler) GetUserByIDHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		userIDStr := r.URL.Query().Get("id")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil || userID <= 0 {
			respondWithError(w, http.StatusBadRequest, "INVALID_USER_ID", "Неверный формат ID пользователя")
			return
		}

		user, err := h.service.GetUserByID(r.Context(), userID)
		if err != nil {
			handleServiceError(w, err)
			return
		}
		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Пользователь",
			Data:    user,
		})
	})(w, r)
}

// GetUsersHandler — список пользователей.
func (h *Handler) GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		users, err := h.service.GetAllUsers(r.Context())
		if err != nil {
			log.Printf("❌ Ошибка получения пользователей: %v", err)
			respondWithError(w, http.StatusInternalServerError, "FETCH_ERROR", "Не удалось получить список пользователей")
			return
		}
		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Список пользователей",
			Data:    users,
		})
	})(w, r)
}

// ConfirmRegistrationHandler — основной флоу подтверждения: токен+пароль → verify+access/refresh.
func (h *Handler) ConfirmRegistrationHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		var req service.ConfirmRegistrationRequest
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}
		// минимальная валидация
		if req.UserID <= 0 || req.Token == "" || req.Password == "" {
			respondWithError(w, http.StatusBadRequest, "MISSING_FIELDS", "Необходимо указать user_id, token и password")
			return
		}

		authResponse, err := h.service.ConfirmRegistration(r.Context(), req)
		if err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Регистрация завершена, аккаунт подтверждён",
			Data:    authResponse,
		})
	})(w, r)
}

// GetCurrentUserHandler — получить данные текущего пользователя (альтернативная реализация)
func (h *Handler) GetCurrentUserHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		user, ok := custommiddleware.GetUserFromContext(r.Context())
		if !ok {
			respondWithError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Пользователь не авторизован")
			return
		}

		// Получаем пользователя с обновленным URL аватара
		currentUser, err := h.service.GetUserByID(r.Context(), user.ID)
		if err != nil {
			handleServiceError(w, err)
			return
		}

		currentUser.PasswordHash = ""

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Данные текущего пользователя",
			Data:    currentUser,
		})
	})(w, r)
}

func (h *Handler) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}
		var req struct {
			RefreshToken string `json:"refresh_token" validate:"required"`
		}
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}
		if err := h.validate.Struct(req); err != nil {
			respondWithError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Неверные данные в запросе")
			return
		}
		if err := h.service.Logout(r.Context(), req.RefreshToken); err != nil {
			handleServiceError(w, err)
			return
		}
		respondWithJSON(w, http.StatusOK, SuccessResponse{Message: "Вы вышли из сессии"})
	})(w, r)
}

func (h *Handler) LogoutAllHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}
		var req struct {
			UserID int `json:"user_id" validate:"required,min=1"`
		}
		if err := decodeJSON(w, r, &req, 1<<20); err != nil {
			respondWithError(w, http.StatusBadRequest, "INVALID_JSON", "Неверный формат данных")
			return
		}
		if err := h.validate.Struct(req); err != nil {
			respondWithError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Неверные данные в запросе")
			return
		}
		if err := h.service.LogoutAll(r.Context(), req.UserID); err != nil {
			handleServiceError(w, err)
			return
		}
		respondWithJSON(w, http.StatusOK, SuccessResponse{Message: "Все сессии завершены"})
	})(w, r)
}

// DeleteUserHandler реализует удаление пользователя
func (h *Handler) DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	withRecover(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			respondWithError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Метод не поддерживается")
			return
		}

		userIDStr := r.URL.Query().Get("id")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil || userID <= 0 {
			respondWithError(w, http.StatusBadRequest, "INVALID_USER_ID", "Неверный формат ID пользователя")
			return
		}

		if err := h.service.DeleteUser(r.Context(), userID); err != nil {
			handleServiceError(w, err)
			return
		}

		respondWithJSON(w, http.StatusOK, SuccessResponse{
			Message: "Пользователь успешно удален",
		})
	})(w, r)
}

// -----------------------------------------------------------------------------
// (опционально) Пример middleware с таймаутом контекста на хендлер
// -----------------------------------------------------------------------------

// func withTimeout(h http.HandlerFunc, d time.Duration) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		ctx, cancel := context.WithTimeout(r.Context(), d)
// 		defer cancel()
// 		h(w, r.WithContext(ctx))
// 	}
// }
