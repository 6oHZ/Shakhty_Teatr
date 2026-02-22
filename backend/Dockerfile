FROM node:20-alpine AS builder
LABEL authors="genbych"
WORKDIR /app
COPY package*.json ./
COPY prisma.config.ts ./


RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .
RUN npm run build


FROM node:20-alpine
WORKDIR /app
COPY package*.json ./


RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000
CMD ["node", "dist/index.js"]