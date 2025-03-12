FROM node:20-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /app

# PostgreSQL-Client installieren für Gesundheitschecks
RUN apk add --no-cache postgresql-client

# Abhängigkeiten zuerst kopieren und installieren für besseres Caching
COPY package*.json ./
RUN npm ci

# Rest der Anwendung kopieren
COPY . .

# Build der Anwendung
RUN npm run build

# Umgebungsvariablen
ENV NODE_ENV=production
ENV PORT=5000

# Ports
EXPOSE 5000

# Docker-Entrypoint
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

# Standard-Befehl
CMD ["npm", "start"]