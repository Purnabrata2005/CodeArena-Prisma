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