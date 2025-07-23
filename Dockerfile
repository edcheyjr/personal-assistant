# Use Node.js 20 with Alpine (smaller and more secure than 22)
FROM node:20-alpine3.19

# Set working directory
WORKDIR /app

# Install necessary packages for native dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

# Copy package files first for better layer caching
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies in a single layer
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile && \
    pnpm add sharp

# Copy application files
COPY . .

# Build optimizations
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate sitemaps and build
RUN pnpm postbuild && \
    pnpm build

# Clean up build artifacts and cache
RUN rm -rf .next/cache && \
    npm cache clean --force && \
    pnpm store prune

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3010 || exit 1

# Start the application
CMD ["pnpm", "start", "-p", "3010"]