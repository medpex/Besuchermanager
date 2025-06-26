FROM node:20-alpine

WORKDIR /app

# Umgebungsvariablen setzen
ENV NODE_ENV=development
ENV PORT=5000

# Paket- und Konfigurationsdateien kopieren
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./
COPY theme.json ./

# Build-Tools global installieren
RUN npm install -g vite esbuild

# Dependencies inkl. devDependencies installieren
RUN npm ci

# Quellcode kopieren
COPY client/ ./client/
COPY server/ ./server/
COPY db/ ./db/

# Build ausführen
RUN npm run build

# Production-Umgebung für den Start
ENV NODE_ENV=production

# Anwendung starten
EXPOSE 5000
CMD ["npm", "run", "start"] 