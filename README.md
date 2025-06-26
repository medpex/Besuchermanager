# Besuchererfassungssystem

Ein umfassendes Besuchererfassungssystem für Kundendienst-Umgebungen, mit Fokus auf benutzerfreundliche Datenverwaltung und dynamische Visualisierung.

## Funktionen

- **Benutzerauthentifizierung**: Sicheres Anmeldesystem mit Benutzerrollen (Admin/Benutzer)
- **Besuchererfassung**: Einfache Erfassung von Besucherdaten mit Kategorien und Standorten
- **Umfassende Statistiken**: Graphische Auswertungen nach Kategorien, Zeiträumen und Standorten
- **Responsive Design**: Optimierte Darstellung auf allen Geräten
- **Datenpersistenz**: Zuverlässige Speicherung aller Daten in einer PostgreSQL-Datenbank

## Technologie-Stack

- **Frontend**: React mit TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js mit Express
- **Datenbank**: PostgreSQL mit Drizzle ORM
- **Authentifizierung**: Passport.js mit sicherer Passwort-Verschlüsselung

## Installation mit Docker

Das Projekt kann komplett mit Docker und Docker Compose betrieben werden. Damit ist keine manuelle Installation von Node.js oder PostgreSQL notwendig.

### Voraussetzungen
- [Docker](https://www.docker.com/get-started) und [Docker Compose](https://docs.docker.com/compose/) müssen installiert sein.

### Starten der Anwendung

1. Repository klonen:
   ```bash
   git clone https://github.com/medpex/Besuchermanager.git
   cd Besuchermanager
   ```
2. Container bauen und starten:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```
3. Die Anwendung ist erreichbar unter:
   - http://localhost:5050

### Zugangsdaten (Standard)
- Benutzername: admin
- Passwort: J123654789j
- Benutzername: benutzer
- Passwort: user123

### Container stoppen
```bash
docker-compose down
```

### Logs anzeigen
```bash
docker-compose logs -f
```

### Hinweise
- Die Datenbankdaten werden im Volume `db-data` persistent gespeichert.
- Änderungen am Code erfordern einen erneuten Build (`docker-compose build`).

## Automatische Installation

Das Projekt enthält ein Setup-Skript für einfache Installation und Paketerstellung:

```bash
chmod +x setup.sh
./setup.sh
```

Das Setup-Skript bietet folgende Optionen:
1. Erstellen eines Installationspakets für Ubuntu-Server
2. Lokale Installation auf dem aktuellen System
3. Beenden

### Manuelle Installation auf Ubuntu-Server

1. Stellen Sie sicher, dass PostgreSQL installiert ist:
   ```bash
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   ```

2. Klonen Sie das Repository oder entpacken Sie das Installationspaket:
   ```bash
   tar -xzvf besuchererfassungssystem.tar.gz
   cd besuchererfassungssystem
   ```

3. Führen Sie das Installations-Skript aus:
   ```bash
   chmod +x install.sh
   sudo ./install.sh
   ```

### Zugangsdaten nach Installation

- URL: http://[server-ip]:5000
- Benutzername: admin
- Passwort: admin

## Systemverwaltung

- Start: `sudo systemctl start besuchererfassung`
- Stop: `sudo systemctl stop besuchererfassung`
- Neustart: `sudo systemctl restart besuchererfassung`
- Status: `sudo systemctl status besuchererfassung`
- Logs: `sudo journalctl -u besuchererfassung -f`

## Entwicklung

Für die lokale Entwicklung:

1. Datenbank einrichten:
   ```bash
   sudo -u postgres psql -c "CREATE USER besucherapp WITH PASSWORD 'besucherapp123';"
   sudo -u postgres psql -c "CREATE DATABASE besucherdb OWNER besucherapp;"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE besucherdb TO besucherapp;"
   sudo -u postgres psql -d besucherdb -f init.sql
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm ci
   ```

3. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

## Lizenz

© 2025 - Alle Rechte vorbehalten