package storage

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3Storage struct {
	Client     *s3.Client
	BucketName string
	Region     string
	Endpoint   string
}

type S3Config struct {
	Bucket          string
	Region          string
	AccessKey       string
	SecretAccessKey string
	Endpoint        string
	UseSSL          bool
}

func NewS3Storage(cfg S3Config) (*S3Storage, error) {
	log.Printf("🔧 Инициализация S3: bucket=%s, region=%s", cfg.Bucket, cfg.Region)

	creds := credentials.NewStaticCredentialsProvider(
		cfg.AccessKey,
		cfg.SecretAccessKey,
		"",
	)

	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(creds),
		config.WithRegion(cfg.Region),
	)
	if err != nil {
		return nil, fmt.Errorf("ошибка загрузки AWS config: %w", err)
	}

	var client *s3.Client
	if cfg.Endpoint != "" {
		client = s3.NewFromConfig(awsCfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
		})
	} else {
		client = s3.NewFromConfig(awsCfg)
	}

	return &S3Storage{
		Client:     client,
		BucketName: cfg.Bucket,
		Region:     cfg.Region,
		Endpoint:   cfg.Endpoint,
	}, nil
}

// GenerateUploadURL генерирует presigned URL для загрузки файла
func (s *S3Storage) GenerateUploadURL(filename string) (string, error) {
	key := fmt.Sprintf("documents/%d-%s", time.Now().Unix(), filename)
	presignClient := s3.NewPresignClient(s.Client)

	input := &s3.PutObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
	}

	req, err := presignClient.PresignPutObject(context.TODO(), input, func(opts *s3.PresignOptions) {
		opts.Expires = 15 * time.Minute
	})
	if err != nil {
		return "", fmt.Errorf("ошибка генерации URL: %w", err)
	}

	return req.URL, nil
}

func (s *S3Storage) GenerateDownloadURL(key string) (string, error) {
	presignClient := s3.NewPresignClient(s.Client)

	input := &s3.GetObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
	}

	req, err := presignClient.PresignGetObject(context.TODO(), input, func(opts *s3.PresignOptions) {
		opts.Expires = 24 * time.Hour
	})
	if err != nil {
		return "", fmt.Errorf("failed to presign download URL: %w", err)
	}

	return req.URL, nil
}

// UploadFile загружает файл в S3
func (s *S3Storage) UploadFile(ctx context.Context, key string, file []byte, contentType string) (string, error) {
	input := &s3.PutObjectInput{
		Bucket:      aws.String(s.BucketName),
		Key:         aws.String(key),
		Body:        bytes.NewReader(file),
		ContentType: aws.String(contentType),
	}

	_, err := s.Client.PutObject(ctx, input)
	if err != nil {
		return "", fmt.Errorf("failed to upload file to S3: %w", err)
	}

	return key, nil
}

// DeleteFile удаляет файл из S3
func (s *S3Storage) DeleteFile(ctx context.Context, key string) error {
	input := &s3.DeleteObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
	}

	_, err := s.Client.DeleteObject(ctx, input)
	if err != nil {
		return fmt.Errorf("ошибка удаления файла из S3: %w", err)
	}

	return nil
}

// UploadPublicFile загружает файл в S3 с публичным доступом для чтения
func (s *S3Storage) UploadPublicFile(ctx context.Context, key string, file []byte, contentType string) (string, error) {
	input := &s3.PutObjectInput{
		Bucket:      aws.String(s.BucketName),
		Key:         aws.String(key),
		Body:        bytes.NewReader(file),
		ContentType: aws.String(contentType),
	}

	_, err := s.Client.PutObject(ctx, input)
	if err != nil {
		return "", fmt.Errorf("failed to upload file to S3: %w", err)
	}

	fileURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.BucketName, s.Region, key)
	return fileURL, nil
}

func (s *S3Storage) CheckFileExists(ctx context.Context, key string) (bool, error) {
	cleanKey := s.extractKeyFromPath(key)

	_, err := s.Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(cleanKey),
	})

	if err != nil {
		var awsErr *types.NotFound
		if errors.As(err, &awsErr) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (s *S3Storage) extractKeyFromPath(path string) string {
	// Если это уже чистый ключ
	if strings.HasPrefix(path, "documents/") || strings.HasPrefix(path, "avatars/") {
		return path
	}

	// Если это presigned upload URL
	if strings.Contains(path, "x-id=PutObject") {
		if idx := strings.Index(path, "?"); idx != -1 {
			path = path[:idx]
		}
		if strings.Contains(path, "amazonaws.com/") {
			parts := strings.Split(path, "amazonaws.com/")
			if len(parts) > 1 {
				return parts[1]
			}
		}
	}

	// Если это обычный S3 URL
	if strings.Contains(path, "amazonaws.com/") {
		parts := strings.Split(path, "amazonaws.com/")
		if len(parts) > 1 {
			return parts[1]
		}
	}

	return path
}
