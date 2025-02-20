// import Redis from 'ioredis';
import { createClient } from 'redis';

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Successfully connected to Azure Redis Cache');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    redisClient.disconnect();
});

export default redisClient; 