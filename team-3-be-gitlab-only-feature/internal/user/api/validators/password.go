package validators

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

func PasswordValidator() *validator.Validate {
	validate := validator.New()
	validate.RegisterValidation("custom_password", ValidateCustomPassword)
	return validate
}

func ValidateCustomPassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	return IsValidPass(password)
}

func IsValidPass(password string) bool {
	if len(password) < 6 || len(password) > 30 {
		return false
	}

	pattern := `^[a-zA-Z0-9` +
		`\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^_\` + "`" + `\{\|\}` +
		`]+$`
	passRegex := regexp.MustCompile(pattern)
	return passRegex.MatchString(password)

}
