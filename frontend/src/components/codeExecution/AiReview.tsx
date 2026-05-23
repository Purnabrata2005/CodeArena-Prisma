import { useState } from "react";
import { useReviewStore } from "@/store/useReviewStore";
import { Sparkles, Loader2, RefreshCw, Code, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AiReviewProps {
  code: string;
  language: string;
  problemTitle: string;
}

interface Block {
  type: "text" | "code";
  content: string;
  language?: string;
}

export default function AiReview({ code, language, problemTitle }: AiReviewProps) {
  const { review, isLoading, getCodeReview } = useReviewStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestReview = async () => {
    if (!code || !code.trim()) {
      setErrorMsg("Please write some code before requesting a review.");
      return;
    }
    setErrorMsg(null);
    try {
      await getCodeReview({
        code,
        language,
        problemTitle,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to generate AI review. Please try again.");
    }
  };

  // Simple Markdown Parser and Renderer
  const parseMarkdownBlocks = (text: string | undefined | null): Block[] => {
    if (!text) return [];
    const lines = text.split("\n");
    const blocks: Block[] = [];
    let currentBlockContent: string[] = [];
    let isInsideCode = false;
    let codeLang = "";

    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        if (isInsideCode) {
          blocks.push({
            type: "code",
            content: currentBlockContent.join("\n"),
            language: codeLang,
          });
          currentBlockContent = [];
          isInsideCode = false;
        } else {
          if (currentBlockContent.length > 0) {
            blocks.push({
              type: "text",
              content: currentBlockContent.join("\n"),
            });
            currentBlockContent = [];
          }
          isInsideCode = true;
          codeLang = line.trim().substring(3).trim();
        }
      } else {
        currentBlockContent.push(line);
      }
    }

    if (currentBlockContent.length > 0) {
      blocks.push({
        type: isInsideCode ? "code" : "text",
        content: currentBlockContent.join("\n"),
        language: isInsideCode ? codeLang : undefined,
      });
    }

    return blocks;
  };

  const renderInline = (text: string) => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitParts = text.split(regex);

    return splitParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="bg-muted text-red-500 dark:text-red-400 font-mono text-xs px-1 py-0.5 rounded border border-border/50"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderMarkdownLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-2" />;

    // Headers
    if (trimmed.startsWith("###")) {
      return (
        <h3
          key={index}
          className="text-base font-bold text-foreground mt-5 mb-2 border-b border-border/20 pb-1"
        >
          {renderInline(trimmed.replace(/^###\s*/, ""))}
        </h3>
      );
    }
    if (trimmed.startsWith("##")) {
      return (
        <h2
          key={index}
          className="text-lg font-bold text-foreground mt-6 mb-3 border-b border-border/40 pb-1"
        >
          {renderInline(trimmed.replace(/^##\s*/, ""))}
        </h2>
      );
    }
    if (trimmed.startsWith("#")) {
      return (
        <h1
          key={index}
          className="text-xl font-extrabold text-foreground mt-7 mb-4 border-b border-border pb-1.5"
        >
          {renderInline(trimmed.replace(/^#\s*/, ""))}
        </h1>
      );
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <li
          key={index}
          className="ml-4 list-disc pl-1 my-1 text-sm leading-relaxed text-muted-foreground"
        >
          {renderInline(trimmed.substring(2))}
        </li>
      );
    }

    // Numbered lists
    const matchNum = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchNum) {
      return (
        <div key={index} className="flex gap-2 my-2 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground/80">{matchNum[1]}.</span>
          <span>{renderInline(matchNum[2])}</span>
        </div>
      );
    }

    // Plain text
    return (
      <p key={index} className="text-sm my-2 leading-relaxed text-muted-foreground">
        {renderInline(line)}
      </p>
    );
  };

  const renderBlock = (block: Block, index: number) => {
    if (block.type === "code") {
      return (
        <div key={index} className="my-4 rounded-lg overflow-hidden border border-border bg-black/60 shadow-inner">
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-1.5 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5" />
              {block.language || "code"}
            </span>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-100 leading-relaxed">
            <code>{block.content}</code>
          </pre>
        </div>
      );
    }

    const lines = block.content.split("\n");
    return (
      <div key={index} className="space-y-1">
        {lines.map((line, lIndex) => renderMarkdownLine(line, lIndex))}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[540px] pr-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="h-10 w-10 text-primary animate-spin relative" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Analyzing Code...</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                Our AI model is reviewing correctness, time/space complexity, edge cases, and quality standards.
              </p>
            </div>
          </div>
        ) : review ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">AI Code Feedback</h4>
                  <p className="text-xs text-muted-foreground">
                    Generated on {review?.timestamp ? new Date(review.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestReview}
                className="text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Re-analyze
              </Button>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none pb-4">
              {parseMarkdownBlocks(review?.review || "").map((block, index) => renderBlock(block, index))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6 px-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary ring-8 ring-primary/5 animate-pulse">
              <Sparkles className="h-12 w-12" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-base font-semibold text-foreground">Get AI Code Review</h3>
              <p className="text-sm text-muted-foreground leading-normal">
                Receive detailed mentoring feedback on your current code. We'll analyze bugs, performance optimization, best practices, and boundary test cases.
              </p>
            </div>
            {errorMsg && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs px-3 py-2 rounded-lg max-w-sm text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <Button
              onClick={handleRequestReview}
              className="flex items-center gap-2 cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-medium shadow-md shadow-primary/15 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Current Code
            </Button>
          </div>
        )}
      </ScrollArea>
  );
}
