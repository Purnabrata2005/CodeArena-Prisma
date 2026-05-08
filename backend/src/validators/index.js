import { z } from "zod";
import { UserRolesEnum, AvailableUserRoles } from "../utils/constants.js";

export const userRegisterSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be less than 20 characters"),

  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  role: z.enum([...AvailableUserRoles]).default(UserRolesEnum.USER),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string(),
});

export const userUpdateSchema = z.object({
  name: z.string().max(255).optional(),
  bio: z.string().max(255).optional(),
  avatar: z.any().optional(),
});


export const codeReviewSchema = z.object({
  code: z
    .string({
      required_error: "Code is required",
      invalid_type_error: "Code must be a string",
    })
    .min(1, "Code cannot be empty"),

  language: z
    .string({
      required_error: "Language is required",
      invalid_type_error: "Language must be a string",
    })
    .min(1, "Language cannot be empty"),

  problemTitle: z
    .string({
      required_error: "Problem title is required",
      invalid_type_error: "Problem title must be a string",
    })
    .min(1, "Problem title cannot be empty"),
});