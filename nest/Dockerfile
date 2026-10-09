# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

RUN chmod +x /app/docker-entrypoint.sh && chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/auth/session').then(r => process.exit(r.status === 401 ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
