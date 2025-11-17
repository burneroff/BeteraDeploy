package validators

import (
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Создание кастомной валидации для проверки email
func LogginValidator() *validator.Validate {
	validate := validator.New()
	validate.RegisterValidation("custom_email", ValidateCustomEmail)
	return validate
}

func ValidateCustomEmail(fl validator.FieldLevel) bool {
	email := fl.Field().String()
	return IsValidEmail(email)
}

// Cоздаем объединяет кастомные валидаторы в один
func NewAppValidator() *validator.Validate {
	validate := validator.New()

	validate.RegisterValidation("custom_email", ValidateCustomEmail)
	validate.RegisterValidation("custom_password", ValidateCustomPassword)

	return validate
}

func IsValidEmail(email string) bool {
	// Проверка максимальной длины
	if len(email) > 250 {
		return false
	}

	// Разделение email на 2 части
	parts := strings.Split(email, "@")
	if len(parts) > 2 {
		return false
	}
	// Проверка local part
	// ○ может содержать английские буквы (a-z, A-Z);
	var localPart string
	localPart = parts[0]

	var domain string
	domain = parts[1]

	if !isValidLocalPart(localPart) {
		return false
	}

	if !isValidDomain(domain) {
		return false
	}

	return true
}

// Проверка localPart email
func isValidLocalPart(localPart string) bool {
	if strings.Contains(localPart, " ") {
		return false
	}

	if strings.Contains(localPart, "..") {
		return false
	}

	if localPart[0] == '.' || localPart[len(localPart)-1] == '.' {
		return false
	}

	localPartRegex := regexp.MustCompile(`^[a-zA-Z0-9._+-]+$`)
	return localPartRegex.MatchString(localPart)
}

// Проверка domain email
func isValidDomain(domain string) bool {
	if strings.Contains(domain, " ") {
		return false
	}

	if domain[0] == '-' || domain[len(domain)-1] == '-' {
		return false
	}

	if !strings.Contains(domain, ".") {
		return false
	}

	domainRegex := regexp.MustCompile(`^[a-zA-Z0-9.-]+$`)
	return domainRegex.MatchString(domain)
}
