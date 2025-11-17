package models

import "time"

type User struct {
	ID           int       `json:"id" db:"id"`
	FirstName    string    `json:"first_name" db:"first_name"`
	LastName     string    `json:"last_name" db:"last_name"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Email        string    `json:"email" db:"email"`
	PhotoPath    string    `json:"photoPath" db:"photo_path"`
	IsVerified   bool      `json:"isVerified" db:"email_confirmed"`
	DocumentsID  string    `json:"documentsID" db:"documents_id"`
	RoleID       int       `json:"role_id" db:"role_id"`
	RoleName     string    `json:"role" db:"role"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	ChangedAt    time.Time `json:"changed_at" db:"updated_at"`
}

// ✅ принимаем новый формат (role_id), и оставляем старый (role) на время миграции
type RegisterRequest struct {
	Email     string `json:"email"       validate:"required,custom_email"`
	FirstName string `json:"first_name"  validate:"required"`
	LastName  string `json:"last_name"   validate:"required"`
	RoleID    int    `json:"role_id,omitempty"`
	RoleName  string `json:"role,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	User         *User  `json:"user"`
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Verified     bool   `json:"verified"`
	Message      string `json:"message"`
}

type VerifyEmailRequest struct {
	UserID int    `json:"user_id" validate:"required"`
	Token  string `json:"token"    validate:"required"`
}
