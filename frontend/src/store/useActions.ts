import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { useProblemStore } from "@/store/useProblemStore";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface ActionsState {
  deletingProblemId: string | null;
  onDeleteProblem: (id: string) => Promise<void>;
}

export const useActions = create<ActionsState>((set) => ({
  deletingProblemId: null,

  onDeleteProblem: async (id: string) => {
    try {
      set({ deletingProblemId: id });
      await axiosInstance.delete(`/problem/delete-problem/${id}`);
      useProblemStore.getState().removeProblem(id);
      toast.success("Problem deleted successfully");
    } catch (error) {
      console.log("Error deleting problem", error);
      toast.error(getErrorMessage(error));
    } finally {
      set({ deletingProblemId: null });
    }
  },
}));
