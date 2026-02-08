FROM node:20-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Build
COPY . .
RUN npm run build

# Create data directory
RUN mkdir -p /app/data /app/public/albums

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed || true; npx next start"]
