import { useFormContext } from "react-hook-form";
import type { ProblemValues } from "@/lib/schemas/problemSchema";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import { Code2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";

const languages = ["JAVASCRIPT", "PYTHON", "JAVA"] as const;

const monacoLang: Record<string, string> = {
  JAVASCRIPT: "javascript",
  PYTHON: "python",
  JAVA: "java",
};

export default function StepCodeTemplates() {
  const { control } = useFormContext<ProblemValues>();
  const [activeLang, setActiveLang] = useState("JAVASCRIPT");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: { top: 16, bottom: 16 },
    fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
    fontLigatures: true,
    cursorBlinking: "smooth" as const,
    smoothScrolling: true,
    renderLineHighlight: "all" as const,
    lineHeight: 1.6,
    letterSpacing: 0.5,
    roundedSelection: true,
    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Provide starter code and reference solutions for each language.
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
          <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="h-4 w-4" /> Starter Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name={`codeSnippets.${lang}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="overflow-hidden rounded-md border border-border">
                          <Editor
                            height="250px"
                            language={monacoLang[lang]}
                            theme={isDark ? "vs-dark" : "vs-light"}
                            value={field.value}
                            onChange={field.onChange}
                            options={editorOptions}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" /> Reference Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name={`referenceSolutions.${lang}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="overflow-hidden rounded-md border border-border">
                          <Editor
                            height="250px"
                            language={monacoLang[lang]}
                            theme={isDark ? "vs-dark" : "vs-light"}
                            value={field.value}
                            onChange={field.onChange}
                            options={editorOptions}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
