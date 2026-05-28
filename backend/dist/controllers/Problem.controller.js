import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { parse } from "csv-parse/sync";
import { getJudge0LanguageId, pullBatchResults, submitBatch, } from "../utils/lib/judge0.js";
import { getUserRank, getGlobalLeaderboard, getUserStreakDetails, } from "../services/leaderboard.js";
export const createProblem = asyncHandler(async (req, res) => {
    const { title, description, difficulty, tags, examples, constraints, hints, editorial, testCases, codeSnippets, referenceSolutions, } = req.body;
    if (!req.user || req.user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden: only ADMIN users can update problems", []);
    }
    if (!referenceSolutions || typeof referenceSolutions !== "object") {
        throw new ApiError(400, "Invalid reference solutions", []);
    }
    const normalizeTextOutput = (value) => typeof value === "string" ? value.trim() : "";
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
        const tokens = submissionResults.map((result) => result.token);
        const results = await pullBatchResults(tokens);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const actualOutput = normalizeTextOutput(result?.stdout);
            const expectedOutput = normalizeTextOutput(testCases[i]?.output);
            if (result.status.id === 4 &&
                actualOutput !== expectedOutput) {
                throw new ApiError(400, `Test case ${i + 1} failed in ${language}: Wrong Answer (Output Mismatch). Expected='${expectedOutput}', Actual='${actualOutput}'`, ["TEST_CASE_FAILED"]);
            }
            if (result.status.id !== 3) {
                const stderr = typeof result?.stderr === "string" ? result.stderr.trim() : "";
                const compileOutput = typeof result?.compile_output === "string"
                    ? result.compile_output.trim()
                    : "";
                const message = stderr || compileOutput || `stdout='${actualOutput || ""}'`;
                throw new ApiError(400, `Test case ${i + 1} failed in ${language}: ${result.status.description}. ${message}`, ["TEST_CASE_FAILED"]);
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
    return res.status(201).json(new ApiResponse(201, "Problem created successfully", {
        data: problem,
    }));
});
export const getAllProblem = asyncHandler(async (req, res) => {
    const problems = await db.problem.findMany();
    if (!problems) {
        throw new ApiError(404, "No problems found", []);
    }
    return res.status(200).json(new ApiResponse(200, "Problems fetched successfully", {
        data: problems,
    }));
});
export const getProblemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await db.problem.findUnique({ where: { id } });
    if (!problem) {
        throw new ApiError(404, "Problem not found", []);
    }
    return res.status(200).json(new ApiResponse(200, "Problem fetched successfully", {
        data: problem,
    }));
});
export const updateProblem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await db.problem.findUnique({ where: { id } });
    if (!problem) {
        throw new ApiError(404, "Problem not found", []);
    }
    const { title, description, difficulty, tags, examples, constraints, hints, editorial, testCases, codeSnippets, referenceSolutions, } = req.body;
    if (!req.user || req.user.role !== "ADMIN") {
        throw new ApiError(403, "You are not authorized to create a problem", []);
    }
    if (!referenceSolutions || typeof referenceSolutions !== "object") {
        throw new ApiError(400, "Invalid reference solutions", []);
    }
    const normalizeTextOutput = (value) => typeof value === "string" ? value.trim() : "";
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
        const tokens = submissionResults.map((result) => result.token);
        const results = await pullBatchResults(tokens);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const actualOutput = normalizeTextOutput(result?.stdout);
            const expectedOutput = normalizeTextOutput(testCases[i]?.output);
            if (result.status.id === 4 &&
                actualOutput !== expectedOutput) {
                throw new ApiError(400, `Test case ${i + 1} failed in ${language}: Wrong Answer (Output Mismatch). Expected='${expectedOutput}', Actual='${actualOutput}'`, ["TEST_CASE_FAILED"]);
            }
            if (result.status.id !== 3) {
                const stderr = typeof result?.stderr === "string" ? result.stderr.trim() : "";
                const compileOutput = typeof result?.compile_output === "string"
                    ? result.compile_output.trim()
                    : "";
                const message = stderr || compileOutput || `stdout='${actualOutput || ""}'`;
                throw new ApiError(400, `Test case ${i + 1} failed in ${language}: ${result.status.description}. ${message}`, ["TEST_CASE_FAILED"]);
            }
        }
    }
    const updatedProblem = await db.problem.update({
        where: { id },
        data: {
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
    return res.status(200).json(new ApiResponse(200, "Problem updated successfully", {
        data: updatedProblem,
    }));
});
export const deleteProblem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await db.problem.findUnique({ where: { id } });
    if (!problem) {
        throw new ApiError(404, "Problem not found", []);
    }
    if (!req.user || req.user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden: only ADMIN users can update problems", []);
    }
    await db.problem.delete({ where: { id } });
    return res
        .status(200)
        .json(new ApiResponse(200, "Problem deleted successfully", {}));
});
export const getSovleProblem = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required", []);
    }
    const userId = user.id;
    const problems = await db.problem.findMany({
        where: {
            solvedBy: {
                some: {
                    userId,
                },
            },
        },
    });
    return res.status(200).json(new ApiResponse(200, "Problems fetched successfully", {
        data: problems,
    }));
});
export const getUserSolvedRank = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required", ["UNAUTHORIZED"]);
    }
    const { id: userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User ID is required", ["BAD_REQUEST"]);
    }
    // Fetch rank, solved count, and streak from Redis (extremely fast)
    const { solvedCount, rank, streak } = await getUserRank(userId);
    return res.status(200).json(new ApiResponse(200, "Rank fetched successfully", {
        solvedCount,
        rank,
        streak,
    }));
});
const safeJsonParse = (value, fallback = null) => {
    if (!value || value === "" || value === "NULL")
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch (err) {
        return fallback;
    }
};
export const importProblemsCSV = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden: only ADMIN users can import problems", []);
    }
    if (!req.file) {
        throw new ApiError(400, "CSV file is required", []);
    }
    const content = req.file.buffer.toString("utf-8");
    let records;
    try {
        records = parse(content, { columns: true, skip_empty_lines: true });
    }
    catch (parseError) {
        throw new ApiError(400, `Failed to parse CSV: ${parseError.message}`, []);
    }
    const normalizeTextOutput = (value) => typeof value === "string" ? value.trim() : "";
    const validateReferenceSolutions = async (referenceSolutions, testCases) => {
        for (const [language, solution] of Object.entries(referenceSolutions)) {
            const languageId = await getJudge0LanguageId(language);
            if (!languageId) {
                throw new Error(`Language ${language} not supported`);
            }
            const submissions = testCases.map(({ input, output }) => ({
                source_code: solution,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));
            const submissionResults = await submitBatch(submissions);
            const tokens = submissionResults.map((r) => r.token);
            const results = await pullBatchResults(tokens);
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const actualOutput = normalizeTextOutput(result?.stdout);
                const expectedOutput = normalizeTextOutput(testCases[i]?.output);
                if (result.status.id === 4 && actualOutput !== expectedOutput) {
                    throw new Error(`Test case ${i + 1} failed in ${language}: Wrong Answer (Output Mismatch). Expected='${expectedOutput}', Actual='${actualOutput}'`);
                }
                if (result.status.id !== 3) {
                    const stderr = typeof result?.stderr === "string" ? result.stderr.trim() : "";
                    const compileOutput = typeof result?.compile_output === "string"
                        ? result.compile_output.trim()
                        : "";
                    const message = stderr || compileOutput || `stdout='${actualOutput || ""}'`;
                    throw new Error(`Test case ${i + 1} failed in ${language}: ${result.status.description}. ${message}`);
                }
            }
        }
    };
    const results = [];
    let createdCount = 0;
    let failedCount = 0;
    for (const rec of records) {
        const title = rec.title || rec.name || "";
        try {
            if (!title) {
                throw new Error("Missing title or name in CSV record");
            }
            const description = rec.description || "";
            let difficulty = (rec.difficulty || "EASY").toUpperCase();
            if (difficulty !== "EASY" && difficulty !== "MEDIUM" && difficulty !== "HARD") {
                difficulty = "EASY";
            }
            let tags = safeJsonParse(rec.tags, null);
            if (!Array.isArray(tags)) {
                if (typeof rec.tags === "string" && rec.tags.trim() !== "") {
                    tags = rec.tags.split(",").map((t) => t.trim());
                }
                else {
                    tags = [];
                }
            }
            const examples = safeJsonParse(rec.examples, {});
            const constraints = rec.constraints || "";
            const hints = rec.hints || "";
            const editorial = rec.editorial || "";
            const testCases = safeJsonParse(rec.testcases || rec.testCases, []);
            const codeSnippets = safeJsonParse(rec.code_snippets || rec.codeSnippets, {});
            const referenceSolutions = safeJsonParse(rec.reference_solutions || rec.referenceSolutions, {});
            if (!referenceSolutions || typeof referenceSolutions !== "object") {
                throw new Error("Invalid reference solutions");
            }
            if (!Array.isArray(testCases) || testCases.length === 0) {
                throw new Error("Missing or invalid testCases");
            }
            // Validate reference solutions using Judge0
            await validateReferenceSolutions(referenceSolutions, testCases);
            await db.problem.create({
                data: {
                    userId: req.user.id,
                    title,
                    description,
                    difficulty: difficulty,
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
            createdCount++;
            results.push({ title, status: "success" });
        }
        catch (err) {
            failedCount++;
            results.push({
                title: title || "Unknown Problem",
                status: "failed",
                error: err.message,
            });
        }
    }
    return res.status(200).json(new ApiResponse(200, "CSV problem import finished", {
        total: records.length,
        createdCount,
        failedCount,
        results,
    }));
});
export const getLeaderboard = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit || "10", 10);
    const leaderboard = await getGlobalLeaderboard(limit);
    return res.status(200).json(new ApiResponse(200, "Leaderboard fetched successfully", {
        leaderboard,
    }));
});
export const getUserStreak = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User ID is required", ["BAD_REQUEST"]);
    }
    const streakDetails = await getUserStreakDetails(userId);
    return res.status(200).json(new ApiResponse(200, "User streak stats fetched successfully", streakDetails));
});
//# sourceMappingURL=Problem.controller.js.map