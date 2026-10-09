# Susi Air Pilot API - Make Commands
# ===================================

# Help
help:
	@echo "Susi Air Pilot API - Available Commands"
	@echo ""
	@echo "Backend Commands (cd nest):"
	@echo "  make install          - Install dependencies"
	@echo "  make dev              - Start development server"
	@echo "  make db-up            - Start PostgreSQL with Docker"
	@echo "  make db-setup         - Setup database (generate, push, seed)"
	@echo "  make db-reset         - Reset database"
	@echo "  make db-studio        - Open Prisma Studio"
	@echo "  make build            - Build for production"
	@echo "  make docker-build     - Build Docker image"
	@echo "  make docker-up        - Start with Docker (full stack)"
	@echo "  make docker-down      - Stop Docker containers"
	@echo ""
	@echo "Frontend Commands (cd nuxt):"
	@echo "  make install-fe       - Install dependencies"
	@echo "  make dev-fe           - Start development server"

# Backend commands
install:
	cd nest && npm install

dev:
	cd nest && npm run start:dev

db-up:
	docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3

db-setup:
	cd nest && npm run db:generate && npm run db:push && npm run db:seed

db-reset:
	cd nest && npm run db:reset && npm run db:seed

db-studio:
	cd nest && npm run db:studio

build:
	cd nest && npm run build

# Docker commands
docker-build:
	docker build -t susi-air-pilot-api ./nest

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

# Frontend commands
install-fe:
	cd nuxt && npm install

dev-fe:
	cd nuxt && npm run dev

# Full stack setup
setup: install db-up db-setup dev

# Clean
clean:
	cd nest && rm -rf dist node_modules
	cd nuxt && rm -rf node_modules .nuxt

# Lint
lint:
	cd nest && npm run lint

# Test
test:
	cd nest && npm run test

# Format
format:
	cd nest && npm run format
