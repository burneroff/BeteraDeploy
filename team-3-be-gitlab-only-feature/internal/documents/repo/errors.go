package repo

import "errors"

var (
	ErrNotFound  = errors.New("record not found")
	ErrInvalidID = errors.New("invalid id")
	ErrBadData   = errors.New("invalid input data")
	ErrDBFailure = errors.New("database error")
	ErrForbidden = errors.New("forbidden")
)
