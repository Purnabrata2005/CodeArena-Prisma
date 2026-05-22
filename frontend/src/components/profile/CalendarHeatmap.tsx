import { useEffect, useRef } from "react";
import type { SubmissionHeatmapEntry } from "@/types";
import { GitHubCalendar } from "@/components/git-hub-calendar";
import QuestionStatistics from "@/components/profile/QuestionStatistics";
import type { UserRankForSolvedProblems } from "@/lib/schemas/profileSchema";
import { useProblemStore } from "@/store";
import { Card, CardContent } from "../ui/card";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToRight = () => {
      if (container) {
        container.scrollLeft = container.scrollWidth;
      }
    };

    // Scroll immediately
    scrollToRight();

    // Set up ResizeObserver to scroll when dimensions change (e.g. after layout/render)
    const resizeObserver = new ResizeObserver(() => {
      scrollToRight();
    });

    resizeObserver.observe(container);

    // Also observe the first child of the container if it exists
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    // Set up multiple timeouts to ensure scrolling works as layout stabilizes
    const timers = [
      setTimeout(scrollToRight, 50),
      setTimeout(scrollToRight, 200),
      setTimeout(scrollToRight, 500),
    ];

    return () => {
      resizeObserver.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [isLoading, data]);

  return (
    <section className="mb-4 w-full gap-4 xl:flex">
      <Card className="mt-2 flex-1 min-w-0 rounded-3xl p-6">
        <CardContent className="p-0">
          <div className="mb-6">
            <h3 className="text-foreground mb-1 text-sm font-medium">
              Activity Overview
            </h3>
            {isLoading ? (
              <div className="h-4 w-48 bg-muted/60 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-muted-foreground text-xs font-normal">
                {totalContributions} contributions in the selected period
              </p>
            )}
          </div>
          <div ref={scrollContainerRef} className="overflow-x-auto w-full pr-2 pb-2">
            <div className="w-max [&>div]:border-0 [&>div]:p-0">
              <GitHubCalendar 
                data={data} 
                isLoading={isLoading}
                colors={[
                  "var(--calendar-bg)", 
                  "var(--calendar-level-1)", 
                  "var(--calendar-level-2)", 
                  "var(--calendar-level-3)", 
                  "var(--calendar-level-4)"
                ]} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-2 flex flex-col justify-stretch">
        <QuestionStatistics
          totalQuestions={problems.length}
          solvedQuestions={userRank?.solvedCount || 0}
          userRank={userRank?.rank || undefined}
          streak={data.length}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
