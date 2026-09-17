.PHONY: up down logs test

up:
      docker compose up -d --build

down:
      docker compose down

logs:
      docker compose logs -f

test:
      curl http://localhost:3010/health
      curl http://localhost:3010/users
