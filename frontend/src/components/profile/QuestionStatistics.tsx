import { Award, Flame, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionStatisticsProps {
  totalQuestions: number;
  solvedQuestions: number;
  userRank: number | undefined;
  streak: number;
  isLoading?: boolean;
}

export default function QuestionStatistics({
  totalQuestions,
  solvedQuestions,
  userRank,
  streak,
  isLoading = false,
}: QuestionStatisticsProps) {
  return (
    <Card className="flex gap-0 py-2">
      <CardHeader className="items-center pb-0">
        {isLoading ? (
          <div className="h-4 w-32 bg-muted/60 animate-pulse rounded" />
        ) : (
          <CardDescription className="p-0">
            Your learning progress
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="grid w-full grid-cols-2 gap-4 text-center">
          <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Rank</span>
            </div>
            {isLoading ? (
              <div className="h-6 w-8 bg-muted/60 animate-pulse rounded mt-1" />
            ) : (
              <span className="text-xl font-bold">{userRank ?? "N/A"}</span>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            {isLoading ? (
              <div className="h-6 w-16 bg-muted/60 animate-pulse rounded mt-1" />
            ) : (
              <span className="text-xl font-bold">{streak} days</span>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Questions</span>
            {isLoading ? (
              <div className="h-5 w-12 bg-muted/60 animate-pulse rounded-full" />
            ) : (
              <Badge variant="outline" className="font-normal">
                {solvedQuestions} / {totalQuestions}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            {isLoading ? (
              <div className="h-4 w-48 bg-muted/60 animate-pulse rounded" />
            ) : (
              <span className="font-medium">
                Keep going! You're making great progress.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
