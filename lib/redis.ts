import { Engine } from '@prisma/client';
import Redis from 'ioredis';
import Redlock from 'redlock';

export const redis = new Redis(process.env.REDIS_URL);
export const redlock = new Redlock(
    [redis],
    {
        driftFactor: 0.01,
        retryCount: 10,
        retryDelay: 100,
        retryJitter: 50,
        automaticExtensionThreshold: 500,
    }
    );


export async function wakeUp(engine: Engine) {
    let pipeline = redis.pipeline();
    pipeline.lpush(`wake:${engine.id}`, '1');
    pipeline.expire(`wake:${engine.id}`, 3);
    await pipeline.exec();
}

export async function sleepUntilWake(engine: Engine, timeout: number) {
    const duplicate = redis.duplicate();

    try {
        await duplicate.del(`wake:${engine.id}`);
        await duplicate.blpop(`wake:${engine.id}`, timeout);
    } finally {
        duplicate.disconnect();
    }
}
