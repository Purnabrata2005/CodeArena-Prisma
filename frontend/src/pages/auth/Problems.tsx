import { useEffect, useMemo } from "react"
import { useProblemStore } from "@/store/useProblemStore"
import PageLoderLoti from "@/assets/pageLoderLoti"
import ProblemsTable from "@/components/problemTable/problemsTable"
import AddToPlaylistModal from "@/components/playList/AddToPlaylistPage"
import { usePlaylistDialog } from "@/store/usePlaylistDialogStore"


const Problems = () => {

  const {
    getAllProblems,
    getSolvedProblemsByUser,
    problems,
    solvedProblemsByUser,
    isProblemsLoading
  } = useProblemStore()

  const { closeDialog, problemId } = usePlaylistDialog()

  useEffect(() => {
    getAllProblems()
    getSolvedProblemsByUser()
  }, [getAllProblems, getSolvedProblemsByUser])

  const problemsWithSolvedStatus = useMemo(() => {
    const solvedIds = new Set(solvedProblemsByUser.map((p) => p.id))
    return problems.map((p) => ({
      ...p,
      isSolved: solvedIds.has(p.id),
    }))
  }, [problems, solvedProblemsByUser])

  if (isProblemsLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <PageLoderLoti />
      </div>
    )
  }


  return (
    <div className="relative mt-4 flex min-h-screen flex-col items-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Primary gradient blob - top left */}
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-primary via-primary to-transparent opacity-25 rounded-full blur-3xl animate-pulse"></div>

        {/* Secondary gradient blob - top right */}
        <div className="absolute -top-20 -right-40 w-[450px] h-[450px] bg-gradient-to-bl from-secondary via-transparent to-transparent opacity-20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

        {/* Tertiary gradient blob - middle left */}
        <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-accent via-transparent to-transparent opacity-15 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

        {/* Additional accent blob - bottom right */}
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-primary via-transparent to-transparent opacity-20 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
      </div>

      <h1 className="z-10 text-center text-4xl font-extrabold">
        Welcome to <span className="text-primary">CodeArena</span>
      </h1>

      <p className="z-10 mt-4 text-center text-lg font-semibold text-gray-500 dark:text-gray-400">
        A Platform Inspired by Leetcode which helps you to prepare for coding
        interviews and helps you to improve your coding skills by solving coding
        problems
      </p>
      <AddToPlaylistModal
        isOpen={problemId ? true : false}
        onClose={closeDialog}
        problemId={problemId || ""}
      />
      {problemsWithSolvedStatus.length > 0 ? (
        <ProblemsTable problems={problemsWithSolvedStatus} />
      ) : (
        <p className="border-primary z-10 mt-10 rounded-md border border-dashed px-4 py-2 text-center text-lg font-semibold text-gray-500 dark:text-gray-400">
          No problems found
        </p>
      )}
    </div>
  );
}

export default Problems
