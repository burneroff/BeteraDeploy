package repo_l

import "errors"

var (
	ErrAlreadyLiked = errors.New("user already liked this document")
	ErrNotFound     = errors.New("like not found")
	ErrForbidden    = errors.New("forbidden")
	ErrDBFailure    = errors.New("database error")
)
