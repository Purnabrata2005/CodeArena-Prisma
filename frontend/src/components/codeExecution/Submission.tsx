import { useState } from "react";
import {
  Clock,
  MemoryStick,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubmissionWithTestCases } from "@/lib/schemas/submissionSchema";
import type { Problem } from "@/lib/schemas/problemSchema";
import { cn } from "@/lib/utils";

interface SubmissionResultsProps {
  submission: SubmissionWithTestCases;
  problem: Problem;
}

export default function SubmissionResults({
  submission,
  problem,
}: SubmissionResultsProps) {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);

  // Parse stringified arrays
  const memoryArr = JSON.parse(submission.memory || "[]");
  const timeArr = JSON.parse(submission.time || "[]");

  // Calculate averages with safety checks
  const parsedMemory = memoryArr
    .map((m: string) => Number.parseFloat(m))
    .filter((num: number) => !Number.isNaN(num));
  const avgMemory = parsedMemory.length > 0
    ? parsedMemory.reduce((a: number, b: number) => a + b, 0) / parsedMemory.length
    : 0;

  const parsedTime = timeArr
    .map((t: string) => Number.parseFloat(t))
    .filter((num: number) => !Number.isNaN(num));
  const avgTime = parsedTime.length > 0
    ? parsedTime.reduce((a: number, b: number) => a + b, 0) / parsedTime.length
    : 0;

  const passedTests = submission.testCases.filter((tc) => tc.passed).length;
  const totalTests = submission.testCases.length;

  const sortedTestCases = [...submission.testCases].sort((a, b) => a.testCase - b.testCase);
  const selectedCase = sortedTestCases[selectedCaseIndex];

  // Helper for displaying test case status name
  const getStatusLabel = (status: string) => {
    return status.toUpperCase();
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xl font-bold tracking-tight",
              submission.status === "ACCEPTED" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {submission.status === "ACCEPTED" ? "Accepted" : getStatusLabel(submission.status)}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              {passedTests} / {totalTests} test cases passed
            </span>
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Submitted at {new Date(submission.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground leading-none">Runtime</div>
              <div className="text-sm font-semibold text-foreground mt-0.5">
                {avgTime > 0 ? `${avgTime.toFixed(3)} s` : "N/A"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground leading-none">Memory</div>
              <div className="text-sm font-semibold text-foreground mt-0.5">
                {avgMemory > 0 ? `${avgMemory.toFixed(0)} KB` : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Cases Results */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            Test Cases Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Tabs header */}
          <div className="flex flex-wrap gap-2 mb-6">
            {sortedTestCases.map((testCase, index) => {
              const passed = testCase.passed;
              return (
                <button
                  key={testCase.testCase}
                  onClick={() => setSelectedCaseIndex(index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border",
                    selectedCaseIndex === index
                      ? "bg-zinc-100 dark:bg-zinc-800 text-foreground border-zinc-300 dark:border-zinc-700 font-semibold"
                      : "bg-zinc-50/50 dark:bg-zinc-900/50 text-muted-foreground border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  )}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    passed ? "bg-green-500" : "bg-red-500"
                  )} />
                  Case {index + 1}
                </button>
              );
            })}
          </div>

          {/* Selected Case Content */}
          {selectedCase && (
            <div className="space-y-5">
              {/* If there's a compilation error, show it prominently */}
              {(selectedCase.compileOutput || selectedCase.status === "Compile Error") && (
                <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 rounded-lg p-4 text-red-600 dark:text-red-400">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 font-sans">Compile Error</div>
                  <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {selectedCase.compileOutput || "Unknown compilation error"}
                  </pre>
                </div>
              )}

              {/* If there's a runtime error or stderr, show it */}
              {selectedCase.stderr && (
                <div className="bg-orange-500/10 dark:bg-orange-950/20 border border-orange-500/20 rounded-lg p-4 text-orange-600 dark:text-orange-400">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 font-sans">Runtime Error / Stderr</div>
                  <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {selectedCase.stderr}
                  </pre>
                </div>
              )}

              {/* Input from problem.testCases */}
              {problem?.testCases?.[selectedCase.testCase - 1] && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Input</div>
                  <div className="font-mono text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-3 text-foreground whitespace-pre-wrap select-all">
                    {problem.testCases[selectedCase.testCase - 1].input}
                  </div>
                </div>
              )}

              {/* Your Output */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Your Output</div>
                <div className={cn(
                  "font-mono text-sm border rounded-lg p-3 whitespace-pre-wrap select-all",
                  selectedCase.passed
                    ? "bg-green-500/5 dark:bg-green-950/5 border-green-500/20 dark:border-green-800/30 text-green-600 dark:text-green-400"
                    : "bg-red-500/5 dark:bg-red-950/5 border-red-500/20 dark:border-red-800/30 text-red-600 dark:text-red-400"
                )}>
                  {selectedCase.stdout || "No stdout"}
                </div>
              </div>

              {/* Expected Output */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Expected Output</div>
                <div className="font-mono text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-3 text-foreground whitespace-pre-wrap select-all">
                  {selectedCase.expected}
                </div>
              </div>

              {/* Time and Memory metadata */}
              <div className="flex gap-4 text-xs text-muted-foreground pt-3 border-t border-zinc-150 dark:border-zinc-800/80">
                <div>
                  Runtime: <span className="font-semibold text-foreground">{selectedCase.time}</span>
                </div>
                <div>
                  Memory: <span className="font-semibold text-foreground">{selectedCase.memory}</span>
                </div>
                <div>
                  Status: <span className={cn(
                    "font-semibold",
                    selectedCase.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>{selectedCase.status}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
