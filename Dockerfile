FROM node:20-alpine

WORKDIR /app

# Installiere Dependencies
COPY package*.json ./
RUN npm install

# Kopiere den Rest des Projekts
COPY . .

# Baue das Projekt
RUN npm run build

# Exponiere den Port
EXPOSE 5000

# Starte die Anwendung
CMD ["npm", "start"]