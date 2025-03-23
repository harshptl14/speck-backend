// import { PrismaClient } from '@prisma/client';
// import { createClient, RedisClientType } from 'redis';

// const prisma = new PrismaClient();

// const redisClient: RedisClientType = createClient({
//     url: process.env.REDIS_URL || 'redis://redis:6379',
//     socket: {
//         tls: true, // Enables SSL for Azure Redis
//         rejectUnauthorized: false, // Disable strict SSL verification if needed
//     }
// });

// redisClient.on('error', (err) => {
//     console.error('Redis Client Error:', err);
// });

// redisClient.on('connect', () => {
//     console.log('Connected to Redis');
// });

// // Connect with error handling
// (async () => {
//     try {
//         await redisClient.connect();
//     } catch (error) {
//         console.error('Failed to connect to Redis:', error);
//     }
// })();

// // Graceful shutdown for Prisma and Redis connections
// process.on('SIGINT', async () => {
//     console.log('Gracefully shutting down...');
//     try {
//         await redisClient.quit();
//         console.log('Redis connection closed.');
//     } catch (err) {
//         console.error('Error closing Redis connection:', err);
//     }

//     try {
//         await prisma.$disconnect();
//         console.log('Prisma connection closed.');
//     } catch (err) {
//         console.error('Error closing Prisma connection:', err);
//     }
//     process.exit(0);
// });

// export { prisma, redisClient };


import { PrismaClient } from '@prisma/client';
import { createClient, RedisClientType } from 'redis';

const isProduction = process.env.NODE_ENV === 'production';

const prisma = new PrismaClient();

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        tls: isProduction, // Use TLS in production (e.g., Azure Cache for Redis)
        rejectUnauthorized: false,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Gracefully shutting down...');
    try {
        await redisClient.quit();
        console.log('Redis connection closed.');
    } catch (err) {
        console.error('Error closing Redis connection:', err);
    }
    try {
        await prisma.$disconnect();
        console.log('Prisma connection closed.');
    } catch (err) {
        console.error('Error closing Prisma connection:', err);
    }
    process.exit(0);
});

export { prisma, redisClient };