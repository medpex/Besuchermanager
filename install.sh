#!/bin/bash

# Besuchererfassungssystem Installationsskript
# ============================================

# Farbcodes für bessere Lesbarkeit
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Hilfsfunktionen
print_step() {
  echo -e "${BLUE}[SCHRITT]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[ERFOLG]${NC} $1"
}

print_error() {
  echo -e "${RED}[FEHLER]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNUNG]${NC} $1"
}

# Überprüft, ob ein Befehl verfügbar ist
check_command() {
  if ! command -v $1 &> /dev/null; then
    print_error "$1 ist nicht installiert. Installation wird durchgeführt..."
    return 1
  else
    return 0
  fi
}

# Hauptverzeichnis des Projekts
PROJECT_DIR=$(pwd)

# Begrüßungstext
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Besuchererfassungssystem Installationsskript   ${NC}"
echo -e "${GREEN}=================================================${NC}"
echo ""
echo "Dieses Skript wird das Besuchererfassungssystem einrichten."
echo "Der Installationsvorgang kann einige Minuten dauern."
echo ""
read -p "Möchten Sie fortfahren? (j/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
  echo "Installation abgebrochen."
  exit 1
fi

# Systemabhängigkeiten überprüfen und installieren
print_step "Überprüfe und installiere Systemabhängigkeiten..."

# Node.js
if ! check_command node; then
  echo "Node.js wird installiert..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# npm
if ! check_command npm; then
  echo "npm wird installiert..."
  sudo apt-get install -y npm
fi

# PostgreSQL
if ! check_command psql; then
  echo "PostgreSQL wird installiert..."
  sudo apt-get update
  sudo apt-get install -y postgresql postgresql-contrib
fi

print_success "Systemabhängigkeiten sind installiert."

# Prüfe, ob PostgreSQL läuft
print_step "Überprüfe PostgreSQL-Dienst..."
if sudo systemctl is-active --quiet postgresql; then
  print_success "PostgreSQL-Dienst läuft."
else
  print_warning "PostgreSQL-Dienst ist nicht aktiv. Starte den Dienst..."
  sudo systemctl start postgresql
  if sudo systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL-Dienst wurde erfolgreich gestartet."
  else
    print_error "PostgreSQL-Dienst konnte nicht gestartet werden. Bitte prüfen Sie die Installation manuell."
    exit 1
  fi
fi

# Projektabhängigkeiten installieren
print_step "Installiere Projektabhängigkeiten..."
cd "$PROJECT_DIR"
npm install
if [ $? -ne 0 ]; then
  print_error "Fehler beim Installieren der Abhängigkeiten."
  exit 1
fi
print_success "Projektabhängigkeiten wurden installiert."

# Datenbank einrichten
print_step "Richte die Datenbank ein..."

# Erstelle Datenbankbenutzer und Datenbank
DB_NAME="visitor_tracking"
DB_USER="visitor_app"
DB_PASSWORD=$(openssl rand -base64 12)

# Datenbankbenutzer und Datenbank anlegen
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

if [ $? -ne 0 ]; then
  print_error "Fehler beim Einrichten der Datenbank."
  exit 1
fi

print_success "Datenbank wurde eingerichtet."

# Umgebungsvariablen einrichten
print_step "Konfiguriere Umgebungsvariablen..."

# Erstelle .env Datei
cat > "$PROJECT_DIR/.env" << EOF
DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PGHOST=localhost
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
PGDATABASE=$DB_NAME
PGPORT=5432
SESSION_SECRET=$(openssl rand -base64 32)
EOF

print_success "Umgebungsvariablen wurden konfiguriert."

# Datenbank-Schema initialisieren
print_step "Initialisiere das Datenbank-Schema..."

# Führe Datenbankmigrationen aus
npm run db:push

if [ $? -ne 0 ]; then
  print_error "Fehler beim Initialisieren des Datenbank-Schemas."
  exit 1
fi

print_success "Datenbank-Schema wurde initialisiert."

# Admin-Benutzer erstellen
print_step "Erstelle den Admin-Benutzer..."

# Erstelle ein temporäres Skript zur Erstellung des Admin-Benutzers
cat > create-admin.js << EOF
const { db } = require("./db");
const { users } = require("./db/schema");
const { hashPassword } = require("./server/utils/crypto");

async function createAdmin() {
  try {
    const hashedPassword = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      isAdmin: true
    });
    console.log("Admin-Benutzer wurde erfolgreich erstellt.");
    process.exit(0);
  } catch (error) {
    console.error("Fehler beim Erstellen des Admin-Benutzers:", error);
    process.exit(1);
  }
}

createAdmin();
EOF

# Führe das Skript aus
node create-admin.js

if [ $? -ne 0 ]; then
  print_error "Fehler beim Erstellen des Admin-Benutzers."
else
  print_success "Admin-Benutzer wurde erstellt. Benutzername: admin, Passwort: admin123"
  print_warning "Bitte ändern Sie das Passwort nach dem ersten Login!"
  rm create-admin.js
fi

# Service-Datei für systemd erstellen
print_step "Richte einen systemd-Service ein..."

SERVICE_FILE="/etc/systemd/system/visitor-tracking.service"

sudo bash -c "cat > $SERVICE_FILE" << EOF
[Unit]
Description=Besuchererfassungssystem
After=network.target postgresql.service

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run dev
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=$PROJECT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable visitor-tracking.service
sudo systemctl start visitor-tracking.service

if sudo systemctl is-active --quiet visitor-tracking.service; then
  print_success "Der Service wurde erfolgreich gestartet."
else
  print_warning "Der Service konnte nicht gestartet werden. Überprüfen Sie den Status mit: sudo systemctl status visitor-tracking.service"
fi

# Abschluss
echo ""
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}      Installation erfolgreich abgeschlossen      ${NC}"
echo -e "${GREEN}=================================================${NC}"
echo ""
echo "Das Besuchererfassungssystem wurde erfolgreich installiert und läuft nun als Service."
echo ""
echo "Zugangsdaten für die Anwendung:"
echo "  - Benutzername: admin"
echo "  - Passwort: admin123"
echo ""
echo "Zugangsdaten für die Datenbank:"
echo "  - Datenbank: $DB_NAME"
echo "  - Benutzer: $DB_USER"
echo "  - Passwort: $DB_PASSWORD"
echo ""
echo "Diese Informationen wurden in der Datei .env gespeichert."
echo ""
echo "Sie können den Service mit folgenden Befehlen verwalten:"
echo "  - Status prüfen: sudo systemctl status visitor-tracking.service"
echo "  - Service neustarten: sudo systemctl restart visitor-tracking.service"
echo "  - Service stoppen: sudo systemctl stop visitor-tracking.service"
echo ""
echo "Die Anwendung ist unter http://localhost:5000 erreichbar."
echo ""
echo -e "${YELLOW}WICHTIG: Bitte ändern Sie das Admin-Passwort nach dem ersten Login!${NC}"
