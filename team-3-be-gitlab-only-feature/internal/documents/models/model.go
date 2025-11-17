package models

import "time"

type Document struct {
	ID        int        `json:"id"`
	Title     string     `json:"title"`
	PDFPath   string     `json:"pdf_path"`
	UserID    *int       `json:"user_id,omitempty"`
	RoleID    int        `json:"role_id"`
	CreatedAt time.Time  `json:"created_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
	FirstName string     `json:"first_name"`
	LastName  string     `json:"last_name"`
	PhotoPath string     `json:"photo_path"`
	Category  struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"category"`

	AccessibleRole struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"accessible_role"`
	AccessibleRoles []int `json:"accessible_roles,omitempty"`
	LikesCount      int   `json:"likes_count"`
	CommentsCount   int   `json:"comments_count"`
	IsViewed        bool  `json:"is_viewed"`
	IsLiked         bool  `json:"is_liked"`
}
