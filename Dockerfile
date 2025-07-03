# Utiliser Node.js 18 comme image de base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Installer les dépendances
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copier le code source
COPY . .

# Construire l'application React
RUN cd client && npm run build

# Exposer le port
EXPOSE 5000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Script de démarrage
CMD ["npm", "start"] 