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

# Umgebungsvariable für Produktion
ENV NODE_ENV=production

# Startkommando
CMD ["node", "dist/index.js"]