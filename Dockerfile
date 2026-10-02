FROM node:22-bookworm-slim

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["sh", "-c", "npm run prisma:deploy && node server/index.js"]
