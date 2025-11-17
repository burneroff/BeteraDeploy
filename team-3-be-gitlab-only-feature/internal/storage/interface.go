package storage

import (
	"context"
)

type Storage interface {
	// Health check
	Ping(ctx context.Context) error
	Close() error
}
