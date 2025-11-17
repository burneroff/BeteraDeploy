package service

import (
	"cmd/internal/storage"
	"cmd/internal/user/models"
	repoUser "cmd/internal/user/repo"
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserAlreadyExists  = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrTokenInvalid       = errors.New("invalid or expired verification token")
)

type Service interface {
	RegisterUser(ctx context.Context, req models.RegisterRequest) (*models.AuthResponse, error)
	UploadUserPhoto(ctx context.Context, userID int, file []byte, filename string) (string, error)
	GenerateDefaultAvatar(ctx context.Context, userID int) (string, error)
	UpdateUserProfile(ctx context.Context, userID int, updateReq UpdateProfileRequest) error
	ConfirmRegistration(ctx context.Context, req ConfirmRegistrationRequest) (*models.AuthResponse, error)
	SetPassword(ctx context.Context, req SetPasswordRequest) error
	LoginUser(ctx context.Context, req models.LoginRequest) (*models.AuthResponse, error)
	DeleteUser(ctx context.Context, userID int) error

	GetUserByID(ctx context.Context, userID int) (*models.User, error)
	GetUserProfile(ctx context.Context, userID int) (*models.User, error)
	GetAllUsers(ctx context.Context) ([]*models.User, error)

	ValidateAccessToken(tokenString string) (int, string, error)
	RefreshToken(ctx context.Context, refreshToken string) (*models.AuthResponse, error)

	ResendVerificationEmail(ctx context.Context, userID int, email string) error
	VerifyEmail(ctx context.Context, userID int, token string) error

	Logout(ctx context.Context, refreshToken string) error
	LogoutAll(ctx context.Context, userID int) error
}

type service struct {
	storage            repoUser.Storage
	refreshStorage     repoUser.Storage
	emailService       EmailService
	verificationSvc    *VerificationService
	jwt                *JWTService
	maxRotationPerHour int
	s3Storage          *storage.S3Storage
}

type Config struct {
	AppBaseURL      string
	EmailService    EmailService
	JWTSecret       string
	AccessTTL       time.Duration
	RefreshTTL      time.Duration
	VerificationTTL time.Duration
}

type SetPasswordRequest struct {
	UserID   int    `json:"user_id"`
	Password string `json:"password"`
}

type ConfirmRegistrationRequest struct {
	UserID   int    `json:"user_id"`
	Token    string `json:"token"`
	Password string `json:"password"`
}

type UpdateProfileRequest = repoUser.UpdateProfileRequest

func New(userStorage repoUser.Storage, cfg Config, s3Storage *storage.S3Storage) Service {
	access := cfg.AccessTTL
	if access == 0 {
		access = 15 * time.Minute
	}
	refresh := cfg.RefreshTTL
	if refresh == 0 {
		refresh = 24 * time.Hour
	}
	jwtSvc := NewJWTService(cfg.JWTSecret, access, refresh)

	verCfg := []VerificationConfig{}
	if cfg.VerificationTTL > 0 {
		verCfg = append(verCfg, VerificationConfig{TokenExpiry: cfg.VerificationTTL})
	}
	vs := NewVerificationService(userStorage, cfg.EmailService, cfg.AppBaseURL, verCfg...)

	log.Printf("🧩 Service.New: accessTTL=%s refreshTTL=%s verifyTTL=%s",
		access, refresh, cfg.VerificationTTL)

	return &service{
		storage:            userStorage,
		refreshStorage:     userStorage,
		emailService:       cfg.EmailService,
		verificationSvc:    vs,
		jwt:                jwtSvc,
		s3Storage:          s3Storage,
		maxRotationPerHour: 10,
	}
}

// ---------------------- AUTH ----------------------

