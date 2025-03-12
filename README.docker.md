# Dockerisiertes Besuchererfassungssystem

Dieses Dokument beschreibt, wie Sie das Besuchererfassungssystem mit Docker betreiben können.

## Voraussetzungen

- Docker und Docker Compose installiert
- Mindestens 1 GB RAM für Container
- 1 GB freier Speicherplatz
- Internetzugang für den ersten Build (zum Herunterladen der Images)

## Schnellstart

Das beiliegende Installationsskript führt alle notwendigen Schritte aus:

```bash
chmod +x install.sh
./install.sh
```

Nach erfolgreicher Installation ist die Anwendung unter http://localhost:5000 erreichbar.

## Manuelle Installation

Wenn Sie die Anwendung manuell installieren möchten, folgen Sie diesen Schritten:

1. Stellen Sie sicher, dass Docker und Docker Compose installiert sind
2. Klonen oder extrahieren Sie die Projektdateien
3. Navigieren Sie zum Projektverzeichnis
4. Führen Sie folgenden Befehl aus:

```bash
docker-compose up -d
```

## Zugangsdaten

Nach der Installation können Sie sich mit folgenden Zugangsdaten anmelden:

- Admin-Benutzer:
  - Benutzername: `admin`
  - Passwort: `J123654789j`

- Normaler Benutzer:
  - Benutzername: `benutzer`
  - Passwort: `user123`

## Konfiguration

Die Anwendung kann über Umgebungsvariablen in der `.docker.env`-Datei konfiguriert werden. 
Die wichtigsten Einstellungen:

- `PORT`: Port, auf dem die Anwendung läuft (Standard: 5000)
- `DB_HOST`: Hostname der Datenbank (Standard: db)
- `DB_USER`, `DB_PASSWORD`: Datenbankzugangsdaten
- `DB_NAME`: Name der Datenbank
- `COOKIE_SECURE`: Ob Cookies nur über HTTPS übertragen werden (Standard: false für Docker)
- `COOKIE_SAME_SITE`: Cookie-SameSite-Einstellung (Standard: lax für Docker)

## Datenbank

Die PostgreSQL-Datenbank wird automatisch eingerichtet und mit Beispieldaten befüllt. Die Daten werden in einem Docker-Volume persistent gespeichert.

Um die Datenbank zurückzusetzen:

```bash
docker-compose down -v
docker-compose up -d
```

## Wartung und Verwaltung

### Container verwalten

- Container starten: `docker-compose up -d`
- Container stoppen: `docker-compose down` (Daten bleiben erhalten)
- Logs anzeigen: `docker-compose logs -f`
- Status prüfen: `docker-compose ps`

### Updates

Um die Anwendung zu aktualisieren, ziehen Sie die neuesten Änderungen und bauen die Container neu:

```bash
git pull  # oder neue Dateien herunterladen
docker-compose build --no-cache
docker-compose up -d
```

## Fehlerbehebung

### Anwendung ist nicht erreichbar

1. Prüfen Sie, ob die Container laufen: `docker-compose ps`
2. Prüfen Sie die Logs: `docker-compose logs -f app`
3. Stellen Sie sicher, dass Port 5000 nicht bereits verwendet wird

### Datenbank-Verbindungsprobleme

1. Prüfen Sie die Datenbank-Logs: `docker-compose logs -f db`
2. Stellen Sie sicher, dass die Datenbank läuft: `docker-compose ps`
3. Überprüfen Sie die Umgebungsvariablen in `.docker.env`

## Sicherheitshinweise

- Ändern Sie die Standard-Zugangsdaten nach der ersten Anmeldung
- Für Produktionsumgebungen sollten Sie die Docker-Konfiguration anpassen:
  - Verwenden Sie sichere Passwörter für die Datenbank
  - Aktivieren Sie HTTPS mit einem gültigen Zertifikat
  - Beschränken Sie die Ports, die nach außen freigegeben werden

## Support

Bei Fragen oder Problemen wenden Sie sich bitte an den Support oder erstellen Sie ein Issue im Repository.