package repo_v

import "errors"

var (
	ErrDBFailure     = errors.New("database failure")
	ErrAlreadyViewed = errors.New("document already viewed")
	ErrNotFound      = errors.New("not found")
)
