FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

RUN npm ci

COPY shared/ ./shared/
COPY client/ ./client/

WORKDIR /app/client
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
