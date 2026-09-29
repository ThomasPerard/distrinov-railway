.PHONY: help dev dev-down dev-logs db-reset db-seed db-migrate install

help:
@echo "📋 Distrinov — Commandes disponibles"
@echo ""
@echo "  Dev local :"
@echo "    make dev          — Démarrer Express + PostgreSQL (docker-compose)"
@echo "    make dev-down     — Arrêter les conteneurs"
@echo "    make dev-logs     — Logs du serveur"
@echo ""
@echo "  Base de données :"
@echo "    make db-reset     — Réinitialiser schema + seed"
@echo "    make db-seed      — Charger les données de test"
@echo "    make db-migrate   — Exécuter les migrations"
@echo ""
@echo "  Setup :"
@echo "    make install      — npm install"

install:
npm install

dev:
docker compose -f docker-compose.dev.yml up --build

dev-down:
docker compose -f docker-compose.dev.yml down

dev-logs:
docker compose -f docker-compose.dev.yml logs -f app

db-reset:
docker compose -f docker-compose.dev.yml exec -T db psql -U distrinov -d distrinov -f db/schema.sql

db-seed:
docker compose -f docker-compose.dev.yml exec -T app node db/seed.js

db-migrate:
@echo "No migrations yet"

# Railway deployment helpers
railway-login:
railway login

railway-init:
railway init

railway-deploy:
railway up
