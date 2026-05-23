import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import type { CodeReviewResponse } from "@/types";
type CodeReviewInput = {
  code: string;
  language: string;
  problemTitle: string;
};
interface ReviewStore {
  isLoading: boolean;
  review: CodeReviewResponse | null;
  getCodeReview: (data: CodeReviewInput) => Promise<void>;
}
export const useReviewStore = create<ReviewStore>((set) => ({
  isLoading: false,
  review: null,
  getCodeReview: async (data) => {
    try {
      set({ isLoading: true });
      const res = (
        await axiosInstance.post("/code-review", data)
      ).data;
      const reviewData = res.data?.data || res.data;
      set({ review: reviewData });
    } catch (error) {
      console.error("Failed to fetch code review:", error);
      const msg = getErrorMessage(error);
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },
}));
