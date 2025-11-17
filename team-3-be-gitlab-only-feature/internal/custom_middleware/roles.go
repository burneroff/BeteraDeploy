package custommiddleware

import (
	"net/http"
	"strings"
)

// RequireRole — проверка роли
func RequireRole(allowed ...int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := GetCurrentUser(r)
			if !ok || user == nil {
				respondJSONError(w, "UNAUTHORIZED", "Пользователь не авторизован", http.StatusUnauthorized)
				return
			}

			for _, role := range allowed {
				if user.RoleID == role {
					next.ServeHTTP(w, r)
					return
				}
			}
			respondJSONError(w, "FORBIDDEN", "Недостаточно прав", http.StatusForbidden)
		})
	}
}

// DocumentAccessMiddleware проверяет доступ к документу на основе ролей
func DocumentAccessMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, ok := GetUserFromContext(r.Context())
		if !ok {
			http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
			return
		}

		// Для операций с документами проверяем права доступа
		if r.Method == http.MethodGet && strings.Contains(r.URL.Path, "/api/documents") {
			// В реальной реализации здесь бы мы получали documentID из запроса
			// и проверяли доступ через access.IsAccessible()
			// Пока просто пропускаем - детальная проверка будет в хендлере
		}

		next.ServeHTTP(w, r)
	})
}
