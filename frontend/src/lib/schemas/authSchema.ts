import { z } from "zod";

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const signUpSchema = z.object({
  name: z.string({ message: "Name is required" }).min(3),
  email: z.string({ message: "Email is required" }).email().min(5).max(50),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@#$%^&*]/, "Password must contain at least one special character"),
});

export type SignupData = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string({ message: "Email is required" }).email().min(5).max(50),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@#$%^&*]/, "Password must contain at least one special character"),
});

export type LoginData = z.infer<typeof loginSchema>;

// ─── Profile Schema ──────────────────────────────────────────────────────────

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export const updateUserProfileSchema = z.object({
  name: z.string().max(255),
  bio: z.string().max(255).optional(),
  avatar: z
    .custom<File | undefined>(
      (file) => {
        if (!file) return true;
        return file instanceof File && imageMimeTypes.includes(file.type);
      },
      {
        message: "Avatar must be a valid image file (jpg, png, webp).",
      },
    )
    .optional(),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

// ─── Re-exports (backward compatibility) ─────────────────────────────────────
// Problem-related schemas and types have been moved to `@/lib/schemas/problem.schema`.
// These re-exports ensure existing imports from `@/lib/schema` continue to work.

export {
  problemSchema,
  stepSchemas,
  type ProblemValues,
  type Problem,
  type ProblemWithSolvedStatus,
  type UserRankForSolvedProblems,
} from "@/lib/schemas/problemSchema";
