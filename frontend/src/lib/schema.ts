import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string({ message: "Name is required" }).min(3),
    email: z.string({ message: "Email is required" }).email().min(5).max(50),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must at least 8 characters" })
      .regex(/[A-Z]/, "Password at leat One Uppercase")
      .regex(/[a-z]/, "Password at least one lowercase")
      .regex(/[0-9]/, "Password at least one number")
      .regex(/[@#$%^&*]/, "Password at least one special character"),
    // confirmPassword: z.string({ message: "Confirm password is required" }),
  })
  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Password and confirm password must be same",
  //   path: ["confirmPassword"],
  // });
export type SignupData = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string({ message: "Email is required" }).email().min(5).max(50),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must at least 8 characters" })
    .regex(/[A-Z]/, "Password at leat One Uppercase")
    .regex(/[a-z]/, "Password at least one lowercase")
    .regex(/[0-9]/, "Password at least one number")
    .regex(/[@#$%^&*]/, "Password at least one special character"),
});
export type LoginData = z.infer<typeof loginSchema>;

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export const updateUserProfileSchema = z.object({
  name: z.string().max(255),
  bio: z.string().max(255).optional(),
  avatar: z
    .custom<File | undefined>(
      (file) => {
        if (!file) return true; // allow optional
        return file instanceof File && imageMimeTypes.includes(file.type);
      },
      {
        message: "Avatar must be a valid image file (jpg, png, webp).",
      },
    )
    .optional(),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;
