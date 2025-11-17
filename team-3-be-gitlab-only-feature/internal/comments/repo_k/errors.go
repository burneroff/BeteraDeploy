package repo_k

import "errors"

var (
	ErrDBFailure = errors.New("database error")
	ErrNotFound  = errors.New("comment not found")
	ErrForbidden = errors.New("forbidden")
	ErrBadData   = errors.New("invalid comment data")
	ErrInvalidID = errors.New("invalid id")
)