func (s *service) RegisterUser(ctx context.Context, req models.RegisterRequest) (*models.AuthResponse, error) {
	log.Printf("➡️ Регистрация пользователя: email=%s, role_id=%d, role=%s", req.Email, req.RoleID, req.RoleName)

	// Проверка на существование пользователя с таким же email
	exists, err := s.storage.UserExists(ctx, req.Email)
	if err != nil {
		log.Printf("❌ UserExists error: %v", err)
		return nil, fmt.Errorf("проверьте существование пользователя: %w", err)
	}
	if exists {
		log.Printf("⚠️ Данный email уже зарегистрирован в системе: %s", req.Email)
		return nil, ErrUserAlreadyExists
	}

	// Проверка наличия роли
	roleID := req.RoleID
	if roleID == 0 {
		if req.RoleName == "" {
			log.Printf("❌ Роль не указана")
			return nil, fmt.Errorf("требуется role_id или role")
		}
		rid, err := s.storage.GetRoleIDByName(ctx, req.RoleName)
		if err != nil {
			log.Printf("❌ GetRoleIDByName(%s) error: %v", req.RoleName, err)
			return nil, fmt.Errorf("определить роль '%s' не удалось: %w", req.RoleName, err)
		}
		roleID = rid
	}

	user := &models.User{
		Email:      req.Email,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		RoleID:     roleID,
		RoleName:   req.RoleName,
		IsVerified: false,
		CreatedAt:  time.Now(),
		ChangedAt:  time.Now(),
	}

	// Создание пользователя
	if err := s.storage.CreateUser(ctx, user); err != nil {
		log.Printf("❌ CreateUser error: %v", err)
		return nil, fmt.Errorf("создание пользователя: %w", err)
	}
	log.Printf("✅ Пользователь создан успешно: id=%d email=%s", user.ID, user.Email)

	// АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ АВАТАРА ПОСЛЕ РЕГИСТРАЦИИ
	if s.s3Storage != nil && user.FirstName != "" && user.LastName != "" {
		go func(userID int) {
			ctx := context.Background()
			if _, err := s.GenerateDefaultAvatar(ctx, userID); err != nil {
				log.Printf("⚠️ Не удалось сгенерировать аватар для user %d: %v", userID, err)
			}
		}(user.ID)
	}

	if s.emailService != nil {
		log.Printf("CreateVerification и отправка email по адресу %s", user.Email)
		if err := s.verificationSvc.CreateVerification(ctx, user.ID, user.Email); err != nil {
			log.Printf("⚠️ Ошибка создания верификации: %v", err)
		}
	}

	return &models.AuthResponse{
		User:     user,
		Verified: user.IsVerified,
		Message:  "Регистрация успешна. Проверьте email для подтверждения и установки пароля.",
	}, nil
}

// UploadUserPhoto загружает фото пользователя в S3
func (s *service) UploadUserPhoto(ctx context.Context, userID int, file []byte, filename string) (string, error) {
	log.Printf("UploadUserPhoto: userID=%d, filename=%s", userID, filename)

	if s.s3Storage == nil {
		return "", fmt.Errorf("S3 storage не инициализирован")
	}

	// Проверяем существование пользователя
	_, err := s.storage.GetUserByID(ctx, userID)
	if err != nil {
		return "", fmt.Errorf("пользователь не найден: %w", err)
	}

	// Генерируем уникальный ключ по новому стандарту
	uniqueKey := fmt.Sprintf("photos/user-%d/%d-%s", userID, time.Now().Unix(), filename)
	log.Printf("🔧 Ключ для S3: %s", uniqueKey)

	// Загружаем в S3
	_, err = s.s3Storage.UploadFile(ctx, uniqueKey, file, "image/jpeg")
	if err != nil {
		return "", fmt.Errorf("ошибка загрузки в S3: %w", err)
	}

	// Сохраняем в БД КЛЮЧ, а не полный URL
	if err := s.storage.UpdateUserPhoto(ctx, userID, uniqueKey); err != nil {
		_ = s.s3Storage.DeleteFile(ctx, uniqueKey)
		return "", fmt.Errorf("ошибка обновления профиля: %w", err)
	}

	// Возвращаем presigned URL для немедленного использования
	presignedURL, err := s.s3Storage.GenerateDownloadURL(uniqueKey)
	if err != nil {
		return "", fmt.Errorf("ошибка генерации URL: %w", err)
	}

	log.Printf("✅ Фото загружено: userID=%d, key=%s", userID, uniqueKey)
	return presignedURL, nil
}

