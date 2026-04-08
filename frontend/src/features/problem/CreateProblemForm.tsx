import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  problemSchema,
  stepSchemas,
  type ProblemValues,
} from "@/lib/schemas/problem.schema";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WizardProgress from "@/components/create-problem/WizardProgress";
import WizardNavigation from "@/components/create-problem/WizardNavigation";
import StepBasicInfo from "@/components/create-problem/StepBasicInfo";
import StepTestCases from "@/components/create-problem/StepTestCases";
import StepCodeTemplates from "@/components/create-problem/StepCodeTemplates";
import StepExamples from "@/components/create-problem/StepExamples";
import StepAdditional from "@/components/create-problem/StepAdditional";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TestTube,
  Code2,
  BookOpen,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { useProblemStore } from "@/store/useProblemStore";
import { useNavigate } from "react-router-dom";

const TOTAL_STEPS = 5;

const stepTitles = [
  {
    title: "Basic Information",
    desc: "Title, description, difficulty & tags",
    icon: FileText,
  },
  {
    title: "Test Cases",
    desc: "Define input/output test cases",
    icon: TestTube,
  },
  {
    title: "Code Templates",
    desc: "Starter code & reference solutions",
    icon: Code2,
  },
  { title: "Examples", desc: "Example I/O per language", icon: BookOpen },
  {
    title: "Additional Details",
    desc: "Constraints, hints & editorial",
    icon: Lightbulb,
  },
];

const defaultValues: ProblemValues = {
  title: "",
  description: "",
  difficulty: "EASY",
  tags: [""],
  testCases: [{ input: "", output: "" }],
  codeSnippets: {
    JAVASCRIPT: "function solution() {\n  // Write your code here\n}",
    PYTHON: "def solution():\n    # Write your code here\n    pass",
    JAVA: "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
  },
  referenceSolutions: {
    JAVASCRIPT: "// Reference solution here",
    PYTHON: "# Reference solution here",
    JAVA: "// Reference solution here",
  },
  examples: {
    JAVASCRIPT: { input: "", output: "", explanation: "" },
    PYTHON: { input: "", output: "", explanation: "" },
    JAVA: { input: "", output: "", explanation: "" },
  },
  constraints: "",
  hints: "",
  editorial: "",
};

interface CreateProblemFormProps {
  action?: "create" | "update";
  problemId?: string;
}

export default function CreateProblemForm({
  action = "create",
  problemId,
}: CreateProblemFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getProblemById, problem, isProblemLoading } = useProblemStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (action === "update" && problemId) {
      getProblemById(problemId);
    }
  }, [problemId, getProblemById, action]);

  const form = useForm<ProblemValues>({
    resolver: zodResolver(problemSchema),
    defaultValues,
    mode: "onTouched",
  });

  const getCompletedStepsFromValues = useCallback((values: ProblemValues) => {
    const completed = new Set<number>();

    for (let i = 0; i < TOTAL_STEPS; i += 1) {
      const schema = stepSchemas[i as keyof typeof stepSchemas];
      if (schema?.safeParse(values).success) {
        completed.add(i);
      }
    }

    return completed;
  }, []);

  useEffect(() => {
    if (action === "update" && problem) {
      const resetValues: ProblemValues = {
        title: problem.title || "",
        description: problem.description || "",
        difficulty: problem.difficulty || "EASY",
        testCases: problem.testCases || [{ input: "", output: "" }],
        tags: problem.tags || [""],
        constraints: problem.constraints || "",
        hints: problem.hints || "",
        editorial: problem.editorial || "",
        examples: problem.examples || defaultValues.examples,
        codeSnippets: problem.codeSnippets || defaultValues.codeSnippets,
        referenceSolutions:
          problem.referenceSolutions || defaultValues.referenceSolutions,
      };
      form.reset(resetValues);
      setCompletedSteps(getCompletedStepsFromValues(resetValues));
    }
  }, [problem, action, form, getCompletedStepsFromValues]);

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const schema = stepSchemas[currentStep as keyof typeof stepSchemas];
    if (!schema) return true;

    const values = form.getValues();
    const result = schema.safeParse(values);

    if (!result.success) {
      // Trigger validation on the relevant fields
      const fieldNames = Object.keys(result.error.flatten().fieldErrors);
      for (const name of fieldNames) {
        await form.trigger(name as any);
      }
      toast.error("Please fix the errors before continuing.");
      return false;
    }
    return true;
  }, [currentStep, form]);

  const goToStep = useCallback(
    async (step: number) => {
      if (step > currentStep) {
        const valid = await validateCurrentStep();
        if (!valid) return;
      }

      setCompletedSteps(getCompletedStepsFromValues(form.getValues()));
      setCurrentStep(step);
    },
    [currentStep, validateCurrentStep, getCompletedStepsFromValues, form],
  );

  const handleNext = () => goToStep(currentStep + 1);
  const handleBack = () => setCurrentStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    const allValid = await form.trigger();
    if (!allValid) {
      toast.error("Please fix all validation errors before submitting.");
      return;
    }

    const values = form.getValues();

    try {
      setIsSubmitting(true);

      const payload = {
        ...values,
        testCases: values.testCases,
      };

      if (action === "create") {
        const res = await axiosInstance.post(
          "/problem/create-problem",
          payload,
        );
        toast.success(res.data.message || "Problem Created successfully⚡");
      }
      if (action === "update" && problemId) {
        const res = await axiosInstance.put(
          `/problem/update-problem/${problemId}`,
          payload,
        );
        toast.success(res.data.message || "Problem Updated successfully⚡");
      }
      setCompletedSteps(new Set([0, 1, 2, 3, 4]));
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepInfo = stepTitles[currentStep];
  const StepIcon = stepInfo.icon;

  if (isProblemLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-center">
        <Loader2 className="mt-9 h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create Problem
          </h1>
          <p className="mt-1 text-muted-foreground">
            Build a coding challenge step by step
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <WizardProgress
            currentStep={currentStep}
            onStepClick={goToStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Step Content */}
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <StepIcon className="h-5 w-5 text-primary" />
                  {stepInfo.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{stepInfo.desc}</p>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep === 0 && <StepBasicInfo />}
                    {currentStep === 1 && <StepTestCases />}
                    {currentStep === 2 && <StepCodeTemplates />}
                    {currentStep === 3 && <StepExamples />}
                    {currentStep === 4 && <StepAdditional />}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            <WizardNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              action={action}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
