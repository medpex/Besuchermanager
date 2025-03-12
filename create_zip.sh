#!/bin/bash
# Skript zum Erstellen eines ZIP-Archivs des Besuchererfassungssystems
# Dieses Skript erstellt eine ZIP-Datei, die alle notwendigen Dateien für die Installation enthält

set -e

# Farbcodes für Ausgaben
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Archivname und temporäres Verzeichnis
ARCHIVE_NAME="besuchererfassungssystem.zip"
TEMP_DIR=$(mktemp -d)
CURRENT_DIR=$(pwd)

echo "=== Erstelle ZIP-Archiv für das Besuchererfassungssystem ==="

# Installationsskript anpassbar machen
chmod +x install.sh

# Temp-Ordner für die Dateien erstellen
mkdir -p "$TEMP_DIR/besuchererfassungssystem"

# Alle relevanten Dateien kopieren (außer Docker-Dateien und temporäre Dateien)
echo "Kopiere Projektdateien..."
cp -r \
  client \
  db \
  scripts \
  server \
  .env.example \
  db-init.js \
  drizzle.config.ts \
  init.sql \
  install.sh \
  package-lock.json \
  package.json \
  postcss.config.js \
  session-fix.js \
  tailwind.config.ts \
  theme.json \
  tsconfig.json \
  vite.config.ts \
  "$TEMP_DIR/besuchererfassungssystem"

# README-Datei erstellen
cat > "$TEMP_DIR/besuchererfassungssystem/README.md" << 'EOL'
# Besuchererfassungssystem

## Installation

Für die automatische Installation auf einem Ubuntu-Server:

1. Archiv entpacken: `unzip besuchererfassungssystem.zip`
2. In das Verzeichnis wechseln: `cd besuchererfassungssystem`
3. Skript ausführbar machen (falls nötig): `chmod +x install.sh`
4. Installation starten: `sudo ./install.sh`

## Zugangsdaten

Nach erfolgreicher Installation kann das System mit folgenden Zugangsdaten erreicht werden:

- URL: http://[server-ip]:5000
- Benutzername: admin
- Passwort: admin

## Systemverwaltung

- Dienst starten: `sudo systemctl start besuchererfassung`
- Dienst stoppen: `sudo systemctl stop besuchererfassung`
- Dienst neustarten: `sudo systemctl restart besuchererfassung`
- Status prüfen: `sudo systemctl status besuchererfassung`
- Logs anzeigen: `sudo journalctl -u besuchererfassung -f`
EOL

# ZIP-Archiv erstellen
echo "Erstelle ZIP-Archiv..."
cd "$TEMP_DIR"
zip -r "$CURRENT_DIR/$ARCHIVE_NAME" besuchererfassungssystem

# Aufräumen
rm -rf "$TEMP_DIR"

echo -e "${GREEN}ZIP-Archiv erfolgreich erstellt:${NC} $CURRENT_DIR/$ARCHIVE_NAME"
echo "Die ZIP-Datei kann nun auf einen Ubuntu-Server übertragen und mit 'sudo ./install.sh' installiert werden."