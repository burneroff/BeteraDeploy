FROM golang:1.24.9-alpine AS builder

WORKDIR /app
COPY . .

# Собираем напрямую из main.go
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" \
    -o /out/backend dochub/main.go

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /out/backend /app/backend
COPY cmd/config/local.yaml /app/config/local.yaml
EXPOSE 8080
CMD ["/app/backend"]
