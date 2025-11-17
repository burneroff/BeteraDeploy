package main

import (
	api_c "cmd/internal/categories/api_c"
	"cmd/internal/categories/repo_c"
	"cmd/internal/categories/service_c"
	routes "cmd/internal/documents"

	api_k "cmd/internal/comments/api_k"
	"cmd/internal/comments/repo_k"
	"cmd/internal/comments/service_k"

	"cmd/internal/config"

	api_docs "cmd/internal/documents/api"
	repoDoc "cmd/internal/documents/repo"
	"cmd/internal/documents/service"

	api_l "cmd/internal/likes/api_l"
	"cmd/internal/likes/repo_l"
	"cmd/internal/likes/service_l"

	"cmd/internal/logger"

	api_r "cmd/internal/roles/api_r"
	"cmd/internal/roles/repo_r"
	"cmd/internal/roles/service_r"

	"cmd/internal/storage"

	APIUser "cmd/internal/user/api"
	repoUser "cmd/internal/user/repo/postgres"
	servUser "cmd/internal/user/service"

	api_v "cmd/internal/views/api_v"
	"cmd/internal/views/repo_v"
	"cmd/internal/views/service_v"

	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/jackc/pgx/v5/stdlib"
)

const (
	EnvLocal = "local"
	EnvDev   = "dev"
	EnvProd  = "prod"
)

func main() {
	// === 1. Начальный логгер ===
	beginLogger := slog.New(
		slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelError}),
	)

	// === 2. Загрузка конфига ===
	cfg, err := config.MustLoad()
	if err != nil {
		beginLogger.Error("Ошибка загрузки конфига", "error", err)
		os.Exit(1)
	}

	log := logger.New(cfg.Env)
	log.Info("Конфигурация успешно загружена",
		slog.String("smtp_host", cfg.Email.SMTPHost),
		slog.Int("smtp_port", cfg.Email.SMTPPort),
	)

	// === 3. Подключение к БД ===
	log.Info("Подключение к базе данных...")
	db, err := storage.New(storage.Config{
		Host:     cfg.Data.PostgreSQl.Host,
		Port:     cfg.Data.PostgreSQl.Port,
		UserName: cfg.Data.PostgreSQl.UserName,
		Password: cfg.Data.PostgreSQl.Password,
		DBName:   cfg.Data.PostgreSQl.Database,
		SSLMode:  cfg.Data.PostgreSQl.SSLMode,
	})
	if err != nil {
		log.Error("Ошибка подключения к БД", slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.Ping(ctx); err != nil {
		log.Error("Ошибка проверки соединения с БД", slog.String("error", err.Error()))
		os.Exit(1)
	}
	log.Info("Соединение с базой данных успешно установлено")

	// === 4. Инициализация S3 ===
	log.Info("Инициализация S3 хранилища...")
	s3Storage, err := storage.NewS3Storage(storage.S3Config{
		Bucket:          cfg.S3.Bucket,
		Region:          cfg.S3.Region,
		AccessKey:       cfg.S3.AccessKey,
		SecretAccessKey: cfg.S3.SecretAccessKey,
		Endpoint:        cfg.S3.Endpoint,
		UseSSL:          cfg.S3.UseSSL,
	})
	if err != nil {
		log.Error("Ошибка инициализации S3", slog.String("error", err.Error()))
		os.Exit(1)
	}
	log.Info("S3 успешно инициализирован")

	// === 5. Сервисы документов и зависимостей ===
	repoStorage := &repoDoc.Storage{DB: db.DB}
	serviceLayer := service.NewService(repoStorage, s3Storage)
	docHandler := api_docs.NewHandler(serviceLayer, s3Storage)

	categoryStorage := &repo_c.CategoryStorage{DB: db.DB}
	categoryService := service_c.NewCategoryService(categoryStorage)
	categoryHandler := api_c.NewHandler(categoryService)

	likeStorage := repo_l.NewLikeStorage(db.DB)
	likeService := service_l.NewLikeService(likeStorage)
	likeHandler := api_l.NewHandler(likeService)

	viewStorage := repo_v.NewViewStorage(db.DB)
	viewService := service_v.NewViewService(viewStorage, s3Storage)
	viewHandler := api_v.NewHandler(viewService)

	roleStorage := repo_r.NewRoleStorage(db.DB)
	roleService := service_r.NewRoleService(roleStorage)
	roleHandler := api_r.NewRoleHandler(roleService)

	commentStorage := repo_k.NewCommentStorage(db.DB)
	commentService := service_k.NewCommentService(commentStorage, s3Storage)
	commentHandler := api_k.NewHandler(commentService)

	// === 6. Email-сервис ===
	log.Info("Инициализация email сервиса...")
	emailService := servUser.NewSMTPEmailService(servUser.EmailConfig{
		SMTPHost:     cfg.Email.SMTPHost,
		SMTPPort:     cfg.Email.SMTPPort,
		SMTPUsername: cfg.Email.SMTPUsername,
		SMTPPassword: cfg.Email.SMTPPassword,
		FromEmail:    cfg.Email.FromEmail,
		FromName:     cfg.Email.FromName,
	})

	// === 7. Пользователи ===
	userStorage := repoUser.NewWithStorage(db)
	userService := servUser.New(userStorage, servUser.Config{
		JWTSecret:    cfg.Auth.JWTSecret,
		AppBaseURL:   cfg.Server.Address,
		EmailService: emailService,
	}, s3Storage)
	userHandler := APIUser.New(APIUser.HandlerConfig{
		Service: userService,
	})
	log.Info("Сервис и хендлер пользователей инициализированы")

	// === 8. JWT сервис ===
	jwtService := servUser.NewJWTService(cfg.Auth.JWTSecret, 15*time.Minute, 7*24*time.Hour)

	// === 9. Роутер ===
	router := chi.NewRouter()

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	router.Use(middleware.RequestID)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(cfg.Server.Timeout))
	router.Use(func(next http.Handler) http.Handler {
		return logger.RequestL(log, next)
	})

	// === 10. Health Check ===
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// === 11. Регистрация всех маршрутов ===
	routes.RegisterAPIRoutes(
		router,
		userHandler,
		docHandler,
		categoryHandler,
		likeHandler,
		viewHandler,
		roleHandler,
		commentHandler,
		jwtService,
		userService,
	)

	// === 12. Запуск сервера ===
	log.Info("Сервер запущен", slog.String("address", cfg.Server.Address))
	srv := &http.Server{
		Addr:         cfg.Server.Address,
		Handler:      router,
		ReadTimeout:  cfg.Server.Timeout,
		WriteTimeout: cfg.Server.Timeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Error("Ошибка сервера", slog.String("error", err.Error()))
		os.Exit(1)
	}
	log.Info("Сервер остановлен")
}
