import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  getJudge0LanguageId,
  pullBatchResults,
  submitBatch,
} from "../utils/lib/judge0.js";

export const createProblem = asyncHandler(async (req, res) => {
  //get all required data from req.body
  //check user role again

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    hints,
    editorial,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "You are not authorized to create a problem", []);
  }

  if (!referenceSolutions || typeof referenceSolutions !== "object") {
    throw new ApiError(400, "Invalid reference solutions", []);
  }

  for (const [language, solution] of Object.entries(referenceSolutions)) {
    const languageId = await getJudge0LanguageId(language);
    if (!languageId) {
      throw new ApiError(400, `Language ${language} not supported`, []);
    }

    const submissions = testCases.map(({ input, output }) => ({
      source_code: solution,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    const submissionResults = await submitBatch(submissions);

    console.log("Submission Results:", submissionResults);

    const tokens = submissionResults.map((result) => result.token);

    const results = await pullBatchResults(tokens);

    for (let i = 0; i < results.length; i++) {
        console.log("results.......",results)
      const result = results[i];
      if (result.status.id !== 3) {
        console.log("Expected Output:", testCases[i].output);
        console.log("Actual Output (stdout):", result.stdout);
        console.log("Status Description:", result.status.description);
        throw new ApiError(
          400,
          `Test case ${i + 1} failed: ${result.status.description}`,
          "TEST_CASE_FAILED",
        );
      }
      if (
        result.status.id === 4 &&
        result.stdout.trim() !== testCases[i].output.trim()
      ) {
        throw new ApiError(
          400,
          `Test case ${i + 1} failed: Wrong Answer (Output Mismatch)`,
          "TEST_CASE_FAILED",
        );
      }
    }
  }

  const problem = await db.problem.create({
    data: {
      userId: req.user.id,
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      hints,
      editorial,
      testCases,
      codeSnippets,
      referenceSolutions,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, "Problem created successfully", {
      data:problem,
    }),
  );
});

export const getAllProblem = asyncHandler(async (req, res) => {});

export const getProblemById = asyncHandler(async (req, res) => {});

export const updateProblem = asyncHandler(async (req, res) => {});

export const deleteProblem = asyncHandler(async (req, res) => {});

export const getSovleProblem = asyncHandler(async (req, res) => {});
