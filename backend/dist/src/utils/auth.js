import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "../db/db.js";
export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    user: {
        fields: {
            image: "avatarUrl",
            emailVerified: "isEmailVerified",
        },
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
            },
            username: {
                type: "string",
            },
            avatarLocalPath: {
                type: "string",
            },
            bio: {
                type: "string",
            },
        },
    },
});
//# sourceMappingURL=auth.js.map