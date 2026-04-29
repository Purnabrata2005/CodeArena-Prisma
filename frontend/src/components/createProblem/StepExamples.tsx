import { useFormContext } from "react-hook-form";
import type { ProblemValues } from "@/lib/schemas/problem.schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2 } from "lucide-react";
import { useState } from "react";

const languages = ["JAVASCRIPT", "PYTHON", "JAVA"] as const;

export default function StepExamples() {
  const { control } = useFormContext<ProblemValues>();
  const [activeLang, setActiveLang] = useState("JAVASCRIPT");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Provide example input/output for each language.
      </p>

      <Tabs value={activeLang} onValueChange={setActiveLang}>
        <TabsList className="w-full justify-start">
          {languages.map((lang) => (
            <TabsTrigger key={lang} value={lang} className="gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              {lang.charAt(0) + lang.slice(1).toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map((lang) => (
          <TabsContent key={lang} value={lang} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name={`examples.${lang}.input`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Example input" className="min-h-20 font-mono text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`examples.${lang}.output`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Example output" className="min-h-20 font-mono text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name={`examples.${lang}.explanation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explain the example..." className="min-h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
