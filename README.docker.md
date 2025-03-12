# Docker-Konfiguration für das Besuchererfassungssystem

Dieses Dokument beschreibt die Docker-Konfiguration für das Besuchererfassungssystem und wie Sie es in einer Docker-Umgebung ausführen können.

## Voraussetzungen

- Docker und Docker Compose müssen auf Ihrem System installiert sein
- Grundlegende Kenntnisse der Befehlszeile

## Schnellstart

1. Klonen Sie das Repository und navigieren Sie zum Projektverzeichnis

2. Starten Sie die Container mit Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Die Anwendung ist nun unter http://localhost:5000 verfügbar

4. Um die Container zu stoppen:
   ```bash
   docker-compose down
   ```

## Anmeldeinformationen

Die Anwendung wird mit zwei vordefinierten Benutzerkonten eingerichtet:

- Admin-Konto:
  - Benutzername: admin
  - Passwort: J123654789j

- Standardbenutzer-Konto:
  - Benutzername: benutzer
  - Passwort: user123

## Datenbank

Die PostgreSQL-Datenbank wird automatisch mit den erforderlichen Tabellen und Beispieldaten initialisiert. Die Datenbankdaten werden in einem Docker-Volume gespeichert, sodass sie zwischen Container-Neustarts bestehen bleiben.

## Container-Struktur

Das System besteht aus zwei Containern:

1. **app**: Node.js-Anwendung, die sowohl den Backend-Server als auch das Frontend ausführt.
   - Port: 5000 (extern zugänglich)

2. **db**: PostgreSQL-Datenbank
   - Port: 5432 (intern)
   - Benutzername: postgres
   - Passwort: postgres
   - Datenbank: visitor_tracking

## Umgebungsvariablen

Die Anwendung verwendet folgende Umgebungsvariablen, die in der docker-compose.yml und Dockerfile definiert sind:

- `NODE_ENV`: Laufzeitumgebung (auf 'production' gesetzt)
- `DATABASE_URL`: Verbindungszeichenfolge für die Datenbank
- `SESSION_SECRET`: Geheimnis für die Sitzungsverschlüsselung
- `COOKIE_SECURE`: Cookie-Sicherheitseinstellung (auf 'false' gesetzt für HTTP)
- `COOKIE_SAMESITE`: Same-Site-Cookie-Einstellung (auf 'lax' gesetzt)

## Fehlerbehebung

### Die Anwendung ist nicht erreichbar

1. Überprüfen Sie, ob die Container laufen:
   ```bash
   docker-compose ps
   ```

2. Prüfen Sie die Logs auf Fehler:
   ```bash
   docker-compose logs
   ```

### Datenbankverbindungsprobleme

1. Vergewissern Sie sich, dass der Datenbankcontainer läuft:
   ```bash
   docker-compose ps db
   ```

2. Prüfen Sie die Datenbankverbindungseinstellungen in der docker-compose.yml

### Sessionprobleme bei der Anmeldung

Die Docker-Konfiguration ist so eingerichtet, dass Cookies für HTTP-Umgebungen funktionieren. Wenn Sie Probleme bei der Anmeldung haben:

1. Löschen Sie Ihre Browser-Cookies für die Seite
2. Stellen Sie sicher, dass Ihr Browser Drittanbieter-Cookies akzeptiert
3. Überprüfen Sie die Docker-Logs auf session-bezogene Fehler