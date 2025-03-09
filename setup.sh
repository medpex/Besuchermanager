#!/bin/bash

# Farben für die Konsolenausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Besuchererfassungssystem - Setup Skript${NC}"
echo "====================================="
echo ""

# Prüfe, ob Docker installiert ist
if ! command -v docker &> /dev/null
then
    echo "Docker ist nicht installiert. Bitte installieren Sie Docker und Docker Compose."
    echo "Installation Guide: https://docs.docker.com/get-docker/"
    exit 1
fi

# Prüfe, ob Docker Compose installiert ist
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose ist nicht installiert. Bitte installieren Sie Docker Compose."
    echo "Installation Guide: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}Starte Docker Container...${NC}"
docker-compose up -d

echo -e "${GREEN}Warte auf Datenbank...${NC}"
sleep 10

echo -e "${GREEN}Initialisiere Datenbank...${NC}"
docker-compose exec app npm run db:push

echo -e "${GREEN}Initialisiere Beispieldaten...${NC}"
docker-compose exec app node db-init.js

echo -e "${GREEN}Überprüfe Admin-Benutzer...${NC}"
docker-compose exec app node scripts/create_admin.ts

echo -e "${GREEN}Setup abgeschlossen!${NC}"
echo "Die Anwendung läuft jetzt auf http://localhost:5000"
echo ""
echo "Admin Login:"
echo "Benutzername: admin"
echo "Passwort: admin123"
echo ""
echo "Bitte ändern Sie das Admin-Passwort nach dem ersten Login."