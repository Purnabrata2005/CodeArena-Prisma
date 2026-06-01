import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        username: { type: "string", required: false },
        bio: { type: "string", required: false },
        role: { type: "string", required: false },
        avatarLocalPath: { type: "string", required: false },
      },
    }),
  ],
});
