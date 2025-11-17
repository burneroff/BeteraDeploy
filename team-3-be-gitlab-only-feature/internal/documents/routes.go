package routes

import (
	api_c "cmd/internal/categories/api_c"
	api_k "cmd/internal/comments/api_k"
	custommiddleware "cmd/internal/custom_middleware"
	api "cmd/internal/documents/api"
	api_l "cmd/internal/likes/api_l"
	"cmd/internal/roles/api_r"
	APIUser "cmd/internal/user/api"
	servUser "cmd/internal/user/service"
	api_v "cmd/internal/views/api_v"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func RegisterAPIRoutes(
	r chi.Router,
	userHandler *APIUser.Handler,
	docHandler *api.Handler,
	catHandler *api_c.CategoryHandler,
	likeHandler *api_l.LikeHandler,
	viewHandler *api_v.ViewHandler,
	roleHandler *api_r.RoleHandler,
	commentHandler *api_k.CommentHandler,
	jwtService *servUser.JWTService,
	userService servUser.Service,
) {
	// === ПУБЛИЧНЫЕ МАРШРУТЫ (АВТОРИЗАЦИЯ) ===
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", userHandler.RegisterHandler)
		r.Post("/login", userHandler.LoginHandler)
		r.Post("/confirm", userHandler.ConfirmRegistrationHandler)
		r.Post("/resend", userHandler.ResendVerificationHandler)
		r.Post("/refresh", userHandler.RefreshTokenHandler)
		r.Get("/verify-email", userHandler.VerifyEmailHandler)
	})

	// === ЗДОРОВЬЕ СИСТЕМЫ ===
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"OK","service":"dochub-corporate-portal","version":"1.0.0"}`))
	})

	// === ЗАЩИЩЁННЫЕ МАРШРУТЫ ===
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(custommiddleware.AuthMiddleware(jwtService))

		// === ПОЛЬЗОВАТЕЛЬ ===
		r.Route("/user", func(r chi.Router) {
			r.Get("/", userHandler.GetUserByIDHandler)
			r.Get("/me", userHandler.GetCurrentUserHandler)
			r.Put("/profile", userHandler.UpdateProfileHandler)
			r.Post("/photo", userHandler.UploadPhotoHandler)
			r.Post("/avatar/generate", userHandler.GenerateAvatarHandler)
			r.Post("/logout", userHandler.LogoutHandler)

			// Админские маршруты для управления пользователями
			r.Route("/admin", func(r chi.Router) {
				r.Use(custommiddleware.RequireRole(1))
				r.Get("/users", userHandler.GetUsersHandler)
				r.Delete("/", userHandler.DeleteUserHandler)
				r.Post("/logout-all", userHandler.LogoutAllHandler)
			})

			r.Route("/roles", func(r chi.Router) {
				r.Use(custommiddleware.RequireRole(1)) // Только админы
				r.Put("/change", roleHandler.ChangeUserRole)
			})
		})

		// === ДОКУМЕНТЫ ===
		r.Get("/documents", docHandler.GetAll)                                          //просмотр всех
		r.With(custommiddleware.ModeratorOrAdmin).Post("/documents", docHandler.Create) //создание

		r.Route("/documents/{id}", func(r chi.Router) {
			r.Get("/", docHandler.GetByID)                                    //просмотр конкретного
			r.With(custommiddleware.AdminOnly).Delete("/", docHandler.Delete) //удаление

			// === КОММЕНТАРИИ ===
			r.Get("/comments", commentHandler.GetByDocument) //просмотреть все
			r.Post("/comments", commentHandler.Create)       //оставить

			// === ЛАЙКИ ===
			r.Put("/like", likeHandler.AddLike)       //поставить
			r.Delete("/like", likeHandler.RemoveLike) //удалить
			r.Get("/likes", likeHandler.GetLikes)     //количество

			// === ПРОСМОТРЫ ===
			r.Put("/view", viewHandler.AddView)                                               //отметить
			r.Get("/views", viewHandler.CountViews)                                           //количество
			r.With(custommiddleware.ModeratorOrAdmin).Get("/viewers", viewHandler.GetViewers) //список
		})

		// === УДАЛЕНИЕ КОММЕНТАРИЯ ===
		r.Delete("/documents/{id}/comments/{comment_id}", commentHandler.Delete)

		// === КАТЕГОРИИ ===
		r.Get("/categories", catHandler.GetAll)                                          //просмотр
		r.With(custommiddleware.ModeratorOrAdmin).Post("/categories", catHandler.Create) //добавление
		r.Get("/categories/{id}/documents", catHandler.GetDocumentsByCategory)           //документы в рамках категории

		// === РОЛИ ===
		r.Get("/roles/getall", roleHandler.GetAll) //получение
	})
}
