package custommiddleware

import (
	"cmd/internal/user/models"
	"cmd/internal/user/service"
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type contextKey string

const UserContextKey contextKey = "user"

// respondJSONError — единый формат ошибок BETERA
func respondJSONError(w http.ResponseWriter, code, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error":   code,
		"message": message,
	})
}

// GetUserFromContext — ВОТ ЭТА ФУНКЦИЯ НУЖНА ВЕЗДЕ!
func GetUserFromContext(ctx context.Context) (*models.User, bool) {
	user, ok := ctx.Value(UserContextKey).(*models.User)
	return user, ok
}

// GetCurrentUser — удобная обертка (теперь используется везде)
func GetCurrentUser(r *http.Request) (*models.User, bool) {
	return GetUserFromContext(r.Context())
}

// AuthMiddleware — кладёт пользователя в контекст
func AuthMiddleware(jwtService *service.JWTService) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if isPublicEndpoint(r.URL.Path) {
				next.ServeHTTP(w, r)
				return
			}

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				respondJSONError(w, "UNAUTHORIZED", "Требуется авторизация", http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			user, err := jwtService.GetUserFromToken(tokenStr)
			if err != nil {
				respondJSONError(w, "UNAUTHORIZED", "Неверный токен", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// isPublicEndpoint проверяет, является ли эндпоинт публичным
func isPublicEndpoint(path string) bool {
	publicEndpoints := []string{
		"/api/login",
		"/api/register",
		"/api/verify-email",
		"/api/confirm-registration",
		"/api/resend-verification",
		"/health",
		"/metrics",
	}

	for _, endpoint := range publicEndpoints {
		if strings.HasPrefix(path, endpoint) {
			return true
		}
	}
	return false
}

// Алиасы
func AdminOnly(next http.Handler) http.Handler {
	return RequireRole(1)(next)
}

func ModeratorOrAdmin(next http.Handler) http.Handler {
	return RequireRole(1, 2)(next)
}
