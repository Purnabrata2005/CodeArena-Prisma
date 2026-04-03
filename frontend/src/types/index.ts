export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "ADMIN" | "USER";
};