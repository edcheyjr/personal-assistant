FROM node:22-alpine3.19

WORKDIR /app

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Install sharp (for Next.js image optimization)
RUN pnpm add sharp

# Copy the rest of the files
COPY . .

# Build the Next.js app
RUN pnpm build

# Verify the build exists
RUN ls -la .next

# Start the app
CMD ["pnpm", "start", "-p", "3010"]