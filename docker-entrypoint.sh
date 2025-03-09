#!/bin/sh
set -e

echo "===== Besuchererfassungssystem Docker Entrypoint ====="

# Warten auf die Datenbank
echo "⏳ Warte auf PostgreSQL..."
i=0
while ! nc -z db 5432; do
  i=$((i+1))
  if [ $i -gt 30 ]; then
    echo "❌ Timeout: PostgreSQL ist nicht erreichbar"
    exit 1
  fi
  sleep 1
  echo "  Warte auf PostgreSQL... ($i/30)"
done
echo "✅ PostgreSQL ist bereit"

# Umgebungsvariablen prüfen
echo "🔑 Prüfe Umgebungsvariablen..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ Warnung: DATABASE_URL ist nicht gesetzt. Verwende Standard-URL."
  export DATABASE_URL="postgresql://postgres:postgres@db:5432/besucherdb"
fi

# Datenbank-Schema initialisieren
echo "🔄 Initialisiere Datenbank-Schema..."
npm run db:push

# In Produktionsumgebung zuerst bauen
if [ "$NODE_ENV" = "production" ]; then
  echo "🏗️ Produktionsumgebung erkannt. Baue Anwendung..."
  npm run build
  
  echo "🚀 Starte die Anwendung im Produktionsmodus..."
  npm run start
else
  # Anwendung im Entwicklungsmodus starten
  echo "🚀 Starte die Anwendung im Entwicklungsmodus..."
  npm run dev
fi
