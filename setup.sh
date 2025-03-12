#!/bin/bash
# Setup-Skript für das Besuchererfassungssystem
# Dieses Skript hilft bei der Einrichtung des Systems auf verschiedenen Plattformen

set -e

# Farbcodes für Ausgaben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Banner anzeigen
echo -e "${BLUE}=================================================================${NC}"
echo -e "${BLUE}       Willkommen beim Setup des Besuchererfassungssystems       ${NC}"
echo -e "${BLUE}=================================================================${NC}"
echo ""

# Optionen anzeigen
echo "Bitte wählen Sie eine Option:"
echo ""
echo "1) Installationspaket für Ubuntu-Server erstellen"
echo "2) Lokal auf diesem System installieren (benötigt sudo)"
echo "3) Beenden"
echo ""
read -p "Ihre Wahl (1-3): " choice

case $choice in
  1)
    log_info "Erstelle Installationspaket..."
    if [ ! -f "create_zip.sh" ]; then
      log_error "create_zip.sh nicht gefunden!"
      exit 1
    fi
    
    chmod +x create_zip.sh
    ./create_zip.sh
    ;;
    
  2)
    log_info "Starte lokale Installation..."
    if [ ! -f "install.sh" ]; then
      log_error "install.sh nicht gefunden!"
      exit 1
    fi
    
    chmod +x install.sh
    sudo ./install.sh
    ;;
    
  3)
    log_info "Setup beendet."
    exit 0
    ;;
    
  *)
    log_error "Ungültige Auswahl!"
    exit 1
    ;;
esac