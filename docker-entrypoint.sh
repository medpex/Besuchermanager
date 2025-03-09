#!/bin/sh

# Warten auf die Datenbank
echo "Warte auf PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL ist bereit"

# Datenbank-Schema initialisieren
echo "Initialisiere Datenbank-Schema..."
npm run db:push

# Beispieldaten einfügen
echo "Füge Beispieldaten ein..."
node db-init.js

# Anwendung starten
echo "Starte die Anwendung..."
npm run dev
