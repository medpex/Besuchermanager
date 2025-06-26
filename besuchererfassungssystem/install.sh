#!/bin/bash
# Automatisches Installationsskript für Besuchererfassungssystem
# Dieses Skript installiert alle Abhängigkeiten und richtet die Anwendung auf einem Ubuntu-Server ein

set -e

# Farbcodes für Ausgaben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Überprüfen, ob das Skript mit root-Rechten ausgeführt wird
if [ "$EUID" -ne 0 ]; then
  log_error "Dieses Skript muss mit root-Rechten ausgeführt werden."
  log_info "Bitte mit 'sudo ./install.sh' ausführen."
  exit 1
fi

# Willkommensnachricht
echo "========================================================"
echo "   Installationsprogramm für Besuchererfassungssystem"
echo "========================================================"
echo ""

# Installation von Abhängigkeiten
log_info "Installiere Systemabhängigkeiten..."
apt-get update
apt-get install -y curl wget gnupg2 postgresql postgresql-contrib build-essential

# Node.js 20 installieren
log_info "Installiere Node.js 20..."
if ! command -v node &> /dev/null || ! node -v | grep -q "v20"; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  log_info "Node.js $(node -v) installiert"
else
  log_info "Node.js $(node -v) ist bereits installiert"
fi

# Postgresql starten
log_info "Starte PostgreSQL-Dienst..."
systemctl start postgresql
systemctl enable postgresql

# Datenbank einrichten
log_info "Richte PostgreSQL-Datenbank ein..."
sudo -u postgres psql -c "CREATE USER besucherapp WITH PASSWORD 'besucherapp123';" || log_warn "Benutzer existiert möglicherweise bereits"
sudo -u postgres psql -c "CREATE DATABASE besucherdb OWNER besucherapp;" || log_warn "Datenbank existiert möglicherweise bereits"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE besucherdb TO besucherapp;"

# Datenbank mit Schema initialisieren
log_info "Initialisiere Datenbankschema..."
sudo -u postgres psql -d besucherdb -f init.sql || log_error "Fehler beim Initialisieren des Datenbankschemas"

# Erstelle .env-Datei
log_info "Erstelle .env-Datei..."
cat > .env << EOL
# Datenbankverbindung
DATABASE_URL=postgres://besucherapp:besucherapp123@localhost:5432/besucherdb

# Server-Konfiguration
PORT=5000
NODE_ENV=production
EOL

# NPM-Abhängigkeiten installieren
log_info "Installiere NPM-Abhängigkeiten..."
npm ci

# Anwendung bauen
log_info "Baue die Anwendung..."
npm run build

# Systemd-Service einrichten
log_info "Richte Systemd-Service ein..."
SERVICE_NAME="besuchererfassung"
SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME.service"
APP_PATH=$(pwd)

cat > $SERVICE_PATH << EOL
[Unit]
Description=Besuchererfassungssystem
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_PATH
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOL

# Service aktivieren und starten
log_info "Aktiviere und starte den Service..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Ausgabe der Zugangsdaten
echo ""
echo "========================================================"
echo "   Installation abgeschlossen!"
echo "========================================================"
echo ""
echo "Die Anwendung ist nun verfügbar unter:"
echo "http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "Zugangsdaten für die Anwendung:"
echo "Benutzername: admin"
echo "Passwort: admin"
echo ""
echo "Um den Status des Dienstes zu überprüfen:"
echo "sudo systemctl status $SERVICE_NAME"
echo ""
echo "Um das Anwendungslog anzusehen:"
echo "sudo journalctl -u $SERVICE_NAME -f"
echo "========================================================"