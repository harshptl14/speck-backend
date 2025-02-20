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

// import { PrismaClient } from '@prisma/client'
// import { createClient, RedisClientType } from 'redis';

// let prisma = new PrismaClient()

// const redisClient: RedisClientType = createClient({
//     url: process.env.REDIS_URL,
//     password: process.env.REDIS_PASSWORD,
// });

// // Error handling
// redisClient.on('error', (err) => {
//     console.error('Redis Client Error', err);
// });

// // Connection handling
// redisClient.connect().catch(console.error);

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//     await redisClient.disconnect();
//     await prisma.$disconnect();
// });

// export { prisma, redisClient }

import { PrismaClient } from '@prisma/client'
import { createClient, RedisClientType } from 'redis';

// const redis = require("redis");
let prisma = new PrismaClient()

const redisClient = createClient({
    socket: {
        host: process.env.host_redis,
        port: 6380,
        tls: true, // Required for Azure Redis over SSL
    },
    password: process.env.REDIS_PASSWORD,
});

(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Azure Redis successfully!");

        // Example: Set and get a value
        await redisClient.set("testKey", "Hello from Azure Redis!");
        const value = await redisClient.get("testKey");
        console.log("Fetched from Redis:", value);
    } catch (err) {
        console.error("Redis connection error:", err);
    }
})();

// Handle errors
redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
});

export { prisma, redisClient }
