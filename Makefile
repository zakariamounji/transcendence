COMPOSE = docker compose

all: env up

# Create .env from the template on first run
env:
	@test -f .env || (cp .env.example .env && \
		echo ">> .env created from .env.example — edit it and fill in real secrets!")

up: env
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

re: down up

# Remove containers + volumes (DELETES the database)
clean:
	$(COMPOSE) down -v

fclean: clean
	docker system prune -f

.PHONY: all env up down logs ps re clean fclean
