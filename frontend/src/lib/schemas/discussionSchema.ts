import z from "zod/v3";

export const discussionSchema = z.object({
  message: z
    .string({
      required_error: "message is required.",
      invalid_type_error: "message must be a string.",
    })
    .min(1, { message: "message cannot be empty." })
    .max(255, { message: "message must be at most 255 characters." }),
});
export type DiscussionValues = z.infer<typeof discussionSchema>;

export type Discussion = DiscussionValues & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
export type DiscussionWithUser = Discussion & {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
};