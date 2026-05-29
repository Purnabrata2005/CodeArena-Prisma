import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "../db/db.js";
import { sendEmail, emailVerificationMailgenContent } from "./mail.js";

const generateUniqueUsername = async (email: string, name?: string | null): Promise<string> => {
  let baseUsername = (name || email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  
  if (baseUsername.length < 3) {
    baseUsername = "user_" + baseUsername;
  }
  
  if (baseUsername.length > 15) {
    baseUsername = baseUsername.slice(0, 15);
  }
  
  let username = baseUsername;
  let isUnique = false;
  let counter = 0;
  
  while (!isUnique) {
    const existingUser = await db.user.findUnique({
      where: { username },
    });
    
    if (!existingUser) {
      isUnique = true;
    } else {
      counter++;
      username = `${baseUsername}${counter}`;
    }
  }
  
  return username;
};

export const auth = betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const username = await generateUniqueUsername(user.email, user.name);
          return {
            data: {
              ...user,
              username,
            },
          };
        },
      },
    },
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ["http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        email: user.email,
        subject: "Verify your email - LeetLab",
        mailgenContent: emailVerificationMailgenContent(
          user.name || user.email,
          url
        ),
      });
    },
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
