#!/bin/bash

# Farben für die Konsolenausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Erstelle ZIP für das Besuchererfassungssystem${NC}"
echo "=========================================="
echo ""

# Name für das ZIP-Archiv
ZIP_NAME="besuchererfassungssystem.zip"

# Prüfe, ob zip installiert ist
if ! command -v zip &> /dev/null
then
    echo "zip ist nicht installiert. Bitte installieren Sie zip."
    echo "Unter Ubuntu: sudo apt-get install zip"
    echo "Unter macOS: brew install zip"
    exit 1
fi

# Erstelle eine Liste von Dateien, die in das ZIP sollen
echo -e "${GREEN}Bereite Dateien für das ZIP vor...${NC}"
files=(
    "package.json"
    "package-lock.json"
    "Dockerfile"
    "docker-compose.yml"
    "docker-entrypoint.sh"
    "setup.sh"
    "README.md"
    "README.docker.md"
    "tailwind.config.ts"
    "postcss.config.js"
    "vite.config.ts"
    "drizzle.config.ts"
    "db-init.js"
    ".docker.env"
    ".env.example"
    "db"
    "server"
    "client"
    "scripts"
)

# Erstelle temporäres Verzeichnis für sauberen Export
echo -e "${GREEN}Erstelle sauberen Export...${NC}"
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/besuchererfassung"

# Kopiere benötigte Dateien
for file in "${files[@]}"; do
  if [ -e "$file" ]; then
    cp -r "$file" "$TEMP_DIR/besuchererfassung/"
  fi
done

# Entferne unnötige Dateien und Verzeichnisse
echo -e "${GREEN}Bereinige Dateien...${NC}"
find "$TEMP_DIR" -name "node_modules" -type d -exec rm -rf {} +
find "$TEMP_DIR" -name ".git" -type d -exec rm -rf {} +
find "$TEMP_DIR" -name ".cache" -type d -exec rm -rf {} +
find "$TEMP_DIR" -name ".config" -type d -exec rm -rf {} +
find "$TEMP_DIR" -name ".local" -type d -exec rm -rf {} +
find "$TEMP_DIR" -name ".upm" -type d -exec rm -rf {} +
find "$TEMP_DIR" -name ".DS_Store" -type f -delete
find "$TEMP_DIR" -name "*.log" -type f -delete

# Erstelle das ZIP aus dem bereinigten Verzeichnis
echo -e "${GREEN}Erstelle ZIP-Archiv...${NC}"
(cd "$TEMP_DIR" && zip -r "$OLDPWD/$ZIP_NAME" "besuchererfassung")

# Lösche temporäres Verzeichnis
rm -rf "$TEMP_DIR"

echo -e "${GREEN}ZIP erfolgreich erstellt: ${NC}$ZIP_NAME"
echo ""
echo "Sie können das ZIP jetzt herunterladen und auf Ihren Server übertragen."
echo "Führen Sie danach das Setup-Skript aus:"
echo "  chmod +x setup.sh"
echo "  ./setup.sh"