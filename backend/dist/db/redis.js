import { Redis } from "ioredis";
const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
export const redis = new Redis(redisUrl);
redis.on("connect", () => {
    console.log("Connected to Redis server successfully");
});
redis.on("error", (err) => {
    console.error("Redis Connection Error:", err);
});
//# sourceMappingURL=redis.js.map