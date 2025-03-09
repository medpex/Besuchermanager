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

2. Docker-Container bauen und starten:
```bash
docker-compose up -d
```

## Zugangsdaten

### Anwendung
- URL: http://localhost:5000
- Admin Benutzer: admin/admin123
- Normaler Benutzer: benutzer/user123

### Datenbank
- Host: localhost
- Port: 5432
- Datenbank: visitor_tracking
- Benutzer: visitor_app
- Passwort: visitor_password

## Container verwalten

- Container stoppen: `docker-compose stop`
- Container starten: `docker-compose start`
- Container neustarten: `docker-compose restart`
- Container und Daten löschen: `docker-compose down -v`
- Logs anzeigen: `docker-compose logs -f`

## Datenbank-Backup

Backup erstellen:
```bash
docker exec visitor_tracking_db_1 pg_dump -U visitor_app visitor_tracking > backup.sql
```

Backup einspielen:
```bash
cat backup.sql | docker exec -i visitor_tracking_db_1 psql -U visitor_app visitor_tracking
```
