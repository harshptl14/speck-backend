# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install

# Copy source code
COPY . .

# Generate Prisma client and build
RUN pnpm prisma generate && \
    pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN npm install -g pnpm && \
    pnpm install --prod

# Copy built files and prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/index.js"]