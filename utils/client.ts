import { PrismaClient } from '@prisma/client';
import { createClient, RedisClientType } from 'redis';

const prisma = new PrismaClient();

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379',
    socket: {
        tls: true, // Enables SSL for Azure Redis
        rejectUnauthorized: false // Disable strict SSL verification if needed
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Connect with error handling
(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

export { prisma, redisClient };
