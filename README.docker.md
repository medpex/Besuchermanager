# Docker Installation - Besuchererfassungssystem

## Voraussetzungen
- Docker
- Docker Compose

## Installation

1. Projekt-ZIP entpacken:
```bash
unzip besuchererfassung.zip
cd besuchererfassung
```

2. Setup-Skript ausführen (empfohlen):
```bash
chmod +x setup.sh
./setup.sh
```

ODER

3. Docker-Container manuell bauen und starten:
```bash
docker-compose up -d
```

4. Manuelle Datenbank-Initialisierung:
```bash
docker-compose exec app npm run db:push
docker-compose exec app node db-init.js
docker-compose exec app node scripts/create_admin.ts
```

## Zugangsdaten

### Anwendung
- URL: http://localhost:5000
- Admin Benutzer: admin/J123654789j
- Normaler Benutzer: benutzer/user123

### Datenbank
- Host: localhost
- Port: 5432
- Datenbank: besucherdb
- Benutzer: postgres
- Passwort: postgres

## Container verwalten

- Container stoppen: `docker-compose stop`
- Container starten: `docker-compose start`
- Container neustarten: `docker-compose restart`
- Container und Daten löschen: `docker-compose down -v`
- Logs anzeigen: `docker-compose logs -f`

## Datenbank-Backup

Backup erstellen:
```bash
docker-compose exec db pg_dump -U postgres besucherdb > backup.sql
```

Backup einspielen:
```bash
cat backup.sql | docker-compose exec -T db psql -U postgres besucherdb
```

## Fehlersuche

Überprüfen der Logs der Anwendung:
```bash
docker-compose logs -f app
```

Überprüfen der Logs der Datenbank:
```bash
docker-compose logs -f db
```

Neustart der Container:
```bash
docker-compose restart
```

Vollständig entfernen und neu starten (Daten werden gelöscht):
```bash
docker-compose down -v
docker-compose up -d
./setup.sh
```
