FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

RUN npm ci

COPY shared/ ./shared/
COPY server/ ./server/

WORKDIR /app/server
ENV NODE_ENV=production

CMD ["sh", "-c", "npx knex migrate:latest && npx tsx src/index.ts"]
