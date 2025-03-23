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

// Clean REDIS_URL by removing ?ssl=true if present
const redisUrl = (process.env.REDIS_URL || 'redis://localhost:6379').split('?')[0];

const prisma = new PrismaClient();

const redisClient: RedisClientType = createClient({
    url: redisUrl, // e.g., redis://default:<password>@speck-redis.redis.cache.windows.net:6380
    socket: {
        tls: isProduction,
        rejectUnauthorized: true, // Enforce strict TLS validation (Azure certs are valid)
        minVersion: 'TLSv1.2', // Match Azure's minimum TLS version
        keepAlive: 5000, // Send keep-alive every 5s (Azure idle timeout is 10min)
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Max Redis reconnection attempts reached');
                return new Error('Max retries reached');
            }
            const delay = Math.min(retries * 500, 5000);
            console.log(`Reconnecting to Redis, attempt ${retries + 1}, delay ${delay}ms`);
            return delay;
        },
    },
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});

redisClient.on('end', () => {
    console.log('Redis connection closed unexpectedly');
});

// Periodic ping to prevent idle timeout
if (isProduction) {
    setInterval(async () => {
        try {
            await redisClient.ping();
            console.log('Redis ping successful');
        } catch (err) {
            console.error('Redis ping failed:', err);
        }
    }, 30000); // Ping every 30s
}

(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis initially:', error);
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