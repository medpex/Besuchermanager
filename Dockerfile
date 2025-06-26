FROM node:20-alpine

WORKDIR /app

# Umgebungsvariablen setzen
ENV NODE_ENV=production
ENV PORT=5000

# Paket- und Konfigurationsdateien kopieren
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

# Build ausführen
RUN npm run build

# Anwendung starten
EXPOSE 5000
CMD ["npm", "run", "start"] 