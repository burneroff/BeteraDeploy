package service

import (
	"cmd/internal/user/models"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// ОДНО ЕДИНСТВЕННОЕ ОПРЕДЕЛЕНИЕ JWTService
type JWTService struct {
	secretKey     string
	tokenExpiry   time.Duration
	refreshExpiry time.Duration
}

// ОДНО ЕДИНСТВЕННОЕ ОПРЕДЕЛЕНИЕ Claims
type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	RoleID int    `json:"role_id"`
	jwt.RegisteredClaims
}

// NewJWTService — создаёт сервис
func NewJWTService(secretKey string, accessTTL, refreshTTL time.Duration) *JWTService {
	return &JWTService{
		secretKey:     secretKey,
		tokenExpiry:   accessTTL,
		refreshExpiry: refreshTTL,
	}
}

// GenerateJWTToken — access token
func (j *JWTService) GenerateJWTToken(userID int, email string, roleID int) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RoleID: roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.tokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   email,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secretKey))
}

// GenerateRefreshToken — refresh token
func (j *JWTService) GenerateRefreshToken(userID int, email string, roleID int) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RoleID: roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.refreshExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("refresh_%s", email),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secretKey))
}

// ValidateToken — ВАЖНО! ЭТОТ МЕТОД ДОЛЖЕН БЫТЬ ЗДЕСЬ!
func (j *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	if err != nil {
		return nil, fmt.Errorf("parse token: %w", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid or expired token")
	}
	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, fmt.Errorf("invalid claims format")
	}
	return claims, nil
}

// GetUserFromToken — возвращает пользователя из токена
func (j *JWTService) GetUserFromToken(tokenString string) (*models.User, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}
	return &models.User{
		ID:       claims.UserID,
		Email:    claims.Email,
		RoleID:   claims.RoleID,
		RoleName: "",
	}, nil
}
