#!/bin/bash

# Dieses Skript korrigiert das Dockerfile für das Besuchererfassungssystem

# Aktualisiere das Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Umgebungsvariablen setzen
ENV NODE_ENV=production
ENV PORT=5000

# Dateien kopieren
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./
COPY theme.json ./

# Dependencies installieren
RUN npm ci

# Quellcode kopieren
COPY client/ ./client/
COPY server/ ./server/
COPY db/ ./db/

# Build ausführen - Fix für den Pfad zu den Binaries
RUN npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Anwendung starten
EXPOSE 5000
CMD ["npm", "run", "start"]
EOF

echo "Dockerfile wurde erfolgreich aktualisiert."
echo "Führen Sie nun 'docker-compose build --no-cache && docker-compose up -d' aus, um die Container neu zu bauen und zu starten." 