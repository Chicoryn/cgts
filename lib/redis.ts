import { Engine } from '@prisma/client';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function wakeUp(engine: Engine) {
    let pipeline = redis.pipeline();
    pipeline.lpush(`wake:${engine.id}`, '1');
    pipeline.expire(`wake:${engine.id}`, 3);
    await pipeline.exec();
}

export async function sleepUntilWake(engine: Engine, timeout: number) {
    await redis.blpop(`wake:${engine.id}`, timeout);
}
