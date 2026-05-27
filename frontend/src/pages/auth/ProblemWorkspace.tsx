import {  useProblemStore } from "@/store/useProblemStore";
import {  useExecutionStore } from "@/store/useExecutionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FileText,
  MessageSquare,
  Lightbulb,
  Code2,
  Users,
  ThumbsUp,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DesktopReqLoti from "@/assets/dextopReqLoti";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn, formatNumber, getDifficultyColor, getLanguageId } from "@/lib/utils";
import SubmissionResults from "@/components/codeExecution/Submission";
import LoadingButton from "@/components/landing/LoadingButton";
import { useSubmissionStore } from "@/store/useSubmissionStore";
import SubmissionTable from "@/components/codeExecution/SubmissionTable";
import MonocoEditor from "@/components/editor/Editor";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import ProblemHeader from "@/components/codeExecution/ProblemHeader";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useDiscussionStore } from "@/store/useDiscussionStore";
import CodeDiscussion from "@/components/codeExecution/CodeDiscussion";
import AiReview from "@/components/codeExecution/AiReview";
import type { Difficulty } from "@/constants";

export default function ProblemWorkspace() {
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { id } = useParams();
  const { authUser: user } = useAuthStore();
  const { 
    getProblemById, 
    problem, 
    isProblemLoading,
    getUserSolvedProblemsRank,
    triggerStreakCelebration
  } = useProblemStore();
  const {
    isExecuting,
    submission: testResults,
    runCode: executeCode,
    submitCode,
    isSubmitting,
    clearSubmission,
  } = useExecutionStore();
  const {
    getSubmissionForProblem,
    isLoading: isSubmissionLoading,
    getSubmissionCountForProblem,
    submissionsForProblem: submissionResults,
    submissionCount,
  } = useSubmissionStore();
  const { language: selectedLanguage, clearProblemCode } = useCodeEditorStore();
  const {
    discussions,
    getAllDiscussions,
    isLoading: isDiscussionLoading,
  } = useDiscussionStore();
  useEffect(() => {
    if (!id) return;
    getProblemById(id as string);
    getSubmissionCountForProblem(id as string);
    clearSubmission();
  }, [id, getProblemById, getSubmissionCountForProblem, clearSubmission]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeTab === "submissions" && id) {
        console.log("calling getSubmissionForProblem");
        getSubmissionForProblem(id);
      }
      if (activeTab === "discussion" && id) {
        getAllDiscussions(id);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [activeTab, id, getSubmissionForProblem, getAllDiscussions]);

  useEffect(() => {
    if (problem) setCode(problem.codeSnippets?.[selectedLanguage] || "");
  }, [selectedLanguage, problem]);

  if (isProblemLoading || !problem) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (!problem && !isProblemLoading)
    return (
      <div className="text-primary flex w-full items-center justify-center text-2xl">
        Problem not found
      </div>
    );
  const handleRunCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const language_id = getLanguageId(selectedLanguage);
    const stdin = problem?.testCases.map((tc) => tc.input);
    const expected_outputs = problem?.testCases.map((tc) => tc.output);

    try {
      await executeCode({
        expected_outputs,
        stdin,
        source_code: code,
        language_id: language_id || "",
        problemId: id as string,
      });
      clearProblemCode(problem.id);
    } catch (error) {
      console.error("Error running code:", error);
    }
  };
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const language_id = getLanguageId(selectedLanguage);
    const stdin = problem?.testCases.map((tc) => tc.input);
    const expected_outputs = problem?.testCases.map((tc) => tc.output);
    try {
      const submissionResult = await submitCode({
        expected_outputs,
        stdin,
        source_code: code,
        language_id: language_id || "",
        problemId: id as string,
      });

      // If submission was successfully accepted, fetch new rank and trigger celebration
      if (submissionResult && submissionResult.status === "ACCEPTED") {
        if (user?.id) {
          // Fetch updated rank/streak from backend
          await getUserSolvedProblemsRank(user.id);
          
          // Check if streak was updated and not celebrated today
          const updatedRank = useProblemStore.getState().userRank;
          if (updatedRank && typeof updatedRank.streak === "number" && updatedRank.streak > 0) {
            const todayStr = new Date().toDateString();
            const lastCelebration = localStorage.getItem("last_streak_celebration_date");
            if (lastCelebration !== todayStr) {
              triggerStreakCelebration(updatedRank.streak);
              localStorage.setItem("last_streak_celebration_date", todayStr);
            }
          }
        }
      }

      if (id) {
        await getSubmissionForProblem(id as string);
        await getSubmissionCountForProblem(id as string);
      }
      clearProblemCode(problem.id);
    } catch (error) {
      console.error("Error running code:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <ScrollArea className="h-[620px] pr-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge
                  className={getDifficultyColor(
                    problem.difficulty as Difficulty,
                  )}
                >
                  {problem.difficulty}
                </Badge>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {formatNumber(submissionCount?.submissionCount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{submissionCount?.successRate}%</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed">
                  {problem.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Examples</h3>
                {Object.entries(problem.examples).map(([lang, example]) => (
                  <Card key={lang} className="bg-muted/50">
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <div className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                          Input:
                        </div>
                        <code className="bg-background rounded px-2 py-1 font-mono text-sm">
                          {example.input}
                        </code>
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-medium text-green-600 dark:text-green-400">
                          Output:
                        </div>
                        <code className="bg-background rounded px-2 py-1 font-mono text-sm">
                          {example.output}
                        </code>
                      </div>
                      {example.explanation && (
                        <div>
                          <div className="mb-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                            Explanation:
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {example.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Constraints</h3>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <code className="font-mono text-sm">
                      {problem.constraints}
                    </code>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        );
      case "submissions":
        return (
          <SubmissionTable
            submissions={submissionResults}
            isLoading={isSubmissionLoading}
          />
        );
      case "discussion":
        return (
          <CodeDiscussion
            messages={discussions}
            isLoading={isDiscussionLoading}
            problemId={problem.id}
          />
        );
      case "ai-review":
        return (
          <AiReview
            code={code}
            language={selectedLanguage}
            problemTitle={problem.title}
          />
        );
      case "hints":
        return problem.hints ? (
          <ScrollArea className="h-[600px]">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 text-yellow-500" />
                  <p className="text-sm">{problem.hints}</p>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        ) : (
          <div className="text-muted-foreground flex h-[600px] items-center justify-center">
            <div className="text-center">
              <Lightbulb className="mx-auto mb-4 h-12 w-12 text-yellow-500 opacity-50" />
              <p>No hints yet</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  if (isMobile) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <DesktopReqLoti />
        <h2 className="text-xl font-bold text-foreground mb-2 mt-6">
          Desktop Screen Required
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs animate-fade-in">
          This coding workspace is optimized for larger screens. Please switch to a laptop or desktop computer to write and execute code.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background mt-4 min-h-screen px-4">
      {/* Header */}
      <ProblemHeader
        problem={problem}
        submissionCount={submissionCount?.submissionCount}
        successRate={submissionCount?.successRate}
      />
      <div className="mx-auto p-4">
        <ResizablePanelGroup className="min-h-[550px]">
          {/* Problem Description Panel */}
          <ResizablePanel defaultSize={45} minSize={35}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger
                      value="description"
                      className="flex cursor-pointer items-center gap-1.5 text-[10px] xl:text-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Description
                    </TabsTrigger>
                    <TabsTrigger
                      value="submissions"
                      className="flex cursor-pointer items-center gap-1.5 text-[10px] xl:text-xs"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      Submissions
                    </TabsTrigger>
                    <TabsTrigger
                      value="discussion"
                      className="flex cursor-pointer items-center gap-1.5 text-[10px] xl:text-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Discussion
                    </TabsTrigger>
                    <TabsTrigger
                      value="hints"
                      className="flex cursor-pointer items-center gap-1.5 text-[10px] xl:text-xs"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      Hints
                    </TabsTrigger>
                    <TabsTrigger
                      value="ai-review"
                      className="flex cursor-pointer items-center gap-1.5 text-[10px] xl:text-xs text-primary/95"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                      AI Review
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {renderTabContent()}
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={55} minSize={40}>
            <div className="h-full gap-4">
              <div className="h-[550px] overflow-hidden rounded-lg">
                <MonocoEditor problem={problem} code={code} setCode={setCode} />
              </div>
              <div className="bg-muted/50 border-t p-4">
                <div className="flex items-center justify-between">
                  <LoadingButton
                    onClick={handleRunCode}
                    isLoading={isExecuting}
                    variant="primary"
                    className="run-code-button"
                    startContent={<Play className="h-4 w-4" />}
                  >
                    Run Code
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isSubmitting}
                    onClick={handleSubmitCode}
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                  >
                    Submit Solution
                  </LoadingButton>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Test Results */}
        {testResults ? (
          <SubmissionResults submission={testResults} problem={problem} />
        ) : (
          <Card className="mt-6 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Test Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Case Selector Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(problem?.testCases || []).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestCaseIndex(index)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border",
                      activeTestCaseIndex === index
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground border-zinc-300 dark:border-zinc-700 font-semibold"
                        : "bg-zinc-50/50 dark:bg-zinc-900/50 text-muted-foreground border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    Case {index + 1}
                  </button>
                ))}
              </div>

              {/* Selected Case Content */}
              {problem?.testCases?.[activeTestCaseIndex] && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Input
                    </div>
                    <div className="font-mono text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-4 text-foreground whitespace-pre-wrap select-all">
                      {problem.testCases[activeTestCaseIndex].input}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Expected Output
                    </div>
                    <div className="font-mono text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-4 text-foreground whitespace-pre-wrap select-all">
                      {problem.testCases[activeTestCaseIndex].output}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
