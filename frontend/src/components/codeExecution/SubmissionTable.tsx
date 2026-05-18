import { CheckCircle, Code2, Loader2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SubmissionResponse } from "@/lib/schemas/submissionSchema";
import {
  formatRelativeDate,
} from "@/lib/utils";

interface SubmissionTableProps {
  submissions: SubmissionResponse[];
  isLoading: boolean;
}

// Helper functions to safely parse memory and time data
const calculateAverageMemory = (memoryData: any): number => {
  try {
    let data = memoryData;
    
    // If it's a string, try to parse it
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        data = [data];
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(data)) {
      data = [data];
    }
    
    // Convert all items to numbers
    const numbers = data.map((item: any) => {
      if (typeof item === "number") return item;
      if (typeof item === "string") {
        const num = parseFloat(item.split(" ")[0]);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });
    
    if (numbers.length === 0) return 0;
    return numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length;
  } catch (error) {
    console.error("Error calculating average memory:", error);
    return 0;
  }
};

const calculateAverageTime = (timeData: any): number => {
  try {
    let data = timeData;
    
    // If it's a string, try to parse it
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        data = [data];
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(data)) {
      data = [data];
    }
    
    // Convert all items to numbers
    const numbers = data.map((item: any) => {
      if (typeof item === "number") return item;
      if (typeof item === "string") {
        const num = parseFloat(item.split(" ")[0]);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });
    
    if (numbers.length === 0) return 0;
    return numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length;
  } catch (error) {
    console.error("Error calculating average time:", error);
    return 0;
  }
};

export default function SubmissionTable({
  submissions,
  isLoading,
}: SubmissionTableProps) {
  console.log("SubmissionTable rendering:", { submissions, isLoading, submissionsLength: submissions.length });

  if (isLoading && !submissions.length) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!submissions.length && !isLoading) {
    return (
      <div className="text-muted-foreground flex h-[400px] w-full items-center justify-center">
        <div className="text-center">
          <Code2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>No submissions yet</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            try {
              const avgMemory = calculateAverageMemory(submission.memory);
              const avgTime = calculateAverageTime(submission.time);
              const statusLower = submission.status?.toLowerCase() || "";
              const isAccepted = statusLower === "accepted" || statusLower === "accepted";

              return (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isAccepted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={
                          isAccepted
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {submission.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{submission.language}</TableCell>
                  <TableCell>{avgTime.toFixed(3)} s</TableCell>
                  <TableCell>{avgMemory.toFixed(0)} KB</TableCell>
                  <TableCell>
                    {formatRelativeDate(new Date(submission.createdAt))}
                  </TableCell>
                </TableRow>
              );
            } catch (error) {
              console.error("Error rendering submission row:", error, submission);
              return null;
            }
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
