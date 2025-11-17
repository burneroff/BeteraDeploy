package service

import (
	"fmt"
	"net/smtp"
)

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
}

// EmailService интерфейс для отправки email
type EmailService interface {
	SendVerificationEmail(email, verificationURL string) error
	SendEmail(to, subject, body string) error
}

// SMTPEmailService реализация для отправки email через SMTP
type SMTPEmailService struct {
	config EmailConfig
}

// NewSMTPEmailService создает новый SMTP email сервис
func NewSMTPEmailService(config EmailConfig) *SMTPEmailService {
	return &SMTPEmailService{
		config: config,
	}
}

// SendVerificationEmail отправляет email с ссылкой для подтверждения
func (s *SMTPEmailService) SendVerificationEmail(email, verificationURL string) error {
	fmt.Printf("📧 DEBUG: SendVerificationEmail вызван для %s\n", email)
	fmt.Printf("📧 DEBUG: SMTP Host: %s:%d\n", s.config.SMTPHost, s.config.SMTPPort)

	subject := "Подтверждение регистрации"
	body := s.buildEmailBody(verificationURL)

	// Для MailHog используем nil auth вместо PlainAuth
	var auth smtp.Auth = nil

	// Если требуются креденшиалы
	if s.config.SMTPUsername != "" && s.config.SMTPPassword != "" {
		auth = smtp.PlainAuth("", s.config.SMTPUsername, s.config.SMTPPassword, s.config.SMTPHost)
	}

	// Формируем заголовки email
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", s.config.FromName, s.config.FromEmail)
	headers["To"] = email
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"UTF-8\""

	// Собираем сообщение
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Отправляем email
	err := smtp.SendMail(
		fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort),
		auth,
		s.config.FromEmail,
		[]string{email},
		[]byte(message),
	)

	if err != nil {
		fmt.Printf("❌ Ошибка отправки email: %v\n", err)
		return fmt.Errorf("failed to send email to %s: %w", email, err)
	}

	fmt.Printf("✅ Email успешно отправлен на %s\n", email)
	return nil
}

// SendEmail общий метод для отправки email
func (s *SMTPEmailService) SendEmail(to, subject, body string) error {
	fmt.Printf("📧 DEBUG: SendEmail вызван для %s\n", to)

	// Для MailHog используем nil auth
	var auth smtp.Auth = nil

	if s.config.SMTPUsername != "" && s.config.SMTPPassword != "" {
		auth = smtp.PlainAuth("", s.config.SMTPUsername, s.config.SMTPPassword, s.config.SMTPHost)
	}

	// Формируем заголовки email
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", s.config.FromName, s.config.FromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"UTF-8\""

	// Собираем сообщение
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Отправляем email
	err := smtp.SendMail(
		fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort),
		auth,
		s.config.FromEmail,
		[]string{to},
		[]byte(message),
	)

	if err != nil {
		fmt.Printf("❌ Ошибка отправки email: %v\n", err)
		return fmt.Errorf("failed to send email to %s: %w", to, err)
	}

	fmt.Printf("✅ Email успешно отправлен на %s\n", to)
	return nil
}

// buildEmailBody формирует текстовое тело email
func (s *SMTPEmailService) buildEmailBody(verificationURL string) string {
	return fmt.Sprintf(`Здравствуйте!

Благодарим вас за регистрацию. Для завершения процесса подтвердите ваш email адрес.

Перейдите по ссылке для подтверждения:
%s

Если вы не регистрировались в нашем сервисе, пожалуйста проигнорируйте это письмо.

Ссылка действительна в течение 24 часов.

С уважением,
Команда сервиса
`, verificationURL)
}
