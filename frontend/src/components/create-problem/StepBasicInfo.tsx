import { useFormContext, useWatch } from "react-hook-form";
import type { ProblemValues } from "@/lib/schemas/problem.schema";
import type { Difficulty } from "@/types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Beaker } from "lucide-react";
import { sampledpData, sampleStringProblem } from "@/lib/sampleProblems";
import { useState } from "react";

export default function StepBasicInfo() {
  const form = useFormContext<ProblemValues>();
  const { control, setValue } = form;
  const [sampleType, setSampleType] = useState<"DP" | "ST">("DP");

  const tags = useWatch({ control, name: "tags" });

  const addTag = () => setValue("tags", [...(tags || []), ""]);
  const removeTag = (i: number) => setValue("tags", tags.filter((_, idx) => idx !== i));

  const replacetestCases = (testCases: ProblemValues["testCases"]) => {
    setValue("testCases", testCases);
  };

  const loadSampleData = () => {
    const sampleData = sampleType === "DP" ? sampledpData : sampleStringProblem;
    replacetestCases(sampleData.testCases.map((tc) => tc));
    form.reset({
      ...sampleData,
      difficulty: sampleData.difficulty as Difficulty,
    });
  };

  return (
    <div className="space-y-6">
      {/* Sample loader */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3">
        <Beaker className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Load sample:</span>
        <Badge
          variant={sampleType === "DP" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSampleType("DP")}
        >
          DP
        </Badge>
        <Badge
          variant={sampleType === "ST" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSampleType("ST")}
        >
          String
        </Badge>
        <Button type="button" variant="secondary" size="sm" onClick={loadSampleData}
          className="ml-auto">
          Load
        </Button>
      </div>

      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Two Sum" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe the problem..." className="min-h-32" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Difficulty</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Tags</span>
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            <Plus className="mr-1 h-4 w-4" /> Add Tag
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tags?.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <FormField
                control={control}
                name={`tags.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Enter tag" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTag(index)}
                disabled={tags.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
