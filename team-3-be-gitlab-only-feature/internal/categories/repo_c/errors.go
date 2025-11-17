package repo_c

import "errors"

var (
	ErrBadData          = errors.New("bad data")
	ErrInvalidID        = errors.New("invalid id")
	ErrForbidden        = errors.New("forbidden")
	ErrCategoryExists   = errors.New("category already exists")
	ErrCategoryNotFound = errors.New("category not found")
)
