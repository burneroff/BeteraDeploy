package service

import (
	"bytes"
	"image/color"
	"math/rand"
	"strings"
	"time"

	"github.com/fogleman/gg"
)

// AvatarGenerator генерирует аватары с инициалами
type AvatarGenerator struct {
	width  int
	height int
	rand   *rand.Rand
}

// NewAvatarGenerator создает новый генератор аватаров
func NewAvatarGenerator(width, height int) *AvatarGenerator {
	// Используем NewSource с текущим временем для случайности
	source := rand.NewSource(time.Now().UnixNano())
	return &AvatarGenerator{
		width:  width,
		height: height,
		rand:   rand.New(source),
	}
}

// GenerateAvatar создает аватар с инициалами
func (ag *AvatarGenerator) GenerateAvatar(firstName, lastName string) ([]byte, error) {
	// Создаем контекст для рисования
	dc := gg.NewContext(ag.width, ag.height)

	// Генерируем случайный цвет фона
	bgColor := ag.generateRandomColor()
	dc.SetColor(bgColor)
	dc.Clear()

	// Создаем инициалы
	initials := ag.getInitials(firstName, lastName)

	dc.SetColor(color.White)

	fontSize := float64(ag.height) * 0.4

	fontPaths := []string{
		// Windows
		"C:/Windows/Fonts/Arial.ttf",
		"C:/Windows/Fonts/Arialbd.ttf",
		// macOS
		"/System/Library/Fonts/Helvetica.ttc",
		"/System/Library/Fonts/Arial.ttf",
		// Linux
		"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
		"/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
	}

	for _, fontPath := range fontPaths {
		err := dc.LoadFontFace(fontPath, fontSize)
		if err == nil {
			break
		}
	}

	// Вычисляем позицию текста по центру
	textWidth, textHeight := dc.MeasureString(initials)
	x := float64(ag.width)/2 - textWidth/2
	y := float64(ag.height)/2 + textHeight/3

	// Рисуем текст
	dc.DrawString(initials, x, y)

	// Кодируем в PNG
	var buf bytes.Buffer
	if err := dc.EncodePNG(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// getInitials возвращает инициалы из имени и фамилии
func (ag *AvatarGenerator) getInitials(firstName, lastName string) string {
	var initials strings.Builder

	if firstName != "" {
		initials.WriteString(strings.ToUpper(string(firstName[0])))
	}
	if lastName != "" {
		initials.WriteString(strings.ToUpper(string(lastName[0])))
	}

	if initials.Len() == 0 {
		return "U"
	}

	return initials.String()
}

// generateRandomColor генерирует случайный цвет
func (ag *AvatarGenerator) generateRandomColor() color.RGBA {
	colors := []color.RGBA{
		{R: 41, G: 128, B: 185, A: 255}, // Синий
		{R: 39, G: 174, B: 96, A: 255},  // Зеленый
		{R: 142, G: 68, B: 173, A: 255}, // Фиолетовый
		{R: 211, G: 84, B: 0, A: 255},   // Оранжевый
		{R: 192, G: 57, B: 43, A: 255},  // Красный
		{R: 52, G: 73, B: 94, A: 255},   // Темно-синий
		{R: 230, G: 126, B: 34, A: 255}, // Морковный
		{R: 22, G: 160, B: 133, A: 255}, // Бирюзовый
		{R: 155, G: 89, B: 182, A: 255}, // Аметистовый
		{R: 241, G: 196, B: 15, A: 255}, // Желтый
	}

	return colors[ag.rand.Intn(len(colors))]
}

// GenerateAvatarWithInitials создает аватар и использует инициалы в имени файла
func (ag *AvatarGenerator) GenerateAvatarWithInitials(firstName, lastName string) ([]byte, string, error) {
	initials := ag.getInitials(firstName, lastName)

	avatarBytes, err := ag.GenerateAvatar(firstName, lastName)
	if err != nil {
		return nil, "", err
	}

	return avatarBytes, initials, nil
}
