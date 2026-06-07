import { redis } from "../db/redis.js";
import { db } from "../db/db.js";

const LEADERBOARD_KEY = "leaderboard:solved";

/**
 * Helper to calculate a user's streak from their submission history in PostgreSQL.
 * Chronological analysis is UTC-based for consistency.
 */
async function computeUserStreakFromDb(userId: string): Promise<{ currentStreak: number; maxStreak: number; lastActiveDate: string | null }> {
  const submissions = await db.submission.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  let currentStreak = 0;
  let maxStreak = 0;
  let lastActiveDate: string | null = null;

  for (const sub of submissions) {
    const dateStr = new Date(sub.createdAt).toISOString().split("T")[0];
    if (lastActiveDate === null) {
      currentStreak = 1;
      maxStreak = 1;
      lastActiveDate = dateStr;
    } else if (lastActiveDate === dateStr) {
      // Same day submission, streak stays the same
    } else {
      const lastDate = new Date(lastActiveDate);
      const nextDate = new Date(dateStr);
      const diffTime = Math.abs(nextDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      lastActiveDate = dateStr;
    }
  }

  return { currentStreak, maxStreak, lastActiveDate };
}

/**
 * Retrieve user's streak from Redis, or lazy-compute from DB if missing/empty.
 */
async function getOrComputeStreak(userId: string): Promise<{ currentStreak: number; maxStreak: number; lastActiveDate: string | null }> {
  const streakKey = `user:streak:${userId}`;

  try {
    const streakData = await redis.hgetall(streakKey);
    if (streakData && streakData.currentStreak !== undefined) {
      return {
        currentStreak: parseInt(streakData.currentStreak || "0", 10),
        maxStreak: parseInt(streakData.maxStreak || "0", 10),
        lastActiveDate: streakData.lastActiveDate || null,
      };
    }
  } catch (error) {
    console.error(`Failed to fetch streak from Redis for user ${userId}:`, error);
  }

  const computed = await computeUserStreakFromDb(userId);

  try {
    if (computed.lastActiveDate) {
      await redis.hmset(streakKey, {
        currentStreak: String(computed.currentStreak),
        maxStreak: String(computed.maxStreak),
        lastActiveDate: computed.lastActiveDate,
      });
    }
  } catch (error) {
    console.error(`Failed to cache computed streak in Redis for user ${userId}:`, error);
  }

  return computed;
}

/**
 * Bootstrap Redis leaderboard from PostgreSQL if it is empty.
 * Implements double-checked locking via a Redis lock key.
 */
export async function bootstrapLeaderboard(): Promise<void> {
  try {
    const exists = await redis.exists(LEADERBOARD_KEY);
    if (exists) return;

    const lockKey = "lock:bootstrap:leaderboard";
    const acquired = await redis.set(lockKey, "true", "PX", 15000, "NX"); // 15s lock
    if (!acquired) {
      // Concurrently bootstrapping. Wait and retry.
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const checkExists = await redis.exists(LEADERBOARD_KEY);
        if (checkExists) return;
      }
      return;
    }

    try {
      const checkExists = await redis.exists(LEADERBOARD_KEY);
      if (checkExists) return;

      console.log("Redis cache is empty. Bootstrapping leaderboard from database...");

      const userSolvedCounts = await db.problemSolved.groupBy({
        by: ["userId"],
        _count: {
          userId: true,
        },
      });

      const pipeline = redis.pipeline();
      for (const item of userSolvedCounts) {
        pipeline.zadd(LEADERBOARD_KEY, item._count.userId, item.userId);
      }
      await pipeline.exec();
      console.log("Redis leaderboard successfully bootstrapped.");
    } finally {
      await redis.del(lockKey);
    }
  } catch (error) {
    console.error("Failed to bootstrap Redis leaderboard:", error);
  }
}

/**
 * Increment user's solved count on successful problem completion
 */
export async function incrementUserScore(userId: string): Promise<void> {
  try {
    await bootstrapLeaderboard();
    const cacheExists = await redis.exists(LEADERBOARD_KEY);
    if (cacheExists === 1) {
      await redis.zincrby(LEADERBOARD_KEY, 1, userId);
    }
  } catch (error) {
    console.error("Failed to increment user score in Redis:", error);
  }
}

/**
 * Update user's streak when they submit code
 */
export async function updateStreak(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  try {
    const streakKey = `user:streak:${userId}`;
    const streak = await getOrComputeStreak(userId);

    let currentStreak = streak.currentStreak;
    let maxStreak = streak.maxStreak;
    const lastActiveDate = streak.lastActiveDate;

    if (lastActiveDate === today) {
      return; // Already active today, streak is maintained
    }

    if (lastActiveDate === yesterday) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }

    await redis.hmset(streakKey, {
      currentStreak: String(currentStreak),
      maxStreak: String(maxStreak),
      lastActiveDate: today,
    });
  } catch (error) {
    console.error(`Failed to update streak in Redis for user ${userId}:`, error);
  }
}

/**
 * Get user rank, solvedCount, and streak from Redis (falls back to PostgreSQL)
 */
