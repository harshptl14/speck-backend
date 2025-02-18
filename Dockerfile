FROM node:20

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN pnpm install --no-frozen-lockfile
RUN npx prisma generate

COPY . .
RUN pnpm run build  
# Ensure backend is built before running

EXPOSE 80
EXPOSE 8080
EXPOSE 5555

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm run start"]