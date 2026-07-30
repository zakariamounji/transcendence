NETWORK_NAME := mynetwork
MAIN_COMPOSE := docker-compose.yml
MONITORING_COMPOSE := monitoring/docker-compose.yml

# Filebeat needs the host's container-log dir and the Docker socket. Under
# rootless Docker these are NOT /var/lib/docker and /var/run/docker.sock, so
# detect them from the running daemon and export them for compose.
DOCKER_ROOT_DIR := $(shell docker info --format '{{.DockerRootDir}}' 2>/dev/null | sed 's:/*$$::')
DOCKER_SOCK := $(shell echo "$${DOCKER_HOST:-unix:///var/run/docker.sock}" | sed -e 's|^unix://||' -e 's|^[^/].*$$|/var/run/docker.sock|')
export DOCKER_ROOT_DIR
export DOCKER_SOCK

.PHONY: all check-env create-network up monitoring clean status help

all: check-env create-network up
	@echo "\n\n\033[32m::: ft_transcendence is running on \033[31mhttps://localhost:8443\033[0m\n\nrun: \033[32mmake clean\033[0m to stop and remove containers and network\n"

check-env:
	@echo "🔍 Checking environment configuration files..."
	@if [ ! -f .env ]; then \
		echo "❌ Error: .env file is missing!"; \
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
	@echo "🐳 Docker data dir: $(DOCKER_ROOT_DIR)  socket: $(DOCKER_SOCK)"
	@if [ ! -r "$(DOCKER_ROOT_DIR)/containers" ]; then \
		echo "❌ Error: cannot read '$(DOCKER_ROOT_DIR)/containers' — filebeat needs it."; \
		exit 1; \
	fi
	docker compose --env-file .env -f $(MONITORING_COMPOSE) up --build -d
	@echo "\n\033[32m::: Monitoring stack is running! :::\033[0m"
	@echo "  📈 Grafana:    \033[36mhttp://localhost:3005\033[0m"
	@echo "  🔍 Kibana:     \033[36mhttp://localhost:5601\033[0m"
	@echo "  🔥 Prometheus: \033[36mhttp://localhost:9090\033[0m\n"

status:
	@echo "📌 Main App Status:"
	docker compose ps
	@echo "\n📌 Monitoring Status:"
	@if [ -f $(MONITORING_COMPOSE) ]; then \
		docker compose --env-file .env -f $(MONITORING_COMPOSE) ps; \
	fi

clean:
	@echo "🛑 Stopping all containers..."
	-docker compose down
	-docker compose --env-file .env -f $(MONITORING_COMPOSE) down
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
