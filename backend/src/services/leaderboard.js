import { redis } from "../db/redis.js";
import { db } from "../db/db.js";

const LEADERBOARD_KEY = "leaderboard:solved";
let isBootstrapping = false;

/**
 * Bootstrap Redis from PostgreSQL if it is empty
 */
export async function bootstrapLeaderboard() {
  const exists = await redis.exists(LEADERBOARD_KEY);
  if (exists) return;

  if (isBootstrapping) {
    return; // Prevent concurrent bootstrapping
  }
  isBootstrapping = true;

  try {
    console.log("Redis cache is empty. Bootstrapping leaderboard & streaks from database...");

    // 1. Bootstrap solved counts (Leaderboard)
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

    // 2. Bootstrap streaks from submissions
    const submissions = await db.submission.findMany({
      select: {
        userId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const userSubmissions = {};
    for (const sub of submissions) {
      if (!userSubmissions[sub.userId]) {
        userSubmissions[sub.userId] = [];
      }
      userSubmissions[sub.userId].push(sub);
    }

    for (const [uid, subs] of Object.entries(userSubmissions)) {
      let currentStreak = 0;
      let maxStreak = 0;
      let lastActiveDate = null;

      for (const sub of subs) {
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
          const diffTime = Math.abs(nextDate - lastDate);
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

      if (lastActiveDate) {
        pipeline.hmset(`user:streak:${uid}`, {
          currentStreak: String(currentStreak),
          maxStreak: String(maxStreak),
          lastActiveDate: lastActiveDate,
        });
      }
    }

    await pipeline.exec();
    console.log("Redis cache successfully bootstrapped.");
  } catch (error) {
    console.error("Failed to bootstrap Redis:", error);
  } finally {
    isBootstrapping = false;
  }
}

/**
 * Increment user's solved count on successful problem completion
 */
export async function incrementUserScore(userId) {
  await bootstrapLeaderboard();
  await redis.zincrby(LEADERBOARD_KEY, 1, userId);
}

/**
 * Update user's streak when they submit code
 */
export async function updateStreak(userId) {
  await bootstrapLeaderboard();

  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  const streakKey = `user:streak:${userId}`;
  const streakData = await redis.hgetall(streakKey);

  let currentStreak = parseInt(streakData.currentStreak || "0", 10);
  let maxStreak = parseInt(streakData.maxStreak || "0", 10);
  const lastActiveDate = streakData.lastActiveDate;

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
}

/**
 * Get user rank, solvedCount, and streak from Redis
 */
export async function getUserRank(userId) {
  await bootstrapLeaderboard();

  const zeroIndexedRank = await redis.zrevrank(LEADERBOARD_KEY, userId);
  const scoreString = await redis.zscore(LEADERBOARD_KEY, userId);
  const totalUsers = await redis.zcard(LEADERBOARD_KEY);

  const streakKey = `user:streak:${userId}`;
  const streakData = await redis.hgetall(streakKey);

  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  let currentStreak = 0;
  if (streakData && streakData.currentStreak) {
    currentStreak = parseInt(streakData.currentStreak, 10);
    const lastActiveDate = streakData.lastActiveDate;
    
    // Check if the streak has expired (no submission today or yesterday)
    if (lastActiveDate !== today && lastActiveDate !== yesterday) {
      currentStreak = 0;
    }
  }

  if (zeroIndexedRank === null) {
    return {
      solvedCount: 0,
      rank: totalUsers + 1,
      streak: currentStreak,
    };
  }

  return {
    solvedCount: parseInt(scoreString, 10),
    rank: zeroIndexedRank + 1,
    streak: currentStreak,
  };
}

/**
 * Retrieve the top users from the leaderboard
 */
export async function getGlobalLeaderboard(limit = 10) {
  await bootstrapLeaderboard();

  const topUsers = await redis.zrevrange(LEADERBOARD_KEY, 0, limit - 1, "WITHSCORES");

  const leaderboardData = [];
  for (let i = 0; i < topUsers.length; i += 2) {
    leaderboardData.push({
      userId: topUsers[i],
      solvedCount: parseInt(topUsers[i + 1], 10),
      rank: (i / 2) + 1,
    });
  }

  if (leaderboardData.length === 0) {
    return [];
  }

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
}

/**
 * Get detailed streak statistics for a user
 */
export async function getUserStreakDetails(userId) {
  await bootstrapLeaderboard();

  const streakKey = `user:streak:${userId}`;
  const streakData = await redis.hgetall(streakKey);

  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  let currentStreak = parseInt(streakData.currentStreak || "0", 10);
  const maxStreak = parseInt(streakData.maxStreak || "0", 10);
  const lastActiveDate = streakData.lastActiveDate || null;

  if (lastActiveDate && lastActiveDate !== today && lastActiveDate !== yesterday) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    maxStreak,
    lastActiveDate,
  };
}