func (s *service) GenerateDefaultAvatar(ctx context.Context, userID int) (string, error) {
	log.Printf("GenerateDefaultAvatar: userID=%d", userID)

	// Получаем данные пользователя
	user, err := s.storage.GetUserByID(ctx, userID)
	if err != nil {
		return "", fmt.Errorf("пользователь не найден: %w", err)
	}

	// Создаем генератор аватаров
	generator := NewAvatarGenerator(640, 640)

	// Генерируем аватар
	avatarBytes, err := generator.GenerateAvatar(user.FirstName, user.LastName)
	if err != nil {
		return "", fmt.Errorf("ошибка генерации аватара: %w", err)
	}

	// Генерируем имя файла по новому стандарту
	filename := fmt.Sprintf("photos/user-%d/%d-default-avatar.png", userID, time.Now().Unix())

	// Загружаем в S3 (БЕЗ публичного доступа - используем presigned URLs)
	avatarKey, err := s.s3Storage.UploadFile(ctx, filename, avatarBytes, "image/png")
	if err != nil {
		return "", fmt.Errorf("ошибка загрузки в S3: %w", err)
	}

	// Обновляем photo_path в базе (сохраняем КЛЮЧ, а не URL)
	if err := s.storage.UpdateUserPhoto(ctx, userID, avatarKey); err != nil {
		_ = s.s3Storage.DeleteFile(ctx, filename)
		return "", fmt.Errorf("ошибка обновления профиля: %w", err)
	}

	// Генерируем presigned URL для немедленного использования
	presignedURL, err := s.s3Storage.GenerateDownloadURL(avatarKey)
	if err != nil {
		return "", fmt.Errorf("ошибка генерации URL: %w", err)
	}

	log.Printf("✅ Автоаватар создан: userID=%d, key=%s", userID, avatarKey)
	return presignedURL, nil
}

func (s *service) ConfirmRegistration(ctx context.Context, req ConfirmRegistrationRequest) (*models.AuthResponse, error) {
	log.Printf("ConfirmRegistration: user_id=%d", req.UserID)

	// Валидация входных данных
	if req.UserID <= 0 || req.Token == "" {
		return nil, fmt.Errorf("некорректные входные данные")
	}

	valid, err := s.verificationSvc.ValidateVerificationToken(ctx, req.UserID, req.Token)
	if err != nil {
		log.Printf("❌ ValidateVerificationToken error: %v", err)
		return nil, fmt.Errorf("валидация токена: %w", err)
	}
	if !valid {
		log.Printf("⚠️ Токен неправильный или срок его действия истек user=%d", req.UserID)
		return nil, ErrTokenInvalid
	}

	// Получаем пользователя ДЛЯ ПРОВЕРКИ СТАТУСА
	user, err := s.storage.GetUserByID(ctx, req.UserID)
	if err != nil {
		log.Printf("❌ GetUserByID error: %v", err)
		return nil, fmt.Errorf("получение пользователя: %w", err)
	}

	// Проверяем, что пользователь еще не верифицирован
	if user.IsVerified {
		log.Printf("⚠️ Пользователь уже подтверждён: user_id=%d", req.UserID)
		return nil, fmt.Errorf("пользователь уже подтверждён")
	}

	hashed, err := s.hashPassword(req.Password)
	if err != nil {
		log.Printf("❌ hashPassword error: %v", err)
		return nil, fmt.Errorf("хэширование пароля: %w", err)
	}

	if err := s.storage.UpdatePasswordAndVerify(ctx, req.UserID, hashed); err != nil {
		log.Printf("❌ UpdatePasswordAndVerify error: %v", err)
		return nil, fmt.Errorf("обновление пароля и верификация: %w", err)
	}

	// Удаляем verification token (с обработкой ошибки)
	if err := s.storage.DeleteVerificationToken(ctx, req.UserID); err != nil {
		log.Printf("⚠️ Не удалось удалить verification token: %v", err)
	}

	// Обновляем данные пользователя после изменений
	user, err = s.storage.GetUserByID(ctx, req.UserID)
	if err != nil {
		log.Printf("❌ GetUserByID error: %v", err)
		return nil, fmt.Errorf("получение пользователя: %w", err)
	}

	// Генерация токенов
	access, err := s.jwt.GenerateJWTToken(user.ID, user.Email, user.RoleID)
	if err != nil {
		log.Printf("❌ GenerateJWTToken error: %v", err)
		return nil, fmt.Errorf("генерация access token: %w", err)
	}

	refresh, err := s.jwt.GenerateRefreshToken(user.ID, user.Email, user.RoleID)
	if err != nil {
		log.Printf("❌ GenerateRefreshToken error: %v", err)
		return nil, fmt.Errorf("генерация refresh token: %w", err)
	}

	if s.refreshStorage == nil {
		log.Printf("❌ refreshStorage is NIL")
		return nil, fmt.Errorf("внутренняя ошибка: хранилище токенов не настроено")
	}

	expires := time.Now().Add(s.jwt.refreshExpiry)
	log.Printf("SaveRefreshToken(confirm): user_id=%d expires=%s", user.ID, expires.Format(time.RFC3339))

	if _, err := s.refreshStorage.SaveRefreshToken(ctx, repoUser.RefreshToken{
		UserID:    user.ID,
		Token:     refresh,
		ExpiresAt: expires,
		CreatedAt: time.Now(),
	}); err != nil {
		log.Printf("❌ SaveRefreshToken error: %v", err)
		return nil, fmt.Errorf("сохранение refresh token: %w", err)
	}

	log.Printf("✅ Регистрация успешно подтверждена: user_id=%d", user.ID)

	return &models.AuthResponse{
		User:         user,
		AccessToken:  access,
		RefreshToken: refresh,
		Verified:     true,
		Message:      "Регистрация завершена. Аккаунт подтверждён.",
	}, nil
}

