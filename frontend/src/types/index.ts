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

export type LanguageKey = "JAVASCRIPT" | "PYTHON" | "JAVA";

export type UserSubmissionStats = {
  totalSubmissions: number;
  submissionsLast24Hours: number;
  mostUsedLanguage: string;
  successRate: number;
  totalLanguagesUsed: number;
  totalSuccesses: number;
};
export type SubmissionHeatmapEntry = {
  date: string; // Format: YYYY-MM-DD
  count: number;
};


