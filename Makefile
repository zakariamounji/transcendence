NETWORK_NAME := mynetwork
MAIN_COMPOSE := docker-compose.yml
MONITORING_COMPOSE := monitoring/docker-compose.yml

.PHONY: all check-env create-network up monitoring clean status help

all: check-env create-network up

check-env:
	@echo "🔍 Checking environment configuration files..."
	@if [ ! -f backend/.env ]; then \
		echo "❌ Error: backend/.env file is missing!"; \
		exit 1; \
	fi
	@if [ ! -f frontend/.env ]; then \
		echo "❌ Error: frontend/.env file is missing!"; \
		exit 1; \
	fi
	@echo "✅ All required .env files are present."

create-network:
	@echo "🌐 Checking Docker network '$(NETWORK_NAME)'..."
	@if ! docker network ls --format '{{.Name}}' | grep -q "^$(NETWORK_NAME)$$"; then \
		echo "🚀 Creating external network '$(NETWORK_NAME)'..."; \
		docker network create $(NETWORK_NAME); \
	else \
		echo "✅ External network '$(NETWORK_NAME)' already exists."; \
	fi

up: check-env create-network
	@echo "🛠️  Building and starting main app services..."
	docker compose up --build -d

monitoring: check-env create-network
	@echo "📊 Starting monitoring stack..."
	docker compose -f $(MONITORING_COMPOSE) up --build -d

status:
	@echo "📌 Main App Status:"
	docker compose ps
	@echo "\n📌 Monitoring Status:"
	@if [ -f $(MONITORING_COMPOSE) ]; then \
		docker compose -f $(MONITORING_COMPOSE) ps; \
	fi

clean:
	@echo "🛑 Stopping all containers..."
	-docker compose down
	-docker compose -f $(MONITORING_COMPOSE) down
	@echo "🧹 Removing external network..."
	-docker network rm $(NETWORK_NAME) 2>/dev/null || true

# Display available commands
help:
	@echo "Usage:"
	@echo "  make            - Check env, create network, and start main app"
	@echo "  make up         - Build and start main app services"
	@echo "  make monitoring - Build and start monitoring services"
	@echo "  make status     - Show status of all services"
	@echo "  make clean      - Stop all services and remove the network"
