import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { db } from "../db/db.js";
import {
  getJudge0LanguageId,
  pullBatchResults,
  submitBatch,
} from "../utils/lib/judge0.js";

const normalizeTextOutput = (value: any) =>
  typeof value === "string" ? value.trim() : "";

async function findAdminUserId() {
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) return admin.id;
  throw new Error("No ADMIN user found in database. Provide an ADMIN user first.");
}

async function validateReferenceSolutions(referenceSolutions: any, testCases: any[]) {
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
    const tokens = submissionResults.map((r: any) => r.token);
    const results = await pullBatchResults(tokens);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const actualOutput = normalizeTextOutput(result?.stdout);
      const expectedOutput = normalizeTextOutput(testCases[i]?.output);
      if (result.status.id === 4 && actualOutput !== expectedOutput) {
        throw new Error(
          `Test case ${i + 1} failed in ${language}: Wrong Answer (Output Mismatch). Expected='${expectedOutput}', Actual='${actualOutput}'`,
        );
      }
      if (result.status.id !== 3) {
        const stderr =
          typeof result?.stderr === "string" ? result.stderr.trim() : "";
        const compileOutput =
          typeof result?.compile_output === "string"
            ? result.compile_output.trim()
            : "";
        const message = stderr || compileOutput || `stdout='${actualOutput || ""}'`;
        throw new Error(
          `Test case ${i + 1} failed in ${language}: ${result.status.description}. ${message}`,
        );
      }
    }
  }
}

function safeJsonParse(value: any, fallback: any = null) {
  if (!value || value === "" || value === "NULL") return fallback;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

async function main() {
  const fileArg = process.argv[2] || "problems.csv";
  const filePath = path.isAbsolute(fileArg)
    ? fileArg
    : path.join(process.cwd(), fileArg);

  if (!fs.existsSync(filePath)) {
    console.error("CSV file not found:", filePath);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, { columns: true, skip_empty_lines: true });

  const adminId = await findAdminUserId();

  let created = 0;
  for (const rec of records) {
    try {
      const title = rec.title || rec.name || "";
      const description = rec.description || "";
      const difficulty = rec.difficulty || "EASY";
      const tags = safeJsonParse(rec.tags, []);
      const examples = safeJsonParse(rec.examples, {});
      const constraints = rec.constraints || "";
      const hints = rec.hints || "";
      const editorial = rec.editorial || "";
      const testCases = safeJsonParse(rec.testcases || rec.testCases, []);
      const codeSnippets = safeJsonParse(rec.code_snippets || rec.codeSnippets, {});
      const referenceSolutions =
        safeJsonParse(rec.reference_solutions || rec.referenceSolutions, {});

      if (!referenceSolutions || typeof referenceSolutions !== "object") {
        throw new Error("Invalid reference solutions for problem: " + title);
      }

      if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new Error("Missing or invalid testCases for problem: " + title);
      }

      // Validate reference solutions using Judge0 (runs each reference solution against test cases)
      await validateReferenceSolutions(referenceSolutions, testCases);

      await db.problem.create({
        data: {
          userId: adminId,
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

      created++;
      console.log(`Created problem: ${title}`);
    } catch (err: any) {
      console.error("Failed to import record:", rec.title || rec.name, "->", err.message);
    }
  }

  console.log(`Import finished. Created: ${created} / ${records.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
