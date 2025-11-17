package repo

import (
	"cmd/internal/user/models"
	"context"
	"time"
)

// ---------------------- USERS STORAGE ----------------------
type Storage interface {
	// Технические методы управления соединениями
	Ping(ctx context.Context) error
	Close() error
	// Users
	UserExists(ctx context.Context, email string) (bool, error)
	CreateUser(ctx context.Context, u *models.User) error
	DeleteUser(ctx context.Context, userID int) error
	GetUserByID(ctx context.Context, id int) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetAllUsers(ctx context.Context) ([]*models.User, error)
	UpdatePassword(ctx context.Context, userID int, hashedPassword string) error
	UpdatePasswordAndVerify(ctx context.Context, userID int, hashedPassword string) error
	MarkUserAsVerified(ctx context.Context, userID int) error
	UpdateUserPhoto(ctx context.Context, userID int, photoPath string) error
	UpdateUserProfile(ctx context.Context, userID int, updateReq UpdateProfileRequest) error

	// Roles
	GetRoleIDByName(ctx context.Context, roleName string) (int, error)

	// Verification tokens
	SaveVerificationToken(ctx context.Context, userID int, token string, expiresAt time.Time) error
	ValidateVerificationToken(ctx context.Context, userID int, token string) (bool, error)
	GetVerificationToken(ctx context.Context, userID int) (string, time.Time, error)
	DeleteVerificationToken(ctx context.Context, userID int) error
	DeleteExpiredVerificationTokens(ctx context.Context) error

	// Refresh tokens
	SaveRefreshToken(ctx context.Context, rt RefreshToken) (int64, error)
	GetRefreshToken(ctx context.Context, token string) (RefreshToken, error)
	DeleteRefreshToken(ctx context.Context, token string) error
	DeleteAllUserRefreshTokens(ctx context.Context, userID int) error
}

// ---------------------- REFRESH TOKEN STORAGE ----------------------

type RefreshToken struct {
	ID        int64
	UserID    int
	Token     string
	ExpiresAt time.Time
	CreatedAt time.Time
}

type UpdateProfileRequest struct {
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	PhotoPath *string `json:"photo_path,omitempty"`
}
