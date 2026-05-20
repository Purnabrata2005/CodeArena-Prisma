import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import crypto from "crypto";
import {
  getLanguageName,
  pullBatchResults,
  submitBatch,
} from "../utils/lib/judge0.js";

export const executeCode = asyncHandler(async (req, res) => {
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body;

  if (!req.user?.id) {
    throw new ApiError(401, "Authentication required", []);
  }

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

  if (
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
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
    const stdout = actualOutput?.trim() ?? "";
    const expectedOutput = expected_outputs[index]?.trim() ?? "";
    const isTestCasePassed =
      stdout.replace(/\r\n/g, "\n") === expectedOutput.replace(/\r\n/g, "\n");

    if (!isTestCasePassed) {
      allTestCasesPassed = false;
    }

    return {
      testCase: index + 1,
      passed: isTestCasePassed,
      stdout,
      expectedOutput,
      expected: expectedOutput,
      stderr: stderr ?? null,
      compileOutput: compile_output ?? null,
      status: status?.description || "Unknown",
      memory: memory ? `${memory} KB` : null,
      time: time ? `${time} s` : null,
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
      stdout: JSON.stringify(detailedResults.map((result) => result.stdout)),
      stderr: detailedResults.some((result) => result.stderr)
        ? JSON.stringify(detailedResults.map((result) => result.stderr))
        : null,
      compileOutput: detailedResults.some((result) => result.compileOutput)
        ? JSON.stringify(detailedResults.map((result) => result.compileOutput))
        : null,
      status: allTestCasesPassed ? "ACCEPTED" : "WRONG ANSWER",
      memory: detailedResults.some((result) => result.memory)
        ? JSON.stringify(detailedResults.map((result) => result.memory))
        : null,
      time: detailedResults.some((result) => result.time)
        ? JSON.stringify(detailedResults.map((result) => result.time))
        : null,
      createdAt: new Date(),
    },
  });

  //if allTestCasesPassed true then mark problem as solved for the current user
  if (allTestCasesPassed) {
    await db.problemSolved.upsert({
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
    testCase: result.testCase,
    passed: result.passed,
    stdout: result.stdout,
    expectedOutput: result.expectedOutput,
    stderr: result.stderr,
    compileOutput: result.compileOutput,
    status: result.status,
    memory: result.memory,
    time: result.time,
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

  const normalizedSubmission = submissionWithTestCases
    ? {
        ...submissionWithTestCases,
        testCases: submissionWithTestCases.testCase.map((testCase) => ({
          ...testCase,
          expected: testCase.expectedOutput,
        })),
      }
    : null;

  res.status(201).json(
    new ApiResponse(201, "Code executed successfully", normalizedSubmission),
  );
});

export const runCode = asyncHandler(async (req, res) => {
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body;

  if (!req.user?.id) {
    throw new ApiError(401, "Authentication required", []);
  }

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

  if (
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
    throw new ApiError(
      400,
      "expected_outputs must be an array with the same length as stdin",
      [],
    );
  }

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

  let allTestCasesPassed = true;
  const testCases = results.map((result, index) => {
    const expected = expected_outputs[index]?.trim() ?? "";
    const actual = result.stdout?.trim() ?? "";
    const passed =
      actual.replace(/\r\n/g, "\n") === expected.replace(/\r\n/g, "\n");

    if (!passed) allTestCasesPassed = false;

    return {
      testCase: index + 1,
      passed,
      stdout: actual,
      expected,
      stderr: result.stderr ?? null,
      compileOutput: result.compile_output ?? null,
      status: result.status?.description ?? "Unknown",
      memory: result.memory ? `${result.memory} KB` : null,
      time: result.time ? `${result.time} s` : null,
    };
  });

  const now = new Date().toISOString();

  const fakeSubmission = {
    id: crypto.randomUUID(),
    userId,
    problemId,
    sourceCode: source_code,
    language: getLanguageName(Number(language_id)),
    stdin: stdin.join("\n"),
    stdout: JSON.stringify(testCases.map((tc) => tc.stdout)),
    stderr: testCases.some((tc) => tc.stderr)
      ? JSON.stringify(testCases.map((tc) => tc.stderr))
      : null,
    compileOutput: testCases.some((tc) => tc.compileOutput)
      ? JSON.stringify(testCases.map((tc) => tc.compileOutput))
      : null,
    status: allTestCasesPassed ? "ACCEPTED" : "WRONG_ANSWER",
    memory: testCases.some((tc) => tc.memory)
      ? JSON.stringify(testCases.map((tc) => tc.memory))
      : null,
    time: testCases.some((tc) => tc.time)
      ? JSON.stringify(testCases.map((tc) => tc.time))
      : null,
    createdAt: now,
    updatedAt: now,
    testCases,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Code executed successfully", fakeSubmission));
});




