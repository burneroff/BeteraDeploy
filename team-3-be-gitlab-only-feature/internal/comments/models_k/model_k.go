package models_k

import "time"

type Comment struct {
	ID         int        `json:"id"`
	DocumentID int        `json:"document_id"`
	UserID     int        `json:"user_id"`
	Text       string     `json:"text"`
	CreatedAt  time.Time  `json:"created_at"`
	IsDeleted  bool       `json:"is_deleted"`
	DeletedAt  *time.Time `json:"deleted_at,omitempty"`
	FirstName  string     `json:"first_name,omitempty"`
	LastName   string     `json:"last_name,omitempty"`
	PhotoPath  *string    `json:"photo_path,omitempty"`
}