export async function getUserRank(userId: string): Promise<{ solvedCount: number; rank: number; streak: number }> {
  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  let currentStreak = 0;

  try {
    const streak = await getOrComputeStreak(userId);
    currentStreak = streak.currentStreak;
    if (streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
      currentStreak = 0;
    }

    await bootstrapLeaderboard();

    const zeroIndexedRank = await redis.zrevrank(LEADERBOARD_KEY, userId);
    const scoreString = await redis.zscore(LEADERBOARD_KEY, userId);
    const totalUsers = await redis.zcard(LEADERBOARD_KEY);

    if (zeroIndexedRank === null) {
      return {
        solvedCount: 0,
        rank: totalUsers + 1,
        streak: currentStreak,
      };
    }

    return {
      solvedCount: scoreString ? parseInt(scoreString, 10) : 0,
      rank: zeroIndexedRank + 1,
      streak: currentStreak,
    };
  } catch (error) {
    console.error(`Redis error in getUserRank for user ${userId}, falling back to DB:`, error);

    try {
      const streak = await computeUserStreakFromDb(userId);
      currentStreak = streak.currentStreak;
      if (streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
        currentStreak = 0;
      }

      const userSolvedCounts = await db.problemSolved.groupBy({
        by: ["userId"],
        _count: {
          problemId: true,
        },
      });

      const ourCount = userSolvedCounts.find((u) => u.userId === userId)?._count.problemId ?? 0;
      let higherCount = 0;
      for (const u of userSolvedCounts) {
        if ((u._count.problemId ?? 0) > ourCount) {
          higherCount++;
        }
      }

      return {
        solvedCount: ourCount,
        rank: higherCount + 1,
        streak: currentStreak,
      };
    } catch (dbError) {
      console.error(`Database fallback failed in getUserRank for user ${userId}:`, dbError);
      return {
        solvedCount: 0,
        rank: 1,
        streak: 0,
      };
    }
  }
}

/**
 * Retrieve the top users from the leaderboard (falls back to PostgreSQL)
 */
export async function getGlobalLeaderboard(limit = 10): Promise<any[]> {
  let leaderboardData: { userId: string; solvedCount: number; rank: number }[] = [];

  try {
    await bootstrapLeaderboard();

    const topUsers = await redis.zrevrange(LEADERBOARD_KEY, 0, limit - 1, "WITHSCORES");
    for (let i = 0; i < topUsers.length; i += 2) {
      leaderboardData.push({
        userId: topUsers[i],
        solvedCount: parseInt(topUsers[i + 1], 10),
        rank: (i / 2) + 1,
      });
    }
  } catch (error) {
    console.error("Redis error in getGlobalLeaderboard, falling back to DB:", error);

    try {
      const userSolvedCounts = await db.problemSolved.groupBy({
        by: ["userId"],
        _count: {
          problemId: true,
        },
        orderBy: {
          _count: {
            problemId: "desc",
          },
        },
        take: limit,
      });

      leaderboardData = userSolvedCounts.map((item, index) => ({
        userId: item.userId,
        solvedCount: item._count.problemId ?? 0,
        rank: index + 1,
      }));
    } catch (dbError) {
      console.error("Database fallback failed in getGlobalLeaderboard:", dbError);
      return [];
    }
  }

  if (leaderboardData.length === 0) {
    return [];
  }

  try {
    const userIds = leaderboardData.map((item) => item.userId);
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return leaderboardData.map((item) => ({
      ...item,
      user: userMap.get(item.userId) || {
        name: "Deleted User",
        username: "deleted",
        avatarUrl: "",
      },
    }));
  } catch (dbError) {
    console.error("Failed to fetch user profiles for leaderboard:", dbError);
    return leaderboardData.map((item) => ({
      ...item,
      user: {
        name: "Unknown User",
        username: "unknown",
        avatarUrl: "",
      },
    }));
  }
}

/**
 * Get detailed streak statistics for a user (falls back to PostgreSQL)
 */
export async function getUserStreakDetails(userId: string): Promise<{ currentStreak: number; maxStreak: number; lastActiveDate: string | null }> {
  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  try {
    const streak = await getOrComputeStreak(userId);
    let currentStreak = streak.currentStreak;
    const maxStreak = streak.maxStreak;
    const lastActiveDate = streak.lastActiveDate;

    if (lastActiveDate && lastActiveDate !== today && lastActiveDate !== yesterday) {
      currentStreak = 0;
    }

    return {
      currentStreak,
      maxStreak,
      lastActiveDate,
    };
  } catch (error) {
    console.error(`Error in getUserStreakDetails for user ${userId}, falling back to DB:`, error);

    try {
      const streak = await computeUserStreakFromDb(userId);
      let currentStreak = streak.currentStreak;
      if (streak.lastActiveDate && streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
        currentStreak = 0;
      }
      return {
        currentStreak,
        maxStreak: streak.maxStreak,
        lastActiveDate: streak.lastActiveDate,
      };
    } catch (dbError) {
      console.error(`Database fallback failed in getUserStreakDetails for user ${userId}:`, dbError);
      return {
        currentStreak: 0,
        maxStreak: 0,
        lastActiveDate: null,
      };
    }
  }
}
