import HeatmapCalendar from "@/components/profile/HeatmapCalendar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabSubmissions from "@/components/profile/ProfileTabSubmissions";
import { useAuthStore } from "@/store/useAuthStore";
import { useProblemStore} from "@/store/useProblemStore";
import { useSubmissionStore  } from "@/store/useSubmissionStore";
import { useEffect } from "react";

export default function ProfilePage() {
  const { authUser: user } = useAuthStore();

  const {
    getSubmissionStats,
    submissionStats,
    isSubmissionStatsLoading,
    getHeatmapData,
    hetmapData,
    isHetmapLoading,
  } = useSubmissionStore();
  const { getUserSolvedProblemsRank, userRank } = useProblemStore();
  useEffect(() => {
    getSubmissionStats();
    getHeatmapData();
    getUserSolvedProblemsRank(user?.id || "");
  }, [getSubmissionStats, getHeatmapData, getUserSolvedProblemsRank, user?.id]);
  return (
    <div className="bg-background mx-auto min-h-screen max-w-7xl">
      <ProfileHeader
        isLoading={isSubmissionStatsLoading}
        submissionStats={submissionStats}
        userData={user}
      />

      <HeatmapCalendar
        isLoading={isHetmapLoading}
        data={hetmapData}
        userRank={userRank}
      />
      <ProfileTabSubmissions />
    </div>
  );
}