// LoginUser реализует авторизацию пользователя
func (s *service) LoginUser(ctx context.Context, req models.LoginRequest) (*models.AuthResponse, error) {
	log.Printf("Попытка входа: email=%s", req.Email)

	user, err := s.storage.GetUserByEmail(ctx, req.Email)
	if err != nil {
		log.Printf("❌ GetUserByEmail error: %v", err)
		return nil, ErrUserNotFound
	}
	if user.PasswordHash == "" || !s.checkPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("⚠️ Неправильный пароль для email=%s", req.Email)
		return nil, ErrInvalidCredentials
	}
	if !user.IsVerified {
		log.Printf("⚠️ Пользователь не верифицирован: %s", req.Email)
		return nil, errors.New("пользователь не верифицирован")
	}

	access, err := s.jwt.GenerateJWTToken(user.ID, user.Email, user.RoleID)
	if err != nil {
		log.Printf("❌ GenerateJWTToken error: %v", err)
		return nil, fmt.Errorf("генерация access token: %w", err)
	}
	refresh, err := s.jwt.GenerateRefreshToken(user.ID, user.Email, user.RoleID)
	if err != nil {
		log.Printf("❌ GenerateRefreshToken error: %v", err)
		return nil, fmt.Errorf("генерация refresh token: %w", err)
	}

	if s.refreshStorage == nil {
		log.Printf("❌ refreshStorage is NIL")
		return nil, fmt.Errorf("внутренняя ошибка: хранилище refresh токенов не настроено")
	}
	expires := time.Now().Add(s.jwt.refreshExpiry)
	log.Printf("SaveRefreshToken(login): user_id=%d expires=%s", user.ID, expires.Format(time.RFC3339))
	if _, err := s.refreshStorage.SaveRefreshToken(ctx, repoUser.RefreshToken{
		UserID:    user.ID,
		Token:     refresh,
		ExpiresAt: expires,
	}); err != nil {
		log.Printf("❌ SaveRefreshToken error: %v", err)
		return nil, fmt.Errorf("сохранение refresh token: %w", err)
	}

	if user.PhotoPath != "" {
		key := s.extractS3Key(user.PhotoPath)
		if key != "" {
			presignedURL, err := s.s3Storage.GenerateDownloadURL(key)
			if err != nil {
				log.Printf("⚠️ Ошибка генерации presigned URL при входе: %v", err)
				// Не прерываем вход, оставляем старый photoPath
			} else {
				user.PhotoPath = presignedURL
				log.Printf("✅ Presigned URL сгенерирован при входе")
			}
		}
	}

	return &models.AuthResponse{
		User:         user,
		AccessToken:  access,
		RefreshToken: refresh,
		Verified:     true,
		Message:      "Успешный вход.",
	}, nil
}

