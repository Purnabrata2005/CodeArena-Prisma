import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  getLanguageName,
  pullBatchResults,
  submitBatch,
} from "../utils/lib/judge0.js";

export const executeCode = asyncHandler(async (req, res) => {
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body;

  const userId = req.user.id;

  if (!source_code || !language_id || !problemId) {
    throw new ApiError(
      400,
      "source_code, language_id and problemId are required",
      [],
    );
  }

  if (!Array.isArray(stdin) || stdin.length === 0) {
    throw new ApiError(400, "stdin must be a non-empty array", []);
  }

  if (!Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
    throw new ApiError(
      400,
      "expected_outputs must be an array with the same length as stdin",
      [],
    );
  }

  // prepare all test cases for judge0 submission
  const submissions = stdin.map((input) => ({
    source_code,
    language_id: Number(language_id),
    stdin: input,
  }));

  const submissionResults = await submitBatch(submissions);

  const tokens = submissionResults.map((result) => result.token);

  const results = await pullBatchResults(tokens);

  // analyze the results for test cases
  let allTestCasesPassed = true;
  const detailedResults = results.map((result, index) => {
    const {
      stdout: actualOutput,
      time,
      memory,
      stderr,
      compile_output,
      status,
    } = result;
    const stdout = actualOutput?.trim();
    const expectedOutput = expected_outputs?.[index]?.trim();

    const isPassed = stdout === expectedOutput;

    if (!isPassed) {
      allTestCasesPassed = false;
    }

    return {
      testCase: index + 1,
      passed: isPassed,
      stdout,
      expectedOutput,
      stderr: stderr || null,
      compileOutput: compile_output,
      status: status?.description || "Unknown",
      memory: memory ? `${memory} KB` : undefined,
      time: time ? `${time} s` : undefined,
    };
  });

  // store the results in the database
  const submission = await db.submission.create({
    data: {
      userId,
      problemId,
      sourceCode: source_code,
      language: getLanguageName(Number(language_id)),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(results.map((result) => result.stdout)),
      stderr: detailedResults.some((result) => result.stderr)
        ? JSON.stringify(results.map((result) => result.stderr))
        : null,
      compileOutput: results.some((result) => result.compile_output)
        ? JSON.stringify(results.map((result) => result.compile_output))
        : null,
      status: allTestCasesPassed ? "Accepted" : "Wrong Answer",
      memory: results.some((result) => result.memory)
        ? JSON.stringify(results.map((result) => result.memory))
        : null,
      time: results.some((result) => result.time)
        ? JSON.stringify(results.map((result) => result.time))
        : null,
      createdAt: new Date(),
    },
  });

  //if allTestCasesPassed true then mark problem as solved for the current user
  if (allTestCasesPassed) {
    await db.ProblemSolved.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {},
      create: {
        userId,
        problemId,
      },
    });
  }

  //save individual test case results using detailedResults
  const testCaseResults = detailedResults.map((result) => ({
    submissionId: submission.id,
    ...result,
  }));

  await db.testCaseResult.createMany({
    data: testCaseResults,
  });

  //

  const submissionWithTestCases = await db.submission.findUnique({
    where: {
      id: submission.id,
    },
    include: {
      testCase: true,
    },
  });

  res.status(200).json(
    new ApiResponse(200, "Code executed successfully", {
      submission: submissionWithTestCases,
    }),
  );
});

export const runCode = asyncHandler(async (req, res) => {
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body;

  const userId = req.user.id;

  // prepare all test cases for judge0 submission
  const submissions = stdin.map((input) => ({
    source_code,
    language_id: Number(language_id),
    stdin: input,
  }));

  const submissionResults = await submitBatch(submissions);

  const tokens = submissionResults.map((result) => result.token);

  const results = await pullBatchResults(tokens);
});




