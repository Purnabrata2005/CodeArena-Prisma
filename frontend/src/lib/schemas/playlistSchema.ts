import z from "zod";
import type { Problem } from "@/lib/schemas/problemSchema";


export const playlistSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  description: z.string().trim().optional(),
});

export type PlaylistValues = z.infer<typeof playlistSchema>;

export type BasicPlaylist = PlaylistValues & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
export type PlaylistProblemRelation = {
  id: string;
  playListId: string;
  problemId: string;
  createdAt: string;
  updatedAt: string;
  problem: Problem;
};
export type PlaylistWithProblems = PlaylistValues & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  problems: PlaylistProblemRelation[];
};