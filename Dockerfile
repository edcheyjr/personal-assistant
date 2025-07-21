FROM node:22-alpine3.19

WORKDIR /app

# Copy the package files
COPY package.json ./ 
COPY pnpm-lock.yaml ./ 

# Install pnpm globally and install dependencies
RUN npm install -g pnpm && pnpm install

# Install sharp package
RUN pnpm add sharp

# Copy the rest of the application files
COPY . .

# Expose port 3010
EXPOSE 3010

# Generate sitemaps
RUN pnpm postbuild

# Build the Next.js app for production
RUN pnpm build

# List directories to verify build
RUN ls -a

# Remove cache
RUN rm -rf .next/cache

# Start the Next.js app on port 3010
CMD ["pnpm", "start", "-p", "3010"]
