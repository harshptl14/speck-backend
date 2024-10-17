import { PrismaClient } from '@prisma/client'
import Redis from "ioredis";
import { createClient } from 'redis';

let prisma = new PrismaClient()

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.connect();

// const redisClient = new Redis();

export { prisma, redisClient }