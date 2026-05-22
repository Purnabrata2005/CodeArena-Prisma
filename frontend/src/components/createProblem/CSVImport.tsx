import React, { useState, useRef } from "react";
import { useProblemStore } from "@/store/useProblemStore";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  HelpCircle,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ImportResultItem {
  title: string;
  status: "success" | "failed";
  error?: string;
}

interface ImportResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;
    createdCount: number;
    failedCount: number;
    results: ImportResultItem[];
  };
}

export default function CSVImport() {
  const { importProblemsCSV, isCreatingProblem } = useProblemStore();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    createdCount: number;
    failedCount: number;
    results: ImportResultItem[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      } else {
        toast.error("Please upload a valid .csv file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
      } else {
        toast.error("Please upload a valid .csv file.");
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file to upload.");
      return;
    }

    try {
      setImportSummary(null);
      const res = (await importProblemsCSV(file)) as ImportResponse;
      if (res && res.data) {
        setImportSummary(res.data);
        if (res.data.failedCount === 0) {
          toast.success(
            `Successfully imported all ${res.data.createdCount} problems!`
          );
        } else if (res.data.createdCount > 0) {
          toast.warning(
            `Imported ${res.data.createdCount} problems, but ${res.data.failedCount} failed validation.`
          );
        } else {
          toast.error("Failed to import any problems from the CSV.");
        }
      } else {
        toast.error(res?.message ?? "Failed to import problems.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred during import."
      );
    }
  };

  const clearSelection = () => {
    setFile(null);
    setImportSummary(null);
  };

  return (
    <div className="space-y-6">
      {/* File Dropzone */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            CSV Import
          </CardTitle>
          <CardDescription>
            Import multiple problems in bulk. We will automatically compile and
            verify reference solutions against test cases using Judge0.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Selected File: {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Drag and drop your CSV file here, or{" "}
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="text-primary hover:underline font-semibold"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only CSV (.csv) files are supported
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            {file && (
              <Button
                variant="outline"
                onClick={clearSelection}
                disabled={isCreatingProblem}
              >
                Clear
              </Button>
            )}
            <Button
              onClick={handleUpload}
              disabled={!file || isCreatingProblem}
              className="gap-2 min-w-[140px]"
            >
              {isCreatingProblem ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating & Saving...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Import CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guide/Template Accordion */}
      <Card className="border-border/40">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between p-4 text-left font-semibold hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span>CSV Column Reference & Formatting Guide</span>
          </div>
          {showGuide ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {showGuide && (
          <CardContent className="border-t p-4 space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The CSV file should contain columns that correspond to the fields of a
                problem. Complex fields must be in JSON format:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <h4 className="font-bold text-foreground">Standard Fields</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">title:</strong> Title of the problem.
                  </li>
                  <li>
                    <strong className="text-foreground">description:</strong> Full description (Markdown supported).
                  </li>
                  <li>
                    <strong className="text-foreground">difficulty:</strong> EASY, MEDIUM, or HARD.
                  </li>
                  <li>
                    <strong className="text-foreground">constraints:</strong> Coding restrictions.
                  </li>
                  <li>
                    <strong className="text-foreground">hints:</strong> (Optional) Helpful clues.
                  </li>
                  <li>
                    <strong className="text-foreground">editorial:</strong> (Optional) Editorial solution explanations.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-foreground">JSON Columns</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">tags:</strong> Comma-separated text or JSON string array (e.g. <code>["array", "math"]</code>).
                  </li>
                  <li>
                    <strong className="text-foreground">testcases:</strong> JSON list of inputs & outputs:
                    <pre className="mt-1 bg-muted/60 p-2 rounded text-xs overflow-x-auto text-foreground">
                      {`[{"input": "1\\n2", "output": "3"}]`}
                    </pre>
                  </li>
                  <li>
                    <strong className="text-foreground">code_snippets:</strong> Starter code templates for languages (e.g. JAVASCRIPT, PYTHON, JAVA):
                    <pre className="mt-1 bg-muted/60 p-2 rounded text-xs overflow-x-auto text-foreground">
                      {`{"JAVASCRIPT": "function add(a, b) {\\n  // code\\n}"}`}
                    </pre>
                  </li>
                  <li>
                    <strong className="text-foreground">reference_solutions:</strong> Correct code solutions matching the test cases:
                    <pre className="mt-1 bg-muted/60 p-2 rounded text-xs overflow-x-auto text-foreground">
                      {`{"JAVASCRIPT": "function add(a,b) { return a+b; }"}`}
                    </pre>
                  </li>
                  <li>
                    <strong className="text-foreground">examples:</strong> Examples shown on the problem page:
                    <pre className="mt-1 bg-muted/60 p-2 rounded text-xs overflow-x-auto text-foreground">
                      {`{"JAVASCRIPT": {"input": "a = 1", "output": "1", "explanation": "..."}}`}
                    </pre>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results Section */}
      {importSummary && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              Summary of the imported CSV contents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Counts grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/40 p-4 rounded-lg text-center space-y-1">
                <span className="text-xs text-muted-foreground font-medium">
                  Total Processed
                </span>
                <p className="text-2xl font-bold text-foreground">
                  {importSummary.total}
                </p>
              </div>

              <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-4 rounded-lg text-center border border-emerald-500/20 space-y-1">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Created
                </span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {importSummary.createdCount}
                </p>
              </div>

              <div className="bg-rose-500/10 dark:bg-rose-500/5 p-4 rounded-lg text-center border border-rose-500/20 space-y-1">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Failed
                </span>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {importSummary.failedCount}
                </p>
              </div>
            </div>

            {/* Detailed results table */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                Problem Breakdown
              </h4>

              <ScrollArea className="h-[280px] rounded-md border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Problem Title</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead>Error Details / Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importSummary.results.map((item, index) => (
                      <TableRow key={index} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-foreground">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          {item.status === "success" ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 flex items-center gap-1 w-fit"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400 flex items-center gap-1 w-fit"
                            >
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono max-w-[400px] truncate">
                          {item.status === "success" ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Problem created successfully
                            </span>
                          ) : (
                            <span className="text-rose-500 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              {item.error}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
