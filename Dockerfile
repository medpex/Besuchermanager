# Basis-Image
FROM node:20-slim

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm install

# Anwendungsdateien kopieren
COPY . .

# Build der Anwendung
RUN npm run build

# Port freigeben
EXPOSE 5000

# Anwendung starten
CMD ["npm", "run", "dev"]
