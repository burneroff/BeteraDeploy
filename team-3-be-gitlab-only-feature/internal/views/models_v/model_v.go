package models_v

import "time"

type DocumentView struct {
	UserID     int       `json:"user_id"`
	DocumentID int       `json:"document_id"`
	ViewedAt   time.Time `json:"viewed_at"`
}

type Viewer struct {
	ID        int     `json:"id"`
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	PhotoPath *string `json:"photo_path,omitempty"`
}
