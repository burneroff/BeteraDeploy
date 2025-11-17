package storage

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// PostgresStorage реализация Storage интерфейса для PostgreSQL
type PostgresStorage struct {
	DB *sql.DB
}

// Config конфигурация для PostgreSQL
type Config struct {
	Host     string
	Port     string
	UserName string
	Password string
	DBName   string
	SSLMode  string
}

// New создает новый экземпляр PostgresStorage
func New(config Config) (*PostgresStorage, error) {
	connStr := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		config.UserName, config.Password, config.Host, config.Port, config.DBName, config.SSLMode,
	)

	db, err := sql.Open("pgx", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Проверка соединения
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &PostgresStorage{DB: db}, nil
}

// Ping проверяет соединение с базой данных
func (s *PostgresStorage) Ping(ctx context.Context) error {
	return s.DB.PingContext(ctx)
}

// Close закрывает соединение с базой данных
func (s *PostgresStorage) Close() error {
	return s.DB.Close()
}

// NewWithDB создает хранилище из существующего *sql.DB
func NewWithDB(db *sql.DB) *PostgresStorage {
	return &PostgresStorage{DB: db} // или как у вас называется поле с *sql.DB
}
