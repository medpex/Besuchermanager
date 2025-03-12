#!/bin/sh
set -e

# Optimiere Cookie-Einstellungen für Docker
node session-fix.js

# Starte den Server
exec "$@"