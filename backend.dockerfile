FROM node:20

# Install pnpm
WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma

RUN npm install

RUN npx prisma generate

COPY . .

EXPOSE 4000
EXPOSE 8080
EXPOSE 5555

CMD ["npm", "run", "dev", "--inspect"]
