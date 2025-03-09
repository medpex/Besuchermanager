# Besuchererfassungssystem

Ein fortschrittliches Besuchererfassungs- und Analysetool für Kundenservice-Büros mit nutzerzentrierter Persistenz und dynamischer Datenvisualisierung.

## Technologiestack:
- TypeScript Full-Stack Entwicklung
- Moderne Authentifizierungsmechanismen
- Benutzer-spezifische Datenpersistenz
- Flexible Datenbank-Integration
- Rollenbasierte Zugriffskontrollen
- Detaillierte Besucherstatistik-Analyse

## Installation mit Docker

### Voraussetzungen
- Docker
- Docker Compose

### Installationsschritte

1. Laden Sie das Projekt-ZIP herunter und entpacken Sie es auf Ihrem Server

2. Navigieren Sie zum Projektverzeichnis:
   ```bash
   cd pfad/zum/besuchererfassungssystem
   ```

3. Führen Sie das Setup-Skript aus:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   Dieses Skript:
   - Startet die Docker-Container (Webanwendung und Datenbank)
   - Initialisiert die Datenbankstruktur
   - Erstellt einen Admin-Benutzer

4. Öffnen Sie einen Webbrowser und navigieren Sie zu:
   ```
   http://ihr-server:5000
   ```

### Admin-Login
- Benutzername: `admin`
- Passwort: `admin123`

**Wichtig:** Bitte ändern Sie das Admin-Passwort nach dem ersten Login.

## Manuelle Installation (ohne Setup-Skript)

Falls Sie die Anwendung manuell installieren möchten:

1. Starten Sie die Docker-Container:
   ```bash
   docker-compose up -d
   ```

2. Initialisieren Sie die Datenbank:
   ```bash
   docker-compose exec app npm run db:push
   ```

3. Erstellen Sie einen Admin-Benutzer:
   ```bash
   docker-compose exec app node scripts/create_admin.ts
   ```

## Fehlerbehebung

- **Problem**: Container starten nicht
  **Lösung**: Überprüfen Sie, ob die Ports 5000 und 5432 verfügbar sind

- **Problem**: Datenbank-Verbindungsfehler
  **Lösung**: Stellen Sie sicher, dass die Umgebungsvariable DATABASE_URL korrekt ist

- **Problem**: Admin-Benutzer kann nicht erstellt werden
  **Lösung**: Überprüfen Sie die Logs mit `docker-compose logs app`

## Sicherung und Wiederherstellung

Die Postgres-Daten werden im Docker-Volume `postgres_data` gespeichert.

Sicherung:
```bash
docker-compose exec db pg_dump -U postgres besucherdb > backup.sql
```

Wiederherstellung:
```bash
cat backup.sql | docker-compose exec -T db psql -U postgres besucherdb
```