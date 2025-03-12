#!/bin/sh
# Docker Entrypoint-Skript für das Besuchererfassungssystem

echo "=== Docker-Entrypoint für Besuchererfassungssystem ==="

# Session-Fix-Skript ausführen, wenn vorhanden
if [ -f "/app/session-fix.js" ]; then
  echo "Konfiguriere Session-Einstellungen für Docker..."
  node /app/session-fix.js
fi

# Prüfen, ob die Datenbank bereit ist (einfacher Test)
echo "Warte auf Datenbankverbindung..."
RETRIES=10
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER || [ $RETRIES -eq 0 ]; do
  echo "Warte auf Postgres-Datenbank, verbleibende Versuche: $RETRIES..."
  RETRIES=$((RETRIES-1))
  sleep 1
done

if [ $RETRIES -eq 0 ]; then
  echo "Fehler: Konnte keine Verbindung zur Datenbank herstellen."
  exit 1
fi

echo "Datenbank ist bereit."

# Anwendung starten
echo "Starte Anwendung..."
exec "$@"