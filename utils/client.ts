import { PrismaClient } from '@prisma/client'
import { createClient, RedisClientType } from 'redis';

let prisma = new PrismaClient()

// const redisClient: RedisClientType = createClient({
//     url: `redis://${process.env.host_redis}:6379`,
//     // url: `redis://localhost:6379`,
//     password: process.env.REDIS_PASSWORD,
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));

// redisClient.connect();

// const redisClient = new Redis();

export { prisma }


// const prisma = new PrismaClient();

// // Azure Redis connection URL and password
// const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; // Default to local if not set
// const redisPassword = process.env.REDIS_PASSWORD || ''; // Set in your environment variables

// const redisClient: RedisClientType = createClient({
//     url: redisUrl,
//     password: redisPassword, // Add password if required
//     socket: {
//         reconnectStrategy: (retries) => Math.min(retries * 50, 500), // Exponential backoff for retries
//     }
// });

// // Error handling
// redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));

// // Connect to Redis
// (async () => {
//     try {
//         await redisClient.connect();
//         console.log('✅ Connected to Azure Redis successfully!');
//     } catch (error) {
//         console.error('❌ Failed to connect to Redis:', error);
//     }
// })();

// export { prisma, redisClient };


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

// import { PrismaClient } from '@prisma/client'
// import { createClient, RedisClientType } from 'redis';

// // const redis = require("redis");
// let prisma = new PrismaClient()

// const redisClient = createClient({
//     socket: {
//         host: process.env.host_redis,
//         port: 6380,
//         tls: true, // Required for Azure Redis over SSL
//     },
//     password: process.env.REDIS_PASSWORD,
// });

// (async () => {
//     try {
//         await redisClient.connect();
//         console.log("Connected to Azure Redis successfully!");

//         // Example: Set and get a value
//         await redisClient.set("testKey", "Hello from Azure Redis!");
//         const value = await redisClient.get("testKey");
//         console.log("Fetched from Redis:", value);
//     } catch (err) {
//         console.error("Redis connection error:", err);
//     }
// })();

// // Handle errors
// redisClient.on("error", (err) => {
//     console.error("Redis Client Error", err);
// });

// export { prisma, redisClient }
