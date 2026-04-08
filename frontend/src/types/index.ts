export type AuthUser = {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  avatarLocalPath?: string;
  bio?: string;
  role: "ADMIN" | "USER";
};

export const DIFFICULTY = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];
