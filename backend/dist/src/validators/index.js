import { z } from "zod";
import { UserRolesEnum } from "../utils/constants.js";
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
    role: z.enum([UserRolesEnum.USER, UserRolesEnum.ADMIN]).default(UserRolesEnum.USER),
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
        .string()
        .min(1, "Code cannot be empty"),
    language: z
        .string()
        .min(1, "Language cannot be empty"),
    problemTitle: z
        .string()
        .min(1, "Problem title cannot be empty"),
});
export const createDiscussionSchema = z.object({
    message: z
        .string()
        .min(1, "Message cannot be empty")
        .max(1000, "Message cannot exceed 1000 characters"),
});
//# sourceMappingURL=index.js.map