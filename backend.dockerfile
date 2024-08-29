FROM node:20

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 4000
EXPOSE 5555

CMD ["pnpm", "run", "dev", "--inspect"]
