#!/bin/bash
# Installationsskript für das Besuchererfassungssystem mit Docker

# Farben für bessere Lesbarkeit
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Besuchererfassungssystem - Docker-Installation ===${NC}"
echo ""

# Prüfen, ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker ist nicht installiert. Bitte installieren Sie Docker und versuchen Sie es erneut.${NC}"
    echo "Anleitung: https://docs.docker.com/get-docker/"
    exit 1
fi

# Prüfen, ob Docker Compose installiert ist
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose ist nicht installiert. Bitte installieren Sie Docker Compose und versuchen Sie es erneut.${NC}"
    echo "Anleitung: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}Docker und Docker Compose sind installiert.${NC}"
echo ""

# Container bauen und starten
echo -e "${YELLOW}Container werden gebaut und gestartet...${NC}"
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Container wurden erfolgreich gestartet!${NC}"
    echo ""
    echo -e "${GREEN}Die Anwendung ist nun unter http://localhost:5000 verfügbar.${NC}"
    echo ""
    echo -e "${YELLOW}Anmeldeinformationen:${NC}"
    echo "Admin: username=admin, password=J123654789j"
    echo "Benutzer: username=benutzer, password=user123"
    echo ""
    echo -e "${YELLOW}Docker-Container-Status:${NC}"
    docker-compose ps
else
    echo -e "${RED}Fehler beim Starten der Container. Bitte überprüfen Sie die Logs.${NC}"
    echo ""
    echo -e "${YELLOW}Logs anzeigen mit:${NC} docker-compose logs"
    exit 1
fi