package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/heetch/confita"
	"github.com/heetch/confita/backend/env"
	"github.com/heetch/confita/backend/file"
	"github.com/heetch/confita/backend/flags"
)

type Config struct {
	Env    string `config:"env" yaml:"env"`
	Server struct {
		Address     string        `config:"address" yaml:"address"`
		Port        int           `config:"server_port" yaml:"server_port"`
		Timeout     time.Duration `config:"timeout" yaml:"timeout"`
		IdleTimeout time.Duration `config:"idle_timeout" yaml:"idle_timeout"`
	} `config:"http_server" yaml:"http_server"`
	Data struct {
		PostgreSQl struct {
			Host     string `yaml:"host" env:"PG_HOST"`
			Port     string `yaml:"port" env:"PG_PORT"`
			UserName string `yaml:"user" env:"PG_USERNAME"`
			Password string `yaml:"password" env:"PG_PASSWORD"`
			Database string `yaml:"database" env:"PG_DATABASE"`
			SSLMode  string `yaml:"ssl_mode" env:"PG_SSL_MODE"`
		} `config:"postgresql" yaml:"postgresql"`
	} `config:"database" yaml:"database"`
	Auth struct {
		JWTSecret string `yaml:"jwt_secret" env:"JWT_SECRET"`
	}
	Email struct {
		SMTPHost     string `config:"smtp_host" yaml:"smtp_host"`
		SMTPPort     int    `config:"smtp_port" yaml:"smtp_port"`
		SMTPUsername string `config:"smtp_username" yaml:"smtp_username"`
		SMTPPassword string `config:"smtp_password" yaml:"smtp_password"`
		FromEmail    string `config:"from_email" yaml:"from_email"`
		FromName     string `config:"from_name" yaml:"from_name"`
	} `config:"email" yaml:"email"`
	S3 struct {
		Bucket          string `config:"bucket" yaml:"bucket"`
		Region          string `config:"region" yaml:"region"`
		Endpoint        string `config:"endpoint" yaml:"endpoint"`
		AccessKey       string `config:"access_key" yaml:"access_key"`
		SecretAccessKey string `config:"secret_key" yaml:"secret_key"`
		UseSSL          bool   `config:"use_ssl" yaml:"use_ssl"`
	} `config:"S3" yaml:"S3"`
}

// Mustload( ) загружает конфигурацию сервиса из конфигурационного файла.
// Возвращает указатель на Config и ошибку.
// Конфигурация имеет следующий порядок приоритета:
//  1. Флаги командной строки
//  2. Переменные окружения
//  3. Конфигурационный файл
func MustLoad() (*Config, error) {
	const op = "config.Mustload"

	configPath := "cmd/config/local.yaml"
	// Проверяем существование файла, если нет - пробуем альтернативные пути
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// Пробуем абсолютный путь в контейнере
		configPath = "/app/config/local.yaml"
		if _, err := os.Stat(configPath); os.IsNotExist(err) {
			// Пробуем относительный путь
			configPath = "../cmd/config/local.yaml"
			if _, err := os.Stat(configPath); os.IsNotExist(err) {
				return nil, fmt.Errorf("%s: config file not found, tried: ../cmd/config/local.yaml, /app/config/local.yaml, config/local.yaml", op)
			}
		}
	}

	fmt.Printf("Loading config from: %s\n", configPath)

	loader := confita.NewLoader(
		flags.NewBackend(),
		env.NewBackend(),
		file.NewBackend(configPath),
		// TODO: добавить путь для конфига прода
	)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cfg := &Config{}
	if err := loader.Load(ctx, cfg); err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	fmt.Printf("Config after load: %+v\n", cfg)
	return cfg, nil
}
