# Besuchererfassungssystem

Ein fortschrittliches Besuchererfassungs- und Analysetool für Kundenservice-Büros mit nutzerzentrierter Persistenz und dynamischer Datenvisualisierung.

## Funktionen

- Erfassung von Besuchern nach Kategorie und Unterkategorie
- Standortspezifische Datenerfassung (Geesthacht, Büchen, Schwarzenbek)
- Umfangreiche Statistikauswertungen mit grafischer Darstellung
- Benutzerbezogene Zählerstände und Einstellungen
- Admin-Bereich zur Verwaltung von Benutzern
- Persistente Speicherung von Besucherdaten
- Responsive Design für verschiedene Bildschirmgrößen

## Technologiestack

- TypeScript Full-Stack Entwicklung
- React Frontend mit modernen UI-Komponenten
- Express Backend-Server
- PostgreSQL Datenbank mit Drizzle ORM
- Recharts für Datenvisualisierung
- Authentifizierung mit Session-basierter Sicherheit
- Benutzer-spezifische Datenpersistenz
- Rollenbasierte Zugriffskontrollen

## Installation

### Automatische Installation mit dem Installationsskript

1. Entpacken Sie das ZIP-Archiv in ein leeres Verzeichnis
2. Öffnen Sie ein Terminal im Projektverzeichnis
3. Führen Sie das Installationsskript aus:

```bash
chmod +x install.sh
./install.sh
```

Das Skript installiert alle notwendigen Abhängigkeiten, richtet die Datenbank ein und startet die Anwendung als systemd-Service.

### Manuelle Installation

Wenn Sie die Anwendung manuell installieren möchten:

1. Installieren Sie Node.js (Version 20 oder höher) und npm
2. Installieren Sie PostgreSQL (Version 14 oder höher)
3. Erstellen Sie eine PostgreSQL-Datenbank und einen Benutzer
4. Kopieren Sie die `.env.example` Datei zu `.env` und passen Sie die Datenbankverbindungseinstellungen an
5. Installieren Sie die Projektabhängigkeiten:

```bash
npm install
```

6. Initialisieren Sie die Datenbankstruktur:

```bash
npm run db:push
```

7. Erstellen Sie einen Admin-Benutzer mit dem Skript:

```bash
node db-init.js
```

8. Starten Sie die Anwendung:

```bash
npm run dev
```

## Daten initialisieren

Sie können das Dateninitialisierungsskript verwenden, um Beispieldaten in die Datenbank einzufügen:

```bash
node db-init.js
```

Dieses Skript erstellt:
- Einen Admin-Benutzer (username: admin, password: admin123)
- Einen normalen Benutzer (username: benutzer, password: user123)
- Beispielbesuche für verschiedene Kategorien, Standorte und Zeiträume

## Anwendung starten

Nach der Installation können Sie die Anwendung mit folgendem Befehl starten:

```bash
npm run dev
```

Die Anwendung ist dann unter http://localhost:5000 erreichbar.

## Anmeldung

Verwenden Sie die folgenden Zugangsdaten für die erste Anmeldung:

- **Admin-Benutzer:**
  - Benutzername: admin
  - Passwort: admin123

- **Normaler Benutzer:**
  - Benutzername: benutzer
  - Passwort: user123

**Wichtig:** Bitte ändern Sie die Passwörter nach der ersten Anmeldung aus Sicherheitsgründen.

## Systemanforderungen

- Node.js v20 oder höher
- npm v9 oder höher
- PostgreSQL v14 oder höher
- Moderner Webbrowser (Chrome, Firefox, Edge)
- Mindestens 2 GB RAM
- 1 GB freier Speicherplatz

## Hilfe und Support

Bei Problemen mit der Installation oder Verwendung der Anwendung:

1. Überprüfen Sie die Logs: 
   ```
   sudo journalctl -u visitor-tracking.service
   ```

2. Überprüfen Sie den Status des Services:
   ```
   sudo systemctl status visitor-tracking.service
   ```

3. Starten Sie den Service neu:
   ```
   sudo systemctl restart visitor-tracking.service
   ```

## Lizenz

© 2025 Besuchererfassungssystem. Alle Rechte vorbehalten.
