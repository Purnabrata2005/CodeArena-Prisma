import z from "zod";

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

export interface UserRankForSolvedProblems {
  solvedCount: number;
  rank: number;
}