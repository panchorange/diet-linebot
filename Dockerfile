# Base image with Bun on Debian for better node-canvas support
FROM oven/bun:1-debian

WORKDIR /app

# System dependencies for node-canvas, font rendering, OpenSSL, and Puppeteer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        # Canvas dependencies
        libcairo2 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libjpeg62-turbo \
        libpng16-16 \
        libgif7 \
        librsvg2-2 \
        fonts-noto-cjk \
        openssl \
        # Puppeteer/Chrome dependencies for prisma-erd-generator
        libnss3 \
        libnspr4 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libdbus-1-3 \
        libxss1 \
        libxtst6 \
        libatspi2.0-0 \
        libx11-6 \
        libxcomposite1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libxcb1 \
        libxkbcommon0 \
        libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Create docs directory for prisma-erd-generator
RUN mkdir -p /app/docs/database

# Install dependencies - bun.lockを使用
COPY package.json bun.lock tsconfig.json ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile \
    && bun prisma generate

# Copy source
COPY src ./src

# .env.localがある場合のみコピー（オプショナル）
COPY .env ./

# Environment
ENV NODE_ENV=production

# Cloud Run provides $PORT; app reads it via env.ts
EXPOSE 8080

# Start the server
CMD ["bun", "src/index.ts"]