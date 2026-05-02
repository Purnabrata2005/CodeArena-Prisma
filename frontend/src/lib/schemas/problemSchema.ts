import { z } from "zod";

const exampleSchema = z.object({
  input: z.string().trim().min(1, "Input is required"),
  output: z.string().trim().min(1, "Output is required"),
  explanation: z.string().trim().optional(),
});

const codeSchema = z.string().min(1, "Code snippet is required");

const basicInfoSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z
    .array(z.string().trim().min(1).max(20))
    .min(1, "At least one tag is required"),
});

const testCasesSchema = z.object({
  testCases: z
    .array(
      z.object({
        input: z.string().trim().min(1, "Input is required"),
        output: z.string().trim().min(1, "Output is required"),
      }),
    )
    .min(1, "At least one test case is required"),
});

const codeTemplatesSchema = z.object({
  codeSnippets: z.object({
    JAVASCRIPT: codeSchema,
    PYTHON: codeSchema,
    JAVA: codeSchema,
  }),
  referenceSolutions: z.object({
    JAVASCRIPT: codeSchema,
    PYTHON: codeSchema,
    JAVA: codeSchema,
  }),
});

const examplesSchema = z.object({
  examples: z.object({
    JAVASCRIPT: exampleSchema.optional(),
    PYTHON: exampleSchema.optional(),
    JAVA: exampleSchema.optional(),
  }),
});

const additionalSchema = z.object({
  constraints: z.string().trim().min(1, "Constraints are required"),
  hints: z.string().trim().optional(),
  editorial: z.string().optional(),
});

export const problemSchema = basicInfoSchema
  .merge(testCasesSchema)
  .merge(codeTemplatesSchema)
  .merge(examplesSchema)
  .merge(additionalSchema);

export const stepSchemas = {
  0: basicInfoSchema,
  1: testCasesSchema,
  2: codeTemplatesSchema,
  3: examplesSchema,
  4: additionalSchema,
} as const;

export type ProblemValues = z.infer<typeof problemSchema>;

export type Problem = ProblemValues & {
  id: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProblemWithSolvedStatus = Problem & {
  isSolved: boolean;
};

export interface UserRankForSolvedProblems {
  solvedCount: number;
  rank: number;
}
