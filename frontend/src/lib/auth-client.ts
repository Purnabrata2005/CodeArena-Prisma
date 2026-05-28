import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth`,
});
