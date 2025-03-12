#!/bin/sh
set -e

# Modifiziere die auth.ts-Datei, um sichere Cookies zu deaktivieren
sed -i 's/secure: true/secure: process.env.COOKIE_SECURE === "false" ? false : true/' /app/server/auth.ts

# Die ursprüngliche CMD ausführen
exec "$@"