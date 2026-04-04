import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { randomUUID } from "node:crypto";
import "dotenv/config";

import { db } from "../db/db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        const displayName = profile?.displayName?.trim() || "";
        const photo = profile?.photos?.[0]?.value;

        if (!email) {
          return done(new Error("Email not provided by Google"));
        }

        const existingUser = await db.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          const updates = {};

          if (photo && !existingUser.avatarUrl) {
            updates.avatarUrl = photo;
          }

          if (!existingUser.authProvider) {
            updates.authProvider = "google";
          }

          if (Object.keys(updates).length > 0) {
            const updatedUser = await db.user.update({
              where: { email },
              data: updates,
            });

            return done(null, updatedUser);
          }

          return done(null, existingUser);
        }

        const username = email.split("@")[0];

        const newUser = await db.user.create({
          data: {
            name: displayName || username,
            email,
            username,
            password: randomUUID(),
            avatarUrl: photo,
            authProvider: "google",
            isEmailVerified: true,
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(
          error instanceof Error ? error : new Error("Authentication failed"),
        );
      }
    },
  ),
);

export default passport;