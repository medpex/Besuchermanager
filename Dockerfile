FROM node:20-alpine

WORKDIR /app

# Installieren der Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopieren des Projektcodes
COPY . .

# Build der Anwendung
RUN npm run build

# Port freigeben
EXPOSE 5000

# Umgebungsvariablen für Produktion
ENV NODE_ENV=production
ENV COOKIE_SECURE=false
ENV COOKIE_SAMESITE=lax
ENV SESSION_SECRET=supersecretkey123

# Kopieren und ausführbar machen des Entrypoints
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Entrypoint und Startkommando
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]