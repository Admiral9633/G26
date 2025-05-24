FROM node:18-alpine

WORKDIR /app

# Installiere Abhängigkeiten
COPY package.json package-lock.json* ./
RUN npm ci

# Kopiere den Rest des Codes
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]