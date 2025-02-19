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
    url: process.env.REDIS_URL || 'rediss://speckrd.redis.cache.windows.net:6380',
    password: process.env.REDIS_PASSWORD,
    socket: {
        tls: true,
        rejectUnauthorized: true,
        // Ensuring TLS 1.2 or higher
        minVersion: 'TLSv1.2'
    }
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