package service

import (
	repoUserInterface "cmd/internal/user/repo"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

// VerificationService сервис для верификации email
type VerificationService struct {
	storage      repoUserInterface.Storage // Используем Storage интерфейс, а не RefreshStorage
	emailService EmailService
	appBaseURL   string
	tokenExpiry  time.Duration
}

// VerificationConfig конфигурация для VerificationService
type VerificationConfig struct {
	TokenExpiry time.Duration
}

// NewVerificationService создает новый сервис верификации
func NewVerificationService(storage repoUserInterface.Storage, emailService EmailService, appBaseURL string, config ...VerificationConfig) *VerificationService {
	tokenExpiry := 1 * time.Hour

	if len(config) > 0 {
		tokenExpiry = config[0].TokenExpiry
	}

	return &VerificationService{
		storage:      storage, // Просто присваиваем переданный storage
		emailService: emailService,
		appBaseURL:   appBaseURL,
		tokenExpiry:  tokenExpiry,
	}
}

// GenerateVerificationToken генерирует случайный токен верификации
func (vs *VerificationService) GenerateVerificationToken() (string, error) {
	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		return "", fmt.Errorf("ошибка генерации токена: %w", err)
	}
	return hex.EncodeToString(token), nil
}

// GetBaseURL подготавливает ссылку для подтверждения email
func (vs *VerificationService) GetBaseURL() string {
	baseURL := vs.appBaseURL
	if !strings.HasPrefix(baseURL, "http://") && !strings.HasPrefix(baseURL, "https://") {
		baseURL = "http://" + baseURL
	}
	return baseURL
}

// SendVerificationEmail отправляет email с ссылкой для подтверждения
func (vs *VerificationService) SendVerificationEmail(userID int, email, token string) error {
	// baseURL := vs.GetBaseURL()
	verificationURL := fmt.Sprintf("http://45.130.9.212:5173/confirm-password?user_id=%d&token=%s", userID, token)

	return vs.emailService.SendVerificationEmail(email, verificationURL)
}

// CreateVerification создает и сохраняет токен верификации
func (vs *VerificationService) CreateVerification(ctx context.Context, userID int, email string) error {
	fmt.Printf("🔧 DEBUG: CreateVerification начат для userID: %d, email: %s\n", userID, email)

	// Генерируем токен
	token, err := vs.GenerateVerificationToken()
	if err != nil {
		fmt.Printf("❌ Ошибка генерации токена: %v\n", err)
		return fmt.Errorf("ошибка генерации токена верификации: %w", err)
	}
	fmt.Printf("🔧 DEBUG: Токен сгенерирован: %s\n", token)

	// Сохраняем токен в БД с временем expiration
	expiresAt := time.Now().Add(vs.tokenExpiry)
	err = vs.storage.SaveVerificationToken(ctx, userID, token, expiresAt)
	if err != nil {
		fmt.Printf("❌ Ошибка сохранения токена: %v\n", err)
		return fmt.Errorf("failed to save verification token: %w", err)
	}
	fmt.Printf("🔧 DEBUG: Токен сохранен в БД\n")

	// Отправляем email
	fmt.Printf("🔧 DEBUG: Вызов SendVerificationEmail...\n")
	err = vs.SendVerificationEmail(userID, email, token)
	if err != nil {
		fmt.Printf("❌ Ошибка отправки email: %v\n", err)
		return fmt.Errorf("failed to send verification email: %w", err)
	}

	fmt.Printf("✅ CreateVerification завершен успешно!\n")
	return nil
}

// ValidateVerificationToken проверяет токен верификации
func (vs *VerificationService) ValidateVerificationToken(ctx context.Context, userID int, token string) (bool, error) {
	// Проверяем токен в БД
	valid, err := vs.storage.ValidateVerificationToken(ctx, userID, token)
	if err != nil {
		return false, fmt.Errorf("ошибка валидации токена: %w", err)
	}

	return valid, nil
}

// CleanupExpiredTokens удаляет просроченные токены верификации
func (vs *VerificationService) CleanupExpiredTokens(ctx context.Context) error {
	return vs.storage.DeleteExpiredVerificationTokens(ctx)
}