// UpdateUserProfile обновляет профиль пользователя
func (s *service) UpdateUserProfile(ctx context.Context, userID int, updateReq UpdateProfileRequest) error {
	log.Printf("UpdateUserProfile: userID=%d", userID)

	// Проверяем существование пользователя
	user, err := s.storage.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("пользователь не найден: %w", err)
	}

	// Убираем предупреждение "declared and not used"
	log.Printf("Обновление профиля для пользователя: %s %s", user.FirstName, user.LastName)

	if err := s.storage.UpdateUserProfile(ctx, userID, updateReq); err != nil {
		return fmt.Errorf("ошибка обновления профиля: %w", err)
	}

	log.Printf("✅ Профиль обновлен: userID=%d", userID)
	return nil
}

// DeleteUser реализует удаление пользователя
func (s *service) DeleteUser(ctx context.Context, userID int) error {
	log.Printf("DeleteUser начат: userID=%d", userID)

	// Проверяем существование пользователя
	user, err := s.storage.GetUserByID(ctx, userID)
	if err != nil {
		log.Printf("❌ GetUserByID error: %v", err)
		return fmt.Errorf("пользователь не найден: %w", err)
	}

	// Дополнительные проверки (опционально)
	if user.IsVerified {
		log.Printf("⚠️ Попытка удаления верифицированного пользователя: userID=%d", userID)
		// Можно добавить дополнительную логику или запретить удаление
	}

	// Удаляем пользователя
	if err := s.storage.DeleteUser(ctx, userID); err != nil {
		log.Printf("❌ DeleteUser storage error: %v", err)
		return fmt.Errorf("ошибка удаления пользователя: %w", err)
	}

	// Удаляем все refresh tokens пользователя
	if err := s.refreshStorage.DeleteAllUserRefreshTokens(ctx, userID); err != nil {
		log.Printf("⚠️ Ошибка удаления refresh tokens: %v", err)
		// Не прерываем выполнение, если не удалось удалить токены
	}

	log.Printf("✅ Пользователь удален: userID=%d, email=%s", userID, user.Email)
	return nil
}

// ---------------------- JWT / SESSIONS ----------------------

func (s *service) ValidateAccessToken(tokenString string) (int, string, error) {
	log.Println("ValidateAccessToken вызвана")
	claims, err := s.jwt.ValidateToken(tokenString)
	if err != nil {
		log.Printf("❌ Ошибка токена валидации: %v", err)
		return 0, "", err
	}
	if len(claims.Subject) >= 8 && claims.Subject[:8] == "refresh_" {
		log.Printf("⚠️ Неправильный тип токена: refresh вместо access")
		return 0, "", errors.New("invalid token type")
	}
	return claims.UserID, claims.Email, nil
}

func (s *service) Logout(ctx context.Context, refreshToken string) error {
	log.Printf("Выход (текущая сессия)")
	return s.refreshStorage.DeleteRefreshToken(ctx, refreshToken)
}

func (s *service) LogoutAll(ctx context.Context, userID int) error {
	log.Printf("Выход всех пользователей user_id=%d", userID)
	return s.refreshStorage.DeleteAllUserRefreshTokens(ctx, userID)
}

// ---------------------- LEGACY VERIFY ----------------------

func (s *service) VerifyEmail(ctx context.Context, userID int, token string) error {
	log.Printf("VerifyEmail: user=%d", userID)
	valid, err := s.verificationSvc.ValidateVerificationToken(ctx, userID, token)
	if err != nil {
		log.Printf("❌ VerifyEmail ошибка валидации: %v", err)
		return fmt.Errorf("валидация токена: %w", err)
	}
	if !valid {
		log.Printf("⚠️ Токен невалиден или срок его действия истек для пользователя %d", userID)
		return ErrTokenInvalid
	}
	if err := s.storage.MarkUserAsVerified(ctx, userID); err != nil {
		log.Printf("❌ Отметка верификации error: %v", err)
		return fmt.Errorf("отметка верификации: %w", err)
	}
	_ = s.storage.DeleteVerificationToken(ctx, userID)
	log.Printf("✅ Email верифицирован для пользователя %d", userID)
	return nil
}

// ---------------------- HELPERS ----------------------

