FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

RUN npm install

COPY shared/ ./shared/
COPY client/ ./client/

WORKDIR /app/client
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
