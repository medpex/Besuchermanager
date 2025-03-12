#!/bin/bash
# Skript zum Erstellen eines ZIP-Archivs für den Docker-Deployment

# Farben für bessere Lesbarkeit
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Besuchererfassungssystem - Erstelle Docker-Paket ===${NC}"
echo ""

# Liste der Dateien, die in das ZIP-Archiv aufgenommen werden sollen
FILES=(
  "Dockerfile"
  "docker-compose.yml"
  ".docker.env"
  ".dockerignore"
  "init.sql"
  "docker-entrypoint.sh"
  "session-fix.js"
  "install.sh"
  "README.docker.md"
)

# Zielverzeichnis erstellen
TEMP_DIR="docker-deployment"
mkdir -p "$TEMP_DIR"

# Dateien in das Zielverzeichnis kopieren
echo -e "${YELLOW}Kopiere erforderliche Dateien...${NC}"
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$TEMP_DIR/"
    echo "  - $file"
  else
    echo -e "${RED}  - Datei nicht gefunden: $file${NC}"
  fi
done

# Erstellen des ZIP-Archivs
ZIPFILE="visitor-tracking-docker.zip"
echo -e "${YELLOW}Erstelle ZIP-Archiv: $ZIPFILE...${NC}"
zip -r "$ZIPFILE" "$TEMP_DIR"

# Aufräumen
echo -e "${YELLOW}Räume auf...${NC}"
rm -rf "$TEMP_DIR"

if [ -f "$ZIPFILE" ]; then
  echo -e "${GREEN}Docker-Paket erfolgreich erstellt: $ZIPFILE${NC}"
  echo ""
  echo -e "${YELLOW}Anleitung zur Installation:${NC}"
  echo "1. Entpacken Sie das ZIP-Archiv"
  echo "2. Navigieren Sie zum entpackten Verzeichnis"
  echo "3. Führen Sie './install.sh' aus, um die Anwendung zu installieren und zu starten"
else
  echo -e "${RED}Fehler beim Erstellen des ZIP-Archivs.${NC}"
  exit 1
fi