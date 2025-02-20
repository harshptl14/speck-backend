import Redis from 'ioredis';

const redisClient = new Redis(
    process.env.REDIS_URL!, {
    tls: {
        rejectUnauthorized: false, // Required for Azure Redis SSL
    },
    connectTimeout: 20000,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    },
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