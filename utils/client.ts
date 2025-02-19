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

// Initialize Prisma
const prisma = new PrismaClient()

// Redis client configuration
const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
        servername: 'speckrd.redis.cache.windows.net',
        rejectUnauthorized: true,
        port: 6380,
        // Azure Redis requires TLS 1.2
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        reconnectStrategy: (retries, cause) => {
            if (retries > 10) return false;
            return Math.min(retries * 100, 3000);
        }
    }
});

function logToConsole(message: string) {
    console.log(message);
    process.stdout.write(''); // Forces immediate flush
}

// Error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', JSON.stringify({
        message: err.message,
        code: err.code,
        stack: err.stack,
        timestamp: new Date().toISOString()
    }, null, 2));
    logToConsole(`Redis Client Error: ${err.message}`);
    process.stdout.write('\n'); // Ensures logs are written properly
});



// Connection status monitoring
redisClient.on('connect', () => {
    console.log('Redis client connecting...');
});

redisClient.on('ready', () => {
    console.log('Redis client ready');
});

redisClient.on('end', () => {
    console.log('Redis client connection ended');
});

redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
});

// Connect with error handling
async function initializeRedis() {
    try {
        await redisClient.connect();
        console.log('Successfully connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Optionally implement a reconnection strategy here
        // or let the application handle the error
        throw error;
    }
}

// Initialize Redis connection
initializeRedis().catch(console.error);

export { prisma, redisClient }