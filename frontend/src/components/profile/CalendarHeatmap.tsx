import type { SubmissionHeatmapEntry } from "@/types";

import { Card, CardContent } from "../ui/card";
import QuestionStatistics from "@/components/profile/QuestionStatistics";
import type { UserRankForSolvedProblems } from "@/lib/schemas/profileSchema";
import { useProblemStore } from "@/store";
interface HeatmapCalendarProps {
  data: SubmissionHeatmapEntry[];
  userRank: UserRankForSolvedProblems | null;
  isLoading: boolean;
}

export default function HeatmapCalendar({
  data,
  userRank,
  isLoading,
}: HeatmapCalendarProps) {
  const totalContributions = data.reduce((sum, item) => sum + item.count, 0);
  const { problems } = useProblemStore();
  if (isLoading) return null;

  const contributionsByDate = new Map(
    data.map((entry) => [entry.date, entry.count]),
  );

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  const days = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const dateKey = date.toISOString().slice(0, 10);

    return {
      dateKey,
      count: contributionsByDate.get(dateKey) || 0,
    };
  });

  const weeks: Array<(typeof days)[number][]> = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/40";
    if (count === 1) return "bg-emerald-200";
    if (count <= 3) return "bg-emerald-400";
    if (count <= 6) return "bg-emerald-500";
    return "bg-emerald-700";
  };

  return (
    <section className="mb-4 w-full gap-2 xl:flex">
      <Card className="mt-2 cursor-pointer rounded-3xl p-4">
        <CardContent className="overflow-auto">
          <div className="mb-4">
            <h3 className="text-foreground mb-1 text-sm font-medium">
              Activity Overview
            </h3>
            <p className="text-muted-foreground text-xs">
              {totalContributions} contributions in the selected period
            </p>
          </div>
          <div className="flex max-w-7xl">
            <span className="text-muted-foreground flex flex-col justify-around py-2 pr-3 text-right text-xs">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </span>
            <div className="flex gap-1 overflow-x-auto pr-4 pb-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.dateKey}
                      title={`${day.dateKey}: ${day.count} submissions`}
                      className={`h-3 w-3 rounded-[3px] border border-black/5 ${getIntensityClass(
                        day.count,
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <QuestionStatistics
        totalQuestions={problems.length}
        solvedQuestions={userRank?.solvedCount || 0}
        userRank={userRank?.rank || undefined}
        streak={data.length}
      />
    </section>
  );
}