func (s *service) hashPassword(password string) (string, error) {
	log.Println("Хэширование пароля")
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("❌ Ошибка хэширования: %v", err)
		return "", err
	}
	return string(bytes), nil
}
func (s *service) checkPasswordHash(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func (s *service) GetAllUsers(ctx context.Context) ([]*models.User, error) {
	log.Println("Вызов всех пользователей")
	users, err := s.storage.GetAllUsers(ctx)
	if err != nil {
		log.Printf("❌ GetAllUsers storage error: %v", err)
		return nil, fmt.Errorf("вызов всех пользователей: %w", err)
	}

	// Генерируем presigned URLs для фото всех пользователей
	for _, user := range users {
		if user.PhotoPath != "" {
			// Извлекаем ключ S3 из photoPath
			key := s.extractS3Key(user.PhotoPath)
			if key == "" {
				log.Printf("⚠️ Не удалось извлечь ключ из: %s", user.PhotoPath)
			} else {
				// Генерируем временный URL
				presignedURL, err := s.s3Storage.GenerateDownloadURL(key)
				if err != nil {
					log.Printf("⚠️ Ошибка генерации presigned URL для пользователя %d: %v", user.ID, err)
				} else {
					user.PhotoPath = presignedURL
				}
			}
		}
	}

	log.Printf("✅ GetAllUsers: count=%d", len(users))
	return users, nil
}

func (s *service) GetUserByID(ctx context.Context, userID int) (*models.User, error) {
	log.Printf("🔍 GetUserByID начат: id=%d", userID)

	user, err := s.storage.GetUserByID(ctx, userID)
	if err != nil {
		log.Printf("❌ GetUserByID storage error: %v", err)
		return nil, fmt.Errorf("вызов пользователя по id: %w", err)
	}

	// Если у пользователя есть аватар, генерируем presigned URL
	if user.PhotoPath != "" {
		log.Printf("🔧 Генерируем presigned URL для: %s", user.PhotoPath)

		// Извлекаем ключ S3 из photoPath
		key := s.extractS3Key(user.PhotoPath)
		if key == "" {
			log.Printf("⚠️ Не удалось извлечь ключ из: %s", user.PhotoPath)
		} else {
			// Генерируем временный URL
			presignedURL, err := s.s3Storage.GenerateDownloadURL(key)
			if err != nil {
				log.Printf("⚠️ Ошибка генерации presigned URL: %v", err)
			} else {
				user.PhotoPath = presignedURL
				log.Printf("✅ Presigned URL сгенерирован")
			}
		}
	}

	log.Printf("✅ GetUserByID успешно: id=%d, email=%s, role_id=%d, photoPath=%s", user.ID, user.Email, user.RoleID, user.PhotoPath)
	return user, nil
}

func (s *service) GetUserProfile(ctx context.Context, userID int) (*models.User, error) {
	log.Printf("👤 GetUserProfile start: id=%d", userID)
	u, err := s.GetUserByID(ctx, userID)
	if err != nil {
		log.Printf("❌ GetUserProfile error: %v", err)
		return nil, err
	}
	log.Printf("✅ GetUserProfile успешно: id=%d", u.ID)
	return u, nil
}

// ResendVerificationEmail — повторно отправить письмо с подтверждением email.
func (s *service) ResendVerificationEmail(ctx context.Context, userID int, email string) error {
	log.Printf("ResendVerificationEmail: user_id=%d, emailArg=%q", userID, email)

	// 0) проверим, что email-сервис сконфигурирован
	if s.emailService == nil {
		log.Println("❌ ResendVerificationEmail: email service не сконфигурирован")
		return errors.New("email service not configured")
	}

	// 1) найдём пользователя
	user, err := s.storage.GetUserByID(ctx, userID)
	if err != nil {
		log.Printf("❌ ResendVerificationEmail: ошибка вызова пользователя: %v", err)
		return fmt.Errorf("вызов пользователя: %w", err)
	}

	// 2) если уже подтверждён — не шлём
	if user.IsVerified {
		log.Printf("⚠️ ResendVerificationEmail: user уже верифицирован (id=%d, email=%s)", user.ID, user.Email)
		return errors.New("пользователь уже верифицирован")
	}

	// 3) если email не передали — используем email из профиля
	targetEmail := email
	if targetEmail == "" {
		targetEmail = user.Email
	}
	log.Printf("ResendVerificationEmail: targetEmail=%s", targetEmail)

	// 4) создаём новый верификационный токен и отправляем письмо
	if err := s.verificationSvc.CreateVerification(ctx, user.ID, targetEmail); err != nil {
		log.Printf("❌ ResendVerificationEmail: создание токена верификации error: %v", err)
		return fmt.Errorf("создание токена верификации: %w", err)
	}

	log.Printf("✅ ResendVerificationEmail: email queued (user_id=%d, email=%s)", user.ID, targetEmail)
	return nil
}
func (s *service) SetPassword(ctx context.Context, req SetPasswordRequest) error {
	log.Printf("SetPassword for user_id=%d", req.UserID)

	hashed, err := s.hashPassword(req.Password)
	if err != nil {
		log.Printf("❌ Ошибка хэширования: %v", err)
		return fmt.Errorf("хэширование пароля: %w", err)
	}

	if err := s.storage.UpdatePassword(ctx, req.UserID, hashed); err != nil {
		log.Printf("❌ UpdatePassword error: %v", err)
		return fmt.Errorf("обновление пароля: %w", err)
	}

	log.Printf("✅ Пароль обновлен для user_id=%d", req.UserID)
	return nil
}

// extractS3Key извлекает ключ из полного URL
func (s *service) extractS3Key(photoPath string) string {
	log.Printf("🔧 Извлекаем ключ из: %s", photoPath)

	// Если photoPath уже ключ (например: "photos/user-13/...")
	if !strings.Contains(photoPath, "://") {
		return photoPath
	}

	// Если это полный URL AWS S3
	if strings.Contains(photoPath, "amazonaws.com/") {
		parts := strings.SplitN(photoPath, "amazonaws.com/", 2)
		if len(parts) == 2 {
			return parts[1]
		}
	}

	// Если это кастомный endpoint
	if strings.Contains(photoPath, s.s3Storage.Endpoint) {
		parts := strings.SplitN(photoPath, s.s3Storage.Endpoint+"/", 2)
		if len(parts) == 2 {
			return parts[1]
		}
	}

	log.Printf("⚠️ Не удалось извлечь ключ из URL: %s", photoPath)
	return ""
}

func (s *service) RefreshToken(ctx context.Context, refreshToken string) (*models.AuthResponse, error) {
	log.Printf("RefreshToken вызван")

	claims, err := s.jwt.ValidateToken(refreshToken)
	if err != nil {
		log.Printf("ValidateToken error: %v", err)
		return nil, fmt.Errorf("неверный refresh token: %w", err)
	}

	if len(claims.Subject) < 8 || claims.Subject[:8] != "refresh_" {
		return nil, errors.New("неверный тип токена")
	}

	rt, err := s.refreshStorage.GetRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, fmt.Errorf("refresh token не найден: %w", err)
	}

	if time.Now().After(rt.ExpiresAt) {
		_ = s.refreshStorage.DeleteRefreshToken(ctx, refreshToken)
		return nil, errors.New("срок действия refresh token истек")
	}

	user, err := s.storage.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("пользователь не найден: %w", err)
	}

	access, err := s.jwt.GenerateJWTToken(user.ID, user.Email, user.RoleID)
	if err != nil {
		return nil, fmt.Errorf("генерация access token: %w", err)
	}

	newRefresh, err := s.jwt.GenerateRefreshToken(user.ID, user.Email, user.RoleID)
	if err != nil {
		return nil, fmt.Errorf("генерация refresh token: %w", err)
	}

	// Ротация токенов
	if err := s.refreshStorage.DeleteRefreshToken(ctx, refreshToken); err != nil {
		log.Printf("Ошибка удаления старого токена: %v", err)
	}

	expires := time.Now().Add(s.jwt.refreshExpiry)
	if _, err := s.refreshStorage.SaveRefreshToken(ctx, repoUser.RefreshToken{
		UserID:    user.ID,
		Token:     newRefresh,
		ExpiresAt: expires,
		CreatedAt: time.Now(),
	}); err != nil {
		return nil, fmt.Errorf("save refresh token: %w", err)
	}

	return &models.AuthResponse{
		User:         user,
		AccessToken:  access,
		RefreshToken: newRefresh,
		Verified:     user.IsVerified,
		Message:      "Tokens refreshed",
	}, nil
}
