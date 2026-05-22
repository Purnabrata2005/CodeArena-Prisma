import CreateProblemForm from "@/features/problem/CreateProblemForm";
import CSVImport from "@/components/createProblem/CSVImport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileSpreadsheet } from "lucide-react";

export default function AddProblem() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-4xl px-4 space-y-6">
        <Tabs defaultValue="manual" className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Add New Problem
              </h1>
              <p className="mt-1 text-muted-foreground text-sm">
                Create a single problem manually or import multiple problems via CSV
              </p>
            </div>
            
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="manual" className="gap-2">
                <FileText className="h-4 w-4" />
                Manual Wizard
              </TabsTrigger>
              <TabsTrigger value="csv" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV Import
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="manual" className="border-none p-0 outline-none">
            <CreateProblemForm action="create" hideHeader />
          </TabsContent>

          <TabsContent value="csv" className="border-none p-0 outline-none">
            <CSVImport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
