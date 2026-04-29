import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import type {
  Problem,
  ProblemValues,
  ProblemWithSolvedStatus,
  UserRankForSolvedProblems,
} from "@/lib/schemas/problem.schema";
import { toast } from "sonner";

type ApiResponse = {
  message?: string;
  [key: string]: unknown;
};

interface ProblemStore {
  problems: ProblemWithSolvedStatus[];
  problem: Problem | null;
  solvedProblemsByUser: Problem[];
  userRank: UserRankForSolvedProblems | null;

  isProblemsLoading: boolean;
  isProblemLoading: boolean;
  isCreatingProblem: boolean;
  isUpdatingProblem: boolean;

  createProblem: (data: ProblemValues) => Promise<ApiResponse>;
  updateProblem: (
    id: string,
    data: Partial<ProblemValues>,
  ) => Promise<ApiResponse>;
  getAllProblems: () => Promise<void>;
  getProblemById: (id: string) => Promise<void>;
  getSolvedProblemsByUser: () => Promise<void>;
  removeProblem: (id: string) => void;
  getUserSolvedProblemsRank: (id: string) => Promise<void>;
}

export const useProblemStore = create<ProblemStore>((set) => ({
  problems: [],
  problem: null,
  solvedProblemsByUser: [],
  userRank: null,
  isProblemsLoading: false,
  isProblemLoading: false,
  isCreatingProblem: false,
  isUpdatingProblem: false,

  createProblem: async (data) => {
    try {
      set({ isCreatingProblem: true });
      const res = await axiosInstance.post("/problem/create-problem", data);
      return res.data;
    } catch (error) {
      console.error("Error creating problem:", error);
      throw error;
    } finally {
      set({ isCreatingProblem: false });
    }
  },

  updateProblem: async (id, data) => {
    try {
      set({ isUpdatingProblem: true });
      const payload = {
        ...data,
        ...(data.testCases ? { testCases: data.testCases } : {}),
      };
      const res = await axiosInstance.put(
        `/problem/update-problem/${id}`,
        payload,
      );
      return res.data;
    } catch (error) {
      console.error("Error updating problem:", error);
      throw error;
    } finally {
      set({ isUpdatingProblem: false });
    }
  },

  getAllProblems: async () => {
    try {
      set({ isProblemsLoading: true });
      const res = (await axiosInstance.get("/problem/get-all-problem")).data;

      const normalizedProblems = (
        res.data.data as Array<Problem & { isSolved?: boolean }>
      ).map((raw) => ({
        ...raw,
        isSolved: raw.isSolved ?? false,
      }));

      set({ problems: normalizedProblems });
    } catch (error) {
      console.error("Error getting all problems:", error);
      toast.error(getErrorMessage(error));
    } finally {
      set({ isProblemsLoading: false });
    }
  },

  getProblemById: async (id) => {
    try {
      set({ isProblemLoading: true });
      const res = (await axiosInstance.get(`/problem/get-problem/${id}`)).data;
      set({
        problem: res.data.data as Problem,
      });
    } catch (error) {
      console.error("Error getting problem by ID:", error);
      toast.error(getErrorMessage(error));
    } finally {
      set({ isProblemLoading: false });
    }
  },

  getSolvedProblemsByUser: async () => {
    try {
      const res = (await axiosInstance.get("/problem/get-solved-problem")).data;
      set({ solvedProblemsByUser: res.data });
    } catch (error) {
      console.error("Error getting solved problems:", error);
      toast.error(getErrorMessage(error));
    }
  },

  removeProblem: (id) =>
    set((state) => ({
      problems: state.problems.filter((problem) => problem.id !== id),
    })),

  getUserSolvedProblemsRank: async (id) => {
    try {
      const res = (await axiosInstance.get(`/problem/user-rank/${id}`)).data;
      set({ userRank: res.data });
    } catch (error) {
      console.error("Error getting user rank:", error);
      toast.error(getErrorMessage(error));
    }
  },
}));
