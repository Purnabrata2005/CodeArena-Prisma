import HeatmapCalendar from "@/components/profile/CalendarHeatmap";
import ProfileHeader from "@/components/profile/ProfileHeader";
// import ProfileTabSubmissions from "@/components/profile/ProfileTabSubmissions";
import { useAuthStore, useProblemStore, useSubmissionStore } from "@/store/index";
import { useEffect } from "react";
export default function ProfilePage() {
  const { authUser: user } = useAuthStore();

  const {
    getSubmissionStats,
    submissionStats,
    isSubmissionStatsLoading,
    getHeatmapData,
    heatmapData,
    isHeatmapLoading,
  } = useSubmissionStore();
  const { getUserSolvedProblemsRank, userRank } = useProblemStore();
  useEffect(() => {
    getSubmissionStats();
    getHeatmapData();
    getUserSolvedProblemsRank(user?.id || "");
  }, [getSubmissionStats, getHeatmapData, getUserSolvedProblemsRank, user?.id]);
  return (
    <div className="bg-background mx-auto min-h-screen max-w-7xl pt-16">
      <ProfileHeader
        isLoading={isSubmissionStatsLoading}
        submissionStats={submissionStats}
        userData={user}
      />

      <HeatmapCalendar
        isLoading={isHeatmapLoading}
        data={heatmapData}
        userRank={userRank}
      />
      {/* <ProfileTabSubmissions /> */}
    </div>
  );
}
