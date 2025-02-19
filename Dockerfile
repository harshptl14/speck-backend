FROM node:20

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN pnpm i --no-frozen-lockfile
RUN npx prisma generate

COPY . .
RUN pnpm run build  
# Ensure backend is built before running

EXPOSE 4000
EXPOSE 8080
EXPOSE 5555
EXPOSE 6380

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm run start"]