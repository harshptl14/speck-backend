// import { PrismaClient } from '@prisma/client'
// import { createClient, RedisClientType } from 'redis';

// let prisma = new PrismaClient()

// const redisClient: RedisClientType = createClient({
//     url: process.env.REDIS_URL || 'redis://redis:6379'
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));

// redisClient.connect();

// // const redisClient = new Redis();

// export { prisma, redisClient }

import { PrismaClient } from '@prisma/client'
import { createClient, RedisClientType } from 'redis';

let prisma = new PrismaClient()

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
});

// Error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

// Connection handling
redisClient.connect().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
    await redisClient.disconnect();
    await prisma.$disconnect();
});

export { prisma, redisClient }