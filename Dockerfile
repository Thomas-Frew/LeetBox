FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci

COPY server ./server
RUN npm run db:generate -w server
RUN npm run build -w server

CMD ["node", "server/dist/src/index.js"]