import z from "zod";

export const submissionSchema = z
  .object({
    source_code: z.string().min(1, "source_code is required"),
    language_id: z.union([z.string(), z.number()]),
    problemId: z.string().uuid("Invalid problemId"),
    stdin: z.array(z.string()).min(1, "stdin must have at least one test case"),
    expected_outputs: z.array(z.string()),
  })
  .refine((data) => data.stdin.length === data.expected_outputs.length, {
    message: "expected_outputs length must match stdin length",
    path: ["expected_outputs"],
  });
export type SubmissionValues = z.infer<typeof submissionSchema>;

export const testCaseSchema = z.object({
  submissionId: z.string().uuid(),
  testCase: z.number().int().positive(),
  passed: z.boolean(),
  stdout: z.string().nullable(),
  expected: z.string(),
  stderr: z.string().nullable(),
  compileOutput: z.string().nullable(),
  status: z.enum([
    "Accepted",
    "Wrong Answer",
    "Time Limit Exceeded",
    "Runtime Error",
    "Compile Error",
  ]),
  memory: z.string(),
  time: z.string(),
});
export type TestCase = z.infer<typeof testCaseSchema>;
export const submissionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  problemId: z.string().uuid(),
  sourceCode: z.string(),
  language: z.string(),
  stdin: z.string(),
  stdout: z.string(),
  stderr: z.string().nullable(),
  compileOutput: z.string().nullable(),
  status: z.string(),
  memory: z.string(),
  time: z.string(),
  // memory: z.string().transform((val) => JSON.parse(val) as string[]).optional(),
  // time: z.string().transform((val) => JSON.parse(val) as string[]).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SubmissionResponse = z.infer<typeof submissionResponseSchema>;
export type TestCaseResult = z.infer<typeof testCaseSchema>;
export type SubmissionWithTestCases = SubmissionResponse & {
  testCases: TestCase[];
};